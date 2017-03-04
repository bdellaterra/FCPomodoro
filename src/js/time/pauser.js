import { assign, frozen, keys, pick, sealed } from '../utility/fn'


const makePauser = (spec) => {
  const state = sealed({ isPaused: false })
  assign(state, pick(spec, keys(state)))
  return frozen({
    isPaused: () => state.isPaused,
    pause:    () => state.isPaused = true,
    unpause:  () => state.isPaused = false
  })
}


export default makePauser
