import { frozen, keys } from 'utility/fn'

// USAGE NOTE: This module is part of a State-Action-Model (SAM) pattern.


// Actions will be presented to the model to direct app behavior.
// Every combination of control states must map to an action.
export const action = frozen({
  input: frozen({ hasInput: true, isRunning: false }),
  start: frozen({ hasInput: true, isRunning: true }),
  run:   frozen({ hasInput: false, isRunning: true }),
  end:   frozen({ hasInput: false, isRunning: false })
})


// Map an action object to it's human-readable name.
export const actionName = (v) => {
  let name = ''
  keys(action).map((n) => {
    if (action[n] === v) {
      name = n
    }
  })
  return name
}


export default action
