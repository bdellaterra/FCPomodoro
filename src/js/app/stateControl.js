import { BLINK } from '../utility/constants'
import { action, animator, model, stateControl, view } from './index'
import { actionName } from './action'
import { clearCanvas } from '../ui/canvas'
import { formatTime } from '../utility/conv'
import { frozen, sealed } from '../utility/fn'
import { makeBreakAnalog } from '../ui/breakAnalog'
import { makeSessionAnalog } from '../ui/sessionAnalog'
import { once } from '../utility/iter'

// USAGE NOTE: This module is part of a State-Action-Model (SAM) pattern.


// The term "state" can be ambiguous. ("control state" vs. "internal state")
// The layer between the view and model is typically called "state" in the
// SAM methodology, but here it is called "state control" to disambiguate.
const makeStateControl = () => {

  // Initialize state
  const state = sealed({
    sessionAnalog: makeSessionAnalog({ animator }),
    breakAnalog:   makeBreakAnalog({ animator })
  })

  // Handle changes to the input fields.
  const registerInput = () => {
    if ( model.inSession() ) {
      clearCanvas()
      state.sessionAnalog.draw()
      model.present(action.inputSession)
    } else {
      clearCanvas()
      state.breakAnalog.draw()
      model.present(action.inputBreak)
    }
  }

  // Toggle input mode when the user clicks the digital display.
  // Using closure to privately track whether session/break was in progress.
  const toggleInputMode = (() => {
    let wasInSession
    return ({ cancellingInput = false } = {}) => {
      const inSession = model.inSession(),
            inputAction = inSession ? action.inputSession : action.inputBreak,
            startAction = inSession ? action.startSession : action.startBreak
      let toggleAction = model.inInputMode() ? startAction : inputAction
      // Save animation state so it can be restored if input is cancelled.
      if (toggleAction === inputAction) {
        wasInSession = inSession
      }
      // If input mode is being cancelled, return to the previous animation.
      if (cancellingInput) {
        if (toggleAction === startAction) {
          toggleAction = wasInSession ? action.runSession : action.runBreak
        } else {
          return // RETURN: When not in input mode cancel request does nothing.
        }
      }
      model.present( toggleAction )
    }
  })()
  // Alias:
  const cancelInputMode = () => toggleInputMode({ cancellingInput: true })

  // Create a callback that will present a the provided action to the model.
  const makeFutureAction = (a) => once(() => {
    model.present(a)
  })

  // Animate the session display.
  const animateSession = () => {
    animator.run()  // Does nothing if already running
    clearCanvas()
    state.sessionAnalog.draw()
    state.sessionAnalog.animate()
  }

  // Start a session for the given length of time.
  // Using closure to keep a private reference to the end-session callback.
  const startSession = (() => {
    let endSessionCallback = Function.prototype
    return (duration) => {
      state.sessionAnalog.deanimate()
      state.breakAnalog.deanimate()
      animator.reset()
      animator.ending(animator.time() + duration)
      animator.removeUpdate(endSessionCallback, duration)
      endSessionCallback = makeFutureAction(action.endSession)
      animator.addUpdate(endSessionCallback, duration)
      animateSession()
    }
  })()

  // Animate the break display.
  const animateBreak = () => {
    animator.run()  // Does nothing if already running
    clearCanvas()
    state.breakAnalog.draw()
    state.breakAnalog.animate()
  }

  // Start a break for the given length of time.
  // Using closure to keep a private reference to the end-session callback.
  const startBreak = (() => {
    let endBreakCallback = Function.prototype
    return (duration) => {
      state.breakAnalog.deanimate()
      state.breakAnalog.deanimate()
      animator.reset()
      animator.ending(animator.time() + duration)
      animator.removeUpdate(endBreakCallback, duration)
      endBreakCallback = makeFutureAction(action.endBreak)
      animator.addUpdate(endBreakCallback, duration)
      animateBreak()
    }
  })()

  // Submit provided session/break input to the model.
  const submitInput = ({ sessionTime, breakTime }) => {
    model.setSessionTime(sessionTime)
    model.setBreakTime(breakTime)
  }

  // Read and submit session/break input. Return the data as an object.
  const readInput = () => {
    const sessionTime = view.readSessionTime(),
          breakTime = view.readBreakTime(),
          input = { sessionTime, breakTime }
    return { sessionTime, breakTime }
  }

  // Adjust presentation with style classes for various control states.
  const presentation = ({ isCancelHidden = false }) => {
    const classes = []
    classes.push(model.inSession() ? 'inSession' : 'onBreak')
    classes.push(model.inInputMode() ? 'inInputMode' : 'inAnimationMode')
    if (isCancelHidden) {
      classes.push('hideCancelMessage')
    }
    return classes.join(' ')
  }

  // Return a formatted value for the digital time display.
  const readout = () => {
    return model.inInputMode() ? 'START' : formatTime(animator.remaining())
  }

  // Message user with instructions.
  const notification = () => {
    return model.inInputMode() ? 'Click to Run Timer' : 'Click to Set Timer'
  }

  // Provide user with a cancellation link
  const cancellation = ({ isCancelHidden }) => {
    const cancelMessage = model.inInputMode() && !isCancelHidden
                        ? 'Click Here to Cancel Input'
                        : ''
    return cancelMessage
  }

  // Create a model that is easily consumed by the view.
  const representation = ({ sessionTime, breakTime, isCancelHidden }) => {
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
      pomodoro:       presentation({ isCancelHidden }),
      digitalTime:    readout(),
      message:        notification(),
      cancelMessage:  cancellation({ isCancelHidden }),
      isInputAllowed: model.inInputMode()
    }
  }

  // Send a representation of the model to the view for rendering,
  // then invoke possible next actions that result from current control state.
  const render = (input) => {
    // Submit input values to the model or read them in if they weren't provided.
    if (input !== undefined) {
      submitInput(input)
      Object.assign(input, { isCancelHidden: true })
    } else {
      input = readInput()
    }
    const { sessionTime, breakTime } = input
    if ( model.startingAnimation() || model.resumingAnimation() ) {
      // Animator resumes clearing the canvas when input mode is finished.
      animator.setClearCanvas(true)
      // Update digital readout frequently and in sync with blinking cursor.
      animator.addUpdate(view.showDigitalTime, BLINK)
    }
    if ( model.startingAnimation() ) {
      // Submit input to the model when starting a new animation.
      submitInput(input)
      // Start the next session/break.
      if ( model.inSession() ) {
        startSession(sessionTime)
      } else {
        startBreak(breakTime)
      }
    } else if ( model.resumingAnimation() ) {
      // Resume the existing session/break.
      if ( model.inSession() ) {
        animateSession()
      } else {
        animateBreak()
      }
      // Restore the input fields to the data contained in the model.
      Object.assign(input, {
        sessionTime: model.getSessionTime(),
        breakTime:   model.getBreakTime()
      })
    } else if ( model.inInputMode() ) {
      // Don't animate while user is inputting new data.
      animator.setClearCanvas(false)
      state.sessionAnalog.deanimate()
      state.breakAnalog.deanimate()
      animator.removeUpdate(view.showDigitalTime, BLINK)
      // Display a preview of the input values being entered by the user.
      if ( model.inSession() ) {
        clearCanvas()
        state.sessionAnalog.draw(sessionTime)
      } else {
        clearCanvas()
        state.breakAnalog.draw(breakTime)
      }
    }

    view.render( representation(input) )

    nextAction()

  }

  // Trigger actions that automatically follow certain control states.
  const nextAction = () => {
    let next = null
    switch (model.getState()) {
      case action.startSession: {
        next = action.runSession
        break
      }
      case action.startBreak: {
        next = action.runBreak
        break
      }
      case action.endSession: {
        next = action.startBreak
        break
      }
      case action.endBreak: {
        next = action.startSession
        break
      }
    }
    if (next) {
      DEBUG && console.log( 'NEXT TO:', actionName(next) )
      model.present(next)
    }
  }

  // Return interface.
  return frozen({
    cancelInputMode,
    presentation,
    readInput,
    readout,
    registerInput,
    render,
    toggleInputMode
  })

}

// Populate the imported state control object.
Object.assign(stateControl, makeStateControl())

