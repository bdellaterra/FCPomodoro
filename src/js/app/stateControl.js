import { BLINK } from 'utility/constants'
import { INDICATOR_BREAK_TXT, INDICATOR_FLASH_DURATION, INDICATOR_SESSION_TXT,
         INPUT_CANCEL_TXT, MESSAGE_RUN_TXT, MESSAGE_SET_TXT, READOUT_START_TXT
       } from 'config'
import { action, animator, breakControl, model,
         sessionControl, stateControl, view
       } from 'app'
import { enclose, frozen, sealed } from 'utility/fn'
import { clearCanvas } from 'ui/canvas'
import { formatTime } from 'utility/conv'
import { once } from 'utility/iter'
import { sleep } from 'time/sleep'

// USAGE NOTE: This module is part of a State-Action-Model (SAM) pattern.


// The term "state" can be ambiguous. ("control state" vs. "internal state")
// In the SAM methodology, the layer between the view and model is typically
// called just "state". Here it is "stateControl" to emphasize "control state".
const makeStateControl = () => {

  // Return toggle action for when the user clicks the digital display.
  const toggleMode = ({ isAnimating } = {}) => {
    if (isAnimating) {
      return () => model.present(action.input)
    } else {
      indicator({ flash: null })
      return () => model.present(action.start, view.readInput())
    }
  }

  // Return input focus action.
  const requestInputMode = ({ isAnimating, isOnBreak } = {}) => {
    if (isAnimating) {
      isOnBreak ? view.focusBreak() : view.focusSession()
      return () => model.present(action.input, view.readInput())
    } else {
      return Function.prototype  // Do nothing if already in input mode.
    }
  }

  // Return input cancel action.
  const cancelInputMode = ({ isAnimating } = {}) => {
    if (isAnimating) {
      return Function.prototype  // Do nothing if not in input mode.
    } else {
      return () => model.present(action.run)
    }
  }

  // Create a callback that will present the provided action to the model.
  const makeFutureAction = (a) => once(() => {
    model.present(a)
  })

  // Setup user input mode.
  const startInput = (data) => {
    // Don't animate while user is inputting new data.
    animator.setClearCanvas(false)
    sessionControl.deanimate()
    breakControl.deanimate()
    animator.removeUpdate(showTimeRemaining, BLINK)
  }

  // Placeholder: There are currently no actions for cancelling animations.
  const cancelAnimation = Function.prototype

  // Setup a new session/break for the given length of time.
  const startAnimation = ({ sessionTime, breakTime, isOnBreak } = {}) => {
    let activeAnalog, inactiveAnalog, duration, flash, endAction
    if (isOnBreak) {
      activeAnalog = breakControl
      inactiveAnalog = sessionControl
      duration = breakTime,
      endAction = action.end,
      flash = INDICATOR_SESSION_TXT
    } else {
      activeAnalog = sessionControl
      inactiveAnalog = breakControl
      duration = sessionTime,
      endAction = action.end,
      flash = INDICATOR_BREAK_TXT
    }
    inactiveAnalog.deanimate()
    clearCanvas()
    activeAnalog.countdown(duration)  // triggers animation
    // Get promise for countdown reaching zero.
    // Transition to break once it resolves.
    animator.waitAlarm()
      .then(() => indicator({ flash }))
      .then(() => model.present(endAction))
      .catch(cancelAnimation)
  }

  // Present time remaining to the view for display.
  const showTimeRemaining = () => {
    const readout = information({ isAnimating: true })
    view.displayReadout({ readout })
  }

  // Animate a session/break analog.
  const runAnimation = ({ isOnBreak } = {}) => {
    if (isOnBreak) {
      sessionControl.deanimate()
      breakControl.animate()
    } else {
      breakControl.deanimate()
      sessionControl.animate()
    }
    // Animator is responsible for clearing the canvas when not in input-mode.
    animator.setClearCanvas(true)
    // Update digital readout frequently and in sync with blinking cursor.
    animator.addUpdate(showTimeRemaining, BLINK)
  }

  // Adjust app presentation using style classes for various control states.
  const presentation = ({ isOnBreak, isAnimating, isCancelHidden } = {}) => {
    return sealed({
      onBreak:           isOnBreak,
      inSession:         !isOnBreak,
      inAnimationMode:   isAnimating,
      inInputMode:       !isAnimating,
      hideCancelMessage: isCancelHidden
    })
  }

  // Return text to indicate important state transitions to the user.
  const indicator = enclose((state, { flash } = {}) => {
    if (flash !== undefined) {
      state.specialMessage = flash
      sleep(INDICATOR_FLASH_DURATION).then(() => state.specialMessage = null)
    }
    // Return a special message or null if none.
    return state.specialMessage
  })

  // Return a formatted string for the digital time display.
  // Important state transitions will flash special alerts over the readout.
  const information = ({ isAnimating } = {}) => {
    if (isAnimating) {
      return indicator() || formatTime(animator.remaining())
    } else {
      return READOUT_START_TXT
    }
  }

  // Message user with instructions.
  const instructions = ({ isAnimating } = {}) => {
    return isAnimating ? MESSAGE_SET_TXT : MESSAGE_RUN_TXT
  }

  // Provide user with a cancellation link.
  const cancellation = ({ isCancelHidden } = {}) => {
    return isCancelHidden ? '' : INPUT_CANCEL_TXT
  }

  // Create a model that is easily consumed by the view.
  const representation = (data) => {
    const { mode, sessionTime, breakTime, isOnBreak } = data,
          isAnimating = mode !== action.input,
          // Hide cancel link when animating, and on first round of input.
          isCancelHidden = isAnimating || isOnBreak === null
    // Format time values for display.
    const [sessionHours, sessionMinutes, sessionSeconds]
            = formatTime(sessionTime).split(':'),
          [breakHours, breakMinutes, breakSeconds]
            = formatTime(breakTime).split(':')
    // Return data that can be fed directly into the view.
    return {
      isAnimating,
      isCancelHidden,
      isOnBreak,
      breakHours,
      breakMinutes,
      breakSeconds,
      breakTime,
      sessionHours,
      sessionMinutes,
      sessionSeconds,
      sessionTime,
      cancelMessage:  cancellation({ isCancelHidden }),
      readout:        information({ isAnimating }),
      message:        instructions({ isAnimating }),
      inputFocuser:   requestInputMode({ isAnimating, isOnBreak }),
      inputCanceller: cancelInputMode({ isAnimating }),
      modeToggler:    toggleMode({ isAnimating }),
      app:            presentation({ isOnBreak, isAnimating, isCancelHidden })
    }
  }

  // Send a representation of the model to the view for rendering,
  // then invoke possible next actions that result from current control state.
  const render = (data) => {

    switch (data.mode) {
      case action.input: {
        startInput(data)
        break
      }
      case action.start: {
        startAnimation(data)
        break
      }
      case action.run:
        runAnimation(data)
        break
      case action.end:
        break
      // No default
    }

    view.render(representation(data))

    nextAction(data.mode)

  }

  // Trigger actions that automatically follow certain control states.
  const nextAction = (mode) => {
    let next = null

    switch (mode) {
      case action.start: {
        next = action.run
        break
      }
      case action.end: {
        next = action.start
        break
      }
    }

    if (next) {
      model.present(next)
    }

  }

  // Return interface.
  return frozen({ render })

}

// Populate the imported state control object.
Object.assign(stateControl, makeStateControl())

