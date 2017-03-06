import { assign, frozen, keys, pick, sealed } from '../utility/fn'
import { SECOND } from '../utility/constants'
import makeArcTimer from './arcTimer'


// Create a thick arc that animates smoothly in a counterclockwise direction
// with one full rotation per hour.
export const makeMinutesArc = (spec) => {

  // Extends:
  const arcTimer = makeArcTimer({
    radius:           200,
    lineWidth:        18,
    strokeStyle:      'rgba(0, 120, 250, 0.5)',
    timeUnit:         SECOND,
    unitsPerRotation: -3600,
    ...spec
  })

  // Style arc as a thin cursor at the current minute location.
  const update = (time) => {
    arcTimer.update(time)
    // let end = arcTimer.getEnd()
    // arcTimer.setStart( end - 0.01 )
    // arcTimer.setEnd( end + 0.01 )
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


export default makeMinutesArc
