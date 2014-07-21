Player
======

Super simple Audio player based on http://www.html5rocks.com/en/tutorials/webaudio/intro/

    context = require "./lib/audio_context"

    require "cornerstone"

    module.exports = (I, self=Model(I)) ->
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

      self.include require "./player_tools"
      self.include require "./pattern"
      self.include require "./player_view"
      self.include require "./player_hotkeys"

      self.setCursor()

      return self
