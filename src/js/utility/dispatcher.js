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

  // A generator that triggers a list of callbacks on every iteration.
  // Arguments for the callbacks can be passed in an array via next().
  // For the first iteration, an array can be provided via spec.args.
  function* dispatcher() {
    while (true) {
      let len = state.callbacks.length
      while (len > 0) {
        let cb = state.callbacks[--len],  // zero-indexed array
            args = (state.args && state.args.length) ? state.args : []
        if (typeof cb === 'function') {
          cb(...args)
        } else if ( isIterable(cb) ) {
          cb.next(...args)
        }
      }
      state.args = yield
    }
  }

  // Create the generator.
  const d = dispatcher()

  // Add additional methods.
  Object.assign(d, {
    addCallback:    (cb) => state.callbacks.unshift(cb),
    numCallbacks:   () => state.callbacks.length,
    removeCallback: (cb) => {
      Array.splice(state.callbacks, state.callbacks.indexOf(cb), 1)
    }
  })

  // Prime and return the generator.
  d.next()
  return frozen(d)

}


export default makeDispatcher
