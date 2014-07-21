Tools
=====

    require "cornerstone"

    tools = [
      (editor, {beat, note}) ->
        # Add Note to Score
        instrument = editor.activeInstrument()

        editor.addNote [beat, note, instrument]

        editor.playNote instrument, note

      (editor, {beat, note}) ->
        if editor.removeNote [beat, note]
          ;# TODO: Play remove sound
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
