import { assign, frozen, keys, pick, sealed } from '../utility/fn'
import { SECOND } from '../utility/constants'
import { degToRadians } from '../utility/conv'
import makeArcTimer from './arcTimer'


// Create a thin line that animates smoothly with one
// full rotation per minute.
export const makeSecondsArc = (spec) => {

  // Extends:
  const arcTimer = makeArcTimer({
    radius:        192,
    lineWidth:     2,
    strokeStyle:   'rgba(0, 0, 0, 0.75)',
    timeUnit:      SECOND,
    unitsPerCycle: 60,
    ...spec
  })

  // Save initial start/end positions for reference.
  const baseStart = arcTimer.getStart()
  const baseEnd = arcTimer.getEnd()

  // Style arc as a thin cursor at the current minute location.
  const update = (time) => {
    arcTimer.update(time)
    let start = arcTimer.getStart(),
        end = arcTimer.getEnd(),
        radTravel = end - start
    // arcTimer.setStart( (1.5 * Math.PI - end) * 60 )
    // arcTimer.setEnd( (Math.PI) - end )
    return time
  }

  // Perform initialization.
  update(0)

  // Return Interface.
  return frozen({
    ...arcTimer,
    update
  })

}


export default makeSecondsArc
