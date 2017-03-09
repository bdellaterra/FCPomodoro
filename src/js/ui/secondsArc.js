import { assign, frozen, keys, pick, sealed } from '../utility/fn'
import { MILLISECOND, MILLISECONDS_PER_MINUTE } from '../utility/constants'
import makeArcTimer from './arcTimer'


// Create a thin line that animates smoothly with one
// full rotation per minute.
export const makeSecondsArc = (spec) => makeArcTimer({
  radius:        192,
  lineWidth:     2,
  strokeStyle:   'rgba(0, 0, 0, 1)',
  timeUnit:      MILLISECOND,
  unitsPerCycle: MILLISECONDS_PER_MINUTE,
  isCountdown:   true,
  isInverse:     true,
  ...spec
})


export default makeSecondsArc
