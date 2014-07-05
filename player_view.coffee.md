Player View
===========

    module.exports = (I, self) ->
      Canvas = require "touch-canvas"
  
      canvas = Canvas()

      canvas.on "touch", ({x, y}) ->
        # Add Note to Score
        instrument = 0

        # TODO: Quantize
        time = x
        note = Math.floor (1 - y) * 25
        
        self.addNote [time, note, instrument]

        self.playNote instrument, note
  
      handleResize =  ->
        canvas.width(window.innerWidth)
        canvas.height(window.innerHeight)

      handleResize()
      window.addEventListener "resize", handleResize, false

      document.body.appendChild canvas.element()

      paint = ->
        canvas.fill "white"

        [1..25].forEach (i) ->
          canvas.drawRect
            x: 0
            y: i * canvas.height()/25
            width: canvas.width()
            height: 1
            color: "rgba(0, 0, 0, 0.25)"

        # Draw notes
        self.notes().forEach ([time, note, instrument]) ->
          canvas.drawRect
            x: time * canvas.width() - 12
            y: (24 - note) * canvas.height() / 25
            width: 25
            height: 25
            color: "black"

        # Draw cursor
        canvas.drawRect
          x: self.playTime() * canvas.width()
          y: 0
          width: 1
          height: canvas.height()
          color: "#F0F"

        requestAnimationFrame(paint)
  
      paint()