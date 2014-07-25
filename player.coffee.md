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
        patternMode: true

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
        beats: ->
          if self.patternMode()
            activePattern().size()
          else
            song.size()
        addNote: (note) ->
          activePattern().notes().push(note)

        # Currently instruments map 1 to 1 with patterns.
        patternToolIndex: ->
          self.patternView().activeInstrument()

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
        patternView.patternPlay = self.patternPlay

        self.patternView = ->
          patternView

        element.appendChild require("./tools")(patternView)

      initPatternView()

      self.include require("./arranger_view")

      self.on "arrangerClick", (channel, beat) ->
        if self.patternView().activeToolIndex() is 1 # Eraser
          song.removePattern channel, beat
        else
          patternIndex = self.patternView().activeInstrument()

          if song.canSet(channel, beat, patternIndex)
            activePattern song.patterns()[patternIndex]
            song.setPattern channel, beat, patternIndex
          else if (patternIndex = song.patternAt(channel, beat))?
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
