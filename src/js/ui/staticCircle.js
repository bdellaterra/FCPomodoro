import { HOUR } from 'utility/constants'
import { CIRCLE_LINE_WIDTH, CIRCLE_RADIUS, CIRCLE_STROKE_STYLE,
         HOURS_LINE_WIDTH, HOURS_RADIUS, HOURS_STROKE_STYLE
       } from 'config'
import { assign, frozen, keys, pick, sealed } from 'utility/fn'
import { context } from 'ui/canvas'
import { makeArcTimer } from 'ui/arcTimer'
import { once } from 'utility/iter'


// Create a full-circle minutes arc to indicate additional hours remaining.
// The arc fades over time as fewer hours remain.
export const makeStaticCircle = (spec) => {

  // Extends:
  const arcTimer = makeArcTimer({
    radius:        CIRCLE_RADIUS,
    lineWidth:     CIRCLE_LINE_WIDTH,
    strokeStyle:   CIRCLE_STROKE_STYLE,
    timeUnit:      HOUR,
    unitsPerCycle: 1,
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
  const style = (t) => {
    const time = (t !== undefined) ? t : arcTimer.remaining(),
          hoursRemaining = time / HOUR
    state.opacity = Math.floor(hoursRemaining) * state.opacityStep
    state.opacity = 1
  }

  // Render the circle, adjusting opacity via the context alpha setting.
  const render = (time) => {
    const saveGlobalAlpha = context.globalAlpha
    context.globalAlpha = state.opacity
    arcTimer.render(time)
    context.globalAlpha = saveGlobalAlpha
    return time
  }

  // Setup animation callbacks.
  const animate = () => {
    arcTimer.addUpdate(once(style), 0)  // Initial display
    arcTimer.addUpdate(() => {
      style()
    }, arcTimer.getTimeUnit(), arcTimer.countdownOffset)
    arcTimer.addRender(render)
  }

  // Teardown animation callbacks.
  const deanimate = () => {
    arcTimer.removeUpdate(style, arcTimer.getTimeUnit())
    arcTimer.removeRender(render)
  }

  // Perform initialization.
  style()
  animate()

  // Return Interface.
  return frozen({
    ...arcTimer,
    animate,
    deanimate,
    render,
    style
  })

}


export default makeStaticCircle
