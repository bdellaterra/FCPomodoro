import { frozen, pick } from '../utility/fn'
import { DEFAULT_BREAK_TIME, DEFAULT_SESSION_TIME } from '../utility/conf'
// import { readInput, render } from './state'
import action from './action'
import makePacer from '../time/pacer'
import makeTimer from '../time/timer'

// USAGE NOTE: This module is part of a Sate-Action-Model (SAM) pattern.


const model = (() => {

  // Initialize state
  let state = {
    timer:       makeTimer(),
    pacer:       makePacer(),
    sessionTime: DEFAULT_SESSION_TIME,
    breakTime:   DEFAULT_BREAK_TIME,
    isRunning:   false,
    onBreak:     false,
    hasInput:    false
  }

  // Intended state will be presented to the model via actions.
  let intent = {}

  // Return limited timer interface.
  const getTimer = () => pick(state.timer, [
    'delta',
    'elapsed',
    'end',
    'remaining',
    'time'
  ])

  // Return limited pacer interface.
  const getPacer = () => pick(state.pacer, [
    'addRender',
    'addUpdate',
    'removeRender',
    'removeUpdate'
  ])

  // Return session time setting from last input.
  const getSessionTime = () => state.sessionTime

  // Return break time setting from last input.
  const getBreakTime = () => state.breakTime

  // Return true if in running state.
  const isRunning = () => state.isRunning

  // Return true if timer has run down to zero.
  const atTimeout = () => isRunning() && state.timer.remaining() <= 0

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

  // Return true if break/session input has changed.
  const hasInput = () => intent.hasInput && !state.hasInput

  // Return true if input was cancelled.
  const hasCancelled = () => {
    return state.hasInput && (intent.hasInput !== undefined) && !intent.hasInput
  }

  // Validate form input from the view.
  const validate = (input = {}) => {
    if (typeof input === 'object') {
      return {
        sessionTime: Math.max(0, Number(input.sessionTime)) || 0,
        breakTime:   Math.max(0, Number(input.breakTime)) || 0
      }
    } else {
      return {}
    }
  }


  const accept = (newState = {}) => {
    state = { ...state, ...newState }
  }


  const present = (newState = {}) => {
    intent = newState

    if (intent === action.session) {
      accept(intent)
    }

    if (intent === action.break) {
      accept(intent)
    }

    if (intent === action.start) {
      if (state.hasInput) {
        accept( { ...validate(mode.readInput()), hasInput: false } )
      }
      state.timer.reset()
      state.timer.end(inSession() ? state.sessionTime : state.breakTime)
      state.pacer.run()
      accept(intent)
    }

    if (intent === action.stop) {
      state.pacer.stop()
      accept(intent)
    }

    if (intent === action.input) {
      accept(intent)
    }

    if (intent === action.cancel) {
      accept(intent)
    }

    // render()
    intent = {}
  }

  // Return interface.
  return frozen({
    atTimeout,
    getBreakTime,
    getPacer,
    getSessionTime,
    getTimer,
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

})()


export default model
