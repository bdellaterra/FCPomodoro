import { assign, frozen, keys, omit, pick, sealed } from '../utility/fn'
import makeDispatcher from '../utility/dispatcher'
import makeTimer from './timer'
import now from 'present'

// USAGE NOTE: All time values are in milliseconds, unless noted otherwise.


// Create a dispatcher that triggers callbacks only after a set time interval.
// The current time must be passed inside and array every iteration via next().
// If the delta from the previous time exceeds the defined interval then all
// callbacks will be called with the current time and delta as args.
export const makeRateLimiter = (spec = {}) => {

  // Initialize state.
  const state = sealed({
    timer:      null,   // placeholder for assign() below
    dispatcher: null,   // placeholder for assign() below
    interval:   0
  })

  // Adjust state to spec.
  assign(state, pick(spec, keys(state)))

  // Create a timer if none was provided.
  if (!state.timer) {
    state.timer = makeTimer(spec)
  }

  // Create a dispatcher if none was provided.
  if (!state.dispatcher) {
    state.dispatcher = makeDispatcher({
      args: [state.lastTime, 0],  // time, delta
      ...spec
    })
  }

  // A dispatcher that triggers callbacks only after a set time interval
  // has elapsed. The timer itself is updated elsewhere, such as in frame loop.
  function* rateLimiter() {
    let lastTime = state.timer.elapsed()
    while (true) {
      let time = state.timer.elapsed(),
          delta = time - lastTime,
          isTriggered = delta >= state.interval
      // Trigger callbacks if delta exceeds time interval.
      if (isTriggered) {
        state.dispatcher.next([time, delta])
        lastTime = time
      }
      // Next timestamp must be passed in via next()
      state.timer.update(yield isTriggered)
    }
  }

  // Create the generator.
  const rl = rateLimiter()

  // Inherit methods from dispatcher without overriding anything.
  assign( rl, omit(state.dispatcher, keys(rl)) )

  // Add additional methods.
  assign( rl, { setInterval: (v) => state.callbacks.unshift(cb) } )

  // Prime and return the generator.
  rl.next()
  return frozen(rl)

}


export default makeRateLimiter