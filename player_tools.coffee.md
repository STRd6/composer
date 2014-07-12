Tools
=====

    {defaults} = require "util"

    tools = [
      (editor, {beat, note}) ->
        # Add Note to Score
        instrument = editor.activeInstrument()

        editor.addNote [beat, note, instrument]

        editor.playNote instrument, note

      (editor, {beat, note}) ->
        if editor.removeNote [beat, note]
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
