import { assign, frozen, keys, pick, sealed } from '../utility/fn'
import { SECOND, SECONDS_PER_HOUR } from '../utility/constants'
import { MINUTES_LINE_WIDTH, MINUTES_RADIUS, MINUTES_STROKE_STYLE
       } from '../utility/conf'
import makeArcTimer from './arcTimer'


// Create a thick arc that animates slowly in a counterclockwise direction
// with one full rotation per hour.
export const makeMinutesArc = (spec) => {

  // Extends:
  const arcTimer = makeArcTimer({
    radius:        MINUTES_RADIUS,
    lineWidth:     MINUTES_LINE_WIDTH,
    strokeStyle:   MINUTES_STROKE_STYLE,
    timeUnit:      SECOND,
    unitsPerCycle: SECONDS_PER_HOUR,
    isCountdown:   true,
    ...spec
  })

  // Perform initialization.
  arcTimer.animate()

  // Return Interface.
  return frozen({ ...arcTimer })

}


export default makeMinutesArc
