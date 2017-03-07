import { ARC_CYCLE, SECOND, SECONDS_PER_MINUTE } from '../utility/constants'
import { assign, frozen, keys, pick, sealed } from '../utility/fn'
import makeArc from './arc'
import makeTimer from '../time/timer'


// Create an arc that updates itself over time.
export const makeArcTimer = (spec) => {

  // Extends:
  const arc = makeArc(spec)

  // Initialize state.
  const state = sealed({
    timer:         null,  // placeholder for assign() below
    timeUnit:      SECOND,
    unitsPerCycle: SECONDS_PER_MINUTE,
    isCountdown:   false
  })

  // Adjust state to spec.
  assign(state, pick(spec, keys(state)))

  // Create a timer if none was provided.
  if (!state.timer) {
    state.timer = makeTimer(spec)
  }

  // Update the end position of the arc based on time elapsed,
  // and proportional to the number of time units per circle.
  // The current time must be polled seperately, likely in a frame loop.
  const update = (time) => {
    const progress = (state.isCountdown)
            ? state.timer.remaining()
            : state.timer.elapsed(),
          moments = progress / state.timeUnit,
          step = ARC_CYCLE / state.unitsPerCycle,
          movements = step * moments,
          sign = arc.isCounterclockwise() ? -1 : 1,
          end = sign * movements % ARC_CYCLE
    // Set arc endpoint, favoring full vs. empty circle after a complete cycle.
    arc.setEnd( (Math.abs(end) > step) ? end : 0 )
    return time
  }

  // Return a reference to the timer.
  const getTimer = () => state.timer

  // Return the time unit indicated by the arc timer.
  const getTimeUnit = () => state.timeUnit

  // Return the number of time units per full circular rotation.
  const getUnitsPerCycle = () => state.unitsPerCycle

  // Return Interface.
  return frozen({
    ...arc,
    ...state.timer,
    getTimer,
    getTimeUnit,
    getUnitsPerCycle,
    update
  })

}


export default makeArcTimer
