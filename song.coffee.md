Song
====

A song has a tempo, a number of channels, and a number of patterns.

Patterns are placed in the channels.

    require "cornerstone"

    Channel = require "./channel"
    Pattern = require "./pattern"

    get = (name) ->
      (x) ->
        x[name]

    module.exports = (I={}, self=Model(I)) ->
      defaults I,
        channels: [{}]
        patterns: [{}]
        tempo: 90

      self.attrObservable "tempo"

      self.attrModels "channels", Channel
      self.attrModels "patterns", Pattern

      self.extend
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
