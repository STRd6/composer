Sample
======

    Deferred = $.Deferred

    module.exports = (data) ->
      loaded = Deferred()

      self =
        loaded: loaded.promise()

      return self
