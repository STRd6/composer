Tools
=====

    {defaults} = require "util"

    tools = [
      (editor, {x, y}) ->
        # Add Note to Score
        instrument = editor.activeInstrument()

        # Quantize
        time = quantize(x, editor.quantize())
        # TODO: Fix these offset hacks!
        note = Math.floor y * 25 - 0.5

        editor.addNote [time, note, instrument]

        editor.playNote instrument, note

      (editor, {x, y}) ->
        time = quantize(x, editor.quantize())
        note = Math.floor (1 - y) * 25

        editor.removeNote [time, note]

        # TODO: Play remove sound
    ]

    module.exports = (I, self) ->
      defaults I,
        activeInstrument: 1
        quantize: 4

      self.attrAccessor "activeInstrument", "quantize"

      self.extend
        activeToolIndex: ->
          0

        activeTool: ->
          tools[self.activeToolIndex()]

Helpers
-------

    quantize = (x, n) ->
      (((x + 1/(2*n)) * n)|0)/n
