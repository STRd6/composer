Sample
======

    Q = require "./lib/q"
    Deferred = require "./lib/deferred"

    bufferLoader = require "./lib/audio_loader"

    urlFor = (sha) ->
      "http://a0.pixiecdn.com/composer/data/#{sha}"

    getImage = (url) ->
      image = new Image
      image.crossOrigin = true
      image.src = url

      return image

A sample has an image and a sound buffer. Both can be loaded from URLs. If they
are loaded from URLs then they must allow CORS.

    module.exports = Sample = (I={}) ->

      self =
        image: getImage(I.spriteURL)
        buffer: null

      return self

    Sample.load = (data) ->
      deferred = Deferred()
      {sprite, sample} = data

      # Load audio buffer
      bufferLoader(urlFor(sample))
      .then (buffer) ->
        deferred.fulfill
          buffer: buffer
          image: getImage(urlFor(sprite))
      .catch deferred.reject
      .done()

      return deferred.promise

    Sample.loadPack = (samplePack) ->
      Q.all(samplePack.map(Sample.load))
