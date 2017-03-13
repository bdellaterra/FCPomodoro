import { frozen } from '../utility/fn'
import { MILLISECOND } from '../utility/constants'
import { formatTime, msecsToHours, msecsToMinutes, msecsToSeconds
       } from '../utility/conv'
import action from './action'
import model from './model'
import makeDispatcher from '../utility/dispatcher'
import makeRateLimiter from '../time/rateLimiter'
import view from './view'

// USAGE NOTE: This module is part of a Sate-Action-Model (SAM) pattern.


// "State" in the State-Action-Model pattern can be a confusing term,
// referring more to "control state" than "internal state" or data.
// The term "mode" is being used here as a replacement.
export const mode = (() => {

  // Get a shared timer to coordinate display components.
  const timer = model.getTimer()

  // Get access to the pacer to schedule callbacks.
  const pacer = model.getPacer()

  // Create generators to dispatch updates at various time intervals.
  const watch = { milliseconds: makeRateLimiter({ interval: MILLISECOND }) }

  // Create a generator to dispatch rendering of various ui components.
  watch.renders = makeDispatcher()

  // The timer updates at a milliseconds interval for accuracy.
  watch.milliseconds.addCallback(timer.sync)

  // Add generators to the pacer so it can trigger iteration.
  pacer.addUpdate(watch.milliseconds)
  pacer.addRender(watch.renders)

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
    const sessionTime = model.getSessionTime(),
          breakTime = model.getBreakTime()
    return {
      pomodoro:       presentation(),
      sessionHours:   msecsToHours( sessionTime ),
      sessionMinutes: msecsToMinutes( sessionTime ),
      sessionSeconds: msecsToSeconds( sessionTime ),
      breakHours:     msecsToHours( breakTime ),
      breakMinutes:   msecsToMinutes( breakTime ),
      breakSeconds:   msecsToSeconds( breakTime ),
      digitalTime:    readout(),
      message:        notification()
    }
  }

  // Read input from the view.
  const readInput = () => {
    return {
      breakTime:   view.readBreakTime(),
      sessionTime: view.readSessionTime()
    }
  }

  // Send a representation of the model to the view for rendering,
  // then invoke possible next actions that result from current control state.
  const render = () => {

    if ( hasInput() && !isRunning() ) {
      if ( inSession() ) {
        view.proposeSessionDisplay()
      }
      if ( onBreak() ) {
        view.proposeBreakDisplay()
      }
    }

    if ( toStart() || hasCancelled() ) {
      if ( inSession() ) {
        view.showSessionDisplay()
      }
      if ( onBreak() ) {
        view.showBreakDisplay()
      }
    }

    // view( representation() )

    nextAction()

  }

  const nextAction = () => {

    if ( isRunning() && atTimeout() ) {
      if ( inSession() ) {
        action.break()
      }
      if ( onBreak() ) {
        action.session()
      }
    }

  }

  // Return interface.
  return frozen({
    getTimer:     model.getTimer,
    addUpdate:    watch.milliseconds.addCallback,
    addRender:    watch.renders.addCallback,
    removeUpdate: watch.milliseconds.removeCallback,
    removeRender: watch.renders.removeCallback,
    readInput,
    render
  })

})()


export default mode
