import { canvas, context } from '../ui/canvas'
import { assign, frozen, keys, pick, sealed } from '../utility/fn'
import { filterNext } from '../utility/iter'
import now from 'present'

// USAGE NOTE: All time values are in milliseconds, unless noted otherwise.


// Create a pacer to run a frame loop.
export const makePacer = (spec) => {

  // Initialize state.
  const state = sealed({
    lastTime:       0,
    frameInterval:  0,
    frameAvgInt:    16.5,  // estimate
    frameRequestID: null,
    isRunning:      false,
    updates:        [],
    renders:        []
  })

  // Adjust state to spec.
  assign(state, pick(spec, keys(state)))

  // Iterate each update generator, removing those that are done.
  // The current time is passed to the generators for calculation purposes.
  const update = (time) => {
    state.updates = filterNext(state.updates, [time])
  }

  // Add an update-generator to the update queue
  const addUpdate = (p) => {
    state.updates.push(p)
  }

  // Iterate each render generator, removing those that are done.
  // The current time is passed for aliasing/interpolation purposes.
  const render = (time) => {
    context.clearRect(0, 0, canvas.width, canvas.height)
    state.renders = filterNext(state.renders, [time])
  }

  // Add a render-generator to the render queue.
  const addRender = (p) => {
    state.renders.push(p)
  }

  // Run a frame loop that executes once every frameInterval milliseconds.
  // The broswer will call back the loop with a high-precision timestamp.
  const loop = (time) => {
    if (state.isRunning) {
      const delta = time - state.lastTime
      // If frame interval is zero or time delta has met/exceeded interval.
      if (!state.frameInterval
        || state.frameInterval <= delta) {
        // Perform all updates.
        update(time)
        // Perform all renders.
        render(time)
        // Save this time for next loop.
        state.lastTime = time
        // Keep a moving average of the frame rate
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
  const getAverageFrameRate = () => 1000 / state.frameAvgInt

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
    addRender,
    addUpdate,
    getAverageFrameInterval,
    getAverageFrameRate,
    getFrameInterval,
    getLastTime,
    isRunning,
    run,
    setFrameInterval,
    stop
  })

}


export default makePacer
