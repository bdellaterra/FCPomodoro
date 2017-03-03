import { assign, frozen, keys, pick, sealed } from '../utility/fn'
import makePauser from './pauser'
import now from 'present'

// USAGE NOTE: All time values are in miliseconds, unless noted otherwise.


// Create a timer object to track periodic and total elapsed time.
// This implementation requires a manual call to update() before time values
// are made current. This aids efficiency and prevents shift between calls.
export const makeTimer = (spec) => {

  // Initialize state.
  const state = sealed({
    startTime:   0,
    currentTime: 0,
    lastTime:    0
  })

  // Adjust state to spec.
  assign(state, pick(spec, keys(state)))

  // Return current time. (as of last upate)
  const time = () => state.currentTime

  // Return time between updates.
  const delta = () => state.currentTime - state.lastTime

  // Return total time elapsed. (as of last upate)
  const elapsed = () => state.currentTime - state.startTime

  // Update current time. Save previous for calculating delta.
  // Updates current time to now() if argument is undefined.
  const update = (t) => {
    state.lastTime = state.currentTime
    state.currentTime = (t !== undefined) ? t : now()
    return state.currentTime
  }

  // Syncronize all time values to now().
  // Optionally synchronize to specified value, if provided.
  const reset = (t) => {
    state.currentTime = (t !== undefined) ? t : now()
    state.startTime = state.currentTime
    state.lastTime = state.currentTime
    return state.currentTime
  }

  // Return Interface.
  return frozen({
    delta,
    elapsed,
    reset,
    time,
    update
  })

}

