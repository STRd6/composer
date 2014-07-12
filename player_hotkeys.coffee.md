Hotkeys
=======

    module.exports = (I, self) ->
      self.include require "hotkeys"

      self.addHotkey "space", "play"

      [0..9].forEach (i) ->
        self.addHotkey i.toString(), ->
          self.activeInstrument i
          self.activeToolIndex(0)

      self.addHotkey "e", ->
        self.activeToolIndex(1)
