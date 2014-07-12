Sample
------

A sample has an image, a sound file, and a reference pitch.

    {defaults} = require "util"

    module.exports = (I) ->
      defaults I,
        image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACMAAAAgCAYAAACYTcH3AAABeElEQVRYR+2XMU4DMRBF7RtEoky7J8iSLiIlDR1HoIMT5AQ5QdLlCOloUoLSQTjBtpRI3AD4K0006/V4xxuvguS4WmntmTffM2Pb/vwN80+GvcAIO9GpjLX2pE2MyYIWDDmHEXxP3lYnwXxMnwzZgqEQXAMGzu8/N2Y7fjgaSAnDbfsiVMMgwphBQXBlksDAYFVVMSymKIp6i/OAQbRdCtGcZMpgP5DEGCS1C8HBfJAcBnaQL2RXqihvafOFEgwMwyGGTy0OowGBHW/T4yUegglltAtD7SK0RuzA1Px4icaUk7tO04mDx0HKDqwJRA0jNb2uDk19JimMxphvTt4wh+tHU76vveLloczh6tmUX3di+sxHr+bl+6bxfxBlAELDBdrNFvWv2/2yBToIDLxIypwFpk95D6bM2WH6ALhrNOeSeGpLAO6Fnc8L/dMG1Plu0jrMD8Z9UUrPDa4MV1ObL6qcISfcge/Wpp3X66ZHi6S3thuxdl4I5hcgNeqwgiRFxgAAAABJRU5ErkJggg=="
        sound: ""
        basePitch: 0
