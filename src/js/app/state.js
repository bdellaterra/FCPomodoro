import { formatTime, msecsToHours, msecsToMinutes, msecsToSeconds
       } from '../utility/conv'
import action from './action'
import model, { present } from './model'
import view from './view'

// USAGE NOTE: This code is based on the Sate-Action-Model methodology. (SAM)


// The "state" in SAM is for "control-state", as with state-machines,
// not a container for "internal state" or data.
export const state = (model) => {

  // Customize the model to enable easy consumption by the view.
  const representation = (model) => ({
    sessionHours:   msecsToHours(model.getSessionTime()),
    sessionMinutes: msecsToMinutes(model.getSessionTime()),
    sessionSeconds: msecsToSeconds(model.getSessionTime()),
    breakHours:     msecsToHours(model.getBreakTime()),
    breakMinutes:   msecsToMinutes(model.getBreakTime()),
    breakSeconds:   msecsToSeconds(model.getBreakTime()),
    digitalTime:    formatTime(model.timeRemaining()),
    message:        'Click to Run Timer'
  })

  const render = () => {

  }

  const nap = () => {

    if (atTimeout) {
      action.stop()
    }

  }

  return {}
}


export default state
