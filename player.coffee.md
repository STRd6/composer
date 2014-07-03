Player
======

Super simple Audio player based on http://www.html5rocks.com/en/tutorials/webaudio/intro/

    AudioContext = window.AudioContext or window.webkitAudioContext
    BufferLoader = require("./lib/buffer_loader")

    module.exports = ->
      context = new AudioContext()
      window.bufferLoader = new BufferLoader(context)

      load: (urls, callback) ->
        bufferLoader.load urls, callback

      play: (index, rate=1,  time=0) ->
        source = context.createBufferSource()
        source.buffer = bufferLoader.bufferList[index]
        source.connect(context.destination)
        source.start(time)
        source.playbackRate.value = rate
