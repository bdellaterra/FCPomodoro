import { assign, frozen, keys, pick, sealed } from '../utility/fn'
import now from 'present'

// USAGE NOTE: All time values are in milliseconds, unless noted otherwise.


// Create a timer object to track periodic and total elapsed time.
// This implementation requires a manual call to sync() before time values
// are made current. This aids efficiency and prevents shift between calls.
export const makeTimer = (spec) => {

  // Initialize state.
  const state = sealed({
    beginning: 0,
    time:      0,
    last:      0
  })

  // Adjust state to spec.
  assign(state, pick(spec, keys(state)))

  // Return current time. (as of last upate) Optionally set time to a value.
  // NOTE: Generally sync() is preffered for updates, since it handles deltas.
  const time = (time) => {
    if (time !== undefined) {
      state.time = time
    }
    return state.time
  }

  // Return beginning time. Optionally set it to provided value.
  const beginning = (time) => {
    if (time !== undefined) {
      state.beginning = time
    }
    return state.beginning
  }

  // Return time elapsed since beginning. (as of last upate)
  // Optionally return time elapsed since a provided time value.
  const since = (time) => {
    return state.time - (time !== undefined ? time : state.beginning)
  }
  // Alias:
  const elapsed = since

  // Update current time to value provided. Save previous time for
  // calculating deltas. Update current time to now() if argument is undefined.
  const sync = (t) => {
    state.last = state.time
    time( t !== undefined ? t : now() )
    return state.time
  }

  // Return time since last update.
  const delta = () => state.time - state.last

  // Synchronize all time values to now().
  // Optionally synchronize to a provided time value.
  const reset = (time) => {
    state.time = (time !== undefined) ? time : now()
    state.beginning = state.time
    state.last = state.time
    return state.time
  }

  // Return Interface.
  return frozen({
    beginning,
    delta,
    elapsed,
    reset,
    since,
    sync,
    time
  })

}


export default makeTimer
