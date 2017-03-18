import { frozen, keys } from 'utility/fn'

// USAGE NOTE: This module is part of a State-Action-Model (SAM) pattern.


// Actions will be presented to the model to direct app behavior.
// Every combination of control states must map to an action.
export const action = frozen({
  startSession: frozen({ inSession: true, hasInput: true, isRunning: true }),
  inputSession: frozen({ inSession: true, hasInput: true, isRunning: false }),
  runSession:   frozen({ inSession: true, hasInput: false, isRunning: true }),
  endSession:   frozen({ inSession: true, hasInput: false, isRunning: false }),
  startBreak:   frozen({ inSession: false, hasInput: true, isRunning: true }),
  inputBreak:   frozen({ inSession: false, hasInput: true, isRunning: false }),
  runBreak:     frozen({ inSession: false, hasInput: false, isRunning: true }),
  endBreak:     frozen({ inSession: false, hasInput: false, isRunning: false })
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
