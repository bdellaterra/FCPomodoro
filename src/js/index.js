// Good browsers support window.performance but shitsters like IE and Safari do not
window.performance = window.performance || {
  'offset': Date.now(),
  'now':    function now() {
    return Date.now() - this.offset
  }
}

// EG
alert(window.performance.now())
