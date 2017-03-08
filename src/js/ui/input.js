
const addInputs = () => {
  var c = document.createDocumentFragment()
  for (var i = 0; i < 10000; i++) {
    var e = document.createElement('div')
    e.className = 'test-div'
    c.appendChild(e)
  }
  document.body.appendChild(c)
}

