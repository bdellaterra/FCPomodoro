import { frozen, keys, sealed } from '../utility/fn'
import { hoursToMsecs, minutesToMsecs, secondsToMsecs } from '../utility/conv'
import { getAnimator, stateControl, view } from './index'
import makeBreakAnalog from '../ui/breakAnalog'
import makeSessionAnalog from '../ui/sessionAnalog'

// USAGE NOTE: This module is part of a State-Action-Model (SAM) pattern.


const makeView = () => {

  // Get access to shared animator.
  const animator = getAnimator()

  // Create analog display elements for the user interface.
  const display = {
    sessionAnalog: makeSessionAnalog({ animator }),
    breakAnalog:   makeBreakAnalog({ animator })
  }

  // Declare root element which will receive classes to adjust presentation.
  const app = frozen({ pomodoro: ['started'] })

  // Declare input fields with their default values.
  const inputs = frozen({
    sessionHours:   0,
    sessionMinutes: 0,
    sessionSeconds: 0,
    breakHours:     0,
    breakMinutes:   0,
    breakSeconds:   0
  })

  // Declare output elements with their default content.
  const outputs = frozen({
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
    El.digitalTime.innerHTML = stateControl.readout()
  }

  // Show the analog display for proposed session time while the user
  // is inputting values but has yet to click-start.
  const proposeSessionDisplay = () => {
    // Remove any time-triggered display.
    display.sessionAnalog.deanimate()
    display.breakAnalog.deanimate()
    // Render based on session input fields.
    display.sessionAnalog.style( readSessionTime() )
    display.sessionAnalog.render()
  }

  // Show the analog display for proposed break time while the user
  // is inputting values but has yet to click-start.
  const proposeBreakDisplay = () => {
    // Remove any time-triggered display.
    display.sessionAnalog.deanimate()
    display.breakAnalog.deanimate()
    // Render based on session input fields.
    display.breakAnalog.style( readSessionTime() )
    display.breakAnalog.render()
  }

  // Show the analog display for session time.
  const showSessionDisplay = () => {
    // Disable break animation.
    display.breakAnalog.deanimate()
    // Enable session animation.
    display.sessionAnalog.animate()
  }

  // Show the analog display for break time.
  const showBreakDisplay = () => {
    // Disable session animation.
    display.sessionAnalog.deanimate()
    // Enable break animation.
    display.breakAnalog.animate()
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

// Populate provided view object.
Object.assign( view, makeView() )

