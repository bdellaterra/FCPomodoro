import { assign, frozen, keys, pick, sealed } from './fn'
import now from 'present'
import { nullIterator } from './util'

// USAGE NOTE: Unless otherwise stated, all time values are in miliseconds.

// Returns a promise that resolves after specified timeout
export function sleep(m) {
  return new Promise((res) => setTimeout(res, m))
}

// create a timer object to track periodic and total elapsed time.
// For efficiency, this implementation requires a manual call
// to update() before time values are made current.
export const makeTimer = (spec) => {

  // Default state
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

  // Update the current time. Save previous for calculating delta.
  const update = (t) => {
    state.lastTime = state.currentTime
    state.currentTime = (t !== undefined) ? t : now()
    return state.currentTime
  }

  // Re-initialize all time values to present time.
  const reset = (t) => {
    state.currentTime = (t !== undefined) ? t : now()
    state.startTime = state.currentTime
    state.lastTime = state.currentTime
    return state.currentTime
  }

  // Interface
  return frozen({ update, time, delta, elapsed, reset })

}

