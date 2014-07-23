Player
======

Super simple Audio player based on http://www.html5rocks.com/en/tutorials/webaudio/intro/

    require "cornerstone"

    Sample = require "./sample"
    Song = require "./song"

    module.exports = (I={}, self=Model(I)) ->
      defaults I,
        tempo: 90 # BPM
        gamut: [-12, 18]
        samples: []

      self.attrObservable "gamut", "samples", "tempo"
      
      song = Song()

      # Loading default sample pack
      Sample.loadPack(require("../samples"))
      .then self.samples
      .done()

      activePattern = ->
        song.patterns()[0]

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
          song.upcomingNotes(current, dt)

        # TODO: May want to handle proxying these better
        beats: ->
          activePattern().beats()

        notes: ->
          activePattern().notes()

      self.include require "./player_tools"
      self.include require "./player_audio"
      self.include require "./player_view"
      self.include require "./player_hotkeys"
      self.include require "./persistence"

      self.setCursor()

      return self
