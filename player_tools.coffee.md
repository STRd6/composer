Tools
=====

    tools = [
      (editor, {x, y}) ->
        # Add Note to Score
        instrument = 0

        # Quantize
        time = quantize(x, 8)
        note = Math.floor (1 - y) * 25

        editor.addNote [time, note, instrument]

        editor.playNote instrument, note

      (editor, {x, y}) ->
        time = quantize(x, 8)
        note = Math.floor (1 - y) * 25

        editor.removeNote [time, note]
        
        # TODO: Play remove sound
    ]

    module.exports = (I, self) ->

      self.extend
        activeToolIndex: ->
          0

        activeTool: ->
          tools[self.activeToolIndex()]

        activeInstrument: ->
          0

Helpers
-------

    quantize = (x, n) ->
      (((x + 1/(2*n)) * n)|0)/n
