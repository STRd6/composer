Player View
===========

    quantize = (x, n) ->
      (((x + 1/(2*n)) * n)|0)/n
      

    images = [
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACMAAAAgCAYAAACYTcH3AAABeElEQVRYR+2XMU4DMRBF7RtEoky7J8iSLiIlDR1HoIMT5AQ5QdLlCOloUoLSQTjBtpRI3AD4K0006/V4xxuvguS4WmntmTffM2Pb/vwN80+GvcAIO9GpjLX2pE2MyYIWDDmHEXxP3lYnwXxMnwzZgqEQXAMGzu8/N2Y7fjgaSAnDbfsiVMMgwphBQXBlksDAYFVVMSymKIp6i/OAQbRdCtGcZMpgP5DEGCS1C8HBfJAcBnaQL2RXqihvafOFEgwMwyGGTy0OowGBHW/T4yUegglltAtD7SK0RuzA1Px4icaUk7tO04mDx0HKDqwJRA0jNb2uDk19JimMxphvTt4wh+tHU76vveLloczh6tmUX3di+sxHr+bl+6bxfxBlAELDBdrNFvWv2/2yBToIDLxIypwFpk95D6bM2WH6ALhrNOeSeGpLAO6Fnc8L/dMG1Plu0jrMD8Z9UUrPDa4MV1ObL6qcISfcge/Wpp3X66ZHi6S3thuxdl4I5hcgNeqwgiRFxgAAAABJRU5ErkJggg=="
    ].map (src) ->
      img = new Image
      img.src = src

      img

    module.exports = (I, self) ->
      Canvas = require "touch-canvas"

      canvas = Canvas()

      canvas.on "touch", ({x, y}) ->
        # Add Note to Score
        instrument = 0

        # Quantize
        time = quantize(x, 8)
        note = Math.floor (1 - y) * 25

        self.addNote [time, note, instrument]

        self.playNote instrument, note
  
      handleResize =  ->
        canvas.width(window.innerWidth)
        canvas.height(window.innerHeight)

      handleResize()
      window.addEventListener "resize", handleResize, false

      document.body.appendChild canvas.element()

      drawNote = (canvas, note) ->
        [time, note, instrument] = note

        {width, height} = img = images[instrument]

        x = time * canvas.width() - width/2
        y = (24 - note) * canvas.height() / 25 - height/2

        canvas.drawImage img, x, y

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
        self.notes().forEach (note) ->
          drawNote(canvas, note)

        # Draw cursor
        canvas.drawRect
          x: self.playTime() * canvas.width()
          y: 0
          width: 1
          height: canvas.height()
          color: "#F0F"

        requestAnimationFrame(paint)
  
      paint()