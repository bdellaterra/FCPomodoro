import { MINUTE, SECOND } from '../utility/constants.js'
import { assign, frozen, keys, pick, sealed } from '../utility/fn'
import makeArcTimer from './arcTimer'


export const makeBlinkingCursor = (spec) => {
  const arcTimer = makeArcTimer({
    radius:           200,
    lineWidth:        16,
    strokeStyle:      'rgba(0, 0, 255, 1)',
    timeUnit:         MINUTE,
    unitsPerRotation: 60,
    ...spec
  })

  // Initialize state.
  const state = sealed({
    strokeStyle: arcTimer.getStrokeStyle(),
    lastMinute:  -1,
    location:    arcTimer.getEnd()
  })

  // Make cursor visible every other second.
  const blink = (time) => {
    if ( (time / SECOND) % 2 >= 1 ) {
      arcTimer.setStrokeStyle(state.strokeStyle)
    } else {
      arcTimer.setStrokeStyle('transparent')
    }
  }

  const stagger = (time, loc) => {
    let currentMinute = Math.floor(time / MINUTE)
    if ( currentMinute > state.lastMinute ) {
      state.lastMinute = currentMinute
      state.location = arcTimer.getEnd()
    }
    arcTimer.setStart( state.location - 0.01 )
    arcTimer.setEnd( state.location + 0.01 )
  }

  const update = (time) => {
    arcTimer.update(time)
    stagger(time)
    blink(time)
    return time
  }

  const setStrokeStyle = (v) => {
    arcTimer.setStrokeStyle(v)
    state.strokeStyle = v
  }

  // Return Interface.
  return frozen({
    ...arcTimer,
    setStrokeStyle,
    update
  })

}


export default makeBlinkingCursor
