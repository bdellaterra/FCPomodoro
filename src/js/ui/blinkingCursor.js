import { MINUTE, SECOND } from '../utility/constants'
import { assign, frozen, keys, pick, sealed } from '../utility/fn'
import makeArcTimer from './arcTimer'


export const makeBlinkingCursor = (spec) => {

  // Extends:
  const arcTimer = makeArcTimer({
    radius:           200,
    lineWidth:        16,
    strokeStyle:      'rgba(0, 0, 255, 1)',
    timeUnit:         SECOND,
    unitsPerRotation: -3600,
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
    let end = arcTimer.getEnd()
    arcTimer.setStart( end - 0.01 )
    arcTimer.setEnd( end + 0.01 )
    return time
  }

  // Set the stroke style.
  // The change will not display visually until the next call to blink().
  const setStrokeStyle = (v) => {
    state.strokeStyle = v
  }

  // Perform initialization.
  blink(update(0))

  // Return Interface.
  return frozen({
    ...arcTimer,
    blink,
    setStrokeStyle,
    update
  })

}


export default makeBlinkingCursor
