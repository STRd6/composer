Player
======

Super simple Audio player based on http://www.html5rocks.com/en/tutorials/webaudio/intro/

    AudioContext = window.AudioContext or window.webkitAudioContext
    BufferLoader = require("./lib/buffer_loader")

    require "cornerstone"

    module.exports = (I, self=Model(I)) ->
      context = new AudioContext()
      window.bufferLoader = new BufferLoader(context)

      self.extend
        load: (urls, callback) ->
          bufferLoader.load urls, callback

Schedule a note to be played, use the buffer at the given index, pitch shift by
`note` semitones, and play at `time` seconds in the future.

        playNote: (index, note=0,  time=0) ->
          rate = Math.pow 2, note / 12

          buffer = bufferLoader.bufferList[index]

          self.playBuffer(buffer, rate, time)

        playBuffer: (buffer, rate=1, time=0) ->
          source = context.createBufferSource()
          source.buffer = buffer
          source.connect(context.destination)
          source.start(time + context.currentTime)
          source.playbackRate.value = rate

      self.include require "./player_tools"
      self.include require "./player_score"
      self.include require "./player_view"
      self.include require "./player_hotkeys"

      self.setCursor()

      return self
