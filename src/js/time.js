import { assign, frozen, keys, pick, sealed } from './fn'
import now from 'present'
import makeTimer from './timer'

// Returns a promise that resolves after specified timeout in miliseconds
export function sleep(m) {
  return new Promise((res) => setTimeout(res, m))
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

// Accumulates time since first call.
// Accumulates from optional argument, if provided.
export const makeKeepTimer = () => {
  var delta = makeDeltaTimer(),
      time = 0
  return (t) => {
    if (t !== undefined) { time = 0 }
    time += delta(t)
    return time
  }
}

// Counts down from supplied time value, stopping at zero.
// Optional argument resets the timer to specified value in miliseconds.
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
// faster than the specified pace.
export const makeFeeder = (iter) => {
  var keeptime = makeKeepTimer(),
      lastTime = 0,
      pace = 0,
      reset = (p) => {
        pace = p
        keeptime(now())
        return null
      }
  return (p) => {
    let time = keeptime(),
        delta = time - lastTime,
        result = null
    if (p !== undefined) {
      reset(p)
    } else if (delta / pace > 1) {  // 0 / 0 = NaN which is not greater than 1
      lastTime = time
      result = iter.next()
    }
    return result
  }
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

