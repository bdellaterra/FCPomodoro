import { frozen, keys } from '../utility/fn'

// USAGE NOTE: This module is part of a State-Action-Model (SAM) pattern.


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

// Map a combination of states to their corresponding action name.
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
