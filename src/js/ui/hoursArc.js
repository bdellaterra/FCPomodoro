import { assign, frozen, keys, pick, sealed } from '../utility/fn'
import { HOUR, SECOND, SECONDS_PER_HOUR } from '../utility/constants'
import { HOURS_LINE_WIDTH, HOURS_RADIUS, HOURS_STROKE_STYLE
       } from '../utility/conf'
import { context } from '../ui/canvas'
import makeArcTimer from './arcTimer'


// Create a full-circle minutes arc to indicate additional hours remaining.
// The arc fades over time as fewer hours remain.
export const makeHoursArc = (spec) => {

  // Extends:
  const arcTimer = makeArcTimer({
    radius:        HOURS_RADIUS,
    lineWidth:     HOURS_LINE_WIDTH,
    strokeStyle:   HOURS_STROKE_STYLE,
    timeUnit:      SECOND,
    unitsPerCycle: SECONDS_PER_HOUR,
    isCountdown:   true,
    ...spec
  })

  // Initialize state.
  const state = sealed({
    opacity:     0,
    opacityStep: 0.09
  })

  // Adjust state to spec.
  assign(state, pick(spec, keys(state)))

  // Style as an opacity change. The arc remains a full-circle.
  const style = () => {
    const hoursRemaining = arcTimer.remaining() / HOUR
    state.opacity = Math.floor(hoursRemaining) * state.opacityStep
  }

  // Update the timer and adjust opacity based on hours remaining.
  // const update = (t) => {
  //   const time = arcTimer.sync(t)
  //   style()
  //   return time
  // }

  // Render the circle, adjusting opacity via the context alpha setting.
  const render = (time) => {
    const saveGlobalAlpha = context.globalAlpha
    context.globalAlpha = state.opacity
    arcTimer.render(time)
    context.globalAlpha = saveGlobalAlpha
    return time
  }

  // Perform initialization.
  style()

  // Return Interface.
  return frozen({
    ...arcTimer,
    render,
    style
    // update
  })

}


export default makeHoursArc
