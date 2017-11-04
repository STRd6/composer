blobToUint8Array = (blob) ->
  new Promise (resolve, reject) ->
    fileReader = new FileReader()
  
    fileReader.onerror = reject
    fileReader.onload = ->
      resolve new Uint8Array(this.result)

    fileReader.readAsArrayBuffer(blob)

uint8ArrayToFloat32Array = (u8a) ->
  f32Buffer = new Float32Array(u8a.length)
  i = 0
  l = u8a.length

  while i < l
  	value = u8a[i<<1] + (u8a[(i<<1)+1]<<8)
  	if (value >= 0x8000) 
  	  value |= ~0x7FFF
  	f32Buffer[i] = value / 0x8000
  	i += 1

  return f32Buffer

parseWav = (wav) ->
  readInt = (i, bytes) ->
    ret = 0
    shft = 0
    
    while bytes > 0
    	ret += wav[i] << shft
    	shft += 8
    	i++
    	bytes--
    
    return ret

  throw 'Invalid compression code, not PCM' if readInt(20, 2) != 1
  throw 'Invalid number of channels, not 1' if readInt(22, 2) != 1

  sampleRate: readInt(24, 4)
  bitsPerSample: readInt(34, 2)
  samples: wav.subarray(44)

remoteWorker = (url) ->
  fetch(url)
  .then (response) ->
    response.arrayBuffer()
  .then (buffer) ->
    blob = new Blob [buffer], type: "application/javascript"
    URL.createObjectURL(blob)
  .then (url) ->
    new Worker(url)

module.exports = (wavBlob) ->
  blobToUint8Array(wavBlob)
  .then parseWav
  .then (data) ->
    remoteWorker("https://danielx.whimsy.space/cdn/util/libmp3lame-worker.js")
    .then (encoderWorker) ->
      new Promise (resolve, reject) ->
        encoderWorker.postMessage
          cmd: 'init'
          config:
            mode : 3
            channels: 1
            samplerate: data.sampleRate
            bitrate: data.bitsPerSample

        encoderWorker.postMessage
          cmd: 'encode'
          buf: uint8ArrayToFloat32Array data.samples

        encoderWorker.postMessage
          cmd: 'finish'

        encoderWorker.onmessage = (e) ->
          if e.data.cmd is 'data'
            console.log("Done converting to Mp3")

            mp3Blob = new Blob [new Uint8Array(e.data.buf)], type: 'audio/mp3'

            resolve mp3Blob
