###
Player Audio
============

Main audio loop

Plays a "Playable". Playables have an `upcomingSounds` method that returns an
array of notes to be played with beat offsets.

Needs tempo, playable, start beat, end beat, looping mode to play.

Provides playTime and playing methods.
###

context = require "./lib/audio-context"

mp3Encode = require "./lib/mp3-worker"

module.exports = (I, self) ->
  playing = false
  playTime = 0
  timestep = 1/60 # Animation Frame timestep, seconds
  minute = 60 # seconds

  scheduleSound = ([time, note, instrument]) ->
    self.playNote instrument, note, time * minute / self.tempo()

  # Schedules upcoming sounds to play
  playUpcomingSounds = (current, dt) ->
    self.upcomingSounds(current, dt)
    .forEach (note) ->
      scheduleSound(note)

  playLoop = ->
    if playing
      # dt is measured in beats
      dt = timestep * self.tempo() / minute
      playUpcomingSounds(playTime, dt)

      playTime += dt

      if playTime >= self.size()
        if self.loop()
          dt = playTime - self.size() # "left over" section wraps to beginning
          playUpcomingSounds(0, dt)
          playTime = dt
        else
          playTime = 0
          playing = false

    requestAnimationFrame playLoop

  playLoop()

  self.extend
    # Schedule a note to be played, use the buffer at the given index, pitch shift by
    # `note` semitones, and play at `time` seconds in the future.
    
    exportSong: (song) ->
      beats = song.size()
      bpm = song.tempo()
      secondsPerBeat = 60 / bpm
      
      audioChannels = 1
      samplesPerSecond = 44100
      lengthInSeconds = secondsPerBeat * beats + 2 # add two seconds padding at the end
      offlineContext = new OfflineAudioContext(audioChannels, samplesPerSecond * lengthInSeconds, samplesPerSecond)

      new Promise (resolve, reject) ->
        t = 0 # beats
        dt = 1 # beats

        work = ->
          console.log "rendering: #{t}"
          song.upcomingNotes(t, dt).forEach ([time, note, instrument]) ->
            self.playNote instrument, note, (t + time) * secondsPerBeat, offlineContext

          t += dt

          if t <= beats
            setTimeout work, 0
          else
            offlineContext.startRendering().then(resolve, reject)

        work()

      .then self.audioBufferToInt16
      .then mp3Encode
      .then (blob) ->
        url = window.URL.createObjectURL(blob)
        a = document.createElement("a")
        a.href = url
        a.download = "song.mp3"
        a.click()
        window.URL.revokeObjectURL(url)

    audioBufferToWav: (audioBuffer) ->
      new Promise (resolve, reject) ->
        workerSource = new Blob [PACKAGE.distribution["lib/wave-worker"].content], type: "application/javascript"

        worker = new Worker(URL.createObjectURL(workerSource))

        worker.onmessage = (e) ->
          blob = new Blob([e.data.buffer], {type:"audio/wav"});
          resolve(blob);

        worker.postMessage
          pcmArrays: [audioBuffer.getChannelData(0)]
          config:
            sampleRate: audioBuffer.sampleRate

    audioBufferToInt16: (audioBuffer) ->
      new Promise (resolve, reject) ->
        workerSource = new Blob [PACKAGE.distribution["lib/pcm-worker"].content], type: "application/javascript"

        worker = new Worker(URL.createObjectURL(workerSource))

        worker.onmessage = (e) ->
          resolve(e.data)

        worker.postMessage audioBuffer.getChannelData(0)

    # TODO: Should different patterns have different sample banks?
    playNote: (instrument, note, time, _context) ->
      buffer = self.samples.get(instrument).buffer
      self.playBufferNote(buffer, note, time, _context or context)

    playBufferNote: (buffer, note=0,  time=0, context) ->
      rate = Math.pow 2, note / 12

      self.playBuffer(buffer, rate, time, context)

    playBuffer: (buffer, rate=1, time=0, context) ->
      console.log "T", context.currentTime

      source = context.createBufferSource()
      source.buffer = buffer
      source.connect(context.destination)
      source.start(time + context.currentTime)
      source.playbackRate.value = rate

    playTime: ->
      playTime

    playing: ->
      playing

    pause: ->
      playing = !playing

    play: ->
      if self.patternMode()
        playTime = 0

      self.pause()
      self.patternMode false

    reset: ->
      playing = false
      playTime = 0

      self.activePattern self.patterns.get(0)

    patternPlay: ->
      self.pause()
      playTime = 0
      self.patternMode true

    loop: ->
      true
