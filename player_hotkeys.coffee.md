Hotkeys
=======

    module.exports = (I, self) ->
      self.include require "hotkeys"

      self.addHotkey "space", "play"

      [0..9].forEach (i) ->
        self.addHotkey i.toString(), ->
          self.activeInstrument i
          # TODO: Make cursor setting observable
          self.setCursor()
