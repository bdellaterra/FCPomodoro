import { frozen } from '../utility/fn'
import { once } from '../utility/iter'
import { MILLISECOND, SECOND } from '../utility/constants'
import { formatTime, msecsToHours, msecsToMinutes, msecsToSeconds
       } from '../utility/conv'
import { action, getAnimator, model, stateControl, view } from './index'

// USAGE NOTE: This module is part of a State-Action-Model (SAM) pattern.


// The term "state" can be ambiguous. ("control state" vs. "internal state")
// The layer between the view and model is typically called "state" in the
// SAM methodology, but here it is called "state control" to disambiguate.
const makeStateControl = () => {

  // Get access to shared animator.
  const animator = getAnimator()

  // Start a session/break from the beginning.
  const start = () => {
    const onBreak = model.onBreak(),
          ending = onBreak ? model.getBreakTime() : model.getSessionTime()
    view.hideDisplay()
    animator.reset()
    animator.ending(animator.time() + ending)
    animator.addUpdate(once(() => model.present(action.start)), ending)
    animator.run()  // Does nothing if already running
    view.hideDisplay()
    onBreak ? view.showBreakDisplay() : view.showSessionDisplay()
  }

  // Adjust presentation with style classes for various control states.
  const presentation = () => model.onBreak() ? ['onBreak'] : ['inSession']

  // Handle changes to the input fields.
  const inputChange = () => {
    model.present( action.input )
  }

  // Toggle input mode when the user clicks the digital display.
  const inputToggle = () => {
    model.present( model.isRunning() ? action.input : action.start )
  }

  // Return consolidated input values.
  const readInput = () => {
    return {
      breakTime:   view.readBreakTime(),
      sessionTime: view.readSessionTime()
    }
  }

  // Return a formatted value for the digital time display.
  const readout = () => {
    return model.isRunning() ? formatTime(animator.remaining()) : formatTime(0)
  }

  // Message user with instructions.
  const notification = () => {
    return model.isRunning() ? 'Click to Set Timer' : 'Click to Run Timer'
  }

  // Create a model that is easily consumed by the view.
  const representation = () => {
    const [sessionHours, sessionMinutes, sessionSeconds]
            = formatTime( model.getSessionTime() ).split(':'),
          [breakHours, breakMinutes, breakSeconds]
            = formatTime( model.getBreakTime() ).split(':')
    return {
      sessionHours,
      sessionMinutes,
      sessionSeconds,
      breakHours,
      breakMinutes,
      breakSeconds,
      pomodoro:    presentation(),
      digitalTime: readout(),
      message:     notification()
    }
  }

  // Send a representation of the model to the view for rendering,
  // then invoke possible next actions that result from current control state.
  const render = () => {

    if ( model.hasInput() ) {
      if ( model.inSession() ) {
        view.proposeSessionDisplay()
      }
      if ( model.onBreak() ) {
        view.proposeBreakDisplay()
      }
    }

    // if ( model.hasInput() && !model.isRunning() ) {
    //   if ( model.inSession() ) {
    //     view.proposeSessionDisplay()
    //   }
    //   if ( model.onBreak() ) {
    //     view.proposeBreakDisplay()
    //   }
    // }
    //
    // if ( model.isRunning() || model.hasCancelled() ) {
    //   if ( model.inSession() ) {
    //     DEBUG && console.log('RUNNING SESSION:')
    //     view.showSessionDisplay()
    //   }
    //   if ( model.onBreak() ) {
    //     DEBUG && console.log('RUNNING BREAK:')
    //     view.showBreakDisplay()
    //   }
    // }

    view.render( representation() )

    nextAction()

  }

  // Trigger actions that automatically follow certain control states.
  const nextAction = () => {
    let next = null
    if ( model.atTimeout() && model.isRunning() ) {
      DEBUG && console.log('TIMEOUT!')
      next = action.start
      // next = model.onBreak() ? action.session : action.break
    }
    // // DEBUG && console.log('CHECK FOR NEXT ACTION:')
    // if ( model.isRunning() && model.atTimeout() ) {
    //   DEBUG && console.log('TIMEOUT!')
    //   if ( model.inSession() ) {
    //     next = action.break
    //   } else {
    //     next = action.session
    //   }
    // }
    if (next) {
      model.present(next)
    }
  }

  // Return interface.
  return frozen({ inputChange, inputToggle, readInput, readout, render, start })

}

// Populate the imported stateControl object.
Object.assign(stateControl, makeStateControl())

