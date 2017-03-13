import { assign, frozen, keys, pick, relay, sealed } from '../utility/fn'
import { SECOND, SECONDS_PER_HOUR } from '../utility/constants'
import { BREAK_LINE_WIDTH, BREAK_RADIUS, BREAK_STROKE_STYLE,
         BREAK_STROKE_STYLE_2, DEFAULT_BREAK_TIME
       } from '../utility/conf'
import makeArc from './arc'
import makeArcTimer from './arcTimer'


// Create analog display for break time.
export const makeBreakAnalog = (spec) => {

  // Initialize state.
  const state = sealed({
    arc:          null,
    arcTimer:     null,
    strokeStyle2: BREAK_STROKE_STYLE_2
  })

  // Adjust state to spec.
  assign(state, pick(spec, keys(state)))

  // Create a full circle to display behind the arc timer.
  if (!state.arc) {
    state.arc = makeArc({
      ...spec,
      strokeStyle: state.strokeStyle2
    })
  }

  // Create a arc timer to countdown the break time.
  if (!state.arcTimer) {
    state.arcTimer = makeArcTimer({
      radius:        BREAK_RADIUS,
      lineWidth:     BREAK_LINE_WIDTH,
      strokeStyle:   BREAK_STROKE_STYLE,
      timeUnit:      SECOND,
      unitsPerCycle: SECONDS_PER_HOUR,
      isCountdown:   true,
      ...spec
    })
  }

  // Render arc timer on top of arc
  const render = () => {
    state.arc.render()
    state.arcTimer.render()
  }

  // Return the 2nd stroke style.
  const getStrokeStyle2 = () => state.strokeStyle2

  // Set 2nd stroke style on the arc.
  const setStrokeStyle2 = (v) => {
    state.strokeStyle2 = v
    state.arc.setStrokeStyle(v)
  }

  // Return Interface.
  return frozen({
    ...relay(state, 'arcTimer'),
    getStrokeStyle2,
    setStrokeStyle2,
    render
  })

}

export default makeBreakAnalog
