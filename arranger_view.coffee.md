Arranger View
=============

    {LIGHT, DARK} = require "./colors"

    patternCount = 10
    patternColors = [
      200
      0
      180
      -90
      130
      -50
      60
      0
      -60
      40
    ].map (h, i) ->
      if i is 6
        s = "0%"
      else
        s = "87%"

      if i is 8
        v = "100%"
      else
        v = "50%"
      "hsl(#{h}, #{s}, #{v})"

    require "cornerstone"

    unitX = 20
    unitY = 20

    module.exports = (I={}, self=Model(I))->
      Canvas = require "touch-canvas"
      canvas = Canvas
        height: 80
        width: 128 * unitX

      canvasHelpers canvas

      element = document.createElement "div"
      element.classList.add "arranger-wrap"

      element.appendChild canvas.element()

      pos =
        channel: 0
        beat: 0

      $(canvas.element()).mousemove (e) ->
        {left, top} = canvas.element().getBoundingClientRect()

        {pageX:x, pageY:y} = e

        pos.beat = 0|((x - left) / unitX)
        pos.channel = 0|((y - top) / unitY)

      canvas.on "touch", (p) ->
        beat = Math.floor(p.x * canvas.width() / unitX)
        channel = Math.floor(p.y * canvas.height() / unitY)

        self.onclick?(channel, beat)

      drawPosition = (canvas) ->
        canvas.drawText
          text: "#{pos.beat}, #{pos.channel}"
          x: 20
          y: 30
          color: "black"

      drawPattern = (canvas, channel, beat, size, color) ->
        canvas.drawRect
          x: beat * unitX
          y: channel * unitY
          width: size * unitX
          height: unitY - 1
          color: color
          stroke:
            width: 1
            color: DARK

      drawChannel = (canvas, patterns, i) ->
        patterns.forEach ([start, end, pattern, index]) ->
          drawPattern(canvas, i, start, pattern.size(), patternColors[index])

        if i is pos.channel
          size = self.activePattern().size()
          # Draw hover
          canvas.withAlpha 0.25, ->
            drawPattern(canvas, i, pos.beat, size, patternColors[self.activePatternIndex()])

        # Draw line
        canvas.drawRect
          x: 0
          y: 20 * (i + 1) - 1
          width: canvas.width()
          height: 1
          color: LIGHT

      # External Observables
      # self.patterns
      # self.activePatternIndex

      # External Event
      # self.onclick

      self.extend
        activePatternIndex: Observable 0

        activePattern: ->
          self.patterns.get(self.activePatternIndex())

        render: (song) ->
          canvas.fill("white")

          song.channels().forEach (channel, i) ->
            patterns = song.channelPatterns(i)
            drawChannel(canvas, patterns, i)

          drawPosition(canvas)

        element: ->
          element

Helpers
-------

    canvasHelpers = (canvas) ->
      canvas.withAlpha = (alpha, fn) ->
        oldAlpha = canvas.globalAlpha()
        canvas.globalAlpha alpha * oldAlpha

        try
          fn(canvas)
        finally
          canvas.globalAlpha oldAlpha

        return canvas
