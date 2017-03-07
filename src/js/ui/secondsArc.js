import { assign, frozen, keys, pick, sealed } from '../utility/fn'
import { MILLISECOND, MILLISECONDS_PER_SECOND, SECOND, SECONDS_PER_MINUTE
       } from '../utility/constants'
import makeArcTimer from './arcTimer'


// Create a thin line that animates smoothly with one
// full rotation per minute.
export const makeSecondsArc = (spec) => makeArcTimer({
  radius:        192,
  lineWidth:     2,
  strokeStyle:   'rgba(0, 20, 50, 0.75)',
  timeUnit:      MILLISECOND,
  unitsPerCycle: SECONDS_PER_MINUTE * MILLISECONDS_PER_SECOND,
  isCountdown:   true,
  isInverse:     true,
  ...spec
})


export default makeSecondsArc
