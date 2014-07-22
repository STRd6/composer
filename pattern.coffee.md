Pattern
=======

    require "cornerstone"
    Sample = require "./sample"

    module.exports = (I={}, self=Model(I)) ->
      defaults I,
        beats: 4
        gamut: [-12, 18]
        notes: []
        samples: []

      self.attrObservable "beats", "samples"
      self.attrAccessor "notes", "gamut"

      # Loading default sample pack
      Sample.loadPack(require("../samples"))
      .then self.samples
      .done()

      extend self,
        addNote: (note) ->
          I.notes.push(note)

        removeNote: ([time, note]) ->
          # TODO: Some leeway to pick nearby note
          matched = I.notes.filter ([t, n]) ->
            time is t and note is n

          self.notes().remove matched.last()

`t` and `dt` are in beats.

        upcomingNotes: (t, dt) ->
          self.notes().filter ([time]) ->
            if dt > 0
              t <= time < t + dt
            else if dt < 0
              t + dt < time <= t

        transpose: ->
          if amount = prompt "Transpose (semitones)"
            amount = parseInt(amount, 10)

            I.notes.forEach (note) ->
              note[1] += amount
