Player
======

Super simple Audio player based on http://www.html5rocks.com/en/tutorials/webaudio/intro/

    require "cornerstone"

    Sample = require "./sample"
    Song = require "./song"

    PatternView = require "./pattern_view"

    module.exports = (I={}, self=Model(I)) ->
      defaults I,
        samples: []
        patternMode: false

      self.include Bindable

      self.attrObservable "samples"

      self.attrAccessor "patternMode"

      song = Song()

      # Loading default sample pack
      Sample.loadPack(require("../samples"))
      .then self.samples
      .done()

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

        removeNote: ->
          activePattern().removeNote arguments...

        upcomingSounds: (current, dt) ->
          if self.patternMode()
            activePattern().upcomingNotes(current, dt)
          else
            song.upcomingNotes(current, dt)

      self.include require "./player_audio"
      self.include require "./persistence"

      element = document.body

      self.include PatternView
      element.appendChild require("./tools")(self)

      self.include require("./arranger_view")

      self.on "arrangerClick", (channel, beat) ->
        if self.activeToolIndex() is 1 # Eraser
          song.removePattern channel, beat
        else
          patternIndex = self.activeInstrument()

          debugger

          if song.canSet(channel, beat, patternIndex)
            activePattern song.patterns()[patternIndex]
            song.setPattern channel, beat, patternIndex
            self.unsaved true
          else if (patternIndex = song.patternAt(channel, beat))?
            self.patternMode true unless self.playing()
            activePattern song.patterns()[patternIndex]

      element.appendChild self.arrangerElement()

      animate ->
        self.trigger("draw")

      return self

Helpers
-------

Bind an observable to "be the same as" the source observable.

    bindO = (from, to) ->
      from.observe to
      to from()

    animate = (fn) ->
      step = ->
        try
          fn()
        catch e
          debugger
          console.error e

        requestAnimationFrame(step)

      step()
