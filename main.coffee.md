Composer
========

Compose music on the internets?
    {applyStylesheet} = require "util"

    applyStylesheet require "./style"

    player = require("./player")()

    sounds = [1..16].map (n) ->
      "http://addressable.s3.amazonaws.com/mpc/musicnote#{n}.wav"

    player.load sounds, ->
      setInterval ->
        player.play(0)
      , 500
