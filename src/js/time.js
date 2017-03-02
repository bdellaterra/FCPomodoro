import { assign, frozen, keys, pick, sealed } from './fn'
import now from 'present'
import { nullIterator } from './util'

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

const timeStream = (spec) => {

  // Initialize state.
  const state = sealed({ timer: makeTimer() })

  // Adjust state to spec.
  assign(state, pick(spec, keys(state)))

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

  // Return a promise resolves once all updates have been resolved.
  const update = (t) => {
    return Promise.all(state.updates)
  }

  // Add a promise to the list of updates.
  const addUpdate = (p) => {
    state.updates.push(p)
  }

  // Return a promise resolves once all renders have been resolved.
  const render = () => {
    return Promise.all(state.renders)
  }

  // Add a promise to the list of renders.
  const addRender = (p) => {
    state.renders.push(p)
  }

  const prom = () => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        console.log('Loopz!!')
        resolve(1)
      }, 3000)
    })
  }

  // Run a frame loop that executes once every frameInterval miliseconds.
  // The broswer will call back the loop with a high-precision timestamp.
  const loop = async (time) => {
    console.log('time:', time)
    if (
      // While in running state...
      state.isRunning
      // and frame interval is either zero...
      && !state.frameInterval
      // or time delta has met/exceeded frame interval.
      || state.frameInterval <= time - state.lastTime) {

      // Perform all updates
      console.log('Updates starting!')
      await update(time)
      console.log('Updates done!')
      // update(time).then(() => console.log('Updates done.'))
        // then perform all renders,
      // .then(render)
        // then request callback from browser for another animation frame.
      // .then(() => state.frameRequestID = window.requestAnimationFrame(loop))

      // Save this time for next loop.
      state.lastTime = time
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


// // Returns a function that feeds iteration results at no
// // faster than the specified pace. The pace can be changed
// // at any time but doing so does not reset the timer.
// // A pace of zero allows iteration with zero delay.
// export const makeFeeder = (spec) => {
//
//  const state = sealed({
//      lastTime: 0,
//      pace:     0
//  })
//
//  assign(state, pick(spec, keys(state)))
//
//  return (p) => {
//    let time = elapsed(),
//        delta = time - lastTime,
//        result = null
//    if (p !== undefined) { pace = p }
//    if (!pace || delta / pace > 1) {
//      lastTime = time
//      result = iter.next()
//    }
//    return result
//  }
// }


// // Creates a function that returns the amount of time since it was last called.
// // Returns zero on first call. Returns time since argument, if provided.
// export const makeDeltaTimer = (spec) => {
//   const state = sealed({ lastTime: null })
//   return frozen({
//     delta: (t) => {
//       if (t !== undefined) { state.lastTime = t }
//       let time = now()
//       let delta = state.lastTime ? time - state.lastTime : 0
//       state.lastTime = time
//       return delta
//     }
//   })
// }
//
// // Accumulates time since first call.
// // Accumulates from specified time, if provided.
// export const makeElapsedTimer = () => {
//   const deltaTimer = makeDeltaTimer(),
//         state = sealed({ elapsedTime: 0 })
//   return frozen({
//     ...deltaTimer,
//     elapsed: (t) => {
//       if (t !== undefined) { state.elapsedTime = 0 }
//       state.elapsedTime += deltaTimer.delta(t)
//       return state.elapsedTime
//     }
//   })
// }
//
// // Counts down from supplied time value.
// // Specifying a value resets the timer.
// export const makeCountdown = () => {
//   var elapsed = makeElapsedTimer(),
//       remaining = 0
//   return (r) => {
//     if (r !== undefined) {
//       elapsed(now())
//     } else {
//       r = remaining - elapsed()
//     }
//     remaining = Math.max(r, 0)
//     return remaining
//   }
// }
//
// // Returns a function that feeds iteration results at no
// // faster than the specified pace. The pace can be changed
// // at any time but doing so does not reset the timer.
// // A pace of zero allows iteration with zero delay.
// export const makeFeeder = (iter) => {
//   var elapsed = makeElapsedTimer(),
//       lastTime = 0,
//       pace = 0
//   return (p) => {
//     let time = elapsed(),
//         delta = time - lastTime,
//         result = null
//     if (p !== undefined) { pace = p }
//     if (!pace || delta / pace > 1) {
//       lastTime = time
//       result = iter.next()
//     }
//     return result
//   }
// }
//
// export const makePacer = (spec) => {
//   const state = sealed({
//     frameInterval: 0,
//     schedule:      []
//   })
//   assign(state, pick(spec, keys(state)))
//   return frozen({
//     getFrameInterval: () => state.frameInterval,
//     setFrameInterval: (v) => state.frameInterval = v,
//     dispatch:         () => {
//       schedule.foreach((f) => {
//         f.next()
//       })
//     }
//   })
// }

// // Create a time keeper that dispatches callbacks at set intervals.
// // Time is measured in miliseconds.
// export const makePacer2 = (spec) => {
//
//   // Default state
//   const state = sealed({
//     startTick:      now(),  // time when tracking began
//     time:           0,      // time elapsed
//     updateInterval: 1, // delay between notifications
//     schedule:       {}
//   })
//
//   // Update time every animation frame.
//   // Dispatch at set intervals. (Default is every frame.)
//   const run = () => {
//     window.requestAnimationFrame(run)
//     state.time = now() - state.startTick
//     // if (state.time / state.updateInterval > 1) {
//     //  dispatch()
//     // }
//   }
//
//   const dispatch = () => {
//     console.log('Updates at:', state.time)
//   }
//
//   // Adjust default state to spec.
//   assign(state, pick(spec, keys(state)))
//
//   // Start in running state
//   run()
//
//   return frozen({
//
//     // As above
//     run,
//
//     getTime: () => state.time,
//     reset:   () => state.startTick = now()
//
//   })
//
// }

