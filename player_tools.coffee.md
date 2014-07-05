Tools
=====

    {defaults} = require "util"

    tools = [
      (editor, {x, y}) ->
        # Add Note to Score
        instrument = editor.activeInstrument()

        # Quantize
        time = quantize(x, 8)
        # TODO: Fix these offset hacks!
        note = Math.floor (1 - y) * 25 - 0.65

        editor.addNote [time, note, instrument]

        editor.playNote instrument, note

      (editor, {x, y}) ->
        time = quantize(x, 8)
        note = Math.floor (1 - y) * 25

        editor.removeNote [time, note]
        
        # TODO: Play remove sound
    ]

    module.exports = (I, self) ->
      defaults I,
        activeInstrument: 1

      self.attrAccessor "activeInstrument"

      self.extend
        activeToolIndex: ->
          0

        activeTool: ->
          tools[self.activeToolIndex()]

Helpers
-------

    quantize = (x, n) ->
      (((x + 1/(2*n)) * n)|0)/n
