import { assign, frozen, keys, pick, sealed } from '../utility/fn'
import { MILLISECOND, MILLISECONDS_PER_MINUTE, SECOND
       } from '../utility/constants'
import { SECONDS_LINE_WIDTH, SECONDS_RADIUS, SECONDS_STROKE_STYLE
       } from '../utility/conf'
import makeArcTimer from './arcTimer'


// Create a thin line that animates smoothly with one
// full rotation per minute.
export const makeSecondsArc = (spec) => {

  // Extends:
  const arcTimer = makeArcTimer({
    radius:        SECONDS_RADIUS,
    lineWidth:     SECONDS_LINE_WIDTH,
    strokeStyle:   SECONDS_STROKE_STYLE,
    timeUnit:      MILLISECOND,
    unitsPerCycle: MILLISECONDS_PER_MINUTE,
    isCountdown:   true,
    isInverse:     true,
    ...spec
  })

  // Setup animation callbacks.
  const animate = () => {
    arcTimer.addUpdate(() => arcTimer.style(), MILLISECOND)
    arcTimer.addUpdate(() => console.log(arcTimer.remaining()), SECOND)
    arcTimer.addRender(arcTimer.render)
  }

  // Teardown animation callbacks.
  const deanimate = () => {
    arcTimer.removeUpdate(arcTimer.style, MILLISECONDS)
    arcTimer.removeRender(arcTimer.render)
  }

  // Perform initialization.
  arcTimer.style()
  animate()

  // Return Interface.
  return frozen({
    ...arcTimer,
    animate,
    deanimate
  })

}


export default makeSecondsArc
