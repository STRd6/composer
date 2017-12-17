# Depends on https://checkout.stripe.com/checkout.js

module.exports = ->
  amount = 199
  description = "Support paint composer!"

  handler = StripeCheckout.configure
    key: 'pk_PPCRZgLrovwFHSKmMkjtVONHDs3pR'
    image: 'https://danielx.whimsy.space/images/wizard.png'
    token: (token, args) ->
      $.post "https://danielx-payments.glitch.me/charge",
        amount: amount
        description: description
        stripeEmail: token.email
        stripeToken: token.id
  
  click: (e) ->
    e.preventDefault()

    handler.open
      name: 'danielx.net'
      description: description
      amount: amount
