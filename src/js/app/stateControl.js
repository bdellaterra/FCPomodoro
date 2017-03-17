import { BLINK } from '../utility/constants'
import { action, animator, breakAnalog, model, sessionAnalog,
         stateControl, view
      } from './index'
import { actionName } from './action'
import { clearCanvas } from '../ui/canvas'
import { formatTime } from '../utility/conv'
import { frozen, sealed } from '../utility/fn'
import { once } from '../utility/iter'

// USAGE NOTE: This module is part of a State-Action-Model (SAM) pattern.


// The term "state" can be ambiguous. ("control state" vs. "internal state")
// The layer between the view and model is typically called "state" in the
// SAM methodology, but here it is called "state control" to disambiguate.
const makeStateControl = () => {

  // Handle changes to the input fields.
  const registerInput = () => {
    if ( model.inSession() ) {
      clearCanvas()
      sessionAnalog.draw()
      model.present(action.inputSession)
    } else {
      clearCanvas()
      breakAnalog.draw()
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

  // Create a callback that will present the provided action to the model.
  const makeFutureAction = (a) => once(() => {
    model.present(a)
  })

  // Start a session for the given length of time.
  // Using closure to keep a private reference to the end-session callback.
  const startSession = (() => {
    let endSessionCallback = Function.prototype
    return (duration) => {
      breakAnalog.deanimate()
      clearCanvas()
      animator.removeUpdate(endSessionCallback, duration)
      endSessionCallback = makeFutureAction(action.endSession)
      animator.addUpdate(endSessionCallback, duration)
      sessionAnalog.countdown(duration)
    }
  })()

  // Start a break for the given length of time.
  // Using closure to keep a private reference to the end-session callback.
  const startBreak = (() => {
    let endBreakCallback = Function.prototype
    return (duration) => {
      sessionAnalog.deanimate()
      clearCanvas()
      animator.removeUpdate(endBreakCallback, duration)
      endBreakCallback = makeFutureAction(action.endBreak)
      animator.addUpdate(endBreakCallback, duration)
      breakAnalog.countdown(duration)
    }
  })()

  // Submit provided session/break input to the model.
  const submitInput = ({ sessionTime, breakTime }) => {
    model.setSessionTime(sessionTime)
    model.setBreakTime(breakTime)
  }

  // Read session/break input from the view. Return the data as an object.
  const readInput = () => {
    const sessionTime = view.readSessionTime(),
          breakTime = view.readBreakTime(),
          input = { sessionTime, breakTime }
    return { sessionTime, breakTime }
  }

  // Adjust app presentation using style classes for various control states.
  const presentation = ({ isCancelHidden = false }) => {
    const classes = [
      model.inSession() ? 'inSession' : 'onBreak',
      model.inInputMode() ? 'inInputMode' : 'inAnimationMode'
    ]
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

    if (input !== undefined) {
      // Submit provided input values to the model.
      submitInput(input)
      Object.assign(input, { isCancelHidden: true })
    } else {
      // If no input provided, read values from the view.
      input = readInput()
    }

    const { sessionTime, breakTime } = input

    if ( model.inInputMode() ) {

      // Don't animate while user is inputting new data.
      animator.setClearCanvas(false)
      sessionAnalog.deanimate()
      breakAnalog.deanimate()
      animator.removeUpdate(view.showDigitalTime, BLINK)
      // Display a preview of the input values being entered by the user.
      clearCanvas()
      if ( model.inSession() ) {
        sessionAnalog.draw(sessionTime)
      } else {
        breakAnalog.draw(breakTime)
      }

    } else if ( model.inAnimationMode() ) {

      // Animator is responsible for clearing the canvas when not in input-mode.
      animator.setClearCanvas(true)
      // Update digital readout frequently and in sync with blinking cursor.
      animator.addUpdate(view.showDigitalTime, BLINK)

      if ( model.startingAnimation() ) {
        // Input is only presented to the model when an animation is starting.
        submitInput(input)
        // Start the next session/break.
        if ( model.inSession() ) {
          startSession(sessionTime)
        } else {
          startBreak(breakTime)
        }
      }

      if ( model.resumingAnimation() ) {
        // Resume the previous session/break.
        clearCanvas()
        if ( model.inSession() ) {
          sessionAnalog.animate()
        } else {
          breakAnalog.animate()
        }
        // Restore input fields to the data contained in the model.
        Object.assign(input, {
          sessionTime: model.getSessionTime(),
          breakTime:   model.getBreakTime()
        })
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

