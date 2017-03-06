import { ARC_CYCLE, ARC_ORIGIN, SECOND, SECONDS_PER_HOUR
       } from '../utility/constants'
import { assign, frozen, keys, pick, sealed } from '../utility/fn'
import makeArcTimer from './arcTimer'


export const makeBlinkingCursor = (spec) => {

  // Extends:
  const arcTimer = makeArcTimer({
    radius:        200,
    lineWidth:     16,
    strokeStyle:   'rgba(0, 0, 255, 1)',
    timeUnit:      SECOND,
    unitsPerCycle: SECONDS_PER_HOUR,
    isClockwise:   false,
    ...spec
  })

  // Initialize state.
  const state = sealed({ strokeStyle: arcTimer.getStrokeStyle() })

  // Make cursor visible every other second.
  const blink = (time) => {
    if ( (time / SECOND) % 2 >= 1 ) {
      arcTimer.setStrokeStyle(state.strokeStyle)
    } else {
      arcTimer.setStrokeStyle('transparent')
    }
    return time
  }

  // Style arc as a thin cursor at the current minute location.
  const update = (time) => {
    arcTimer.update(time)
    let end = arcTimer.getEnd(),
        cursorWidth = ARC_CYCLE / 360
    arcTimer.setStart( end )
    arcTimer.setEnd( end - cursorWidth )
    return time
  }

  // Set the stroke style.
  // The change will not display visually until the next call to blink().
  const setStrokeStyle = (v) => {
    state.strokeStyle = v
  }

  // Perform initialization.
  blink(update(ARC_ORIGIN))

  // Return Interface.
  return frozen({
    ...arcTimer,
    blink,
    setStrokeStyle,
    update
  })

}


export default makeBlinkingCursor
