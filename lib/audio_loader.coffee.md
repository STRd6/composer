Audio Loader
============

    Q = require "./q"
    loader = require "./loader"

    context = require "./audio_context"

    module.exports = (url) ->
      deferred = Q.defer()

      loader(url)
      .then (buffer) ->
        context.decodeAudioData buffer, deferred.resolve, deferred.reject
      .catch(deferred.reject)
      .done()

      deferred.promise
