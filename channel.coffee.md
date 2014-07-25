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

        patternAt: (beat, patterns) ->
          patternStarts(patterns).filter ([start, end]) ->
            start <= beat < end
          .map ([start, end, pattern, patternIndex]) ->
            patternIndex
          .first()

        setPattern: (beat, patternIndex) ->
          I.data[beat] = patternIndex

        removePattern: (beat, patterns) ->
          patternStarts(patterns).filter ([start, end]) ->
            start <= beat < end
          .forEach ([start]) ->
            delete I.data[start]

        upcomingNotes: (t, dt, patterns) ->
          patternStarts(patterns).filter ([start, end, pattern]) ->
            (start <= t < end) or # t is within pattern or
            (t <= start < t + dt) # pattern start is within [t, t + dt)
          .map ([start, end, pattern]) ->
            offset = t - start

            pattern.upcomingNotes(offset, dt).map ([time, note, instrument]) ->
              [time - offset, note, instrument]
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
