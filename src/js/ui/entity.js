import now from 'present'
import { assign, frozen, keys, pick, sealed } from '../utility/fn'


// Create a unique entity with it's own ID.
const makeEntity = (spec) => {
  const state = sealed({ id: now() })
  assign(state, pick(spec, keys(state)))
  return frozen({ getID: () => state.id })
}


export default makeEntity
