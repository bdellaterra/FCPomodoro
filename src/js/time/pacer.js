import { assign, frozen, keys, pick, sealed } from '../utility/fn'
import { canvas, context } from '../ui/canvas'
import { filterNext } from '../utility/iter'
import now from 'present'
import sleep from './sleep'

// USAGE NOTE: All time values are in miliseconds, unless noted otherwise.


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
    context.clearRect(0, 0, canvas.width, canvas.height)
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
        render()
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
    addRender,
    addUpdate,
    getFrameInterval,
    getLastTime,
    isRunning,
    run,
    setFrameInterval,
    stop
  })

}


export default makePacer
