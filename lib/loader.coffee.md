Loader
======

Load binary data and return a promise that will be fullflled with an ArrayBuffer
or rejected with an error.

    module.exports = (url) ->
      new Promise (resolve, reject) ->
        request = new XMLHttpRequest()
        request.open "GET", url
        request.responseType = "arraybuffer"

        request.onload = ->
          resolve request.response

        request.onerror = ->
          reject Error("Failed to load #{url}")

        request.send()
