import { assign, frozen, keys, pick, sealed } from '../utility/fn'
import now from 'present'

// USAGE NOTE: All time values are in miliseconds, unless noted otherwise.


// Create a generator that triggers callbacks only after a set time interval.
// The current time must be passed in every iteration. If the delta from
// the previous time exceeds the defined interval the generator invokes all
// callbacks with the current time and the delta as args, then yields true.
// NOT EXPORTED: See makeDeltaGen()
function* deltaGen(spec) {

  // Initialize state.
  const state = sealed({
    lastTime:  now(),
    interval:  0,
    callbacks: []
  })

  // Adjust state to spec.
  assign(state, pick(spec, keys(state)))

  // Iteration is a permanent loop.
  while (true) {
    let time = yield Boolean(isTriggered),  // Time passed in via next()
        delta = time - state.lastTime,
        isTriggered = delta >= state.interval
    // Trigger callbacks if delta exceeds interval.
    if (isTriggered) {
      let len = state.callbacks.length
      while (len--) {
        state.callbacks[len](time, delta)
      }
      state.lastTime = time
    }
  }

}


// Extend generator deltaGen with methods for adding/removing callbacks.
export const makeDeltaGen = (spec = {}) => {
  // Create shared reference to callbacks.
  const state = { callbacks: spec.callbacks || [] }
  spec.callbacks = state.callbacks
  // Return generator extended with methods for managing callbacks.
  return Object.assign(deltaGen(spec), {
    addCallback:    (cb) => state.callbacks.push(cb),
    numCallbacks:   () => state.callbacks.length,
    removeCallback: (cb) => {
      Array.splice(state.callbacks, state.callbacks.indexOf(cb), 1)
    }
  })
}


export default makeDeltaGen
