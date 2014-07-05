Player View
===========

    images = [
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACMAAAAgCAYAAACYTcH3AAABeElEQVRYR+2XMU4DMRBF7RtEoky7J8iSLiIlDR1HoIMT5AQ5QdLlCOloUoLSQTjBtpRI3AD4K0006/V4xxuvguS4WmntmTffM2Pb/vwN80+GvcAIO9GpjLX2pE2MyYIWDDmHEXxP3lYnwXxMnwzZgqEQXAMGzu8/N2Y7fjgaSAnDbfsiVMMgwphBQXBlksDAYFVVMSymKIp6i/OAQbRdCtGcZMpgP5DEGCS1C8HBfJAcBnaQL2RXqihvafOFEgwMwyGGTy0OowGBHW/T4yUegglltAtD7SK0RuzA1Px4icaUk7tO04mDx0HKDqwJRA0jNb2uDk19JimMxphvTt4wh+tHU76vveLloczh6tmUX3di+sxHr+bl+6bxfxBlAELDBdrNFvWv2/2yBToIDLxIypwFpk95D6bM2WH6ALhrNOeSeGpLAO6Fnc8L/dMG1Plu0jrMD8Z9UUrPDa4MV1ObL6qcISfcge/Wpp3X66ZHi6S3thuxdl4I5hcgNeqwgiRFxgAAAABJRU5ErkJggg=="
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABDklEQVRYhe1WwRHCMAxzuT7YoZOwR3foTOzAHkzCDjy4M58UmtbBUupePuiZOJbOdmyLNEZX8UaD/NAPVUTkdb5sLvrnvVoMaqwWsYUkBhZxiiSvQR9BvkpBqIBaYhUwDZ6RW3iP2zU7H8YJ8fv145B3icz6ehn5ME4bMQiQIswIQRIVu19sAKUg2elMnsL8EVUCkg4vAp3lYCa1BLFgW6gWii4TtDh3/cOdELSjfSNGS3JWsGvP/AImXaGz4FAwAmrqwAU6C+aQhoughxExHaE6aJ4C9Bsu7cwdoTCaXf9MCn6O5vV5EuTuBSF9wBKFrnHN+wCagmL49wKOwFGbMSyA3XxR+yPHMeP/j3Z4A6F+XR8/HV/0AAAAAElFTkSuQmCC"
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAA9klEQVRYR+1VQQ7DIAwrt/W2/f+R2227scIIDYgsMepUTQqntoLY2E4alpNXOBl/cQKugCvwlwpEYXZMXQY5lIHj5driP+/5PYRaCqlpHkRxWx/g9TYkQB8LETMJy0YZnFCLCjMk7ATo5h1YVYR9R1TQCMTG8x6crtzbkjLxeuRoaD87bQNGgAhuhI4jkMInyc8VmMyBrkCffkMGWFtq9VWP9A7gJv/aguKrmCse2KMykIcfIdIwSm0mPTN2qvymNikFdyvK2B0RQLyvQ0vr0xGBb2eQIYQokK2o/wOBAQqOEmjyIHEwKlq3mYKCFkX2OwFXwBV4A45aZSF7iJhTAAAAAElFTkSuQmCC"
    ].map (src) ->
      img = new Image
      img.src = src

      img

    module.exports = (I, self) ->
      Canvas = require "touch-canvas"

      canvas = Canvas()

      canvas.on "touch", (p) ->
        self.activeTool()(self, p)

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
