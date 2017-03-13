import { assign, frozen, keys, pick, sealed } from '../utility/fn'
import makeDispatcher from '../utility/dispatcher.js'
import makeTimer from './timer'


// Create a dispatcher that keeps a schedule of time intervals and
// associated callbacks. On each call to sync() the callbacks for the
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
  const addCallback = (cb, interval) => {
    if (state.schedule[interval] === undefined) {
      state.schedule[interval] = {
        dispatcher: makeDispatcher(),
        last:       0
      }
    }
    state.schedule[interval].dispatcher.addCallback(cb)
  }

  // Remove a callback from the dispatcher for the specified time interval.
  const removeCallback = (cb, interval) => {
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

  // Sync timer to current time. Trigger any callbacks that have waited
  // their specified interval or longer.
  const sync = (t) => {
    state.timer.sync(t)
    const elapsed = state.timer.elapsed()
    console.dir(keys(state.schedule))
    keys(state.schedule).map((interval) => {
      const dispatcher = state.schedule[interval].dispatcher,
            last = state.schedule[interval].last,
            delta = elapsed - last
      if (delta > interval) {
        console.log('Dispatch for', interval, 'after', elapsed)
        dispatcher.next()
        state.schedule[interval].last = elapsed
      }
    })
  }

  // Return Interface.
  return frozen({
    addCallback,
    numCallbacks,
    removeCallback,
    sync
  })

}


export default makePeriodicDispatcher
