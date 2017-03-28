import { assign, frozen, keys, pick, sealed } from '../utility/fn'
import { isIterable } from './iter'


// Create dispatcher with methods for adding/removing callbacks.
export const makeDispatcher = (spec = {}) => {

  // Initialize state.
  const state = sealed({
    callbacks: [],
    args:      []
  })

  // Adjust state to spec.
  assign(state, pick(spec, keys(state)))

  // Intuitively, callbacks should be provided in order-of-execution.
  // They are implemented in reverse for efficiency, so spec order is adjusted.
  state.callbacks.reverse()

  // Add a callback. If the dispatcher already has the callback,
  // it is not added to the list a second time.
  const addCallback = (cb) => {
    if (!state.callbacks.includes(cb)) {
      state.callbacks.unshift(cb)
    }
  }

  // Remove a callback from the list.
  const removeCallback = (cb) => {
    const index = state.callbacks.indexOf(cb)
    if (cb && index >= 0) {
      Array.splice(state.callbacks, index, 1)
    }
  }

  // Return the number of callbacks.
  const numCallbacks = () => state.callbacks.length

  // A generator that triggers a list of callbacks on every iteration.
  // Arguments for the callbacks can be passed in an array via next().
  // For the first iteration, an array can be provided via spec.args.
  function* dispatcher() {
    while (true) {
      let len = state.callbacks.length
      while (len > 0) {
        let cb = state.callbacks[--len],  // decrement, zero-indexed array
            args = (state.args && state.args.length) ? state.args : []
        if (typeof cb === 'function') {
          // Call functions.
          cb(...args)
        } else if (isIterable(cb)) {
          // Call next() for iterators, removing them if iteration is done.
          if (cb.next(...args).done) {
            removeCallback(cb)
          }
        }
      }
      state.args = yield
    }
  }

  // Create the generator.
  const d = dispatcher()

  // Add additional methods.
  Object.assign(d, {
    addCallback,
    numCallbacks,
    removeCallback
  })

  // Return the generator.
  return frozen(d)

}


export default makeDispatcher
