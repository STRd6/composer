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
            "pattern0.json":
              content: JSON.stringify data

        $.ajax base,
          headers:
            Accept: "application/vnd.github.v3+json"
          contentType: "application/json; charset=utf-8"
          data: JSON.stringify data
          dataType: "json"
          type: "POST"
        .then (result) ->
          result.id

      load: (gistId) ->
        $.get("#{base}/#{gistId}").then (data) ->
          JSON.parse data.files["pattern0.json"].content
