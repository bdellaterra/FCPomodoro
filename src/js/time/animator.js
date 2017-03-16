import { SECOND } from '../utility/constants'
import { assign, frozen, keys, pick, relay, sealed } from '../utility/fn'
import { filterNext } from '../utility/iter'
import { clearCanvas } from '../ui/canvas'
import makeDispatcher from '../utility/dispatcher.js'
import makePacer from '../time/pacer.js'
import now from 'present'

// USAGE NOTE: All time values are in milliseconds, unless noted otherwise.


// Create an animator to run a frame loop that triggers state updates
// and rendering of display objects.
export const makeAnimator = (spec) => {

  // Initialize state.
  const state = sealed({
    lastTime:       0,
    frameInterval:  0,
    frameAvgInt:    16.5,  // Start with estimate.
    frameRequestID: null,
    isRunning:      false,
    updater:        makePacer(spec),
    renderer:       makeDispatcher(spec)
  })

  // Adjust state to spec.
  assign(state, pick(spec, keys(state)))

  // Trigger updates.
  const update = (time) => {
    state.updater.next(time)
    return time
  }

  // Add an update callback with optional time interval between updates.
  const addUpdate = state.updater.addCallback

  // Remove an update callback, specifying the same interval it was added under.
  const removeUpdate = (cb, interval) => {
    return state.updater.removeCallback(cb, interval)
  }

  // Return the number of update callbacks under a given time interval.
  // If no argument is provided, return the total number of update callbacks.
  const numUpdates = state.updater.numCallbacks

  // Trigger renders.
  const render = () => {
    clearCanvas()
    state.renderer.next()
  }

  // Add a render callback.
  const addRender = state.renderer.addCallback

  // Remove a render callback.
  const removeRender = state.renderer.removeCallback

  // Return the number of render callbacks.
  const numRenders = state.renderer.numCallbacks

  // Run a frame loop that executes once every frameInterval milliseconds.
  // The browser will call back the loop with a high-precision timestamp.
  const loop = (time) => {
    if (state.isRunning) {
      const delta = time - state.lastTime
      // If frame interval is zero or time delta has met/exceeded interval.
      if (!state.frameInterval || state.frameInterval <= delta) {
        // Perform all updates.
        update(time)
        // Perform all renders.
        render(time)
        // Save this time for the next loop.
        state.lastTime = time
        // Keep a moving average of the frame interval.
        state.frameAvgInt = 0.9 * state.frameAvgInt + 0.1 * delta
      }
      // Request callback from browser for another animation frame.
      state.frameRequestID = window.requestAnimationFrame(loop)
    }
  }

  // Return time of last completed loop
  const getLastTime = () => state.lastTime

  // Return current frame interval.
  const getFrameInterval = () => state.frameInterval

  // Return average frame interval.
  const getAverageFrameInterval = () => state.frameAvgInt

  // Return average frame rate per second.
  const getAverageFrameRate = () => SECOND / state.frameAvgInt

  // Adjust how often the loop iterates by setting the frame interval.
  const setFrameInterval = (f = 0) => {
    state.frameInterval = Math.max(Number(f), 0) || 0
  }

  // Return true if the frame loop is currently running.
  const isRunning = () => state.isRunning

  // Start loop. Update frameInterval if value provided.
  const run = (f) => {
    if (!state.isRunning) {
      state.lastTime = now()
      setFrameInterval(f)
      state.updater.resetCallbacks()
      state.isRunning = true
      loop(now())
    }
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
    ...relay( state.updater ),
    addRender,
    addUpdate,
    getAverageFrameInterval,
    getAverageFrameRate,
    getFrameInterval,
    getLastTime,
    isRunning,
    numRenders,
    numUpdates,
    removeRender,
    removeUpdate,
    run,
    setFrameInterval,
    stop
  })

}


export default makeAnimator
