Composer
========

Setup

    # Google Analytics
    require("analytics").init("UA-3464282-15")

    require "appcache"
    require "cornerstone"
    require "jquery-utils"

Compose music on the internets?

    {applyStylesheet} = require "util"

    applyStylesheet require "./style"

    player = require("./player")()

    document.body.appendChild require("./tools")(player)
