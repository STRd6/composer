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
        note = Math.floor y * 25 - 0.5

        if editor.removeNote [time, note]
          # Play remove sound
          # TODO: This is a hack!
          editor.playNote 16
    ]

    module.exports = (I, self) ->
      defaults I,
        activeInstrument: 1
        activeToolIndex: 0
        quantize: 4

      self.attrObservable "activeInstrument", "activeToolIndex", "quantize"

      self.activeInstrument.observe (instrument) ->
        self.playNote instrument
        self.setCursor()

      self.activeToolIndex.observe ->
        self.setCursor()

      self.extend
        activeTool: ->
          tools[self.activeToolIndex()]

Helpers
-------

    quantize = (x, n) ->
      (((x + 1/(2*n)) * n)|0)/n
