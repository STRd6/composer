Pattern Tools
=============

    require "cornerstone"

    tools = [
      (self, {beat, note}) ->
        # Add Note to Score
        instrument = self.activeInstrument()

        self.addNote [beat, note, instrument]

        self.playNote instrument, note

      (self, {beat, note}) ->
        if self.activePattern().removeNote [beat, note]
          ;# TODO: Play remove sound
    ]

    module.exports = (I, self) ->
      defaults I,
        activeInstrument: 1
        activeToolIndex: 0

      self.attrObservable "activeInstrument", "activeToolIndex"

      self.extend
        activeTool: ->
          tools[self.activeToolIndex()]

      self.activeInstrument.observe (instrument) ->
        self.playNote instrument
        self.setCursor()

      self.activeToolIndex.observe ->
        self.setCursor()

      # Hotkeys
      self.include require "hotkeys"

      self.addHotkey "space", "play"

      [1..9].forEach (i) ->
        self.addHotkey i.toString(), ->
          self.activeInstrument i - 1
          self.activeToolIndex(0)

      self.addHotkey "0", ->
        self.activeInstrument 9
        self.activeToolIndex(0)

      self.addHotkey "e", ->
        self.activeToolIndex(1)

      return self
