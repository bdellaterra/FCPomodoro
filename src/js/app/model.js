import { frozen, pick } from '../utility/fn'
import { once } from '../utility/iter'
import { DEFAULT_BREAK_TIME, DEFAULT_SESSION_TIME } from '../utility/conf'
import { action, getAnimator, model, stateControl, view } from './index'
import { actionName } from './action'

// USAGE NOTE: This module is part of a State-Action-Model (SAM) pattern.


export const makeModel = () => {

  // Get access to the shared animator.
  const animator = getAnimator()

  // Initialize state
  let intent = action.inputSession,  // inSession, hasInput, !isRunning
      state = intent,
      sessionTime = DEFAULT_SESSION_TIME,
      breakTime = DEFAULT_BREAK_TIME

  // Validate time values before accepting.
  const validateTime = (time) => Math.max(0, Number(time)) || 0

  // Return session time setting from last input.
  const getSessionTime = () => sessionTime

  // Set session time to the provided value.
  const setSessionTime = (t) => sessionTime = validateTime(t)

  // Return break time setting from last input.
  const getBreakTime = () => breakTime

  // Set break time to the provided value.
  const setBreakTime = (t) => breakTime = validateTime(t)

  // Update state if intent is for any of the accepted valid states.
  const accept = (validStates) => {
    const accepted = validStates.reduce((bool, valid) => {
      return (bool || intent === valid)
    }, false)
    DEBUG && console.log(actionName(state), '->', actionName(intent),
      (accepted ? '(accepted)' : '(rejected)'))
    if (accepted) {
      state = intent
    }
  }

  // Present new state to the model for acceptance.
  const present = (newState) => {
    intent = newState

    switch (state) {
      case action.inputSession:
        accept([action.inputSession, action.inputBreak, action.startSession])
        break
      case action.startSession:
        accept([action.runSession])
        break
      case action.runSession:
        accept([action.inputSession, action.inputBreak, action.endSession])
        break
      case action.endSession:
        accept([action.startBreak])
        break
      case action.inputBreak:
        accept([action.inputSession, action.inputBreak, action.startBreak])
        break
      case action.startBreak:
        accept([action.runBreak])
        break
      case action.runBreak:
        accept([action.inputSession, action.inputBreak, action.endBreak])
        break
      case action.endBreak:
        accept([action.startSession])
        break
      default:
        // All actions/states have been accounted for.
        break
    }

    intent = {}
    stateControl.render()
  }

  // Return a copy of the state object.
  const getState = () => state

  // Return interface.
  return frozen({
    getBreakTime,
    getSessionTime,
    getState,
    present,
    setBreakTime,
    setSessionTime
  })

}

// Populate the imported model object.
Object.assign(model, makeModel())

