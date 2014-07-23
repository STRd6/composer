Player
======

Super simple Audio player based on http://www.html5rocks.com/en/tutorials/webaudio/intro/

    context = require "./lib/audio_context"

    require "cornerstone"

    Pattern = require "./pattern"
    Sample = require "./sample"

    module.exports = (I={}, self=Model(I)) ->
      defaults I,
        tempo: 90 # BPM
        gamut: [-12, 18]
        samples: []

      self.attrObservable "gamut", "samples", "tempo"

      # Loading default sample pack
      Sample.loadPack(require("../samples"))
      .then self.samples
      .done()

      channels = [0..3].map (n) -> [n]

      patterns = [
        Pattern() # Empty Pattern
        Pattern()
        Pattern()
        Pattern()
      ]

      activePattern = ->
        patterns[1]

      self.extend
        addNote: (note) ->
          activePattern().notes().push(note)

        # TODO: Should different patterns have different sample banks?
        playNote: (instrument, note, time) ->
          buffer = self.samples.get(instrument).buffer
          self.playBufferNote(buffer, note, time)

        removeNote: ->
          activePattern().removeNote arguments...

        upcomingSounds: (current, dt) ->
          patterns.map (pattern) ->
            pattern.upcomingNotes(current, dt)
          .flatten()

        # TODO: May want to handle proxying these better
        beats: ->
          activePattern().beats()

        notes: ->
          activePattern().notes()

Schedule a note to be played, use the buffer at the given index, pitch shift by
`note` semitones, and play at `time` seconds in the future.

        playBufferNote: (buffer, note=0,  time=0) ->
          rate = Math.pow 2, note / 12

          self.playBuffer(buffer, rate, time)

        playBuffer: (buffer, rate=1, time=0) ->
          source = context.createBufferSource()
          source.buffer = buffer
          source.connect(context.destination)
          source.start(time + context.currentTime)
          source.playbackRate.value = rate

      self.include require "./player_tools"
      self.include require "./player_audio"
      self.include require "./player_view"
      self.include require "./player_hotkeys"
      self.include require "./persistence"

      self.setCursor()

      return self
