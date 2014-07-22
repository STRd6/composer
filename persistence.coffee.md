Persistence
===========

    Gist = require "./lib/gist"

    module.exports = (I={}, self) ->
      # Autoload from location hash

      setTimeout ->
        if hash = location.hash
          self.loadGist hash.substr(1)
      , 0

      # Demo song
      localStorage.songs_demo ?= JSON.stringify {"activeInstrument":0,"activeToolIndex":1,"quantize":4,"tempo":"120","beats":"16","scale":0,"gamut":[-12,12],"notes":[[0,10,0],[0,7,0],[3.25,10,0],[3.5,11,0],[3.75,10,0],[4,9,0],[4,5,0],[4.75,5,0],[7,5,0],[7.5,7,0],[8,8,0],[8,4,0],[11.25,8,0],[11.5,10,0],[11.75,8,0],[12,7,0],[12,3,0],[12.75,7,0],[12.75,15,0]]}

      self.extend
        saveAs: ->
          if name = prompt "Name"
            data = self.toJSON()

            localStorage["songs_#{name}"] = JSON.stringify data

        loadSong: ->
          if name = prompt "Name", "demo"
            data = JSON.parse localStorage["songs_#{name}"]

            self.fromJSON(data)

        fromJSON: (data) ->
          self.notes data.notes
          self.beats data.beats
          self.tempo data.tempo

          playing = false
          playTime = 0

        publish: ->
          Gist.save(self.toJSON()).then (id) ->
            location.hash = id

            alert "Published as #{location}\nShare this by copying the url!"

        loadGist: (id) ->
          Gist.load(id).then (data) ->
            self.fromJSON(data)
            location.hash = id
          , ->
            alert "Couldn't load gist with id: #{id}"

        loadGistPrompt: ->
          if id = prompt "Gist id", location.hash.substr(1) || "4430ba0c808101866b4d"
            self.loadGist(id)
