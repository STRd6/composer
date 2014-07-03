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
      width = canvas.width()/16
      hue = 0

      canvas.drawRect
        x: 0
        y: 0
        width: width
        height: canvas.height()
        color: "hsl(#{hue}, 75%, 50%)"

      [1..15].forEach (i) ->
        
        hue = Math.floor(i / 16 * 360)

        canvas.drawRect
          x: i * width
          y: 0
          width: width
          height: canvas.height()
          color: "hsl(#{hue}, 75%, 50%)"

        canvas.drawRect
          x: i * width
          y: 0
          width: 1
          height: canvas.height()
          color: "rgba(0, 0, 0, 0.25)"

      [1..25].forEach (i) ->
        canvas.drawRect
          x: 0
          y: i * canvas.height()/25
          width: canvas.width()
          height: 1
          color: "rgba(0, 0, 0, 0.25)"

      # Draw notes
      # Draw cursor

      requestAnimationFrame(paint)

    paint()
