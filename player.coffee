require "cornerstone"
require "./extensions"

Ajax = require "ajax"
{Progress, Modal, Style} = UI = require "ui"
Postmaster = require "postmaster"

Sample = require "./sample"
Song = require "./song"

PatternView = require "./pattern_view"

PublishFormTemplate = require "../templates/publish-form"

style = document.createElement "style"
style.innerHTML = Style.all
document.head.appendChild style

module.exports = (I={}, self=Model(I)) ->
  defaults I,
    samples: []
    patternMode: false
    lastChannelIndex: 0

  ajax = Ajax()

  self.include Bindable

  self.attrObservable "samples"

  self.attrAccessor "patternMode", "lastChannelIndex"

  song = Song()

  # Loading default sample pack
  Sample.loadPack(require("../samples"))
  .then self.samples

  # TODO: Make it a real observable function
  activePattern = Observable song.patterns()[0]

  self.extend
    activePattern: activePattern
    size: ->
      if self.patternMode()
        activePattern().size()
      else
        song.size()

    addNote: (note) ->
      self.unsaved true
      activePattern().notes().push(note)

    # Currently instruments map 1 to 1 with patterns.
    patternToolIndex: ->
      self.activeInstrument()

    patterns: song.patterns

    song: ->
      song

    tempo: song.tempo

    # TODO: Should different patterns have different sample banks?
    playNote: (instrument, note, time) ->
      buffer = self.samples.get(instrument).buffer
      self.playBufferNote(buffer, note, time)

    about: ->
      console.log "about"
      # TODO: Display About page

    removeNote: ->
      activePattern().removeNote arguments...

    upcomingSounds: (current, dt) ->
      if self.patternMode()
        activePattern().upcomingNotes(current, dt)
      else
        song.upcomingNotes(current, dt)

    publish: ->
      Modal.form PublishFormTemplate()
      .then (data) ->
        data.content = JSON.stringify self.song().toJSON()

        progressView = Progress
          value: 0
          message: "Saving..."

        Modal.show progressView.element,
          cancellable: false

        postmaster.invokeRemote "save", data
        .then ->
          Modal.alert "Saved!"
          self.unsaved false
        .catch ({message}) ->
          Modal.alert "Error: #{message}"

    loadFromURL: (url) ->
      progressView = Progress
        value: 0
        message: "Loading..."

      Modal.show progressView.element,
        cancellable: false

      ajax.ajax
        url: url
        responseType: "json"
      .progress ({lengthComputable, loaded, total}) ->
        if lengthComputable
          progressView.value loaded / total
      .then self.fromJSON
      .then ->
        Modal.hide()
      .catch (e) ->
        if e.statusText
          Modal.alert "An error has occurred: #{e.status} - #{e.statusText}"
        else
          Modal.alert "An error has occurred: #{e.message}"

  self.include require "./player_audio"
  self.include require "./persistence"

  element = document.body

  self.include PatternView
  element.appendChild require("./tools")(self)

  self.include require("./arranger_view")

  self.on "arrangerClick", (channel, beat) ->
    if self.activeToolIndex() is 1 # Eraser
      if song.removePattern channel, beat
        self.unsaved true
    else
      patternIndex = self.activeInstrument()

      if song.canSet(channel, beat, patternIndex)
        activePattern song.patterns()[patternIndex]
        song.setPattern channel, beat, patternIndex
        self.lastChannelIndex channel
        self.unsaved true
      else if (patternIndex = song.patternAt(channel, beat))?
        self.patternMode true unless self.playing()
        activePattern song.patterns()[patternIndex]

  element.appendChild self.arrangerElement()

  animate ->
    self.trigger("draw")

  postmaster = Postmaster
    loadFile: (blob) ->
      blob.readAsJSON()
      .then self.fromJSON

    loadFromURL: self.loadFromURL

  postmaster.invokeRemote "ready"
  .catch (e) ->
    console.warn e.message

  return self

animate = (fn) ->
  step = ->
    try
      fn()
    catch e
      debugger
      console.error e

    requestAnimationFrame(step)

  step()
