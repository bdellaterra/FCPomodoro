import { assign, frozen, keys, pick, sealed } from '../utility/fn'


// A generator that triggers a list of callbacks.
function* dispatcher(state) {
  while (true) {
    let len = state.callbacks.length
    while (len--) {
      state.callbacks[len].apply(null, state.args)
    }
    state.args = yield len
  }
}


// Create dispatcher with methods for adding/removing callbacks.
// A spec.args array can be used to pass args to the callbacks
// on the first iteration of the generator.
export const makeDispatcher = (spec = {}) => {

  // Initialize state.
  const state = sealed({
    callbacks: [],
    args:      []
  })

  // Adjust state to spec.
  assign(state, pick(spec, keys(state)))

  // Create generator.
  const d = dispatcher(state)

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
