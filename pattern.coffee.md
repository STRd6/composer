Pattern
=======

A `Pattern` is a list of [beat, note, instrument] tuples.

`beats` is the length of the pattern.

    require "cornerstone"

    module.exports = (I={}, self=Model(I)) ->
      defaults I,
        beats: 4
        notes: []

      self.attrObservable "beats"
      self.attrAccessor "notes"

      extend self,
        addNote: (note) ->
          I.notes.push(note)

        removeNote: ([time, note]) ->
          matched = I.notes.filter ([t, n]) ->
            time is t and note is n

          self.notes().remove matched.last()

        size: ->
          self.beats()

`t` and `dt` are in beats.

        upcomingNotes: (t, dt) ->
          self.notes().filter ([time]) ->
            if dt > 0
              t <= time < t + dt
            else if dt < 0
              t + dt < time <= t
          .map ([time, note, instrument]) ->
            [time - t, note, instrument]
