loader = require "./loader"

context = require "./audio-context"

module.exports = (url) ->
  new Promise (resolve, reject) ->
    loader(url)
    .then (buffer) ->
      context.decodeAudioData buffer, resolve, reject
