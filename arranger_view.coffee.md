Arranger View
=============

    {LIGHT, DARK} = require "./colors"

    module.exports = ->
      Canvas = require "touch-canvas"
      canvas = Canvas
        height: 80
        width: 128 * 20

      element = document.createElement "div"
      element.classList.add "arranger-wrap"

      element.appendChild canvas.element()

      p =
        x: 0
        y: 0

      $(canvas.element()).mousemove (e) ->
        {left, top, width, height} = canvas.element().getBoundingClientRect()

        {pageX:x, pageY:y} = e

        p =
          x: (x - left) / width
          y: (y - top) / height

      canvas.on "touch", (p) ->


      unitX = 20
      unitY = 20

      drawPosition = (canvas) ->
        canvas.drawText
          text: "#{p.x.toFixed(2)}, #{p.y.toFixed(2)}"
          x: canvas.width() - 50
          y: 15
          color: "black"

      drawChannel = (canvas, patterns, i) ->
        # TODO: Draw each pattern

        patterns.forEach ([start, end, pattern]) ->
          canvas.drawRect
            x: start * unitX
            y: i * unitY
            width: pattern.size() * unitX
            height: unitY
            color: "hsl(0, 87%, 50%)"
            stroke:
              width: 1
              color: DARK

        canvas.drawRect
          x: 0
          y: 20 * (i + 1)
          width: canvas.width()
          height: 1
          color: LIGHT

      self.extend
        render: (song) ->
          canvas.fill("white")

          song.channels().forEach (channel, i) ->
            patterns = song.channelPatterns(i)
            drawChannel(canvas, patterns, i)

          drawPosition(canvas)

        element: ->
          element
