/* global DEBUG */
import '../css/styles.css'

import now from 'present'
import * as most from 'most'

import { assign, frozen, keys, pick, sealed } from './fn'
// import { degToRadians, msecsToHours, msecsToMinutes,
//         msecsToSeconds, timeToDegrees, timeToRadians } from './conv'
// import { sleep, jiffy, delta } from './time'
// import { nullIterator } from './util'
//
import { sleep, makePacer, makeTimer } from './time'
// import makeTimer from './timer'
// import makeArcTimer from './arcTimer'

// Asynchronous generator - a generator that yields promises
function* wait() {
  let x = 1
  while (true) {
    console.log('...')
    yield sleep(1000).then(() => x++)
  }
}

const add = (x, y) => x + y

function* countTo(limit) {
  let x = 1
  while (x <= limit) {
    // console.log(x)
    yield x++
  }
}

function* count4Eva() {
  let x = 1
  while (true) {
    delay(1000)
    yield x++
  }
}

function* alphaTo(limit) {
  const alpha = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i',
                 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r',
                 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']
  let l,
      i = 0
  while (l !== limit && i < alpha.length) {
    l = alpha[i++]
    yield l
  }
}

const stream1 = most.from(alphaTo('z'))
const stream2 = most.from(countTo('26'))
const stream3 = most.generate(wait).take(26)
stream2.zip(add, stream3).map((v) => `--${v}--`).observe((x) => console.log(x))

//
// var p = new Promise((resolve, reject) => {
//  setTimeout(() => resolve(4), 2000)
// })
//
// const valStream = just('hello')
// valStream.observe((x) => console.log(x))
//
// const promiseStream = fromPromise(p)
// promiseStream.observe((r) => console.log('promiseStream returned:', r))
// p.then(() => console.log('Promise resolved!'))
//
// const containerStream = from([1, 2, 3, 4, 5])
// containerStream.forEach((v) => console.log(v))
//
// const generatorStream = from(alphaTo('z'))
// generatorStream.take(5).forEach((v) => console.log(v))
//
// const infiniteStream = from(count4Eva())
// infiniteStream.take(5).forEach((v) => console.log(v))

// // an immediately resolved promise
// var p2 = Promise.resolve('foo')
//
// // can get it after the fact, unlike events
// p2.then((res) => console.log(res))
//
// var p = new Promise((resolve, reject) => {
//   setTimeout(() => resolve(4), 2000)
// })
//
// // handler can't change promise, just value
// p.then((res) => {
//   res += 2
//   console.log(res)
// })
//
// // still gets 4
// p.then((res) => console.log(res))
//
// var p3 = new Promise((resolve, reject) => {
//   if (1) {
//     resolve(1)
//   } else {
//     reject(-1)
//   }
// })
//
// var p4 = new Promise((resolve, reject) => resolve(5))
// p4.then((val) => console.log(val))

// let pacer = makePacer()
// console.log('NumUpdates:', pacer.getNumUpdates())
// pacer.isRunning()
// pacer.run()

// let alpha = alphaTo('z')
// let iter = countTo(50)
// let result
//
// result = iter.next()
// console.log(result.value)

// console.log(iter.next())
// console.log(iter.next())
// console.log(iter.next())
// console.log(iter.next())
// console.log(iter.next())
// console.log(iter.next().done)

// async function main() {
  // let pacer = makePacer()
  // pacer.addIterator( iter )
  // pacer.addIterator( alpha )
  // console.log('NumIterators:', pacer.getNumIterators())
  // pacer.run(50)
  //  await sleep(60000)
  // pacer.stop()
  // console.log('NumIterators:', pacer.getNumIterators())
  // console.log('isRunning:', pacer.isRunning())
  // }

// main()

// let introvert = (self = {}) => {
//  return Object.assign(self, { [self]: {} })
// }
// let i = introvert()
//
// let state = (self) => self[self]
//
// let extension = (self = introvert()) => {
//  const defaults = {
//    c: 3,
//    d: 4
//  }
//  Object.assign(state(self), { c: 3 })
//  // console.dir(self)
//  return self
// }
// let e = extension(i)
//
// let release = ((self = introvert()) => {
//  const defaults = {
//    c: 3,
//    d: 4
//  }
//  Object.assign(state(self), { d: 4, getC: () => state(self).c })
//  // console.dir(self)
//  return () => ({ ...self })
// })()
// let r = release(e)
//
// r[r].d = 9
// console.dir(r[r])
// console.log(r.hasOwnProperty(r))
// console.log(r.getC())
//
// console.dir(e[e])

// console.dir(i)

// let o = { a: 1, b: 2 }
// let q = { [o]: 'wtf' }
// console.dir(q)
// console.log(q[o])
//
// const makeKeeper = (s) => {
//   const store = (s !== undefined) ? s : {}
//   return Object.assign(store, {
//     getX: () => store[store].x,
//     setX: (v) => store[store].x = v
//   })
// }
//
// let k = makeKeeper()
// console.dir(k)


// var store = new WeakMap()
//
// const makeCrazy = (self = {}) => {
//   const defaults = { x: 5, y: 7 },  // defaults
//         state = store.get(self) || store.set(self, {})
//   Object.assign( state, { ...defaults, state } )
//   Object.assign(self, {
//     getX: () => state.x,
//     setX: (v) => state.x = v,
//     getY: () => state.y,
//     setY: (v) => state.y = v
//   })
//   return self
// }
//
// const makeSilly = (self = {}) => {
//   const defaults = { a: 1, b: 2 },  // defaults
//         state = store.get(self) || store.set(self, {})
//   Object.assign( state, { ...defaults, state } )
//   Object.assign(self, {
//     getA: () => state.a,
//     setA: (v) => state.a = v,
//     getB: () => state.b,
//     setB: (v) => state.b = v
//   })
//   return self
// }
//
// let c = makeCrazy(),
//     s = makeSilly(c)
// c.setX(2)
// s.setB(4)
// s.setX(22)
// console.dir(s)
// console.log(s.getX())
// console.dir(c)
// console.log(c.getX())
//
// const makeState = (spec) => {
//   const state = { ...spec }
//   return (s) => {
//     if (s !== undefined) {
//       Object.assign(state, s)
//     }
//     return state
//   }
// }


// let makeCounter = () => {
//   const state = makeState({ total: 0 })
//   return () => state().total++
// }
//
// let counter = makeCounter()
// console.log(counter())
// console.log(counter())
// console.log(counter())

// let s = makeState()
// s({ a: 1, b: 2 })
// console.log(s({ c: 3 }))
// delete s().b
// console.log(s())
//
// let t = makeState( { ...s(), d: 4 } )
// console.dir(s())
// console.dir(t({ c: 77 }))

// let n = nullIterator
// console.log(n.next())

// let p = makePacer()
// console.log(p.getTime())
// async function ptest() {
//  try {
//    await sleep(3000)
//    console.log(p.getTime())
//  } catch (err) {
//    console.err(err)
//  }
// }
// ptest()

// let t = makeTimer({ time: 5000 })
// async function ttest() {
//  try {
//    t.start()
//    console.log(t.read())
//    await sleep(2000)
//    t.update()
//    console.log(t.read())
//  } catch (err) {
//    console.err(err)
//  }
// }
//
// ttest()


// let z = sleep(2000)
// z.then(
// () => {
//   console.log(msecsToSeconds(m.update()))
//   m.draw()
// }
// )


// const makeSecondsArc = (spec) => {
//  const arcTimer = makeArcTimer({
//    radius:      192,
//    lineWidth:   2,
//    strokeStyle: 'rgba(0, 0, 0, 0.75)',
//    ...spec
//  })
//  const timer = arcTimer.getTimer()
//  const baseStart = arcTimer.getStart()
//  const baseEnd = arcTimer.getEnd()
//  return frozen({
//    ...arcTimer,
//    update: (t) => {
//      let time = timeToRadians( t !== undefined ? t : timer.update() )
//      arcTimer.setStart(baseStart)
//      arcTimer.setEnd( baseStart + time )
//      return time
//    }
//  })
// }
//
// const makeBlinkingCursor = (spec) => {
//  const arcTimer = makeArcTimer({
//    radius:      200,
//    lineWidth:   16,
//    strokeStyle: 'rgba(0, 0, 0, 0.75)',
//    ...spec
//  })
//  const timer = arcTimer.getTimer()
//  const baseStart = arcTimer.getStart()
//  return frozen({
//    ...arcTimer,
//    update: (t) => {
//      let time = timeToRadians( t !== undefined ? t : timer.update() )
//      arcTimer.setStart( baseStart + time - 0.01 )
//      arcTimer.setEnd( baseStart + time + 0.01 )
//      return time
//    }
//  })
// }


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
// Define main loop

// let x = 0
// const loop = (() => {
//   var time,
//       timeBefore = now(),
//       frameInterval = 0
//
//   return (time) => {
//     window.requestAnimationFrame(loop)
//
//     if (!frameInterval || time - timeBefore >= frameInterval) {
//       timeBefore = time
//       if (x < 1000) {
//         console.log(x++)
//       }
//       // update()
//       // draw()
//     }
//   }
//
// })()
//
//
// loop()

