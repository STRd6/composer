Song
====

A song has a tempo, a number of channels, and a number of patterns.

Patterns are placed in the channels.

    require "cornerstone"

    Channel = require "./channel"

    module.exports = (I={}, self=Model(I)) ->
      defaults I,
        channels: [{}]
        patterns: [{}]
        tempo: 90

      self.attrObservable "tempo"

      self.attrModel "channels", Channel

      self.extend
        upcomingNotes: ->
          []

        size: ->
          4

      return self
