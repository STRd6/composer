Song = require "../song"
Pattern = require "../pattern"

describe "Song", ->
  it "Should know it's size", ->
    song = Song()

    assert.equal song.size(), 4, "song.size() is #{song.size()}"

  it "Should know it's tempo", ->
    song = Song
      tempo: 54

    assert.equal song.tempo(), 54

  it "Should return upcoming notes", ->
    song = Song()

    assert.equal song.upcomingNotes(0, 1).length, 0

  describe "With a single pattern", ->
    it "should return all the notes", ->
      pattern = Pattern
        notes: [0..3].map (i) ->
          [i, 0, 0]

      song = Song
        patterns: [
          pattern.I
        ]

      assert.equal song.upcomingNotes(0, 1).length, 1
      assert.equal song.upcomingNotes(1, 1).length, 1
      assert.equal song.upcomingNotes(2, 1).length, 1
      assert.equal song.upcomingNotes(3, 1).length, 1
      assert.equal song.upcomingNotes(4, 1).length, 1 # Maybe don't loop past the end?

      assert.equal song.upcomingNotes(0, 4).length, 4
      # TODO: If we are going to loop past, this should work too...
      # assert.equal song.upcomingNotes(0, 8).length, 8

  describe "With multiple patterns", ->
    it "should return all the notes", ->
      pattern1 = Pattern
        notes: [0..3].map (i) ->
          [i, 0, 0]

      pattern2 = Pattern
        notes: [0..3].map (i) ->
          [i + 0.5, 0, 1]

      song = Song
        channels: [
          {
            data: [0]
          }, {
            data: [1]
          }
        ]
        patterns: [
          pattern1.I
          pattern2.I
        ]

      console.log song.upcomingNotes(0, 1)

      assert.equal song.upcomingNotes(0, 1).length, 2
      assert.equal song.upcomingNotes(1, 1).length, 2
      assert.equal song.upcomingNotes(2, 1).length, 2
      assert.equal song.upcomingNotes(3, 1).length, 2
      assert.equal song.upcomingNotes(4, 1).length, 2 # TODO: Should we be looping here?

      assert.equal song.upcomingNotes(0, 4).length, 8
