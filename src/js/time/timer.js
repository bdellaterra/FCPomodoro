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
    last:      0,
    ending:    0,
    alarm:     null
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

  // Return time between updates.
  const delta = () => state.time - state.last

  // Return time elapsed since start time. (as of last upate)
  // Optionally return time elapsed since a provided time value.
  const since = (time) => {
    return state.time - (time !== undefined ? time : state.beginning)
  }

  // Alias for since()
  const elapsed = since

  // Return the start time. Optionally set begin time to provided value.
  const beginning = (time) => {
    if (time !== undefined) {
      state.beginning = time
    }
    return state.beginning
  }

  // Return the ending time. Optionally set ending time to provided value.
  const ending = (time) => {
    if (time !== undefined) {
      state.ending = time
    }
    return state.ending
  }

  // Return time remaining until end time. (as of last upate)
  // Optionally return time remaining until a provided time value.
  const until = (time) => {
    return Math.max(0, (time !== undefined ? time : state.ending ) - state.time)
  }
  // Alias for until()
  const remaining = until

  // Update current time to value provided. Save previous time for
  // calculating deltas. Update current time to now() if argument is undefined.
  const sync = (time) => {
    state.last = state.time
    state.time = (time !== undefined) ? time : now()
    return state.time
  }

  // Synchronize all time values to now().
  // Optionally synchronize to a provided time value.
  const reset = (time) => {
    state.time = (time !== undefined) ? time : now()
    state.beginning = state.time
    state.last = state.time
    state.ending = state.time
    return state.time
  }

  // Reset timer and count down the given length of time.
  const countdown = (duration = 0) => {
    reset()
    ending(state.time + duration)
  }

  // Return Interface.
  return frozen({
    beginning,
    countdown,
    delta,
    elapsed,
    ending,
    remaining,
    reset,
    since,
    sync,
    time,
    until
  })

}


export default makeTimer
