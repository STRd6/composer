Composer
========

Setup

    # Google Analytics
    require("analytics").init("UA-3464282-15")

    require "cornerstone"
    require "jquery-utils"

Compose music on the internets?

    style = document.createElement "style"
    style.innerHTML = require "./style"
    document.head.appendChild style

    player = require("./player")()
