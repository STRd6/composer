Composer
========


Compose music on the internets?
    {applyStylesheet} = require "util"

    applyStylesheet require "./style"

    player = require("./player")()

    sounds = [1..16].map (n) ->
      "http://addressable.s3.amazonaws.com/mpc/musicnote#{n}.wav"

    player.load sounds, ->
      console.log "Loaded!"

    Canvas = require "touch-canvas"

    canvas = Canvas()

    canvas.on "touch", (p) ->
      instrument = Math.floor p.x * 16
      note = Math.floor (1 - p.y) * 25

      rate = Math.pow 2, note / 12

      player.play instrument, rate

    handleResize =  ->
      canvas.width(window.innerWidth)
      canvas.height(window.innerHeight)
  
    handleResize()
    window.addEventListener "resize", handleResize, false

    document.body.appendChild canvas.element()

    paint = ->
      canvas.fill "orange"
      # Draw notes
      # Draw cursor

      requestAnimationFrame(paint)

    paint()
