import { BLINK } from 'utility/constants'
import { INDICATOR_BREAK_TXT, INDICATOR_FLASH_DURATION, INDICATOR_SESSION_TXT,
         INPUT_CANCEL_TXT, MESSAGE_RUN_TXT, MESSAGE_SET_TXT, READOUT_START_TXT
       } from 'config'
import { action, animator, breakControl, model,
         sessionControl, stateControl, view
       } from 'app'
import { clearCanvas } from 'ui/canvas'
import { formatTime } from 'utility/conv'
import { frozen } from 'utility/fn'
import { once } from 'utility/iter'
import { sleep } from 'time/sleep'

// USAGE NOTE: This module is part of a State-Action-Model (SAM) pattern.


// The term "state" can be ambiguous. ("control state" vs. "internal state")
// In the SAM methodology, the layer between the view and model is typically
// called just "state". Here it is "stateControl" to emphasize "control state".
const makeStateControl = () => {

  // Read session/break input from the view. Return the data as an object.
  const readInput = () => {
    const sessionTime = view.calcSessionTime(),
          breakTime = view.calcBreakTime()
    return { sessionTime, breakTime }
  }

  // Return toggle action for when the user clicks the digital display.
  const modeToggle = ({ isAnimating } = {}) => {
    if (isAnimating) {
      return () => model.present(action.input)
    } else {
      const payload = readInput()
      return () => model.present(action.start, payload)
    }
  }

  // Return input cancel action.
  const inputCancel = ({ isAnimating } = {}) => {
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
  const startInput = () => {
    // Don't animate while user is inputting new data.
    animator.setClearCanvas(false)
    sessionControl.deanimate()
    breakControl.deanimate()
    animator.removeUpdate(view.showReadout, BLINK)
  }

  // There are currently no actions for cancelling animations.
  const cancelAnimation = Function.prototype

  // Setup a new session/break for the given length of time.
  const startAnimation = ({ sessionTime, breakTime, isOnBreak } = {}) => {
    let activeAnalog, inactiveAnalog, duration, flash, endAction
    if (isOnBreak) {
      activeAnalog = breakControl
      inactiveAnalog = sessionControl
      duration = breakTime,
      flash = INDICATOR_BREAK_TXT
      endAction = action.endBreak
    } else {
      activeAnalog = sessionControl
      inactiveAnalog = breakControl
      duration = sessionTime,
      flash = INDICATOR_SESSION_TXT
      endAction = action.endSession
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
    animator.addUpdate(view.showReadout, BLINK)
  }

  // Adjust app presentation using style classes for various control states.
  const presentation = ({ isOnBreak, isAnimating, isCancelHidden } = {}) => {
    const classes = [
      isOnBreak ? 'onBreak' : 'inSession',
      isAnimating ? 'inAnimationMode' : 'inInputMode'
    ]
    if (isCancelHidden) {
      classes.push('hideCancelMessage')
    }
    return classes.join(' ')
  }

  // Return text to indicate important state transitions to the user.
  const indicator = (() => {
    // Using closure to keep a special message that will display temporarily.
    let specialMessage
    return ({ flash } = {}) => {
      if (flash) {
        specialMessage = flash
        sleep(INDICATOR_FLASH_DURATION).then(() => specialMessage = null)
      }
      // Return special message or null
      return specialMessage
    }
  })()

  // Return a formatted string for the digital time display.
  // Important state transitions will flash special alerts over this readout.
  const information = ({ isAnimating } = {}) => {
    return indicator()
           || isAnimating ? READOUT_START_TXT : formatTime(animator.remaining())
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
          isCancelHidden = isOnBreak === null  // hide for first input
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
      cancelMessage: cancellation({ isCancelHidden }),
      readout:       information({ isAnimating }),
      message:       instructions({ isAnimating }),
      onInputCancel: inputCancel({ isAnimating }),
      onToggle:      modeToggle({ isAnimating }),
      pomodoro:      presentation({ isCancelHidden })
    }
  }

  // Send a representation of the model to the view for rendering,
  // then invoke possible next actions that result from current control state.
  const render = (data) => {

    switch (data.mode) {
      case action.input: {
        startInput()
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
      default:
        // All actions/states have been accounted for.
        break
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

