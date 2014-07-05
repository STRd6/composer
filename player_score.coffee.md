Player Score
============

    {extend} = require "util"

    module.exports = (I, self) ->
      notes = []
      
      playing = false
      playTime = 0
      dt = 1/60

      playLoop = ->
        if playing
          # Play upcoming sounds
          notes.filter ([time]) ->
            playTime <= time < playTime + dt
          .forEach ([time, note, instrument]) ->
            self.playNote instrument, note, time - playTime

          playTime += dt

          if playTime >= 1
            playTime = 0

        requestAnimationFrame playLoop

      playLoop()

      extend self,
        addNote: (note) ->
          notes.push(note)

        removeNote: ([time, note]) ->
          # TODO: Some leeway to pick nearby note
          matched = notes.filter ([t, n]) ->
            time is t and note is n

          remove notes, matched[0]

        notes: ->
          notes

        playTime: ->
          playTime

        play: ->
          playing = !playing

Helpers
-------

    remove = (array, value) ->
      index = array.indexOf(value)

      if index >= 0
        @splice(index, 1)[0]