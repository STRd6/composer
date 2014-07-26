Sample = require "../sample"

describe "Sample", ->
  it "should be able to load a sample pack", (done) ->
    Sample.loadPack(require("../samples"))
    .then (samples) ->
      console.log samples
      done()
    .done()
