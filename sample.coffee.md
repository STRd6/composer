Sample
======

    Deferred = require "./lib/deferred"
    
    bufferLoader = require "./lib/audio_loader"
    
    urlFor = (sha) ->
      "https://addressable.s3.amazonaws.com/composer/data/#{sha}"

    getImage = (url) ->
      image = new Image
      image.crossOrigin = true
      image.src = url

      return image

A sample has an image and a sound buffer. Both can be loaded from URLs. If they
are loaded from URLs then they must allow CORS.

    module.exports = Sample (I={}) ->

      self =
        image: getImage(I.spriteURL)
        buffer: null

      return self

    Sample.load = (data) ->
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
