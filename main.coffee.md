Composer
========

Setup

    # Google Analytics
    require("analytics").init("UA-3464282-15")

    require "appcache"
    require "cornerstone"
    require "jquery-utils"
    global.Observable = require "observable"

Compose music on the internets?

    {applyStylesheet} = require "util"

    applyStylesheet require "./style"

    player = require("./player")()

    sounds = require("./samples").map ({sample}) ->
      "https://addressable.s3.amazonaws.com/composer/data/#{sample}"

    document.body.appendChild require("./tools")(player)
