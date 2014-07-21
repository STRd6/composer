Loader
======

    Q = require "./q"

Load binary data and return a promise that will be fullflled with an ArrayBuffer
or rejected with an error.

    module.exports = (url) ->
      deferred = Q.defer()

      request = new XMLHttpRequest()
      request.open "GET", url
      request.responseType = "arraybuffer"

      request.onload = ->
        deferred.resolve request.response

      request.onerror = ->
        deferred.reject Error("Failed to load #{url}")

      request.send()

      return deferred.promise
