import { assign, frozen, keys, pick, sealed } from '../utility/fn'
import makeDispatcher from '../utility/dispatcher.js'
import makeTimer from './timer'


// Create a dispatcher that keeps a schedule of time intervals and
// associated callbacks. On each call to next() the callbacks for the
// intervals that have elapsed will be triggered.
export const makePeriodicDispatcher = (spec) => {

  // Initialize state.
  const state = sealed({
    timer:    null,  // placeholder for assign() below
    schedule: {}
  })

  // Adjust state to spec.
  assign(state, pick(spec, keys(state)))

  // Create a timer if none was provided.
  if (!state.timer) {
    state.timer = makeTimer(spec)
  }

  // Add a callback to the dispatcher for the specified time interval.
  const addCallback = (cb, interval = 0) => {
    if (state.schedule[interval] === undefined) {
      state.schedule[interval] = {
        dispatcher: makeDispatcher(),
        last:       0
      }
    }
    state.schedule[interval].dispatcher.addCallback(cb)
  }

  // Remove a callback from the dispatcher for the specified time interval.
  const removeCallback = (cb, interval = 0) => {
    if (state.schedule[interval] !== undefined
        && state.schedule[interval].dispatcher !== undefined) {
      const dispatcher = state.schedule[interval].dispatcher
      dispatcher.removeCallback(cb)
      if (dispatcher.numCallbacks() <= 0) {
        delete state.schedule[interval]
      }
    }
  }

  // Return the total number of callbacks for all intervals combined.
  const totalCallbacks = () => keys(state.schedule).reduce((num, interval) => {
    return num += state.schedule[interval].dispatcher.numCallbacks()
  }, 0)

  // Return the number of callbacks being dispatched at the specified interval.
  const numCallbacks = (interval) => {
    let num = 0
    if (interval !== undefined) {
      if (state.schedule[interval] !== undefined) {
        num = state.schedule[interval].dispatcher.numCallbacks()
      }
    } else {
      num = totalCallbacks()
    }
    return num
  }

  // Create a dispatcher that triggers any callbacks that have waited
  // their specified interval or longer.
  function* periodicDispatcher() {
    while (true) {
      const elapsed = state.timer.elapsed()
      keys(state.schedule).map((interval) => {
        const dispatcher = state.schedule[interval].dispatcher,
              last = state.schedule[interval].last,
              delta = elapsed - last
        if (delta >= interval) {
          DEBUG && console.log('Dispatch for', interval, 'after', elapsed)
          dispatcher.next()
          state.schedule[interval].last = elapsed
        }
      })
      // Next timestamp must be passed in via next().
      state.timer.sync(yield)
    }
  }

  // Create the generator.
  const pd = periodicDispatcher()

  // Add additional methods.
  assign( pd, {
    addCallback,
    numCallbacks,
    removeCallback
  })

  // Prime and return the generator.
  pd.next()

  // Return Interface.
  return frozen(pd)

}


export default makePeriodicDispatcher
