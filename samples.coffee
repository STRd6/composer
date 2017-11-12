# Base
base = "https://addressable.s3.amazonaws.com/composer/data/"

samples =
  synth:
    sample: "f122a3a8f29ec09b0d61d0254022c0fc338240b3"
    sprite: "e99777fe5a3c514d3ae7d9078cd705c6495838cc"
  piano: # toy piano
    sample: "b4e7f603e5d18bfd3c97b080fbfab8a57afa9fb6"
    sprite: "dcac2056d205c401bbcf5939171ce6aa1d5bb0fe"
  guitar:
    sample: "824188ae0fcf3cda0a508c563577a98efa6fe384"
    sprite: "3518ee95f9f047ec45adbb47a964f7b6864fecc6"
  horn:
    sample: "64916bf1576808add3711c647b3773a3d40eeaec"
    sprite: "c68b9502dd74c020b11519a4c37562b724c255af"
  orch_hit:
    sample: "b761c6d420c8af2309def0dc408c7ac98008dc5b"
    sprite: "c98d94ab15a922c4ad96e719a02ea7e5eff3930b"
  drum:
    sample: "d16a30a4d5ec1b32ccb98a048d5dc18d3592ddc7"
    sprite: "cff35c7a508c1dc9e05d608a594bd88bbe0b6890"
  snare:
    sample: "df1f06afcda30a67672e8ee054e306b7a459a94c"
    sprite: "f738c3e6f1734e1c6216add824aa2db779876c2f"
  clap:
    sample: "8a5e245b4149ddf0c15c887c1b4a40d94bab0f4e"
    sprite: "191d6bc3012513af8957f4fef9b923c7c830ada1"
  cat:
    sample: "06c7e53fcae1b07628357344e73ab1782353cd82"
    sprite: "5d6a625888bd45ac1d9d33a86d7a0206709acbba"
  dog:
    sample: "ef7e42d463e8994c5bd8b84256f4dade3faf32fb"
    sprite: "88e70bd36b7aba07b64a8cfb626b8002fa214772"

module.exports = Object.keys(samples).map (name, i) ->
  sample = samples[name]
  sample.name = name
  sample.index = i

  sample
