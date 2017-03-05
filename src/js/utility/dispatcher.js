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


// A dispatcher that triggers callbacks only after
// a set time interval has elapsed.
function* rateLimiter(state) {
  let time = state.lastTime
  while (true) {
    let delta = time - state.lastTime,
        isTriggered = delta >= state.interval
   // Trigger callbacks if delta exceeds time interval.
    if (isTriggered) {
      state.dispatcher.next([time, delta])
      state.lastTime = time
    }
    // Next timestamp must be passed in via next()
    time = yield Boolean(isTriggered)
  }
}


// Create a rate limiter with time methods.
export const makeRateLimiter = (spec = {}) => {

  // Initialize state.
  const state = sealed({
    dispatcher: null,   // placeholder for assign() below
    lastTime:   now(),
    interval:   0
  })

  // Adjust state to spec.
  assign(state, pick(spec, keys(state)))

  // Create a dispatcher if none was provided.
  if (!state.dispatcher) {
    state.dispatcher = makeDispatcher({
      args: [state.lastTime, 0],  // time, delta
      ...spec
    })
  }

  // Create generator.
  const rl = rateLimiter(state)

  // Add additional methods.
  Object.assign(rl, {
    ...dispatcher,
    setInterval:    (v) => state.callbacks.unshift(cb),
    numCallbacks:   () => state.callbacks.length,
    removeCallback: (cb) => {
      Array.splice(state.callbacks, state.callbacks.indexOf(cb), 1)
    }
  })

  // Prime and return the generator.
  rl.next()
  return frozen(rl)

}


export default makeDispatcher
