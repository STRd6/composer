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

      numPatterns = 10

      # Init Patterns
      initPatterns = ->
        [0...numPatterns].forEach (n) ->
          self.patterns()[n] ?= Pattern()

        # Be sure that our patterns and data are in sync!
        # TODO: Shouldn't need this hack
        self.patterns self.patterns().copy()

      initPatterns()

      self.extend
        channelPatterns: (n) ->
          self.channels.get(n).patterns(self.patterns())

        setPattern: (channel, beat, patternIndex) ->
          self.channels.get(channel).setPattern(beat, patternIndex)

        canSet: (channel, beat, patternIndex) ->
          self.channels.get(channel).canSet(beat, patternIndex, self.patterns())

        patternAt: (channel, beat) ->
          self.channels.get(channel).patternAt(beat, self.patterns())

        patternsDataAt: (beat) ->
          self.channels().map (channel) ->
            channel.patternDataAt(beat, self.patterns()).first()

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

        fromJSON: (data) ->
          if data.patterns?
            self.patterns data.patterns.map Identity Pattern
            self.channels data.channels.map Identity Channel
          else
            self.patterns [0...numPatterns].map (i) ->
              if i is 0
                Pattern
                  beats: parseInt data.beats, 10
                  notes: data.notes
              else
                Pattern()

            self.channels [{
              data:
                0: 0
            }, {}, {}, {}].map (channelData) ->
              Channel(channelData)

          initPatterns()

          self.tempo data.tempo

          self

      return self

Helpers
-------

    Identity = (out) ->
      (x) ->
        out x
