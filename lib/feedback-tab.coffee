module.exports = (href) ->
  tab = document.createElement 'a'
  tab.textContent = "Feedback"
  tab.id = "feedback"
  tab.href = href
  tab.target = "_blank"

  document.body.appendChild(tab)
