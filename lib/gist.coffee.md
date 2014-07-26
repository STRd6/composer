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
            "data.json":
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
          data = data.files["data.json"]?.content or data.files["pattern0.json"]?.content

          if data
            JSON.parse data
          else
            alert "Failed to load gist with id: #{gistId}"
