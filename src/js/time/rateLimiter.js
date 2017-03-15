import { assign, frozen, keys, omit, pick, sealed } from '../utility/fn'
import makeDispatcher from '../utility/dispatcher'
import makeTimer from './timer'

// USAGE NOTE: All time values are in milliseconds, unless noted otherwise.


// Create a dispatcher that triggers callbacks only after a set time interval.
// The current time must be passed inside an array every iteration via next().
// If the delta from the previous time exceeds the defined interval then all
// callbacks will be called with the current time and delta as args.
export const makeRateLimiter = (spec = {}) => {

  // Initialize state.
  const state = sealed({
    timer:      makeTimer(spec),  // track time since callbacks were triggered
    dispatcher: null,   // placeholder for assign() below
    interval:   0
  })

  // Adjust state to spec.
  assign(state, pick(spec, keys(state)))

  // Create a dispatcher if none was provided.
  if (!state.dispatcher) {
    state.dispatcher = makeDispatcher({
      args: [state.timer.elapsed(), 0],  // time, delta
      ...spec
    })
  }

  // Create a dispatcher that triggers callbacks only after a set time interval
  // has elapsed. The current time is polled elsewhere, likely in a frame loop.
  function* rateLimiter() {
    let lastElapsed = state.timer.elapsed()
    while (true) {
      let elapsed = state.timer.elapsed(),
          delta = elapsed - lastElapsed,
          isTriggered = delta >= state.interval
      // Trigger callbacks if delta exceeds time interval.
      if (isTriggered) {
        state.dispatcher.next([elapsed, delta])
        lastElapsed = elapsed
      }
      // Next timestamp must be passed in via next()
      state.timer.sync(yield isTriggered)
    }
  }

  // Create the generator.
  const rl = rateLimiter()

  // Inherit from dispatcher without overriding generator methods like next().
  assign( rl, omit(state.dispatcher, keys(rl)) )

  // Add additional methods.
  assign( rl, {
    getInterval: () => state.interval,
    setInterval: (v) => state.interval = v
  })

  // Prime and return the generator.
  rl.next()
  return frozen(rl)

}


export default makeRateLimiter
