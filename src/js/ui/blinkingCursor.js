import { ARC_CYCLE, ARC_ORIGIN, DEGREES_PER_CYCLE, SECOND, SECONDS_PER_HOUR
       } from '../utility/constants'
import { assign, frozen, keys, pick, sealed } from '../utility/fn'
import makeArcTimer from './arcTimer'


// Create a cursor that traverses an arc-like path and blinks periodically.
export const makeBlinkingCursor = (spec) => {

  // Extends:
  const arcTimer = makeArcTimer({
    radius:        200,
    lineWidth:     16,
    strokeStyle:   'rgb(0, 20, 250)',
    timeUnit:      SECOND,
    unitsPerCycle: SECONDS_PER_HOUR,
    isCountdown:   true,
    ...spec
  })

  // Initialize state.
  const state = sealed({
    strokeStyle:  arcTimer.getStrokeStyle(),
    strokeStyle2: 'rgb(245, 245, 245)'
  })

  // Adjust state to spec.
  assign(state, pick(spec, keys(state)))

  // Make cursor visible every other second.
  // Blinking stops if countdown timer reaches zero.
  const blink = () => {
    const progress = (arcTimer.isCountdown())
            ? arcTimer.remaining()
            : arcTimer.elapsed()
    if (progress && (progress / SECOND) % 2 >= 1 ) {
      arcTimer.setStrokeStyle(state.strokeStyle)
    } else {
      arcTimer.setStrokeStyle(state.strokeStyle2)
    }
  }

  // Style arc as a thin cursor at the current minute location.
  const style = () => {
    arcTimer.style()
    const end = arcTimer.getEnd(),
          sign = arcTimer.isCounterclockwise() ? -1 : 1,
          cursorWidth = ARC_CYCLE / DEGREES_PER_CYCLE
    arcTimer.setStart(end - sign * cursorWidth)
  }

  // Update the timer and the position/style of the cursor.
  const update = (t) => {
    const time = arcTimer.update(t)
    style()
    blink()
    return time
  }

  // Set the stroke style.
  // The change will not display visually until the next call to blink().
  const setStrokeStyle = (v) => {
    state.strokeStyle = v
  }

  // Return the 2nd stroke style.
  const getStrokeStyle2 = () => state.strokeStyle2

  // Set the 2nd stroke style for alternate seconds.
  const setStrokeStyle2 = (v) => state.strokeStyle2 = v

  // Perform initialization.
  blink(update(ARC_ORIGIN))

  // Return Interface.
  return frozen({
    ...arcTimer,
    blink,
    getStrokeStyle2,
    setStrokeStyle,
    setStrokeStyle2,
    style,
    update
  })

}


export default makeBlinkingCursor
