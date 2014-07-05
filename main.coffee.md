Composer
========

    require "jquery-utils"

Compose music on the internets?
    {applyStylesheet} = require "util"

    applyStylesheet require "./style"

    player = require("./player")()

    sounds = [1..16].map (n) ->
      "http://addressable.s3.amazonaws.com/mpc/musicnote#{n}.wav"

    player.load sounds, ->
      console.log "Loaded!"

    player.include require "./player_tools"
    player.include require "./player_score"
    player.include require "./player_view"
    player.include require "./player_hotkeys"
