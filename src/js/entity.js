import now from 'present'
import { assign, frozen, keys, pick, sealed } from './fn'

// Entity trackable by ID
const makeEntity = (spec) => {
  const state = sealed({ id: now() })
  assign(state, pick(spec, keys(state)))
  return frozen({ getID: () => state.id })
}

export default makeEntity
