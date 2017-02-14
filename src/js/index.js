import now from 'present'

const loop = (() => {
  var time, timeDelta,
    timeBefore = 0,
    frameInterval = 10

  return () => {
    window.requestAnimationFrame(loop)

    time = now()
    timeDelta = time - timeBefore

    if (timeDelta >= frameInterval) {
      timeBefore = time
      console.log(timeDelta)
    }
  }

})()

loop()

