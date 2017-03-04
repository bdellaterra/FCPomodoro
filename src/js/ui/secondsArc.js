import { assign, frozen, keys, pick, sealed } from '../utility/fn'
import { SECOND } from '../utility/constants.js'
import makeArcTimer from './arcTimer'


// Create a thin line that animates smoothly with one
// full rotation per minute.
export const makeSecondsArc = (spec) => makeArcTimer({
  radius:           192,
  lineWidth:        2,
  strokeStyle:      'rgba(0, 0, 0, 0.75)',
  timeUnit:         SECOND,
  unitsPerRotation: -60,
  ...spec
})


// // Draw thin line to indicate seconds
// const drawSecondsLine = (t) => {
//   let pos = degToRadians(timeToDegrees(t))
//   let minutesLeft = secondsToMinutes(secondsLeft)
//   let mpos = degToRadians(timeToDegrees(minutesLeft))
//   // console.log(mpos)
//   context.beginPath()
//   context.lineWidth = 2
//   context.arc( centerX, centerY, radius - (lineWidth / 2),
//                start + mpos, start + mpos + pos )
//   context.strokeStyle = 'rgba(0, 0, 0, 0.75)'
//   context.stroke()
// }


export default makeSecondsArc
