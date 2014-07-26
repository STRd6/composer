Audio Loader
============

    Deferred = require "./deferred"
    loader = require "./loader"

    context = require "./audio_context"

    module.exports = (url) ->
      deferred = Deferred()

      loader(url)
      .then (buffer) ->
        context.decodeAudioData buffer, deferred.resolve, deferred.reject
      .catch(deferred.reject)
      .done()

      deferred.promise
