Composer
========

Setup

    require "cornerstone"
    require "jquery-utils"

Compose music on the internets?

    {applyStylesheet} = require "util"

    applyStylesheet require "./style"

    player = require("./player")()

    sounds = [1..16].map (n) ->
      "http://addressable.s3.amazonaws.com/mpc/musicnote#{n}.wav"

    console.log "wat"
    console.log player.load

    player.load sounds, ->
      console.log "Loaded!"
