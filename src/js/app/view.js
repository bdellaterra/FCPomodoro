import { frozen, keys, sealed } from '../utility/fn'
import makeBreakAnalog from '../ui/breakAnalog'
import makeSessionAnalog from '../ui/sessionAnalog'
import mode from './mode'

// VIEW...USAGE NOTE: This module is part of a Sate-Action-Model (SAM) pattern.


export const view = (() => {

  // Get a shared timer to coordinate display components.
  const timer = mode.getTimer()

  // Create analog display elements for the user interface.
  const display = {
    session: makeSessionAnalog({ timer }),
    break:   makeBreakAnalog({ timer })
  }

  // Root element which will receive a list of classes to adjust presentation.
  const app = sealed({ pomodoro: ['started'] })

  // Declare input fields with default values.
  const inputs = sealed({
    sessionHours:   0,
    sessionMinutes: 0,
    sessionSeconds: 0,
    breakHours:     0,
    breakMinutes:   0,
    breakSeconds:   0
  })

  // Declare output elements with default content.
  const outputs = sealed({
    digitalTime: '0:00:00',
    message:     'Click to Run Timer'
  })

  // Pull DOM targets into an object.
  const El = {}
  keys({ ...app, ...inputs, ...outputs })
    .map( (e) => El[e] = document.getElementById(e) )

  // Read session time from the relevant input fields.
  const readSessionTime = () => {
    const [h, m, s] = ['sessionHours', 'sessionMinutes', 'sessionSeconds']
      .map((e) => El[e].value)
    return hoursToMsecs(h) + minutesToMsecs(m) + secondsToMsecs(s)
  }

  // Read break time from the relevant input fields.
  const readBreakTime = () => {
    const [h, m, s] = ['breakHours', 'breakMinutes', 'breakSeconds']
      .map((e) => El[e].value)
    return hoursToMsecs(h) + minutesToMsecs(m) + secondsToMsecs(s)
  }

  // Show the analog display for proposed session time while the user
  // is inputting values but has yet to click-start.
  const proposeSessionDisplay = () => {
    mode.removeUpdate(display.session.style)
    mode.removeRender(display.session.render)
    mode.removeUpdate(display.break.style)
    mode.removeRender(display.break.render)
    display.session.style( readSessionTime() )
    display.session.render()
  }

  // Show the analog display for proposed break time while the user
  // is inputting values but has yet to click-start.
  const proposeBreakDisplay = () => {
    mode.removeUpdate(display.session.style)
    mode.removeRender(display.session.render)
    mode.removeUpdate(display.break.style)
    mode.removeRender(display.break.render)
    display.break.style( readSessionTime() )
    display.break.render()
  }

  // Show the analog display for session time.
  const showSessionDisplay = () => {
    mode.removeUpdate(display.break.style)
    mode.removeRender(display.break.render)
    mode.addUpdate(display.session.style)
    mode.addRender(display.session.render)
  }

  // Show the analog display for break time.
  const showBreakDisplay = () => {
    mode.removeUpdate(display.session.style)
    mode.removeRender(display.session.render)
    mode.addUpdate(display.break.style)
    mode.addRender(display.break.render)
  }

  // Render current state to the DOM.
  const render = () => {
    keys(app).map( (e) => El[e].className = state[e] )
    keys(inputs).map( (e) => El[e].value = state[e] )
    keys(outputs).map( (e) => El[e].innerHTML = state[e] )
  }

  // Return interface.
  return frozen({
    proposeBreakDisplay,
    proposeSessionDisplay,
    readBreakTime,
    readSessionTime,
    render,
    showBreakDisplay,
    showSessionDisplay
  })

})()


export default view
