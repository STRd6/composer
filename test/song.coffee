Song = require "../song"
Pattern = require "../pattern"

describe "Song", ->
  it "Should know it's size", ->
    song = Song
      patterns: [
        beats: 4
      ]

    assert.equal song.size(), 4, "song.size() is #{song.size()}"

  it "Should know the correct size when the pattern has a different size", ->
    song = Song
      patterns: [
        beats: 10
      ]

    assert.equal song.size(), 10

  it "Should know it's tempo", ->
    song = Song
      tempo: 54

    assert.equal song.tempo(), 54

  it "Should return upcoming notes", ->
    song = Song()

    assert.equal song.upcomingNotes(0, 1).length, 0

  describe "With a single pattern", ->
    pattern = Pattern
      notes: [0..3].map (i) ->
        [i, 0, 0]

    song = Song
      channels: [
        {
          data:
            0: 0
        }
      ]
      patterns: [
        pattern.I
      ]

    it "should return all the notes", ->
      assert.equal song.upcomingNotes(0, 1).length, 1
      assert.equal song.upcomingNotes(1, 1).length, 1
      assert.equal song.upcomingNotes(2, 1).length, 1
      assert.equal song.upcomingNotes(3, 1).length, 1

      assert.equal song.upcomingNotes(0, 4).length, 4

    it "shouldn't loop past the end", ->
      assert.equal song.upcomingNotes(4, 1).length, 0
      assert.equal song.upcomingNotes(0, 8).length, 4

  describe "With multiple patterns in parallel", ->
    pattern1 = Pattern
      notes: [0..3].map (i) ->
        [i, 0, 0]

    pattern2 = Pattern
      notes: [0..3].map (i) ->
        [i + 0.5, 0, 1]

    song = Song
      channels: [
        {
          data: 
            0: 0
        }, {
          data:
            0: 1
        }
      ]
      patterns: [
        pattern1.I
        pattern2.I
      ]

    it "should return all the notes", ->
      assert.equal song.upcomingNotes(0, 1).length, 2
      assert.equal song.upcomingNotes(1, 1).length, 2
      assert.equal song.upcomingNotes(2, 1).length, 2
      assert.equal song.upcomingNotes(3, 1).length, 2

      assert.equal song.upcomingNotes(0, 4).length, 8

    it "shouldn't loop past the end", ->
      assert.equal song.upcomingNotes(4, 1).length, 0
      assert.equal song.upcomingNotes(3, 2).length, 2

  describe "With two patterns in sequence", ->
    pattern1 = Pattern
      notes: [0..3].map (i) ->
        [i, 0, 0]

    song = Song
      channels: [
        {
          data:
            0: 0
            4: 0
        }
      ]
      patterns: [
        pattern1.I
      ]
        
    it "should return all the notes in short timesteps", ->
      assert.equal song.upcomingNotes(0, 1).length, 1
      assert.equal song.upcomingNotes(1, 1).length, 1
      assert.equal song.upcomingNotes(2, 1).length, 1
      assert.equal song.upcomingNotes(3, 1).length, 1

      assert.equal song.upcomingNotes(4, 1).length, 1
      assert.equal song.upcomingNotes(5, 1).length, 1
      assert.equal song.upcomingNotes(6, 1).length, 1
      assert.equal song.upcomingNotes(7, 1).length, 1

    it "should Work with larger timesteps", ->
      assert.equal song.upcomingNotes(0, 4).length, 4
      assert.equal song.upcomingNotes(4, 4).length, 4

    it "should cross pattern boundries", ->
      assert.equal song.upcomingNotes(0, 8).length, 8

    it "shouldn't loop past the end", ->
      assert.equal song.upcomingNotes(8, 1).length, 0
      assert.equal song.upcomingNotes(0, 16).length, 8

    it "should have the correct times for the later notes", ->
      notes = song.upcomingNotes(0, 16)

      assert.equal notes[4][0], 4

      notes = song.upcomingNotes(3, 16)

      assert.equal notes[1][0], 1

  describe "#canSet", ->
    it "should allow placing a pattern if there is space, not if not", ->
      song = Song
        patterns: [
          beats: 8
        ]
        channels: [
          {
            data:
              0: 0
              8: 0
          }
        ]

      assert song.canSet(0, 16, 0)
      assert !song.canSet(0, 15, 0)
