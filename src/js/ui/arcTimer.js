import makeArc from './arc'
import makeTimer from '../time/timer'
import { SECOND } from '../utility/constants'
import { assign, frozen, keys, pick, sealed } from '../utility/fn'
import { degToRadians } from '../utility/conv'


// Create an arc that updates itself over time.
export const makeArcTimer = (spec) => {

  // Extends:
  const arc = makeArc(spec),
        timer = makeTimer(spec)

  // Initialize state.
  const state = sealed({
    timeUnit:         SECOND,
    unitsPerRotation: 60  // Use negative values for counterclockwise
  })

  // Adjust state to spec.
  assign(state, pick(spec, keys(state)))

  // Save initial start/end positions for reference.
  const baseStart = arc.getStart()
  const baseEnd = arc.getEnd()

  // Update the end position of the arc based on time elapsed,
  // and proportional to the number of time units per circle.
  const update = (time) => {
    timer.update(time)
    let elapsed = timer.elapsed() / state.timeUnit,
        degTravel = 360 / state.unitsPerRotation,
        radTravel = degToRadians(degTravel * elapsed)
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
    ...timer,
    getTimeUnit,
    getUnitsPerRotation,
    update
  })

}


export default makeArcTimer
