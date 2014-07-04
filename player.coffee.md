Player
======

Super simple Audio player based on http://www.html5rocks.com/en/tutorials/webaudio/intro/

    AudioContext = window.AudioContext or window.webkitAudioContext
    BufferLoader = require("./lib/buffer_loader")

    {extend} = require "util"

    module.exports = (I, self) ->
      context = new AudioContext()
      window.bufferLoader = new BufferLoader(context)

      self =
        load: (urls, callback) ->
          bufferLoader.load urls, callback
  
        playNote: (index, note=0,  time=0) ->
          rate = Math.pow 2, note / 12

          source = context.createBufferSource()
          source.buffer = bufferLoader.bufferList[index]
          source.connect(context.destination)
          source.start(time + context.currentTime)
          source.playbackRate.value = rate
  
        include: (module) ->
          module(I, self)
  
          return self

        extend: (args...) ->
          extend self, args...