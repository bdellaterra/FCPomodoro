import { frozen } from '../utility/fn'
import { MILLISECOND, SECOND } from '../utility/constants'
import { formatTime, msecsToHours, msecsToMinutes, msecsToSeconds
       } from '../utility/conv'
import { action, getTimer, getUpdater, model, stateControl, view } from './index'

// USAGE NOTE: This module is part of a State-Action-Model (SAM) pattern.


// The term "state" can be ambiguous. ("control state" vs. "internal state")
// The layer between the view and model is typically called "state" in the
// SAM methodology, but here it is called "state control" to disambiguate.
const makeStateControl = () => {

  // Get access to shared resources
  const timer = getTimer(),
        updater = getUpdater()

  // Adjust presentation with style classes for various control states.
  const presentation = () => model.onBreak() ? ['onBreak'] : ['inSession']

  // Return a formatted value for the digital time display.
  const readout = () => {
    return model.isRunning() ? formatTime( timer.remaining() ) : formatTime(0)
  }

  // Message user with instructions.
  const notification = () => {
    return model.isRunning() ? 'Click to Set Timer' : 'Click to Run Timer'
  }

  // Create a model that is easily consumed by the view.
  const representation = () => {
    const input = view.readInput()
    return {
      pomodoro:       presentation(),
      sessionHours:   msecsToHours( input.sessionTime ),
      sessionMinutes: msecsToMinutes( input.sessionTime ),
      sessionSeconds: msecsToSeconds( input.sessionTime ),
      breakHours:     msecsToHours( input.breakTime ),
      breakMinutes:   msecsToMinutes( input.breakTime ),
      breakSeconds:   msecsToSeconds( input.breakTime ),
      digitalTime:    readout(),
      message:        notification()
    }
  }

  // Send a representation of the model to the view for rendering,
  // then invoke possible next actions that result from current control state.
  const render = () => {
    DEBUG && console.log('STATE RENDER:')

    if ( model.hasInput() && !model.isRunning() ) {
      if ( model.inSession() ) {
        view.proposeSessionDisplay()
      }
      if ( model.onBreak() ) {
        view.proposeBreakDisplay()
      }
    }

    if ( model.isRunning() || model.hasCancelled() ) {
      if ( model.inSession() ) {
        DEBUG && console.log('RUNNING SESSION:')
        view.showSessionDisplay()
      }
      if ( model.onBreak() ) {
        DEBUG && console.log('RUNNING BREAK:')
        view.showBreakDisplay()
      }
    }

    view.render( representation() )

    nextAction()

  }

  // Trigger actions that automatically follow certain control states.
  const nextAction = () => {
    DEBUG && console.log('CHECK FOR NEXT ACTION:')
    if ( model.isRunning() && model.atTimeout() ) {
      DEBUG && console.log('TIMEOUT!')
      if ( model.inSession() ) {
        model.present(action.break)
        DEBUG && console.log('SWITCH TO BREAK:', action.break)
      }
      if ( model.onBreak() ) {
        model.present(action.session)
        DEBUG && console.log('SWITCH TO SESSION:', action.session)
      }
    }
  }

  // Return interface.
  return frozen({ readout, render })

}

// Populate provided stateControl object.
Object.assign(stateControl, makeStateControl())

