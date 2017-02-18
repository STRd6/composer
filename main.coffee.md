Composer
========

    # Google Analytics
    require("analytics").init("UA-3464282-15")

    require "cornerstone"
    require "jquery-utils"

    style = document.createElement "style"
    style.innerHTML = require "./style"
    document.head.appendChild style

    global.player = require("./player")()

    require("./lib/feedback-tab")("https://docs.google.com/forms/d/e/1FAIpQLSeRz9rCsLJLacvpJNAtAPhj0AN0LM155INP01Y8Tt4k2pIlmA/viewform")
