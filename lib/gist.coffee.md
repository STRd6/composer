Gist
====

Save or load anonymous gists.

    base = "https://api.github.com/gists"

    module.exports =
      save: (data) ->
        data =
          description: "A song created with #{window.location}"
          public: true
          files:
            "song.json":
              content: JSON.stringify data
            "info.md":
              content: """
                Created with #{window.location}
              """

        $.ajax base,
          headers:
            Accept: "application/vnd.github.v3+json"
          contentType: "application/json; charset=utf-8"
          data: JSON.stringify data, null, 2
          dataType: "json"
          type: "POST"
        .then (result) ->
          console.log result

      load: (gistId) ->
        $.get("#{base}/#{gistId}").then (data) ->
          console.log data
