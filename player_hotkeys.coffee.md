Hotkeys
=======

    module.exports = (I, self) ->
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
