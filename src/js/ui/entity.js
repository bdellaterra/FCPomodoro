import { assign, frozen, keys, pick, sealed } from '../utility/fn'
import now from 'present'


// Create a unique entity with it's own ID.
export const makeEntity = (spec) => {

  // Initialize state.
  const state = sealed({ id: now() })

  // Adjust state to spec.
  assign(state, pick(spec, keys(state)))

  // Return Interface.
  return frozen({ getID: () => state.id })
}


export default makeEntity
