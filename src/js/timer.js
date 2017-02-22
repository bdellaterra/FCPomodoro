import now from 'present'
import { assign, frozen, keys, pick, sealed } from './fn'
import makePauser from './pauser'

const makeTimer = (spec) => {
  const pauser = makePauser({ isPaused: true, ...spec })
  const initState = {
    time:     0,
    lastTick: 0
  }
  const state = sealed({ ...initState })
  assign(state, pick(spec, keys(state)))
  return frozen({
    ...pauser,
    read:   () => state.time,
    update: () => {
      const tick = now()
      if (!pauser.isPaused()) {
        const delta = tick - state.lastTick
        state.time = Math.max(state.time - delta, 0)
      }
      state.lastTick = tick
      return state.time
    },
    start: pauser.unpause,
    stop:  pauser.pause,
    reset: (t) => {
      pauser.pause()
      assign(state, initState)
      if (t !== undefined) { state.timer = t }
    }
  })
}

export default makeTimer
