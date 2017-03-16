import { frozen } from '../utility/fn'
import { once } from '../utility/iter'
import { MILLISECOND, MINUTE, SECOND } from '../utility/constants'
import { formatTime } from '../utility/conv'
import { action, getAnimator, model, stateControl, view } from './index'
import { actionName } from './action'
import { clearCanvas } from '../ui/canvas'
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

  // Track callbacks for end of session/break so they can be
  // unscheduled if progress is discontinued prematurely.
  let endSessionCallback, endBreakCallback

  // Track whether session/break animation was in progress so it can be
  // restored when the user cancels input mode.
  let wasSession

  // Handle changes to the input fields.
  const registerInput = () => {
    if ( model.inSession() ) {
      previewSession()
      model.present(action.inputSession)
    } else {
      previewBreak()
      model.present(action.inputBreak)
    }
  }

  // Toggle input mode when the user clicks the digital display.
  const toggleInputMode = () => {
    const inSession = model.inSession(),
          inputAction = inSession ? action.inputSession : action.inputBreak,
          startAction = inSession ? action.startSession : action.startBreak,
          toggleAction = model.inInputMode() ? startAction : inputAction
    // Save session/break state so it can be restored if input is cancelled.
    wasSession = inSession
    // Present the corresponding input mode  to the model.
    model.present( toggleAction )
  }

  // Cancel input mode when the user clicks on the cancel link.
  const cancelInputMode = () => {
    model.present( wasSession ? action.runSession : action.runBreak )
  }

  // Show a session analog that visually represents the user input.
  const previewSession = () => {
    const { sessionTime, breakTime } = readInput()
    clearCanvas()
    sessionAnalog.style( sessionTime )
    sessionAnalog.render()
    console.log('PREVIEW SESSION:', sessionTime)
  }

  // Show a break analog that visually represents the user input.
  const previewBreak = () => {
    const { sessionTime, breakTime } = readInput()
    clearCanvas()
    breakAnalog.style( breakTime )
    breakAnalog.render()
    console.log('PREVIEW BREAK:', breakTime)
  }

  // Create a callback that will present a the provided action to the model.
  const makeFutureAction = (a) => once(() => {
    model.present(a)
  })

  // Animate the session display.
  const animateSession = () => {
    animator.run()  // Does nothing if already running
    previewSession()
    sessionAnalog.animate()
  }

  // Start a session for the given length of time.
  const startSession = (duration) => {
    sessionAnalog.deanimate()
    breakAnalog.deanimate()
    animator.reset()
    animator.ending(animator.time() + duration)
    animator.removeUpdate(endSessionCallback, duration)
    endSessionCallback = makeFutureAction(action.endSession)
    animator.addUpdate(endSessionCallback, duration)
    animateSession()
  }

  // Animate the break display.
  const animateBreak = () => {
    animator.run()  // Does nothing if already running
    previewBreak()
    breakAnalog.animate()
  }

  // Start a break for the given length of time.
  const startBreak = (duration) => {
    sessionAnalog.deanimate()
    breakAnalog.deanimate()
    animator.reset()
    animator.ending(animator.time() + duration)
    animator.removeUpdate(endBreakCallback, duration)
    endBreakCallback = makeFutureAction(action.endBreak)
    animator.addUpdate(endBreakCallback, duration)
    animateBreak()
  }

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
  const representation = ({ sessionTime, breakTime, isCancelHidden, restoringInput }) => {
    // Format time values for display.
    const [sessionHours, sessionMinutes, sessionSeconds]
            = formatTime(sessionTime).split(':'),
          [breakHours, breakMinutes, breakSeconds]
            = formatTime(breakTime).split(':')
    if (restoringInput) {
      console.log('ST:', formatTime(sessionTime), 'BT:', formatTime(breakTime))
    }
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
      // Update digital readout frequently while animating.
      animator.addUpdate(view.showDigitalTime, SECOND / 5)
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
        sessionTime:    model.getSessionTime(),
        breakTime:      model.getBreakTime(),
        restoringInput: true
      })
    } else if ( model.inInputMode() ) {
      // Don't animate while user is inputting new data.
      animator.setClearCanvas(false)
      sessionAnalog.deanimate()
      breakAnalog.deanimate()
      animator.removeUpdate(view.showDigitalTime, SECOND / 5)
      // Display a preview of the input values being entered by the user.
      if ( model.inSession() ) {
        previewSession()
      } else {
        previewBreak()
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

