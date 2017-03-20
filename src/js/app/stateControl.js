import { BLINK } from 'utility/constants'
import { DEFAULT_BREAK_TIME, DEFAULT_SESSION_TIME } from 'config'
import { action, animator, breakControl, model,
         sessionControl, stateControl, view
       } from 'app'
import { clearCanvas } from 'ui/canvas'
import { formatTime } from 'utility/conv'
import { frozen } from 'utility/fn'
import { once } from 'utility/iter'

// USAGE NOTE: This module is part of a State-Action-Model (SAM) pattern.


// The term "state" can be ambiguous. ("control state" vs. "internal state")
// In the SAM methodology, the layer between the view and model is typically
// called just "state". Here it is "stateControl" to emphasize "control state".
const makeStateControl = () => {

  // Handle changes to the input fields.
  const registerInput = () => {
    if ( model.inSession() ) {
      model.present(action.inputSession)
    } else {
      model.present(action.inputBreak)
    }
  }

  // Transition to input mode. Optionally specify if session input has focus.
  const inputMode = ({ inSession } = {}) => {
    if (inSession === undefined) {
      inSession = model.inSession()
    }
    if (!model.inInputMode()) {
      model.present(inSession ? action.inputSession : action.inputBreak)
    }
  }

  // Transition to animation mode.
  const animationMode = () => {
    if (!model.inAnimationMode()) {
      model.present(model.inSession() ? action.startSession : action.startBreak)
    }
  }

  // Toggle mode when the user clicks the digital display.
  const toggleMode = (() => {
    // Using closure to privately track whether session/break was in progress.
    let lastAnimation
    return ({ cancellingInput = false } = {}) => {
      if ( model.inInputMode() ) {
        if (cancellingInput) {
          if (lastAnimation) {
            // Restore previous animation if cancelling input.
            model.present(lastAnimation)
          } else {
            // If cancelling the initial input there is no previous animation,
            // so restore the default values instead.
            render({
              sessionTime: DEFAULT_SESSION_TIME,
              breakTime:   DEFAULT_BREAK_TIME
            })
          }
        } else {
          // Toggle from input mode to animation mode.
          animationMode()
          lastAnimation = model.inSession()
                        ? action.runSession
                        : action.runBreak
        }
      } else {
        // Toggle from animation mode to input mode.
        inputMode()
      }
    }
  })()
  // Alias:
  const cancelInputMode = () => toggleMode({ cancellingInput: true })

  // Create a callback that will present the provided action to the model.
  const makeFutureAction = (a) => once(() => {
    model.present(a)
  })

  // There are currently no actions required when cancelling sessions.
  const cancelSession = Function.prototype

  // There are currently no actions required when cancelling breaks.
  const cancelBreak = Function.prototype

  // Start a session for the given length of time.
  const startSession = (duration) => {
    breakControl.deanimate()
    clearCanvas()
    sessionControl.countdown(duration)
    animator.waitAlarm()
      .then(() => model.present(action.endSession))
      .catch(cancelSession)
  }

  // Start a break for the given length of time.
  const startBreak = (duration) => {
    sessionControl.deanimate()
    clearCanvas()
    breakControl.countdown(duration)
    animator.waitAlarm()
      .then(() => model.present(action.endBreak))
      .catch(cancelBreak)
  }

  // Submit provided session/break input to the model.
  const submitInput = ({ sessionTime, breakTime }) => {
    model.setSessionTime(sessionTime)
    model.setBreakTime(breakTime)
  }

  // Read session/break input from the view. Return the data as an object.
  const readInput = () => {
    const sessionTime = view.calcSessionTime(),
          breakTime = view.calcBreakTime()
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

  // Provide user with a cancellation link.
  const cancellation = ({ isCancelHidden }) => {
    const cancelMessage = model.inInputMode() && !isCancelHidden
                        ? 'Click Here to Cancel Input'
                        : ''
    return cancelMessage
  }

  // Create a model that is easily consumed by the view.
  const representation = ({ sessionTime, breakTime, isCancelHidden }) => {
    const inInputMode = model.inInputMode(),
          inSession = model.inSession()
    // Format time values for display.
    const [sessionHours, sessionMinutes, sessionSeconds]
            = formatTime(sessionTime).split(':'),
          [breakHours, breakMinutes, breakSeconds]
            = formatTime(breakTime).split(':')
    // Return data that can be fed directly into the view.
    return {
      inInputMode,
      inSession,
      sessionHours,
      sessionMinutes,
      sessionSeconds,
      sessionTime,
      breakHours,
      breakMinutes,
      breakSeconds,
      breakTime,
      pomodoro:      presentation({ isCancelHidden }),
      digitalTime:   readout(),
      message:       notification(),
      cancelMessage: cancellation({ isCancelHidden })
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
      sessionControl.deanimate()
      breakControl.deanimate()
      animator.removeUpdate(view.showDigitalTime, BLINK)

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
          sessionControl.animate()
        } else {
          breakControl.animate()
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
    animationMode,
    cancelInputMode,
    inputMode,
    presentation,
    readInput,
    readout,
    registerInput,
    render,
    toggleMode
  })

}

// Populate the imported state control object.
Object.assign(stateControl, makeStateControl())

