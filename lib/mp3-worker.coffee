# takes samples as an Int16Array, returns a blob with type audio/mp3
module.exports = (samples) ->
  remoteWorker("https://danielx.whimsy.space/cdn/util/lame-worker.js")
  .then (worker) ->
    new Promise (resolve, reject) ->
      worker.postMessage samples

      worker.onmessage = (e) ->
        resolve e.data

remoteWorker = (url) ->
  fetch(url)
  .then (response) ->
    response.arrayBuffer()
  .then (buffer) ->
    blob = new Blob [buffer], type: "application/javascript"
    URL.createObjectURL(blob)
  .then (url) ->
    new Worker(url)
