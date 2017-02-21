import { assign, frozen, keys, pick, sealed } from './fn'

const makePauser = (spec) => {
  const state = sealed({
    isPaused:  false,
    onPause:   Function.prototype,
    onUnpause: Function.prototype
  })
  assign(state, pick(spec, keys(state)))
  return frozen({
    isPaused: () => state.isPaused,
    pause:    () => {
      state.isPaused = true
      state.onPause()
    },
    unpause: () => {
      state.isPaused = false
      state.onUnpause()
    }
  })
}

export default makePauser
