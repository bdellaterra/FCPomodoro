import '../css/styles.css'
import now from 'present'

const canvas = document.getElementById('canvas')
const context = canvas.getContext('2d')
const centerX = canvas.width / 2
const centerY = canvas.height / 2

var timeStart = 0
var timeElapsed = timeStart
var timeEnd = 180
const start = -0.5 * Math.PI
const end = 1.5 * Math.PI
var tock = false
var pos = start
var radius = 200
var lineWidth = 15

const degToRadians = deg => deg * Math.PI / 180
const timeToDegrees = t => t * 6

const makeTimer = () => {
  var timeRemaining = 0
  var lastTick = 0
  var paused = true

  return {
    'init': (duration) => {
      timeRemaining = duration
    },
    'update': () => {
      if (!paused) {
        let tick = now()
        timeRemaining -= tick - lastTick
        lastTick = tick
      }
      return Math.max(timeRemaining, 0)
    },
    'start': () => {
      paused = false
    },
    'stop': () => {
      paused = true
    }
  }

}

const timer = makeTimer()
let secondsLeft = 0

const secondsToMinutes = (s) => {
  return Math.ceil(s / 60)
}

// Update state
const update = () => {
  tock = Math.floor(secondsLeft) % 2
  secondsLeft = timer.update() / 1000
  // console.log(secondsLeft)
}

// Draw thick line to indicate time remaining
const drawTime = (t) => {
  let pos = degToRadians(timeToDegrees(t))
  context.beginPath()
  context.lineWidth = lineWidth
  context.arc(centerX, centerY, radius, start, start + pos)
  context.strokeStyle = 'rgba(0, 0, 255, 0.30)'
  context.stroke()
}

// Draw thin line to indicate seconds
const drawSecondsLine = (t) => {
  let pos = degToRadians(timeToDegrees(t))
  let minutesLeft = secondsToMinutes(secondsLeft)
  let mpos = degToRadians(timeToDegrees(minutesLeft))
  // console.log(mpos)
  context.beginPath()
  context.lineWidth = 2
  context.arc(centerX, centerY, radius - (lineWidth / 2), start + mpos, start + mpos + pos)
  context.strokeStyle = 'rgba(0, 0, 0, 0.75)'
  context.stroke()
}

// Draw blinking cursor hand
const drawHand = (t) => {
  let pos = degToRadians(timeToDegrees(t))
  context.beginPath()
  context.lineWidth = lineWidth + 1
  context.arc( centerX, centerY, radius, start + pos - 0.01, start + pos + 0.01 )
  context.strokeStyle = tock ? 'rgba(0, 0, 0, 0.75)' : 'rgba(255, 255, 255, 0.00)'
  context.stroke()
}

// Redraw the canvas
const draw = () => {
  let minutesLeft = secondsToMinutes(secondsLeft)
  // Clear the canvas
  context.clearRect(0, 0, canvas.width, canvas.height)
  // Draw a full loop for every full hour
  let circuits = Math.floor(minutesLeft / 60)
  for (let i = 0; i < circuits; i++) {
    drawTime(60)
  }
  // Draw a partial loop for remaining minutes
  drawTime(minutesLeft % 60)
  // Draw an inner line to indicate seconds
  drawSecondsLine(secondsLeft % 60)
  // Flash a hand/cursor every other second
  drawHand(Math.floor(minutesLeft))
}

// Initialize timer
timer.init(140 * 60 * 1000)
timer.start()

// Define main loop
const loop = (() => {
  var time
  var timeBefore = now()
  var frameInterval = 0

  return () => {
    window.requestAnimationFrame(loop)

    time = now()
    if (!frameInterval || time - timeBefore >= frameInterval) {
      timeBefore = time
      update()
      draw()
    }
  }

})()


loop()

