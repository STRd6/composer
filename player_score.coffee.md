Phrase
======

    {defaults, extend} = require "util"

    module.exports = (I, self) ->
      defaults I,
        tempo: 90 # BPM
        beats: 4

      self.attrAccessor "beats", "tempo"

      notes = []

      playing = false
      playTime = 0
      timestep = 1/60 # Animation Frame timestep, seconds
      minute = 60 # seconds

      upcomingSounds = (dt) ->
        notes.filter ([time]) ->
          playTime <= time < playTime + dt

      # Schedules upcoming sounds to play
      playUpcomingSounds = (dt) ->
        upcomingSounds(dt)
        .forEach ([time, note, instrument]) ->
          self.playNote instrument, note, time - playTime

      playLoop = ->
        if playing
          # dt is measured in beats
          dt = timestep * self.tempo() / minute
          playUpcomingSounds(dt)
          
          playTime += dt
          
          # TODO Handle remainder?
          if playTime >= self.beats()
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

          notes.remove matched[0]

        notes: ->
          notes

        playTime: ->
          playTime

        play: ->
          playing = !playing
