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

    sounds = [1..17].map (n) ->
      n = 11 if n is 7

      if n is 17
        "http://addressable.s3.amazonaws.com/mpc/eraserloop.wav"
      else
        "http://addressable.s3.amazonaws.com/mpc/musicnote#{n}.wav"

    player.load sounds, ->
      console.log "Loaded!"

    document.body.appendChild require("./tools")(player)
