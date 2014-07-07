Phrase
======

    {defaults, extend} = require "util"

    module.exports = (I, self) ->
      defaults I,
        tempo: 90 # BPM
        beats: 4

      self.attrObservable "beats", "tempo"

      notes = []

      playing = false
      playTime = 0
      timestep = 1/60 # Animation Frame timestep, seconds
      minute = 60 # seconds

      upcomingSounds = (current, dt) ->
        notes.filter ([time]) ->
          current <= time < current + dt

      # Schedules upcoming sounds to play
      playUpcomingSounds = (current, dt) ->
        upcomingSounds(current, dt)
        .forEach ([time, note, instrument]) ->
          # TODO: Make sure the units in time are right
          # should be seconds but may currently be beats!
          self.playNote instrument, note, (time - current) * minute / self.tempo()

      playLoop = ->
        if playing
          # dt is measured in beats
          dt = timestep * self.tempo() / minute
          playUpcomingSounds(playTime, dt)

          playTime += dt

          if playTime >= self.beats()
            dt = playTime - self.beats() # "left over" section wraps to beginning
            playUpcomingSounds(0, dt)
            playTime = dt

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
