import { formatTime, msecsToHours, msecsToMinutes, msecsToSeconds
       } from '../utility/conv'
import action from './action'
import model, { present } from './model'
import view from './view'

// USAGE NOTE: This code is based on the Sate-Action-Model methodology. (SAM)


// The "state" function in SAM is for "control-state", as with state-machines,
// and not to be confused with "internal state" or data.
export const state = (model) => {

  // Adjust presentation with style classes for various control states.
  const presentation = () => model.onBreak() ? ['onBreak'] : ['inSession']

  // Message user with instructions.
  const notification = () => {
    return model.isRunning() ? 'Click to Set Timer' : 'Click to Run Timer'
  }

  // Create a model that is easily consumed by the view.
  const representation = () => ({
    pomodoro:       presentation(),
    sessionHours:   msecsToHours( model.getSessionTime() ),
    sessionMinutes: msecsToMinutes( model.getSessionTime() ),
    sessionSeconds: msecsToSeconds( model.getSessionTime() ),
    breakHours:     msecsToHours( model.getBreakTime() ),
    breakMinutes:   msecsToMinutes( model.getBreakTime() ),
    breakSeconds:   msecsToSeconds( model.getBreakTime() ),
    digitalTime:    formatTime( model.timeRemaining() ),
    message:        notification()
  })

  const render = () => {
    view( representation() )
    nextAction()
  }

  const nextAction = () => {

    if (atTimeout) {
      action.stop()
    }

  }

  return {}
}


export default state
