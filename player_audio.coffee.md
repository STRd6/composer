Player Audio
============

Main audio loop

Plays a "Playable". Playables have an `upcomingSounds` method that returns an
array of notes to be played with beat offsets.

Needs tempo, playable, start beat, end beat, looping mode to play.

Provides playTime and playing methods.

    context = require "./lib/audio_context"

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
            if self.loop()
              dt = playTime - self.beats() # "left over" section wraps to beginning
              playUpcomingSounds(0, dt)
              playTime = dt
            else
              playTime = 0
              playing = false

        requestAnimationFrame playLoop

      playLoop()

      self.extend

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

        playTime: ->
          playTime

        play: ->
          playing = !playing

        loop: ->
          true
