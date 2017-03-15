import { assign, frozen, keys, pick, relay, sealed } from '../utility/fn'
import { MINUTE, SECOND } from '../utility/constants'
import makeDispatcher from '../utility/dispatcher.js'
import makeTimer from './timer'


// Create a pacer that keeps a schedule of time intervals and
// associated callbacks. On each call to next() the callbacks for the
// intervals that have elapsed will be triggered.
export const makePacer = (spec) => {

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
  // The default interval of zero means the callback triggers every iteration.
  // An optional timing offset callback can be provided. Returns the interval.
  const addCallback = (cb, interval = 0, offset = () => 0) => {
    if (state.schedule[interval] === undefined) {
      // Each interval has a dispatcher and the last reading of timer.elapsed().
      state.schedule[interval] = {
        dispatcher: makeDispatcher(),
        last:       0,
        offset
      }
      console.log(interval, state.schedule[interval])
    }
    state.schedule[interval].dispatcher.addCallback(cb)
    return interval
  }

  // Remove a callback from the dispatcher for the specified time interval.
  // Returns the interval.
  const removeCallback = (cb, interval = 0) => {
    if (state.schedule[interval] && state.schedule[interval].dispatcher) {
      const dispatcher = state.schedule[interval].dispatcher
      dispatcher.removeCallback(cb)
      // Remove the entry for the interval itself if zero callbacks remain.
      if (dispatcher.numCallbacks() <= 0) {
        delete state.schedule[interval]
      }
    }
    return interval
  }

  // Return the total number of callbacks for all intervals combined.
  const totalCallbacks = () => keys(state.schedule).reduce((num, interval) => {
    return num += state.schedule[interval].dispatcher.numCallbacks()
  }, 0)

  // Return the number of callbacks being dispatched at the specified interval,
  // or the total for all intervals if no argument provided.
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

  // Reset the time for all callbacks
  const resetCallbacks = () => keys(state.schedule).map((interval) => {
    state.schedule[interval].last = 0
  })

  // Reset the timer
  const resetTimer = () => state.timer.reset()

  // Reset the timer and zero-out the last time reading for all callbacks.
  const reset = () => {
    resetTimer()
    resetCallbacks()
  }

  // Return the timer.
  const getTimer = () => state.timer

  // Set the pacer to track a new timer.
  const setTimer = (v) => {
    state.timer = v
    resetCallbacks()
  }

  // Create a pacer to trigger callbacks that have waited
  // for a specified timer interval or longer.
  function* pacer() {
    while (true) {
      const elapsed = state.timer.elapsed()
      keys(state.schedule).map((interval) => {
        const dispatcher = state.schedule[interval].dispatcher,
              last = state.schedule[interval].last,
              offset = state.schedule[interval].offset(),
              delta = elapsed - last + offset
        if (Number(interval) === MINUTE) {
          console.clear()
          console.log(delta)
        }
        if (delta >= interval) {
          dispatcher.next()
          state.schedule[interval].last = elapsed
        }
      })
      // Next timestamp is passed in via next().
      state.timer.sync(yield)
    }
  }

  // Create the generator.
  const p = pacer()

  // Add additional methods.
  assign( p, {
    ...relay(state.timer),  // provide timer interface
    addCallback,
    getTimer,
    numCallbacks,
    removeCallback,
    reset,
    resetCallbacks,
    resetTimer,
    setTimer
  })

  // Prime and return the generator.
  p.next()

  // Return Interface.
  return frozen(p)

}


export default makePacer
