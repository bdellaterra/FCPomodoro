import { SECOND } from '../utility/constants'
import { degToRadians } from '../utility/conv'
import { assign, frozen, keys, pick, sealed } from '../utility/fn'
import makeArc from './arc'
import makeTimer from '../time/timer'


// Create an arc that updates itself over time.
export const makeArcTimer = (spec) => {

  // Extends:
  const arc = makeArc(spec)

  // Initialize state.
  const state = sealed({
    timer:            null,  // placeholder for assign() below
    timeUnit:         SECOND,
    unitsPerRotation: 60  // Use negative values for counterclockwise
  })

  // Adjust state to spec.
  assign(state, pick(spec, keys(state)))

  // Create a timer if none was provided.
  if (!state.timer) {
    state.timer = makeTimer(spec)
  }

  // Save initial start/end positions for reference.
  const baseStart = arc.getStart()
  const baseEnd = arc.getEnd()

  // Update the end position of the arc based on time elapsed,
  // and proportional to the number of time units per circle.
  const update = (time) => {
    state.timer.update(time)
    let elapsed = state.timer.elapsed() / state.timeUnit,
        degTravel = 360 / state.unitsPerRotation * elapsed,
        radTravel = degToRadians(degTravel)
    arc.setEnd( baseStart + radTravel % (2 * Math.PI) )
    return time
  }

  // Return the time unit.
  const getTimeUnit = () => state.timeUnit

  // Return the number of time units per full circular rotation.
  const getUnitsPerRotation = () => state.unitsPerRotation

  // Return Interface.
  return frozen({
    ...arc,
    ...state.timer,
    getTimeUnit,
    getUnitsPerRotation,
    update
  })

}


export default makeArcTimer
