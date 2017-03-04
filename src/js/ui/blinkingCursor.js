import { assign, frozen, keys, pick, sealed } from '../utility/fn'
import { SECOND, MINUTE } from '../utility/constants.js'
import makeArcTimer from './arcTimer'


export const makeBlinkingCursor = (spec) => {
  const arcTimer = makeArcTimer({
    radius:           200,
    lineWidth:        16,
    strokeStyle:      'rgba(255, 0, 0, 0.75)',
    timeUnit:         MINUTE,
    unitsPerRotation: 60,
    ...spec
  })

  // Save initial state for restoration later.
  const init = {
    start:       arcTimer.getStart(),
    end:         arcTimer.getEnd(),
    strokeStyle: arcTimer.getStrokeStyle()
  }

  const blink = () => (arcTimer.elapsed() / SECOND) % 2 >= 1

  const update = (time) => {
    arcTimer.update(time)
    let end = arcTimer.getEnd()
    arcTimer.setStart( end - 0.01 )
    arcTimer.setEnd( end + 0.01 )
    arcTimer.setStrokeStyle( blink() ? init.strokeStyle : 'rgba(0, 0, 255, 0.75)' )
    console.log(arcTimer.getTimeUnit())
    return time
  }

  // Return Interface.
  return frozen({
    ...arcTimer,
    update
  })

}


export default makeBlinkingCursor
