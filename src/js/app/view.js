import { frozen, keys, sealed } from '../utility/fn'
import { hoursToMsecs, minutesToMsecs, secondsToMsecs } from '../utility/conv'
import { SECOND } from '../utility/constants'
import { getRenderer, getTimer, getUpdater, mode, view } from './index'
import makeBreakAnalog from '../ui/breakAnalog'
import makeSessionAnalog from '../ui/sessionAnalog'

// USAGE NOTE: This module is part of a State-Action-Model (SAM) pattern.


const makeView = () => {

  // Get access to shared resources.
  const renderer = getRenderer()
  const timer = getTimer()
  const updater = getUpdater()

  // Create analog display elements for the user interface.
  const display = {
    session: makeSessionAnalog({ periodicDispatcher: updater }),
    break:   makeBreakAnalog({ timer })
  }

  // Declare root element which will receive classes to adjust presentation.
  const app = sealed({ pomodoro: ['started'] })

  // Declare input fields with their default values.
  const inputs = sealed({
    sessionHours:   0,
    sessionMinutes: 0,
    sessionSeconds: 0,
    breakHours:     0,
    breakMinutes:   0,
    breakSeconds:   0
  })

  // Declare output elements with their default content.
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

  // Return consolidated input values.
  const readInput = () => {
    DEBUG && console.log('READ INPUT:')
    return {
      breakTime:   readBreakTime(),
      sessionTime: readSessionTime()
    }
  }

  const showDigitalTime = () => {
    El.digitalTime.innerHTML = mode.readout()
  }

  // Show the analog display for proposed session time while the user
  // is inputting values but has yet to click-start.
  const proposeSessionDisplay = () => {
    // Remove any time-triggered display.
    updater.removeCallback(display.session.style)
    renderer.removeCallback(display.session.render)
    updater.removeCallback(display.break.style)
    renderer.removeCallback(display.break.render)
    // Render based on session input fields.
    display.session.style( readSessionTime() )
    display.session.render()
  }

  // Show the analog display for proposed break time while the user
  // is inputting values but has yet to click-start.
  const proposeBreakDisplay = () => {
    // Remove any time-triggered display.
    updater.removeCallback(display.session.style)
    renderer.removeCallback(display.session.render)
    updater.removeCallback(display.break.style)
    renderer.removeCallback(display.break.render)
    // Render based on break input fields.
    display.break.style( readBreakTime() )
    display.break.render()
  }

  // Show the analog display for session time.
  const showSessionDisplay = () => {
    // Clear any break display.
    updater.removeCallback(display.break.style)
    renderer.removeCallback(display.break.render)
    // Add session display.
    updater.addCallback(display.session.style)
    renderer.addCallback(display.session.render)
  }

  // Show the analog display for break time.
  const showBreakDisplay = () => {
    // Clear any session display.
    updater.removeCallback(display.session.style)
    renderer.removeCallback(display.session.render)
    // Add break display.
    updater.addCallback(display.break.style)
    renderer.addCallback(display.break.render)
  }

  // Render current state to the DOM.
  const render = (data) => {
    keys(app).map( (e) => El[e].className = data[e] )
    keys(inputs).map( (e) => El[e].value = data[e] )
    keys(outputs).map( (e) => El[e].innerHTML = data[e] )
  }

  // Return interface.
  return frozen({
    proposeBreakDisplay,
    proposeSessionDisplay,
    readInput,
    render,
    showBreakDisplay,
    showSessionDisplay
  })

}

Object.assign( view, makeView() )

