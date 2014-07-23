Player View
===========

    LIGHT = "rgba(0, 0, 0, 0.0625)"
    DARK = "rgba(0, 0, 0, 0.25)"

    noteName = require "./note"

    module.exports = (I, self) ->
      Canvas = require "touch-canvas"

      canvas = Canvas()

      $(canvas.element()).mousemove (e) ->
        {pageX:x, pageY:y} = e
        note = Math.round positionToNote(y)
        beat = quantize(x / canvas.width() * self.beats(), self.quantize())
        $(".position").text "T: #{beat.toFixed(2)}, #{noteName note}"

      canvas.on "touch", (p) ->
        data =
          note: Math.round(positionToNote(p.y * canvas.height()))
          beat: quantize(p.x * self.beats(), self.quantize())

        self.activeTool()(self, data)

      document.body.appendChild canvas.element()

      handleResize =  ->
        canvas.width(window.innerWidth)
        canvas.height(window.innerHeight)

      handleResize()
      window.addEventListener "resize", handleResize, false

      drawNote = (canvas, note) ->
        [time, note, instrument] = note

        {width, height} = img = self.samples.get(instrument).image

        x = time * (canvas.width()/self.beats()) - width/2
        y = noteToPosition(note) - height/2

        canvas.drawImage img, x, y

      drawTemporalGuides = (canvas) ->
        # TODO: View Offset

        n = self.beats() * self.quantize()

        width = canvas.width()/n

        [0..n-1].forEach (i) ->
          if mod(i, self.quantize()) is 0
            color = DARK
          else
            color = LIGHT

          canvas.drawRect
            x: width * i
            y: 0
            width: 1
            height: canvas.height()
            color: color

      noteToPosition = (note) ->
        [low, high] = self.gamut()

        n = (high - low) + 1
        mid = (high + low) / 2
        height = canvas.height()/n

        canvas.height() - (note - mid + n/2) * height

      positionToNote = (position) ->
        [low, high] = self.gamut()

        n = (high - low) + 1
        mid = (high + low) / 2
        height = canvas.height()/n

        note = canvas.height() / height - (position / height + n/2 - mid)

      drawScaleGuides = (canvas) ->
        [low, high] = self.gamut()

        [low..high].forEach (i, index) ->
          if inScale(i)
            color = DARK
          else
            color = LIGHT

          canvas.drawRect
            x: 0
            y: noteToPosition(i)
            width: canvas.width()
            height: 1
            color: color

      inScale = (i, scale=0) ->
        i = mod i + scale, 12

        [0, 2, 4, 5, 7, 9, 11].some (n) ->
          n is i

      paint = ->
        canvas.fill "white"

        drawScaleGuides(canvas)
        drawTemporalGuides(canvas)

        # Draw notes
        self.notes().forEach (note) ->
          drawNote(canvas, note)

        # Draw player cursor
        canvas.drawRect
          x: self.playTime() * canvas.width() / self.beats()
          y: 0
          width: 1
          height: canvas.height()
          color: "#F0F"

        requestAnimationFrame(paint)

      paint()

      # TODO: This doesn't seem to be the place for this
      self.samples.observe ->
        self.setCursor()

      self.extend
        setCursor: ->
          if self.activeToolIndex() is 0
            if sample = self.samples.get(self.activeInstrument())
              {width, height, src:url} = img = sample.image

              # Kill query string so we don't accidentally cache the crossdomain image as
              # non-crossdomain 
              # TODO: handle it better, probably need to generate resource URLs from the 
              # raw data of the crossdomain images
              url = url.replace(/\?.*/, "") 

              # Center cursor
              x = width/2
              y = height/2

              $(canvas.element()).css
                cursor: "url(#{url}) #{x} #{y}, default"
          else # Eraser
            $(canvas.element()).css
              cursor: "url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAAIdJREFUeJzNUsERwCAIw15n031wDt0Hl0s/9VoF9NnmZzRBCERfI2zusdOtDABmopRGVoRCrdviADNMiADM6L873Mql2NYiw3E2WItzVi2dSuw8JBHNvQyegcU4vmjNFesWZrHFTSlYQ/RhRDgatKZFnXPy7zMIoVaYa3fH5i3PTHira4r/gQv1W1E4p9FksQAAAABJRU5ErkJggg==) 8 8, default"

Helpers
-------

    mod = (n, k) ->
      (n % k + k) % k

Helpers
-------

    quantize = (x, n) ->
      (((x + 1/(2*n)) * n)|0)/n
