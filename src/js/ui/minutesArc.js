import { assign, frozen, keys, pick, sealed } from '../utility/fn'
import { SECOND, SECONDS_PER_HOUR } from '../utility/constants'
import makeArcTimer from './arcTimer'


// Create a thick arc that animates slowly in a counterclockwise direction
// with one full rotation per hour.
export const makeMinutesArc = (spec) => makeArcTimer({
  radius:        200,
  lineWidth:     18,
  strokeStyle:   'rgb(35, 170, 250)',
  timeUnit:      SECOND,
  unitsPerCycle: SECONDS_PER_HOUR,
  isCountdown:   true,
  ...spec
})


export default makeMinutesArc
