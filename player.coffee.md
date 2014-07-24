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

      self.attrObservable "samples"

      song = Song()

      # Loading default sample pack
      Sample.loadPack(require("../samples"))
      .then self.samples
      .done()

      # TODO: Make it a real observable function
      activePattern = Observable song.patterns()[0]

      self.extend
        addNote: (note) ->
          activePattern().notes().push(note)

        tempo: song.tempo

        # TODO: Should different patterns have different sample banks?
        playNote: (instrument, note, time) ->
          buffer = self.samples.get(instrument).buffer
          self.playBufferNote(buffer, note, time)

        removeNote: ->
          activePattern().removeNote arguments...

        upcomingSounds: (current, dt) ->
          song.upcomingNotes(current, dt)

      self.include require "./player_audio"
      self.include require "./persistence"

      element = document.body

      initPatternView = ->
        # This pattern view is really closely entertwined
        # Probably want to find a better way of delegating a view
        patternView = PatternView()
        bindO activePattern, patternView.pattern
        bindO self.samples, patternView.samples
        patternView.tempo = song.tempo
        patternView.playTime = self.playTime
        patternView.playNote = self.playNote
        patternView.play = self.play

        # TODO
        self.beats = song.size

        self.patternView = ->
          patternView

        element.appendChild require("./tools")(patternView)

      initPatternView()

      arrangerView = require("./arranger_view")()

      element.appendChild arrangerView.element()

      setInterval ->
        arrangerView.render song
      , 15

      return self

Helpers
-------

Bind an observable to "be the same as" the source observable.

    bindO = (from, to) ->
      from.observe to
      to from()
