import now from 'present'

const canvas = document.getElementById('canvas')
const context = canvas.getContext('2d')
const centerX = canvas.width / 2
const centerY = canvas.height / 2

var timeStart = 0
var timeElapsed = timeStart
var timeEnd = 180
var tock = false
var start = -0.5 * Math.PI
var end = 1.5 * Math.PI
var pos = start
var radius = 200
var lineWidth = 15

const degToRadians = deg => deg * Math.PI / 180
const timeToDegrees = t => t * 6

const update = () => {
  timeElapsed += 1
}

const drawTime = (minutes) => {
  let pos = degToRadians(timeToDegrees(minutes))
  context.beginPath()
  context.lineWidth = lineWidth
  context.arc(centerX, centerY, radius, start + pos, end)
  context.strokeStyle = tock ? 'rgba(0, 0, 255, 0.25)' : 'rgba(255, 0, 0, 0.25)'
  context.stroke()
}

const draw = () => {
  context.clearRect(0, 0, canvas.width, canvas.height)
  let circuits = Math.floor((timeEnd - timeElapsed) / 60)
  console.log(circuits)
  for (let i = 0; i < circuits; i++) {
    drawTime(0)
  }
  drawTime(timeElapsed)
}


const loop = (() => {
  var time, timeDelta,
    timeBefore = 0,
    frameInterval = 1000

  return () => {
    window.requestAnimationFrame(loop)

    time = now()
    timeDelta = time - timeBefore

    if (timeDelta >= frameInterval) {
      timeBefore = time
      console.log(time)
      update()
      draw()
    }
  }

})()

loop()

