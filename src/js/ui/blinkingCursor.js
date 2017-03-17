import { ARC_CYCLE, BLINK, DEGREES_PER_CYCLE, SECOND, SECONDS_PER_HOUR
       } from '../utility/constants'
import { CURSOR_LINE_WIDTH, CURSOR_RADIUS,
         CURSOR_STROKE_STYLE_1, CURSOR_STROKE_STYLE_2
       } from '../utility/conf'
import { assign, frozen, keys, pick, sealed } from '../utility/fn'
import { makeArcTimer } from './arcTimer'
import { once } from '../utility/iter'


// Create a cursor that traverses an arc-like path and blinks periodically.
export const makeBlinkingCursor = (spec) => {

  // Extends:
  const arcTimer = makeArcTimer({
    radius:        CURSOR_RADIUS,
    lineWidth:     CURSOR_LINE_WIDTH,
    strokeStyle:   CURSOR_STROKE_STYLE_1,
    timeUnit:      SECOND,
    unitsPerCycle: SECONDS_PER_HOUR,
    isCountdown:   true,
    ...spec
  })

  // Initialize state.
  const state = sealed({
    strokeStyle:  arcTimer.getStrokeStyle(),
    strokeStyle2: CURSOR_STROKE_STYLE_2
  })

  // Adjust state to spec.
  assign(state, pick(spec, keys(state)))

  // Make cursor visible every other second.
  // Blinking stops if countdown timer reaches zero.
  const blink = (t) => {
    const time = (state.isCountdown)
            ? arcTimer.remaining()
            : arcTimer.elapsed(),
          progress = (t !== undefined) ? t : time
    if (progress && (progress / SECOND) % 2 >= 1 ) {
      arcTimer.setStrokeStyle(state.strokeStyle)
    } else {
      arcTimer.setStrokeStyle(state.strokeStyle2)
    }
  }

  // Style arc as a thin cursor at the current minute location.
  const style = (t) => {
    arcTimer.style(t)
    const end = arcTimer.getEnd(),
          sign = arcTimer.isCounterclockwise() ? -1 : 1,
          cursorWidth = ARC_CYCLE / DEGREES_PER_CYCLE
    arcTimer.setStart(end - sign * cursorWidth)
    blink(t)
  }

  // Set the stroke style. (May not show visually until next blink)
  const setStrokeStyle = (v) => state.strokeStyle = v

  // Return the 2nd stroke style.
  const getStrokeStyle2 = () => state.strokeStyle2

  // Set the 2nd stroke style for alternate seconds.
  // (May not show visually until next blink)
  const setStrokeStyle2 = (v) => state.strokeStyle2 = v

  // Setup animation callbacks.
  const animate = () => {
    arcTimer.animate()
    arcTimer.addUpdate(once(style), 0)  // Initial display
    arcTimer.addUpdate(style, BLINK)  // sync timing with digital readout
    arcTimer.addRender(arcTimer.render)
  }

  // Teardown animation callbacks.
  const deanimate = () => {
    arcTimer.deanimate()
    arcTimer.removeUpdate(style, BLINK)
    arcTimer.removeRender(arcTimer.render)
  }

  // Perform initialization.
  style()
  animate()

  // Return Interface.
  return frozen({
    ...arcTimer,
    animate,
    deanimate,
    getStrokeStyle2,
    setStrokeStyle,
    setStrokeStyle2,
    style
  })

}


export default makeBlinkingCursor
