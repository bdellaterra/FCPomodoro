import { frozen, pick } from '../utility/fn'
import { once } from '../utility/iter'
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
  const atTimeout = () => state.isRunning && state.animator.remaining() <= 0

  // Return true if display/input focus is on break time.
  const onBreak = () => state.onBreak

  // Return true if display/input focus is on session time.
  const inSession = () => !state.onBreak

  // Return true if in session and intent is for break.
  const toBreak = () => !state.onBreak && intent.onBreak

  // Return true if on break and intent is for session.
  const toSession = () => {
    return state.onBreak && (intent.onBreak !== undefined) && !intent.onBreak
  }

  // Return true if transitioning from stopped to running.
  const toStart = () => !state.isRunning && intent.isRunning

  // Return true if transitioning from running to stopped.
  const toStop = () => {
    return state.isRunning && (intent.isRunning !== undefined) && !intent.isRunning
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
  const accept = () => {
    state = { ...state, ...intent }
    intent = {}
  }

  // Present new state to the model for acceptance.
  const present = (newState = action.monitor) => {
    intent = newState
    switch (intent) {
      case action.input:
        DEBUG && console.log('input...')
        intent = {
          ...intent,
          ...validate(stateControl.readInput()),
          hasInput: false
        }
        accept()
        break
      case action.start:
        DEBUG && console.log('starting...')
        accept()
        stateControl.start()
        break
      case action.stop:
        DEBUG && console.log('stopping...')
        accept()
        break
      default:
        DEBUG && console.log('UNKNOWN ACTION!!')
    }

    stateControl.render()

    // // DEBUG && console.log('State:', state)
    // DEBUG && console.log('NewState:', newState, state.isRunning, state.animator.remaining())
    // // DEBUG && console.log('Remaining:', state.animator.remaining())
    //
    // if ( intent === action.monitor ) {
    //  // accept()
    // } else if (intent === action.session) {
    //   DEBUG && console.log('SWITCH TO SESSION:', action.break)
    //   accept()
    //   state.animator.ending(state.animator.time() + state.sessionTime)
    // } else if (intent === action.break) {
    //   DEBUG && console.log('SWITCH TO BREAK:', action.break)
    //   accept()
    //   state.animator.ending(state.animator.time() + state.breakTime)
    // } else if (intent === action.start) {
    //   console.log('starting...', intent)
    //   if (state.hasInput) {
    //     Object.assign( intent, { ...validate(view.readInput()), hasInput: false } )
    //   }
    //   accept()
    //   let nextEnding = state.animator.time()
    //                  + inSession() ? state.sessionTime : state.breakTime
    //   state.animator.ending(nextEnding)
    //   if (!state.animator.isRunning()) {
    //     state.animator.run()
    //   }
    // } else if (intent === action.stop) {
    //   accept()
    // } else if (intent === action.input) {
    //   accept()
    // } else if (intent === action.cancel) {
    //   accept()
    // }
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

