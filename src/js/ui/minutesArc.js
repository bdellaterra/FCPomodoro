import { assign, frozen, keys, pick, sealed } from '../utility/fn'
import { SECOND, SECONDS_PER_HOUR } from '../utility/constants'
import makeArcTimer from './arcTimer'


// Create a thick arc that animates smoothly in a counterclockwise direction
// with one full rotation per hour.
export const makeMinutesArc = (spec) => makeArcTimer({
  radius:        200,
  lineWidth:     18,
  strokeStyle:   'rgba(70, 170, 235, 1)',
  timeUnit:      SECOND,
  unitsPerCycle: SECONDS_PER_HOUR,
  isCountdown:   true,
  ...spec
})


export default makeMinutesArc
