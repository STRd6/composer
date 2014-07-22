Channel
=======


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
