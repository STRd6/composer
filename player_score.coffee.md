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
          debugger
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

        notes: ->
          notes

        playTime: ->
          playTime

        play: ->
          playing = !playing
