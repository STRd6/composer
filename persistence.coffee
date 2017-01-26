Gist = require "./lib/gist"

module.exports = (I={}, self) ->
  # Autoload from location hash
  defaults I,
    unsaved: false

  self.attrAccessor "unsaved"

  # NOTE: Track `prompted` so in an iframe it won't trigger twice
  prompted = false
  window.addEventListener "beforeunload", (e) ->
    return if prompted
    prompted = true
    setTimeout ->
      prompted = false

    if self.unsaved()
      e.returnValue = "Your changes haven't yet been saved. If you leave now you will lose your work."

    return e.returnValue

  setTimeout ->
    if hash = location.hash
      self.loadGist hash.substr(1)
  , 0

  # Demo song
  localStorage.songs_demo ?= JSON.stringify require "./demo_song"

  self.extend
    saveAs: ->
      if name = prompt "Name"
        data = self.song().toJSON()

        localStorage["songs_#{name}"] = JSON.stringify data

        self.unsaved false

    loadSong: ->
      # TODO: Prompt unsaved

      if name = prompt "Name", "demo"
        data = JSON.parse localStorage["songs_#{name}"]

        self.fromJSON(data)

    fromJSON: (data) ->
      self.song().fromJSON(data)

      self.reset()

    publish: ->
      Gist.save(self.song().toJSON()).then (id) ->
        location.hash = id

        alert "Published as #{location}\nShare this by copying the url!"

        self.unsaved false

    loadGist: (id) ->
      Gist.load(id).then (data) ->
        self.fromJSON(data)
        location.hash = id
      , ->
        alert "Couldn't load gist with id: #{id}"

    loadGistPrompt: ->
      if id = prompt "Gist id", location.hash.substr(1) || "0b4c4656a6eb1d246829"
        self.loadGist(id)

