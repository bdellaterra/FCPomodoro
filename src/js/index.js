/* global DEBUG */
import '../css/styles.css'

import now from 'present'
import { canvas, context } from './canvas'
import { degToRadians, msecsToHours, msecsToMinutes,
         msecsToSeconds, timeToDegrees, timeToRadians } from './conv'
import { assign, frozen, keys, pick, sealed } from './fn'

import makePauser from './pauser'
import makeTimer from './timer'
import makeEntity from './entity'
import makeDisplayer from './displayer'
import makeArc from './arc'
import makeArcTimer from './arcTimer'

DEBUG && console.clear()


let t = makeTimer({ time: 5000 })
t.start()
console.log(t.update())

let m = makeArcTimer({ timer: t })

function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms))
}

let z = sleep(3000)
z.then(
  () => {
    console.log(msecsToSeconds(m.update()))
    m.draw()
  }
)


const makeSecondsArc = (spec) => {
  const arcTimer = makeArcTimer({
    radius:      192,
    lineWidth:   2,
    strokeStyle: 'rgba(0, 0, 0, 0.75)',
    ...spec
  })
  const timer = arcTimer.getTimer()
  const baseStart = arcTimer.getStart()
  const baseEnd = arcTimer.getEnd()
  return frozen({
    ...arcTimer,
    update: (t) => {
      let time = timeToRadians( t !== undefined ? t : timer.update() )
      arcTimer.setStart(baseStart)
      arcTimer.setEnd( baseStart + time )
      return time
    }
  })
}

const makeBlinkingCursor = (spec) => {
  const arcTimer = makeArcTimer({
    radius:      200,
    lineWidth:   16,
    strokeStyle: 'rgba(0, 0, 0, 0.75)',
    ...spec
  })
  const timer = arcTimer.getTimer()
  const baseStart = arcTimer.getStart()
  return frozen({
    ...arcTimer,
    update: (t) => {
      let time = timeToRadians( t !== undefined ? t : timer.update() )
      arcTimer.setStart( baseStart + time - 0.01 )
      arcTimer.setEnd( baseStart + time + 0.01 )
      return time
    }
  })
}


// let s = makeSecondsArc({ timer: t })
// s.update(0)
// s.draw()
//
// let c = makeBlinkingCursor()
// c.update(59)
// c.draw()

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
