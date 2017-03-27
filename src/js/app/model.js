/* global DEBUG */
import { SECOND } from 'utility/constants'
import { DEFAULT_BREAK_TIME, DEFAULT_SESSION_TIME,
         MINIMUM_BREAK_TIME, MINIMUM_SESSION_TIME
       } from 'config'
import { action, model, stateControl } from 'app'
import { frozen, sealed } from 'utility/fn'
import { actionName } from 'app/action'

// USAGE NOTE: This module is part of a State-Action-Model (SAM) pattern.


export const makeModel = () => {

  // Initialize state
  let intent = null,
      state = sealed({
        mode:        action.input,  // current action state
        sessionTime: DEFAULT_SESSION_TIME,
        breakTime:   DEFAULT_BREAK_TIME,
        isOnBreak:   null
      })

  // Validate time values before accepting.
  const validateTime = (time) => Math.max(0, Number(time)) || 0

  // Set session time to the provided value. To prevent a state where
  // all time values are zero, the minimum session length is one second.
  const setSessionTime = (t) => {
    state.sessionTime = Math.max(SECOND, MINIMUM_SESSION_TIME, validateTime(t))
  }

  // Set break time to the provided value.
  const setBreakTime = (t) => {
    state.breakTime = Math.max(MINIMUM_BREAK_TIME, validateTime(t))
  }

  // Accept data from the state control only when starting a new animation.
  const receiveInput = (payload) => {
    if (state.mode === action.start) {
      if (payload.sessionTime !== undefined) {
        setSessionTime(payload.sessionTime)
      }
      if (payload.breakTime !== undefined) {
        setBreakTime(payload.breakTime)
      }
      state.isOnBreak = Boolean(payload.isOnBreak)
    }
  }

  // Alternate session/break when time runs out.
  const alternate = () => {
    if (state.mode === action.end) {
      state.isOnBreak = !state.isOnBreak
    }
  }

  // Update action state only if a valid new action is intended.
  const accept = (validActions) => {
    const isAccepted = validActions.reduce((isValid, validAction) => {
      return (isValid || intent === validAction)
    }, false)
    DEBUG && console.log((isAccepted ? 'ACCEPT:' : 'REJECT:'),
                          actionName(intent), '<-', actionName(state.mode))
    if (isAccepted) {
      state.mode = intent
    }
  }

  // Present new action to the model for acceptance.
  const present = (newAction, payload = {}) => {

    if (newAction) {
      intent = newAction

      switch (state.mode) {
        case action.input:
          accept([action.start, action.run, action.end])
          switch (state.mode) {
            case action.start:
              receiveInput(payload)
              break
            case action.end:
              alternate()
              break
          }
          break
        case action.start:
          accept([action.run])
          break
        case action.run:
          accept([action.input, action.end])
          switch (state.mode) {
            case action.end:
              alternate()
              break
          }
          break
        case action.end:
          accept([action.start])
          break
        // No default
      }

      intent = {}
    }

    stateControl.render({ ...state })

  }

  // Return interface.
  return frozen({ present })

}

// Populate the imported model object.
Object.assign(model, makeModel())

