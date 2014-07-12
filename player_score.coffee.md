Phrase
======

    {defaults, extend} = require "util"

    module.exports = (I, self) ->
      defaults I,
        tempo: 90 # BPM
        beats: 4
        scale: 0
        gamut: [-12, 12]
        notes: []

      self.attrObservable "beats", "tempo"
      self.attrAccessor "notes", "gamut"

      playing = false
      playTime = 0
      timestep = 1/60 # Animation Frame timestep, seconds
      minute = 60 # seconds

      upcomingSounds = (current, dt) ->
        I.notes.filter ([time]) ->
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
          I.notes.push(note)

        removeNote: ([time, note]) ->
          # TODO: Some leeway to pick nearby note
          matched = I.notes.filter ([t, n]) ->
            time is t and note is n

          I.notes.remove matched[0]

        playTime: ->
          playTime

        play: ->
          playing = !playing

        transpose: ->
          if amount = prompt "Transpose (semitones)"
            amount = parseInt(amount, 10)

            I.notes.forEach (note) ->
              note[1] += amount

        saveAs: ->
          if name = prompt "Name"
            data = self.toJSON()

            localStorage["songs_#{name}"] = JSON.stringify data

        loadSong: ->
          if name = prompt "Name"
            data = JSON.parse localStorage["songs_#{name}"]

            self.notes data.notes
            self.beats data.beats
            self.tempo data.tempo

            playing = false
            playTime = 0
