import { frozen } from '../utility/fn'
import { once } from '../utility/iter'
import { MILLISECOND, SECOND } from '../utility/constants'
import { formatTime } from '../utility/conv'
import { action, getAnimator, model, stateControl, view } from './index'
import { actionName } from './action'
import makeBreakAnalog from '../ui/breakAnalog'
import makeSessionAnalog from '../ui/sessionAnalog'

// USAGE NOTE: This module is part of a State-Action-Model (SAM) pattern.


// The term "state" can be ambiguous. ("control state" vs. "internal state")
// The layer between the view and model is typically called "state" in the
// SAM methodology, but here it is called "state control" to disambiguate.
const makeStateControl = () => {

  // Get access to the shared animator.
  const animator = getAnimator()

  // Create analog display elements for the user interface.
  const sessionAnalog = makeSessionAnalog({ animator }),
        breakAnalog = makeBreakAnalog({ animator })

  // Handle changes to the input fields.
  const inputChange = () => {
    const inSession = model.getState(),
          inputAction = inSession ? action.inputSession : action.inputBreak
    model.present(inputAction)
  }

  // Toggle input mode when the user clicks the digital display.
  const inputToggle = () => {
    const { inSession, hasInput, isRunning } = model.getState(),
          inputAction = inSession ? action.inputSession : action.inputBreak,
          startAction = inSession ? action.startSession : action.startBreak,
          toggleAction = hasInput ? startAction : inputAction
    model.present( toggleAction )
  }

  // Show a session analog that visually represents the user input.
  const previewSession = () => {
    sessionAnalog.style( view.readSessionTime() )
  }

  // Show a break analog that visually represents the user input.
  const previewBreak = () => {
    breakAnalog.style( view.readBreakTime() )
  }

  // Start a session for the given length of time.
  const startSession = (duration) => {
    animator.reset()
    animator.ending(animator.time() + duration)
    animator.addUpdate(once(() => {
      model.present(action.endSession)
    }), duration)
    animator.run()  // Does nothing if already running
  }

  // Start a break for the given length of time.
  const startBreak = (duration) => {
    animator.reset()
    animator.ending(animator.time() + duration)
    animator.addUpdate(once(() => {
      model.present(action.endBreak)
    }), duration)
    animator.run()  // Does nothing if already running
  }

  // Return consolidated input values.
  const readInput = () => {
    return {
      breakTime:   view.readBreakTime(),
      sessionTime: view.readSessionTime()
    }
  }

  // Submit user input to the model.
  const submitInput = () => {
    const { breakTime, sessionTime } = readInput()
    model.setBreakTime(breakTime)
    model.setSessionTime(sessionTime)
  }

  // Adjust presentation with style classes for various control states.
  const presentation = (inSession) => inSession ? ['inSession'] : ['onBreak']

  // Return true if input-mode is active.
  const isInputMode = () => {
    const state = model.getState()
    return (state === action.inputSession || state === action.inputBreak)
  }

  // Return a formatted value for the digital time display.
  const readout = () => {
    return isInputMode() ? 'START' : formatTime(animator.remaining())
  }

  // Message user with instructions.
  const notification = (isInputMode) => {
    return isInputMode ? 'Click to Run Timer' : 'Click to Set Timer'
  }

  // Create a model that is easily consumed by the view.
  // The representation is derived from the provided plan:
  // session - true if focus should be on session time vs. break time.
  // input - true if display should reflect input values vs. animation.
  // submit - true if input values should be submitted to the model.
  // animate - true if a new animation is beginning.
  const representation = (plan) => {
    // Submit input values to the model.
    if (plan.submit) {
      submitInput()
    }
    // Get time values from the model.
    let sessionTime = model.getSessionTime(),
        breakTime = model.getBreakTime()
    // Disable animation for the session/break analog that's not in focus.
    // Either animate the analog that is in focus, or if in input-mode,
    // show a rendering that serves to preview the user's input values.
    if (plan.session) {
      breakAnalog.deanimate()
      if (plan.input) {
        previewSession()
      } else {
        if (plan.animate) {
          startSession(sessionTime)  // Startup new animations.
        }
        sessionAnalog.animate()
      }
    } else {
      // focus is on break
      sessionAnalog.deanimate()
      if (plan.input) {
        previewBreak()
      } else {
        if (plan.animate) {
          startBreak(breakTime)  // Startup new animations.
        }
        breakAnalog.animate()
      }
    }
    // Create lexically scoped callback for animating digital readout.
    if (plan.input) {
      // Don't update from model while user is inputting new data.
      const input = readInput()
      breakTime = input.breakTime
      sessionTime = input.sessionTime
      animator.removeUpdate(view.showDigitalTime, SECOND / 5)
    } else {
      // Update digital readout frequently while animating.
      animator.addUpdate(view.showDigitalTime, SECOND / 5)
    }
    // Format time values for display.
    const [sessionHours, sessionMinutes, sessionSeconds]
            = formatTime(sessionTime).split(':'),
          [breakHours, breakMinutes, breakSeconds]
            = formatTime(breakTime).split(':')
    // Return data that can be fed directly into the view.
    return {
      sessionHours,
      sessionMinutes,
      sessionSeconds,
      breakHours,
      breakMinutes,
      breakSeconds,
      pomodoro:    presentation(plan.session),
      digitalTime: readout(plan.input),
      message:     notification(plan.input)
    }
  }

  // Send a representation of the model to the view for rendering,
  // then invoke possible next actions that result from current control state.
  const render = () => {
    let plan = {}  // boolean: session, input, submit, animate

    switch (model.getState()) {
      case action.inputSession:
        plan = { session: true, input: true, submit: false, animate: false }
        break
      case action.inputBreak:
        plan = { session: false, input: true, submit: false, animate: false }
        break
      case action.startSession:
        plan = { session: true, input: false, submit: true, animate: true }
        break
      case action.startBreak:
        plan = { session: false, input: false, submit: true, animate: true }
        break
      case action.runSession:
        plan = { session: true, input: false, submit: false, animate: false }
        break
      case action.runBreak:
        plan = { session: false, input: false, submit: false, animate: false }
        break
      case action.endSession:
        plan = { session: false, input: false, submit: false, animate: true }
        break
      case action.endBreak:
        plan = { session: true, input: false, submit: false, animate: true }
        break
      default:  // inputSession
        plan = { session: true, input: true, submit: false, animate: false }
        break
    }

    view.render( representation(plan) )

    nextAction()

  }

  // Trigger actions that automatically follow certain control states.
  const nextAction = () => {
    let next = null
    switch (model.getState()) {
      case action.startSession:
        next = action.runSession
        break
      case action.startBreak:
        next = action.runBreak
        break
      case action.endSession:
        next = action.startBreak
        break
      case action.endBreak:
        next = action.startSession
        break
    }
    DEBUG && console.log('Examining:', actionName(model.getState()), (next ? ` -> ${next}` : ''))
    if (next) {
      model.present(next)
    }
  }

  // Return interface.
  return frozen({
    inputChange,
    inputToggle,
    presentation,
    readInput,
    readout,
    render
  })

}

// Populate the imported stateControl object.
Object.assign(stateControl, makeStateControl())

