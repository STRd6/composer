loader = require "../lib/audio_loader"

describe "Loader", ->
  it "should load array buffers", (done) ->
    loader("https://addressable.s3.amazonaws.com/composer/data/f122a3a8f29ec09b0d61d0254022c0fc338240b3")
    .then (buffer) ->
      console.log buffer
      done()
    .catch (error) ->
      console.log error
      done()
    .done()
