import now from 'present'
import { assign, frozen, keys, pick, sealed } from './fn'
import makePauser from './pauser'

// Create a timer that counts down from initial time remaining.
// Time is measured in miliseconds.
const makeTimer = (spec) => {

  // Has pausability, defaulting to paused.
  const pauser = makePauser({ isPaused: true, ...spec })

  // Initial state will be restored upon reset.
  const initState = {
    time:     0,    // time remaining
    lastTick: null  // previous timestamp
  }

  // Adjust default state to spec.
  const state = sealed({ ...initState })
  assign(state, pick(spec, keys(state)))

  // Reduce time remaining by time elapsed since last update.
  // No effect if timer is paused. Returns current timestamp.
  const update = () => {
    const lastTick = state.lastTick || now(),
          tick = now()
    if (!pauser.isPaused()) {
      // Delta is time elapsed since last tick recorded.
      const delta = tick - lastTick
      // Reduce time remaining by delta. Stops at zero.
      state.time = Math.max(state.time - delta, 0)
    }
    // Save current tick to calculate next delta
    state.lastTick = tick
    return tick
  }

  // Unpause should run update to initialize lastTick.
  const unpause = () => {
    update()
    pauser.unpause()
  }

  // Pause should run update for consistency with unpause
  const pause = () => {
    update()
    pauser.pause()
  }

  // Return interface.
  return frozen({
    ...pauser,

    // As above
    update,
    unpause,
    pause,

    // Aliases
    start: unpause,
    stop:  pause,

    // Read time remaining.
    read: () => state.time,

    // Reset timer to initial state.
    // Optionally set time remaining to argument provided.
    reset: (t) => {
      pauser.pause()
      assign(state, initState)
      if (t !== undefined) { state.timer = t }
    }

  })
}

export default makeTimer
