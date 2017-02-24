import { assign, frozen, keys, pick, sealed } from './fn'
import now from 'present'
import { nullIterator } from './util'

// USAGE NOTE: Unless otherwise stated, all time values are in miliseconds.

// Returns a promise that resolves after specified timeout
export function sleep(m) {
  return new Promise((res) => setTimeout(res, m))
}

// Creates a function that returns the amount of time since it was last called.
// Returns zero on first call. Returns time since argument, if provided.
export const makeDeltaTimer = () => {
  var lastTime
  return (t) => {
    if (t !== undefined) { lastTime = t }
    let time = now()
    let delta = lastTime ? time - lastTime : 0
    lastTime = time
    return delta
  }
}

// Accumulates time since first call.
// Accumulates from specified time, if provided.
export const makeKeepTimer = () => {
  var delta = makeDeltaTimer(),
      time = 0
  return (t) => {
    if (t !== undefined) { time = 0 }
    time += delta(t)
    return time
  }
}

// Counts down from supplied time value.
// Specifying a value resets the timer.
export const makeCountdown = () => {
  var keeptime = makeKeepTimer(),
      remaining = 0
  return (r) => {
    if (r !== undefined) {
      keeptime(now())
    } else {
      r = remaining - keeptime()
    }
    remaining = Math.max(r, 0)
    return remaining
  }
}

// Returns a function that feeds iteration results at no
// faster than the specified pace. The pace can be changed
// at any time but doing so does not reset the timer.
// A pace of zero allows iteration with zero delay.
export const makeFeeder = (iter) => {
  var keeptime = makeKeepTimer(),
      lastTime = 0,
      pace = 0
  return (p) => {
    let time = keeptime(),
        delta = time - lastTime,
        result = null
    if (p !== undefined) { pace = p }
    if (!pace || delta / pace > 1) {
      lastTime = time
      result = iter.next()
    }
    return result
  }
}

export const makePacer = (spec) => {
  const state = sealed({
    frameInterval: 0,
    schedule:      {}
  })
  assign(state, pick(spec, keys(state)))
  return frozen({
    getFrameInterval: () => state.frameInterval,
    setFrameInterval: (v) => state.frameInterval = v,
    dispatch:         () => {
      schedule.keys().foreach(() => {
      })
    }
  })
}

export const makeLooper = (p) => {
  const pace = (p !== undefined) ? p : makePacer(),
        loop = () => {
          window.requestAnimationFrame(loop)
          pace()
        }
  return loop
}

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

