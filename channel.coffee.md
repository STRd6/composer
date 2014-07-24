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
          pattern = patterns[I.data[start]]
          end = start + pattern.size()

          [start, end, pattern]

      self.extend
        patterns: patternStarts

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
            4
          .maximum() ? 0

      return self
