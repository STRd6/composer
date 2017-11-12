audioBufferToInt16 = (buffer) ->
  channels = 1
  bufferLength = buffer.length
  data = new Int16Array bufferLength

  channel = 0
  buffer.forEach (sample, i) ->
    outputIndex = ( i * channels + channel )

    sample = Math.max(-1, Math.min(1, sample))

    if sample < 0
      sample *= 0x8000
    else
      sample *= 0x7FFF

    data[outputIndex] = sample

  return data

self.onmessage = (e) ->
  self.postMessage audioBufferToInt16 e.data
  self.close()
