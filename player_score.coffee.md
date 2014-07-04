Player Score
============

    {extend} = require "util"

    module.exports = (I, self) ->
      notes = []
      
      debugger

      extend self,
        addNote: (note) ->
          notes.push(note)

        notes: ->
          notes

        playTime: ->
          0.5
