import { assign, frozen, keys, pick, sealed } from './fn'
import now from 'present'
import makeTimer from './timer'

// Minimum milisecond delay for safely testing asyncronous timing
export const jiffy = 50

// Returns a promise that resolves after specified timeout in miliseconds
export function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms))
}

// Creates a function that returns the amount of time since it was last called.
// Time is measured in miliseconds. Returns zero on first call.
// If optional argument is provided it returns time since argument.
export const makeDeltaTimer = () => {
  var lastTick
  return (t) => {
    if (t !== undefined) { lastTick = t }
    let tick = now()
    let delta = lastTick ? tick - lastTick : 0
    lastTick = tick
    return delta
  }
}


// Create a time keeper that dispatches callbacks at set intervals.
// Time is measured in miliseconds.
export const makePacer = (spec) => {

  // Default state
  const state = sealed({
    startTick:      now(),  // time when tracking began
    time:           0,      // time elapsed
    updateInterval: 1, // delay between notifications
    schedule:       {}
  })

  // Update time every animation frame.
  // Dispatch at set intervals. (Default is every frame.)
  const run = () => {
    window.requestAnimationFrame(run)
    state.time = now() - state.startTick
    // if (state.time / state.updateInterval > 1) {
    //  dispatch()
    // }
  }

  const dispatch = () => {
    console.log('Updates at:', state.time)
  }

  // Adjust default state to spec.
  assign(state, pick(spec, keys(state)))

  // Start in running state
  run()

  return frozen({

    // As above
    run,

    getTime: () => state.time,
    reset:   () => state.startTick = now()

  })

}

