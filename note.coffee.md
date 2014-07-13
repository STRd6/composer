Note
====

Translate a number to a music note name.

    notes = "C C# D D# E F F# G G# A A# B".split(" ")

-1 is B3
0 is C4
1 is C#4
...

    module.exports = (noteNumber) ->
      noteNumber |= 0

      note = notes.wrap noteNumber

      octave = 4 + (noteNumber / 12)|0

      "#{note}#{octave}"
