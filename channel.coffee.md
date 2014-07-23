Channel
=======

A channel holds a sequence of patterns. The patterns are stored in the `data`
array at beat indexes. If an element in the array is `null` then it continues the
previous pattern.

`[1, null, null, null, 2, null, null, null, 1]` for example would play pattern
1 starting at beat 0, then pattern 2 starting at beat 4, then pattern 1 again
starting at beat 8.

Pattern 0 is the 'empty pattern' and plays no sounds.

`[1, 0, null, null, 1]` this would play the first beat of pattern 1 then nothing
for three beats, then pattern 1 for the length of the pattern.

The data must end on a non-null index.

This array structure is basically a poor man's sparse array.

    require "cornerstone"

    module.exports = (I={}, self=Model(I)) ->
      defaults I,
        data: [0] # Pattern 0 is the 'empty pattern'

      patternAt = (t) ->
        i = t|0

        while !(patternIndex = I.data[i])? and i >= 0
          i -= 1

        pattern = patternIndex
        offset = t - i

        return [patternIndex, offset]

      self.extend
        upcomingNotes: (t, dt, patterns) ->
          [patternIndex, offset] = patternAt(t)

          if patternIndex?
            pattern = patterns[patternIndex]
            offset %= pattern.beats()

            pattern.upcomingNotes(offset, dt)
          else
            []

        size: (patterns) ->
          console.log I.data.length

          if I.data.length
            I.data.length - 1 + patterns[I.data.last()].beats()
          else
            0

      return self
