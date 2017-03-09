import { ARC_CYCLE, ARC_ORIGIN, SECOND, SECONDS_PER_HOUR
       } from '../utility/constants'
import { assign, frozen, keys, pick, sealed } from '../utility/fn'
import makeArcTimer from './arcTimer'


export const makeBlinkingCursor = (spec) => {

  // Extends:
  const arcTimer = makeArcTimer({
    radius:        200,
    lineWidth:     16,
    strokeStyle:   'rgba(0, 20, 250, 1)',
    timeUnit:      SECOND,
    unitsPerCycle: SECONDS_PER_HOUR,
    isCountdown:   true,
    ...spec
  })

  // Initialize state.
  const state = sealed({
    strokeStyle:  arcTimer.getStrokeStyle(),
    strokeStyle2: 'rgba(245, 245, 245, 1)'
  })

  // Make cursor visible every other second.
  // Blinking stops if time is zero.
  const blink = (time) => {
    console.log(time)
    if ( (time / SECOND) % 2 >= 1 ) {
      arcTimer.setStrokeStyle(state.strokeStyle)
    } else {
      arcTimer.setStrokeStyle(state.strokeStyle2)
    }
    return time
  }

  // Style arc as a thin cursor at the current minute location.
  const update = (time) => {
    arcTimer.update(time)
    let end = arcTimer.getEnd(),
        sign = arcTimer.isCounterclockwise() ? -1 : 1,
        cursorWidth = ARC_CYCLE / 360
    arcTimer.setStart(end - sign * cursorWidth)
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
    update
  })

}


export default makeBlinkingCursor
