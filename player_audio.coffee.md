Player Audio
============

Main audio loop

    module.exports = (I, self) ->
      playing = false
      playTime = 0
      timestep = 1/60 # Animation Frame timestep, seconds
      minute = 60 # seconds

      # Schedules upcoming sounds to play
      playUpcomingSounds = (current, dt) ->
        self.upcomingSounds(current, dt)
        .forEach ([time, note, instrument]) ->
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
          else if playTime < 0 # negative tempo case
            dt = playTime # "left over" section wraps to end
            playUpcomingSounds(self.beats(), dt)
            playTime = self.beats() + dt

        requestAnimationFrame playLoop

      playLoop()

      self.extend
        playTime: ->
          playTime

        play: ->
          playing = !playing
