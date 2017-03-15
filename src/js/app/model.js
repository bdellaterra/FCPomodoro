import { frozen, pick } from '../utility/fn'
import { DEFAULT_BREAK_TIME, DEFAULT_SESSION_TIME } from '../utility/conf'
import { action, getAnimator, model, stateControl, view } from './index'

// USAGE NOTE: This module is part of a State-Action-Model (SAM) pattern.


export const makeModel = () => {

  // Initialize state
  let state = {
    animator:    getAnimator(),
    sessionTime: DEFAULT_SESSION_TIME,
    breakTime:   DEFAULT_BREAK_TIME,
    isRunning:   false,
    onBreak:     false,
    hasInput:    false
  }

  // Intended state will be presented to the model via actions.
  let intent = {}

  // Return session time setting from last input.
  const getSessionTime = () => state.sessionTime

  // Return break time setting from last input.
  const getBreakTime = () => state.breakTime

  // Return true if in running state.
  const isRunning = () => state.isRunning

  // Return true if timer has run down to zero.
  const atTimeout = () => isRunning() && state.animator.remaining() <= 0

  // Return true if display/input focus is on break time.
  const onBreak = () => state.onBreak

  // Return true if display/input focus is on session time.
  const inSession = () => !state.onBreak

  // Return true if in session and intent is for break.
  const toBreak = () => inSession() && intent.onBreak

  // Return true if on break and intent is for session.
  const toSession = () => {
    return onBreak() && (intent.onBreak !== undefined) && !intent.onBreak
  }

  // Return true if transitioning from stopped to running.
  const toStart = () => !isRunning() && intent.isRunning

  // Return true if transitioning from running to stopped.
  const toStop = () => {
    return isRunning() && (intent.isRunning !== undefined) && !intent.isRunning
  }

  // Return true if input has changed.
  const hasInput = () => intent.hasInput && !state.hasInput

  // Return true if input has been cancelled.
  const hasCancelled = () => {
    return state.hasInput && (intent.hasInput !== undefined) && !intent.hasInput
  }

  // Validate form input from the view.
  const validate = (input = {}) => {
    let valid = {}
    if (typeof input === 'object') {
      valid = {
        sessionTime: Math.max(0, Number(input.sessionTime)) || 0,
        breakTime:   Math.max(0, Number(input.breakTime)) || 0
      }
    }
    return valid
  }

  // Update state with the accepted new state.
  const accept = (newState = {}) => {
    state = { ...state, ...newState }
    stateControl.render()
  }

  // Present new state to the model for acceptance.
  const present = (newState = action.monitor) => {
    intent = newState
    DEBUG && console.log('PRESENT:', newState)

    if ( intent === action.monitor ) {
      accept(intent)
    }

    if (intent === action.session) {
      accept(intent)
    }

    if (intent === action.break) {
      accept(intent)
    }

    if (intent === action.start) {
      if (state.hasInput) {
        accept( { ...validate(view.readInput()), hasInput: false } )
      }
      state.animator.reset()
      state.animator.ending(inSession() ? state.sessionTime : state.breakTime)
      accept(intent)
    }

    if (intent === action.stop) {
      state.animator.reset()
      accept(intent)
    }

    if (intent === action.input) {
      accept(intent)
    }

    if (intent === action.cancel) {
      accept(intent)
    }

    intent = {}
  }

  // Return interface.
  return frozen({
    atTimeout,
    getBreakTime,
    getSessionTime,
    hasCancelled,
    hasInput,
    inSession,
    isRunning,
    onBreak,
    present,
    toBreak,
    toSession,
    toStart,
    toStop
  })

}

// Populate the imported model object.
Object.assign(model, makeModel())

