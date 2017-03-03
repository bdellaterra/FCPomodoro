import { assign, frozen, keys, pick, sealed } from './fn'
import now from 'present'
import { filterNext } from './util'

// USAGE NOTE: All time values are in miliseconds, unless noted otherwise.


// Returns a promise that resolves after specified timeout.
export function sleep(m) {
  return new Promise((res) => setTimeout(res, m))
}


// Create a timer object to track periodic and total elapsed time.
// This implementation requires a manual call to update() before time values
// are made current. This aids efficiency and prevents shift between calls.
export const makeTimer = (spec) => {

  // Initialize state.
  const state = sealed({
    startTime:   0,
    currentTime: 0,
    lastTime:    0
  })

  // Adjust state to spec.
  assign(state, pick(spec, keys(state)))

  // Return current time. (as of last upate)
  const time = () => state.currentTime

  // Return time between updates.
  const delta = () => state.currentTime - state.lastTime

  // Return total time elapsed. (as of last upate)
  const elapsed = () => state.currentTime - state.startTime

  // Update current time. Save previous for calculating delta.
  // Updates current time to now() if argument is undefined.
  const update = (t) => {
    state.lastTime = state.currentTime
    state.currentTime = (t !== undefined) ? t : now()
    return state.currentTime
  }

  // Syncronize all time values to now().
  // Optionally synchronize to specified value, if provided.
  const reset = (t) => {
    state.currentTime = (t !== undefined) ? t : now()
    state.startTime = state.currentTime
    state.lastTime = state.currentTime
    return state.currentTime
  }

  // Return Interface.
  return frozen({
    delta,
    elapsed,
    reset,
    time,
    update
  })

}


// Create a pacer to run a frame loop.
export const makePacer = (spec) => {

  // Initialize state.
  const state = sealed({
    lastTime:       0,
    frameInterval:  0,
    frameRequestID: null,
    isRunning:      false,
    updates:        [],
    renders:        []
  })

  // Adjust state to spec.
  assign(state, pick(spec, keys(state)))

  // Iterate each update-generator, removing those that are done.
  // The current time is passed to the generators for calculation purposes.
  const update = (time) => {
    state.updates = filterNext(state.updates, time)
  }

  // Add an update-generator to the update queue
  const addUpdate = (p) => {
    state.updates.push(p)
  }

  // Iterate each render-generator, removing those that are done.
  const render = () => {
    state.renders = filterNext(state.renders)
  }

  // Add a render-generator to the render queue
  const addRender = (p) => {
    state.renders.push(p)
  }

  // Run a frame loop that executes once every frameInterval miliseconds.
  // The broswer will call back the loop with a high-precision timestamp.
  const loop = (time) => {
    if (state.isRunning) {
      // If frame interval is zero or time delta has met/exceeded interval.
      if (!state.frameInterval
        || state.frameInterval <= time - state.lastTime) {
        // Perform all updates.
        update(time)
        // Perform all renders.
        // render()
        // Save this time for next loop.
        state.lastTime = time
      }
      // Request callback from browser for another animation frame.
      state.frameRequestID = window.requestAnimationFrame(loop)
    }
  }

  // Get time of last completed loop
  const getLastTime = () => state.lastTime

  // Get current frame interval.
  const getFrameInterval = () => state.frameInterval

  // Adjust how often the loop iterates by setting the frame interval.
  const setFrameInterval = (f = 0) => {
    state.frameInterval = Math.max(f, 0)
  }

  // Return true if the frame loop is currently running.
  const isRunning = () => state.isRunning

  // Start loop. Update frameInterval if value provided.
  const run = (f) => {
    state.lastTime = now()
    setFrameInterval(f)
    state.isRunning = true
    loop(now())
  }

  // Stop the loop.
  const stop = () => {
    if (state.frameRequestID) {
      window.cancelAnimationFrame(state.frameRequestID)
    }
    state.frameRequestID = null
    state.isRunning = false
  }

  // Return Interface.
  return frozen({
    addUpdate,
    addRender,
    isRunning,
    getFrameInterval,
    getLastTime,
    setFrameInterval,
    run,
    stop
  })

}


// Create a generator that triggers callbacks only after a set time interval.
// The current time must be passed in every iteration. If the delta from
// the previous time exceeds the defined interval the generator invokes all
// callbacks with the current time and the delta as args, then yields true.
function* deltaGen(spec) {

  // Initialize state.
  const state = sealed({
    lastTime:  now(),
    interval:  0,
    callbacks: []
  })

  // Adjust state to spec.
  assign(state, pick(spec, keys(state)))

  // Iteration is a permanent loop.
  while (true) {
    let time = yield Boolean(isTriggered),  // Time passed in via next()
        delta = time - state.lastTime,
        isTriggered = delta >= state.interval
    // Trigger callbacks if delta exceeds interval.
    if (isTriggered) {
      let len = state.callbacks.length
      while (len--) {
        state.callbacks[len](time, delta)
      }
      state.lastTime = time
    }
  }

}

// Extend generator deltaGen with methods for adding/removing callbacks.
export const makeDeltaGen = (spec = {}) => {
  // Create shared reference to callbacks.
  const state = { callbacks: spec.callbacks || [] }
  spec.callbacks = state.callbacks
  // Return generator extended with methods regarding callbacks.
  return Object.assign(deltaGen(spec), {
    numCallbacks:   () => state.callbacks.length,
    addCallback:    (cb) => state.callbacks.push(cb),
    removeCallback: (cb) => {
      Array.splice(state.callbacks, state.callbacks.indexOf(cb), 1)
    }
  })
}

