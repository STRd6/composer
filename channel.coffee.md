Channel
=======

A channel holds a sequence of patterns. The patterns are stored in the `data`
table at beat keys with `patternId` values.

    require "cornerstone"

    module.exports = (I={}, self=Model(I)) ->
      defaults I,
        data: {}

      patternStarts = (patterns) ->
        Object.keys(I.data).map (start) ->
          start = parseInt(start, 10)
          patternIndex = parseInt(I.data[start], 10)
          pattern = patterns[patternIndex]
          end = start + pattern.size()

          [start, end, pattern, patternIndex]

      self.extend
        patterns: patternStarts

        canSet: (beat, patternIndex, patterns) ->
          size = patterns[patternIndex].size()

          toInsert = [beat, beat + size]

          # Can't set if there are any overlaps
          !patternStarts(patterns).some (segment) ->
            overlap(toInsert, segment)

        patternDataAt: (beat, patterns) ->
          patternStarts(patterns).filter ([start, end]) ->
            start <= beat < end

        patternAt: (beat, patterns) ->
          self.patternDataAt(beat, patterns)
          .map ([start, end, pattern, patternIndex]) ->
            patternIndex
          .first()

        setPattern: (beat, patternIndex) ->
          I.data[beat] = patternIndex

        removePattern: (beat, patterns) ->
          patternsAtBeat = patternStarts(patterns).filter ([start, end]) ->
            start <= beat < end

          patternsAtBeat.forEach ([start]) ->
            delete I.data[start]

          return patternsAtBeat.length > 0

        upcomingNotes: (t, dt, patterns) ->
          patternStarts(patterns).filter ([start, end, pattern]) ->
            (start <= t < end) or # t is within pattern or
            (t <= start < t + dt) # pattern start is within [t, t + dt)
          .map ([start, end, pattern]) ->
            offset = t - start

            pattern.upcomingNotes(offset, dt)
          .flatten()

        size: (patterns) ->
          patternStarts(patterns).map ([start, end]) ->
            end
          .maximum() ? 0

      return self

Helpers
-------

    {min, max} = Math

    overlap = ([a1, a2], [b1, b2]) ->
      max(0, min(a2, b2) - max(a1, b1)) > 0
