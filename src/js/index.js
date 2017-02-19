import '../css/styles.css'
import pick from 'lodash/pick'
import now from 'present'

const assign = Object.assign
const keys = Object.keys

console.clear()
console.log('-----------------------------------')
const canvas = document.getElementById('canvas'),
      context = canvas.getContext('2d')

// Conversion functions
const degToRadians = (deg) => deg * Math.PI / 180
const timeToDegrees = (t) => t * 6

const makePauser = (spec) => {
  const state = Object.seal({
    isPaused:  false,
    onPause:   Function.prototype,
    onUnpause: Function.prototype
  })
  assign(state, pick(spec, keys(state)))
  return Object.freeze({
    isPaused: () => state.isPaused,
    pause:    () => {
      state.isPaused = true
      state.onPause()
    },
    unpause: () => {
      state.isPaused = false
      state.onUnpause()
    }
  })
}

const makeTimer = (spec) => {
  const pauser = makePauser(spec)
  const initState = {
    time:     0,
    lastTick: 0
  }
  const state = Object.seal({ ...initState })
  assign(state, pick(spec, keys(state)))
  return Object.freeze({
    ...pauser,
    read:   () => state.time,
    update: () => {
      if (!state.isPaused) {
        const tick = now()
        const delta = tick - state.lastTick
        state.time = Math.max(state.time - delta, 0)
        state.lastTick = tick
      }
      return state.time
    },
    start: pauser.unpause,
    stop:  pauser.pause,
    reset: () => {
      pauser.pause()
      assign(state, initState)
    }
  })
}

const timer = makeTimer({ time: 5000 })

const makeDisplayElement = (spec) => {
  const initState = {
    name: '',
    x:    canvas.width / 2,
    y:    canvas.height / 2,
    draw: () => {
      console.log('Draw Element!')
      context.clearRect(0, 0, canvas.width, canvas.height)
    }
  }
  const state = Object.seal({ ...initState })
  assign(state, pick(spec, keys(state)))
  return Object.freeze({
    getName: () => state.name,
    setName: (v) => state.name = v,
    getX:    () => state.x,
    setX:    (v) => state.x = v,
    getY:    () => state.y,
    setY:    (v) => state.y = v,
    draw:    () => state.draw()
  })
}

const makeArc = (spec) => {
  const displayElement = makeDisplayElement(spec)
  const state = Object.seal({
    start:       -0.5 * Math.PI,
    end:         1.5 * Math.PI,
    radius:      100,
    lineWidth:   5,
    strokeStyle: 'blue',
    draw:        () => {
      console.log('Draw Arc!')
      displayElement.draw() // Clear the canvas
      context.beginPath()
      context.lineWidth = state.lineWidth
      context.arc( displayElement.getX(), displayElement.getY(),
                   state.radius, state.start, state.end )
      context.strokeStyle = state.strokeStyle
      context.stroke()
    }
  })
  assign(state, pick(spec, keys(state)))
  return Object.freeze({
    ...displayElement,
    draw:         () => state.draw(), // override
    getStart:     () => state.start,
    setStart:     (v) => state.start = v,
    getEnd:       () => state.end,
    setEnd:       (v) => state.end = v,
    getRadius:    () => state.radius,
    setRadius:    (v) => state.radius = v,
    getLineWidth: () => state.lineWidth,
    setLineWidth: (v) => state.lineWidth = v
  })
}

const makeMinuteArc = (spec) => {
  const arc = makeArc({
    radius:      200,
    lineWidth:   15,
    strokeStyle: 'rgba(0, 0, 255, 0.30)',
    ...spec
  })
  return Object.freeze({
    ...arc,
    set: (m) => {
      arc.setEnd(
        arc.getStart() + degToRadians(timeToDegrees(m))
      )
    }
  })
}

let a = makeMinuteArc()
a.set(30)
a.draw()
console.dir(a)

// // Draw thick line to indicate time remaining
// const drawTime = (t) => {
//  let pos = degToRadians(timeToDegrees(t))
//  context.beginPath()
//  context.lineWidth = lineWidth
//  context.arc(centerX, centerY, radius, start, start + pos)
//  context.strokeStyle = 'rgba(0, 0, 255, 0.30)'
//  context.stroke()
// }

// let p = makeTimer({
//  time:      30000,
//  isPaused:  true,
//  onPause:   () => console.log('Stop!'),
//  onUnpause: () => console.log('Go!')
// })
//
//
// console.dir(p)
// p.start()
// console.log(p.update())
// console.log(p.stop())
// console.log(p.isPaused())
// p.start()
// console.log(p.update())
// console.log(p.read())

// const canvas = document.getElementById('canvas'),
//      context = canvas.getContext('2d'),
//      centerX = canvas.width / 2,
//      centerY = canvas.height / 2,
//      start = -0.5 * Math.PI,
//      end = 1.5 * Math.PI
//
// var tock = 0,
//    radius = 200,
//    lineWidth = 15
//
//
// const degToRadians = (deg) => deg * Math.PI / 180
//
// const timeToDegrees = (t) => t * 6
//
// const makeTimer = () => {
//
//  return {
//    'init': (duration) => {
//      timeRemaining = duration
//    },
//    'update': () => {
//      if (!paused) {
//        let tick = now()
//        timeRemaining -= tick - lastTick
//        lastTick = tick
//      }
//      return Math.max(timeRemaining, 0)
//    },
//    'start': () => {
//      paused = false
//    },
//    'stop': () => {
//      paused = true
//    }
//  }
//
// }
//
// const timer = makeTimer()
// let secondsLeft = 0
//
// const secondsToMinutes = (s) => {
//  return Math.ceil(s / 60)
// }
//
// // Update state
// const update = () => {
//  tock = Math.floor(secondsLeft) % 2
//  secondsLeft = timer.update() / 1000
//  // console.log(secondsLeft)
// }
//
// // Draw thick line to indicate time remaining
// const drawTime = (t) => {
//  let pos = degToRadians(timeToDegrees(t))
//  context.beginPath()
//  context.lineWidth = lineWidth
//  context.arc(centerX, centerY, radius, start, start + pos)
//  context.strokeStyle = 'rgba(0, 0, 255, 0.30)'
//  context.stroke()
// }
//
// // Draw thin line to indicate seconds
// const drawSecondsLine = (t) => {
//  let pos = degToRadians(timeToDegrees(t)),
//      minutesLeft = secondsToMinutes(secondsLeft),
//      mpos = degToRadians(timeToDegrees(minutesLeft))
//  // console.log(mpos)
//  context.beginPath()
//  context.lineWidth = 2
//  context.arc( centerX, centerY, radius - (lineWidth / 2),
//               start + mpos, start + mpos + pos )
//  context.strokeStyle = 'rgba(0, 0, 0, 0.75)'
//  context.stroke()
// }
//
// // Draw blinking cursor hand
// const drawHand = (t) => {
//  let pos = degToRadians(timeToDegrees(t))
//  context.beginPath()
//  context.lineWidth = lineWidth + 1
//  context.arc( centerX, centerY, radius,
//               start + pos - 0.01, start + pos + 0.01 )
//  context.strokeStyle = tock
//    ? 'rgba(0, 0, 0, 0.75)'
//    : 'rgba(255, 255, 255, 0.00)'
//  context.stroke()
// }
//
// // Redraw the canvas
// const draw = () => {
//  let minutesLeft = secondsToMinutes(secondsLeft)
//  // Clear the canvas
//  context.clearRect(0, 0, canvas.width, canvas.height)
//  // Draw a full loop for every full hour
//  let circuits = Math.floor(minutesLeft / 60)
//  for (let i = 0; i < circuits; i++) {
//    drawTime(60)
//  }
//  // Draw a partial loop for remaining minutes
//  drawTime(minutesLeft % 60)
//  // Draw an inner line to indicate seconds
//  drawSecondsLine(secondsLeft % 60)
//  // Flash a hand/cursor every other second
//  drawHand(Math.floor(minutesLeft))
// }
//
// // Initialize timer
// timer.init(140 * 60 * 1000)
// timer.start()
//
// // Define main loop
// const loop = (() => {
//  var time,
//      timeBefore = now(),
//      frameInterval = 0
//
//  return () => {
//    window.requestAnimationFrame(loop)
//
//    time = now()
//    if (!frameInterval || time - timeBefore >= frameInterval) {
//      timeBefore = time
//      update()
//      draw()
//    }
//  }
//
// })()
//
//
// loop()
//
