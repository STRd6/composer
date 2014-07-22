Song = require "../song"

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
