import { assign, frozen, keys, pick, sealed } from '../utility/fn'


// Create a generator that triggers a list of callbacks
function* dispatcher(spec) {

  // Initialize state.
  const state = sealed({ callbacks: [] })

  // Adjust state to spec.
  assign(state, pick(spec, keys(state)))

  // Iteration is a permanent loop.
  while (true) {
    let len = state.callbacks.length
    console.log('dispatching:', len)
    while (len--) {
      state.callbacks[len]()
    }
    yield
  }

}


// Extend dispatcher with methods for adding/removing callbacks.
export const makeDispatcher = (spec = {}) => {
  // Create shared reference to callbacks.
  const state = { callbacks: spec.callbacks || [] }
  spec.callbacks = state.callbacks
  // Return generator extended with methods for managing callbacks.
  return Object.assign(dispatcher(spec), {
    addCallback:    (cb) => state.callbacks.push(cb),
    numCallbacks:   () => state.callbacks.length,
    removeCallback: (cb) => {
      Array.splice(state.callbacks, state.callbacks.indexOf(cb), 1)
    }
  })
}


export default makeDispatcher
