import { assign, frozen, keys, pick, sealed } from '../utility/fn'
import { HOUR, SECOND, SECONDS_PER_HOUR } from '../utility/constants'
import { context } from '../ui/canvas'
import makeArcTimer from './arcTimer'

// Create a full-circle minutes arc to indicate an additional hour remains.
// The semi-transparent nature of these arcs makes it possible to visually
// infer if multiple hours remain.
export const makeHoursArc = (spec) => {

  // Extends:
  const arcTimer = makeArcTimer({
  radius:        200,
  lineWidth:     18,
  strokeStyle:   'rgba(15, 12, 5, 1)',
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

  // During update the shape of the default full-circle arc remains unchanged.
  // An opacity value is set and the timer is updated.
  const update = (time) => {
    let timer = arcTimer.getTimer(),
        hoursRemaining = timer.remaining() / HOUR
    state.opacity = Math.floor(hoursRemaining) * state.opacityStep
  }

  // The circle is rendered with a transparency based on how few hours remain.
  const render = (time) => {
    let saveGlobalAlpha = context.globalAlpha
    context.globalAlpha = state.opacity
    arcTimer.render(time)
    context.globalAlpha = saveGlobalAlpha
    return time
  }

  // Perform initialization.
  update(arcTimer.getTimer().time())

  // Return Interface.
  return frozen({
    ...arcTimer,
    render,
    update
  })

}


export default makeHoursArc
