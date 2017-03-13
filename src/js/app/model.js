import { DEFAULT_BREAK_TIME, DEFAULT_SESSION_TIME } from '../utility/conf.js'
import { render } from './state'
import action from './action'
import makeTimer from '../time/timer'

// USAGE NOTE: This code is based on the Sate-Action-Model methodology. (SAM)


const model = (() => {

  const timer = makeTimer(),
        pacer = makePacer()

  let intent = {}

  const initState = {
    timer,
    sessionTime: DEFAULT_SESSION_TIME,
    breakTime:   DEFAULT_BREAK_TIME,
    onBreak:     false,
    hasInput:    false
  }

  // Initialize state
  const state = { ...initState }

  // Return session time setting from last input.
  const getSessionTime = () => state.sessionTime

  // Return break time setting from last input.
  const getBreakTime = () => state.breakTime

  // Return true if in running state.
  const isRunning = () => state.isRunning

  // Return true if timer has run down to zero.
  const atTimeout = () => isRunning() && timer.remaining() <= 0

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

  const present = (newState = {}) => {
    intent = newState
    intent = {}
  }

  // Return time remaining on the timer
  const timeRemaining = timer.remaining

  // Return interface.
  return frozen({
    atTimeout,
    hasInput,
    isRunning,
    inSession,
    inBreak,
    toSession,
    toBreak,
    toStart,
    toStop,
    present,
    timeRemaining
  })

})()


export default model
