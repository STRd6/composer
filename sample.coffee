bufferLoader = require "./lib/audio-loader"

urlFor = (sha) ->
  n = 4
  i = parseInt(sha.slice(-1), 0x10) % n

  "https://a#{i}.pixiecdn.com/composer/data/#{sha}?xdomain"

getImage = (url) ->
  image = new Image
  image.crossOrigin = true
  image.src = url

  return image

module.exports = Sample = (I={}) ->

  self =
    image: getImage(I.spriteURL)
    buffer: null

  return self

Sample.load = (data) ->
  {sprite, sample} = data

  # Load audio buffer
  bufferLoader(urlFor(sample))
  .then (buffer) ->
    buffer: buffer
    image: getImage(urlFor(sprite))

Sample.loadPack = (samplePack) ->
  Promise.all(samplePack.map(Sample.load))
