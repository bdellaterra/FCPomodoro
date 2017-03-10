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

  // Set the end position of the arc based on time elapsed/remaining,
  // and proportional to the number of time units per circle.
  const style = () => {
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
  }

  // Update the timer and the positioning of the arc.
  const update = (t) => {
    const time = state.timer.update(t)
    style()
    return time
  }

  // Return a reference to the timer.
  const getTimer = () => state.timer

  // Set the arc to track a different timer.
  const setTimer = (v) => state.timer = v

  // Return the time unit indicated by the arc timer.
  const getTimeUnit = () => state.timeUnit

  // Set the time unit denominated by the arc timer.
  const setTimeUnit = (v) => state.timeUnit = v

  // Return the number of time units per full circular rotation.
  const getUnitsPerCycle = () => state.unitsPerCycle

  // Set the number of time units per full circular rotation.
  const setUnitsPerCycle = (v) => state.unitsPerCycle = v

  // Return true if arc displays time diminishing toward zero.
  const isCountdown = () => state.isCountdown

  // Set boolean indicating if arc tracks diminishing time.
  // If true the timer's end value should be considered as well.
  const setCountdown = (v) => state.isCountdown = Boolean(v)

  // Return Interface.
  return frozen({
    ...arc,
    ...state.timer,
    getTimer,
    getTimeUnit,
    getUnitsPerCycle,
    isCountdown,
    setCountdown,
    setTimer,
    setTimeUnit,
    setUnitsPerCycle,
    style,
    update
  })

}


export default makeArcTimer
