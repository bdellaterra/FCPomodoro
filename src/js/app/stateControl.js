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
    model.present( toggleAction )
  }

  // Show a session analog that visually represents the user input.
  const previewSession = () => {
    const { sessionTime, breakTime } = readInput()
    sessionAnalog.deanimate()
    clearCanvas()
    sessionAnalog.style( sessionTime )
    sessionAnalog.render()
  }

  // Show a break analog that visually represents the user input.
  const previewBreak = () => {
    const { sessionTime, breakTime } = readInput()
    breakAnalog.deanimate()
    clearCanvas()
    breakAnalog.style( breakTime )
    breakAnalog.render()
  }

  // Start a session for the given length of time.
  const startSession = (duration) => {
    sessionAnalog.deanimate()
    breakAnalog.deanimate()
    animator.run()  // Does nothing if already running
    animator.reset()
    animator.ending(animator.time() + duration)
    animator.addUpdate(once(() => {
      model.present(action.endSession)
    }), duration)
    previewSession()
    sessionAnalog.animate()
  }

  // Start a break for the given length of time.
  const startBreak = (duration) => {
    sessionAnalog.deanimate()
    breakAnalog.deanimate()
    animator.run()  // Does nothing if already running
    animator.reset()
    animator.ending(animator.time() + duration)
    animator.addUpdate(once(() => {
      model.present(action.endBreak)
    }), duration)
    previewBreak()
    breakAnalog.animate()
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
    submitInput(input)
    return { sessionTime, breakTime }
  }

  // Adjust presentation with style classes for various control states.
  const presentation = () => model.inSession() ? ['inSession'] : ['onBreak']

  // Return a formatted value for the digital time display.
  const readout = () => {
    return model.inInputMode() ? 'START' : formatTime(animator.remaining())
  }

  // Message user with instructions.
  const notification = () => {
    return model.inInputMode() ? 'Click to Run Timer' : 'Click to Set Timer'
  }

  // Create a model that is easily consumed by the view.
  const representation = ({ sessionTime, breakTime }) => {
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
      pomodoro:       presentation(),
      digitalTime:    readout(),
      message:        notification(),
      isInputAllowed: model.inInputMode()
    }
  }

  // Send a representation of the model to the view for rendering,
  // then invoke possible next actions that result from current control state.
  const render = (input) => {
    // Read input values if they weren't provided and submit them to the model.
    if (input !== undefined) {
      submitInput(input)
    } else {
      input = readInput()  // reads from view and submits input to model
    }
    const { sessionTime, breakTime } = input
    if ( model.startingAnimation() ) {
      // Start the next session/break.
      if ( model.inSession() ) {
        startSession(sessionTime)
      } else {
        startBreak(breakTime)
      }
      // Update digital readout frequently while animating.
      animator.addUpdate(view.showDigitalTime, SECOND / 5)
    } else if ( model.inInputMode() ) {
      // Don't update readout from model while user is inputting new data.
      animator.removeUpdate(view.showDigitalTime, SECOND / 5)
      // Display a preview of the input values being entered by the user.
      if ( model.inSession() ) {
        DEBUG && console.log('SESSION PREVIEW:', view.readSessionTime())
        previewSession()
      } else {
        DEBUG && console.log('BREAK PREVIEW:', view.readSessionTime())
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
    toggleInputMode,
    presentation,
    readInput,
    readout,
    registerInput,
    render
  })

}

// Populate the imported stateControl object.
Object.assign(stateControl, makeStateControl())

