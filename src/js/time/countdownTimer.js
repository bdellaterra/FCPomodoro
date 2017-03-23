import { assign, frozen, keys, pick, sealed } from '../utility/fn'
import { makeTimer } from 'time/timer'
import now from 'present'

// USAGE NOTE: All time values are in milliseconds, unless noted otherwise.


// Create a timer that can count down a specified duration and
// notify listeners when the zero-moment arrives.
export const makeCountdownTimer = (spec) => {

  // Extends:
  const timer = makeTimer(spec)

  // Initialize state.
  const state = sealed({
    ending:   0,
    promise:  null,  // shared promise that resolves when countdown reaches zero
    notifier: null   // iterator used to resolve the promise asynchronously
  })

  // Adjust state to spec.
  assign(state, pick(spec, keys(state)))

  // Return the ending time. Optionally set ending time to provided value.
  const ending = (time) => {
    if (time !== undefined) {
      state.ending = time
    }
    return state.ending
  }

  // Return difference between time of last update and the ending time.
  // Optionally calculate how long remains until a provided time value.
  const until = (time) => {
    const ending = time !== undefined ? time : state.ending
    return Math.max(0, ending - timer.time())
  }
  // Alias:
  const remaining = until

  // Update current time. Check the time remaining and
  // resolve promise if it is zero.
  const sync = (time) => {
    const currentTime = timer.sync(time)
    // If the countdown is complete...
    if (remaining() === 0) {
      // Resolve any pending promise by sending boolean true
      if (state.promise) {
        state.notifier.next(true)
      }
      // Clear the promise/notifier
      state.promise = null
      state.notifier = null
    }
    return currentTime
  }

  // Reset time values and clear promise/notifier.
  const reset = (time) => {
    time = (time !== undefined) ? time : now()
    state.ending = timer.reset(time)
    // If there's a pending promise, reject it by sending boolean false.
    if (state.promise) {
      state.notifier.next(false)
    }
    // Clear the promise/notifier
    state.promise = null
    state.notifier = null
    return time
  }

  // Reset timer and count down the given length of time.
  // Create a promise that resolves when the countdown reaches zero.
  const countdown = (duration = 0) => {
    reset()
    if (duration > 0) {
      state.ending = timer.time() + duration
      // Create notifier inside promise to access the resolve/reject functions.
      state.promise = new Promise((resolve, reject) => {
        state.notifier = (function* () { (yield) ? resolve() : reject() }())
      })
      // Prime the notifier
      state.notifier.next()
    }
  }

  // Return the promise that resolves when the countdown reaches zero.
  // If the time remaining is zero, return a promise that resolves immediately.
  const waitAlarm = () => state.promise || Promise.resolve()

  // Return Interface.
  return frozen({
    ...timer,
    countdown,
    ending,
    remaining,
    reset,
    sync,
    until,
    waitAlarm
  })

}


export default makeCountdownTimer
