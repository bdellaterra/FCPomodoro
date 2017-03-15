import { ARC_CYCLE, SECOND, SECONDS_PER_MINUTE } from '../utility/constants'
import { assign, frozen, keys, pick, relay, sealed } from '../utility/fn'
import { once } from '../utility/iter'
import makeAnimator from '../time/animator'
import makeArc from './arc'


// Create an arc that updates itself over time.
export const makeArcTimer = (spec) => {

  // Extends:
  const arc = makeArc(spec)

  // Initialize state.
  const state = sealed({
    animator:      null,  // placeholder for assign() below
    timeUnit:      SECOND,
    unitsPerCycle: SECONDS_PER_MINUTE,
    isCountdown:   false
  })

  // Adjust state to spec.
  assign(state, pick(spec, keys(state)))

  // Create a timer if none was provided.
  if (!state.animator) {
    state.animator = makeAnimator(spec)
  }

  // Set the end position of the arc based on time elapsed/remaining,
  // and proportional to the number of time units per circle.
  // Optionally position arc based on a supplied time value.
  const style = (t) => {
    const time = (state.isCountdown)
            ? state.animator.remaining()
            : state.animator.elapsed(),
          progress = (t !== undefined) ? t : time,
          moments = progress / state.timeUnit,
          step = ARC_CYCLE / state.unitsPerCycle,
          movements = step * moments,
          sign = arc.isCounterclockwise() ? -1 : 1,
          end = sign * movements % ARC_CYCLE
    // Set arc endpoint, favoring full vs. empty circle after a complete cycle.
    arc.setEnd( (Math.abs(end) > step) ? end : 0 )
  }

  // Return a reference to the timer.
  const getAnimator = () => state.animator

  // Set the arc to track a different timer.
  const setAnimator = (v) => state.animator = v

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
  // If changed this affects the arc's start and end position.
  const setCountdown = (v) => state.isCountdown = Boolean(v)

  const updateOffset = () => {
    let offset = 0
    if (state.isCountdown) {
      offset = state.timeUnit - state.animator.ending() % state.timeUnit
    }
    return offset
  }

  // Setup animation callbacks.
  const animate = () => {
    state.animator.addUpdate(once(style), 0)  // Initial display
    state.animator.addUpdate(style, state.timeUnit, updateOffset)
    state.animator.addRender(arc.render)
  }

  // Teardown animation callbacks.
  const deanimate = () => {
    state.animator.removeUpdate(style, state.timeUnit)
    state.animator.removeRender(arc.render)
  }

  // Return Interface.
  return frozen({
    ...arc,
    ...relay(state.animator),
    animate,
    deanimate,
    getAnimator,
    getTimeUnit,
    getUnitsPerCycle,
    isCountdown,
    setCountdown,
    setAnimator,
    setTimeUnit,
    setUnitsPerCycle,
    style,
    updateOffset
  })

}


export default makeArcTimer
