Song
====

A song has a tempo, a number of channels, and a number of patterns.

Patterns are placed in the channels.

    require "cornerstone"

    Channel = require "./channel"
    Pattern = require "./pattern"

    module.exports = (I={}, self=Model(I)) ->
      defaults I,
        channels: [{
          data: 
            0: 0
        }, {}, {}, {}]
        patterns: [{}]
        tempo: 90

      self.attrObservable "tempo"

      self.attrModels "channels", Channel
      self.attrModels "patterns", Pattern

      # Init Patterns
      [0..9].forEach (n) ->
        self.patterns()[n] ?= Pattern()

      self.extend
        channelPatterns: (n) ->
          self.channels.get(n).patterns(self.patterns())

        setPattern: (channel, beat, patternIndex) ->
          self.channels.get(channel).setPattern(beat, patternIndex)

        canSet: (channel, beat, patternIndex) ->
          self.channels.get(channel).canSet(beat, patternIndex, self.patterns())

        patternAt: (channel, beat) ->
          self.channels.get(channel).patternAt(beat, self.patterns())

Remove the pattern that starts or is present on `beat` in the given channel.

        removePattern: (channel, beat) ->
          self.channels.get(channel).removePattern(beat, self.patterns())

        upcomingNotes: (t, dt) ->
          patterns = self.patterns()

          self.channels.map (channel) ->
            channel.upcomingNotes t, dt, patterns
          .flatten()

        size: ->
          self.channels().map (channel) ->
            channel.size(self.patterns())
          .maximum()

      return self
