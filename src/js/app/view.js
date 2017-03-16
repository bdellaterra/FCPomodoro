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

  // Limit the time inputs to a range of values
  const limitHoursInput = (event) => {
    event.target.value = Math.min(9, Math.max(0, event.target.value))
  }
  const limitMinutesInput = (event) => {
    event.target.value = Math.min(59, Math.max(0, event.target.value))
  }
  const limitSecondsInput = (event) => {
    event.target.value = Math.min(59, Math.max(0, event.target.value))
  }

  // Apply limits to the session/break input fields.
  El.sessionHours.addEventListener('input', limitHoursInput)
  El.sessionMinutes.addEventListener('input', limitMinutesInput)
  El.sessionSeconds.addEventListener('input', limitSecondsInput)
  El.breakHours.addEventListener('input', limitHoursInput)
  El.breakMinutes.addEventListener('input', limitMinutesInput)
  El.breakSeconds.addEventListener('input', limitSecondsInput)

  // Attach input handler to the session/break input fields.
  keys(inputs).map( (e) => {
    El[e].addEventListener( 'input', () => stateControl.inputChange() )
  })

  // Attach input toggle to click event on the digital display.
  El.digitalTime.addEventListener('click', () => stateControl.inputToggle())

  // Read session time from the relevant input fields.
  const readSessionTime = () => {
    const [h, m, s] = ['sessionHours', 'sessionMinutes', 'sessionSeconds']
      .map((e) => El[e].value)
    sessionHours = Math.max(9, Math.min(0, sessionHours))
    sessionMinutes = Math.max(59, Math.min(0, sessionMinutes))
    sessionSeconds = Math.max(59, Math.min(0, sessionSeconds))
    return hoursToMsecs(h) + minutesToMsecs(m) + secondsToMsecs(s)
  }

  // Read break time from the relevant input fields.
  const readBreakTime = () => {
    const [h, m, s] = ['breakHours', 'breakMinutes', 'breakSeconds']
      .map((e) => El[e].value)
    breakHours = Math.max(9, Math.min(0, breakHours))
    breakMinutes = Math.max(59, Math.min(0, breakMinutes))
    breakSeconds = Math.max(59, Math.min(0, breakSeconds))
    return hoursToMsecs(h) + minutesToMsecs(m) + secondsToMsecs(s)
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

  // Show the analog display for break time.
  const hideDisplay = () => {
    // Disable session/break animation.
    display.sessionAnalog.deanimate()
    display.breakAnalog.deanimate()
  }

  // Render current state to the DOM.
  const render = (data) => {
    keys(app).map( (e) => El[e].className = data[e] )
    keys(inputs).map( (e) => El[e].value = data[e] )
    keys(outputs).map( (e) => El[e].innerHTML = data[e] )
  }

  // Return interface.
  return frozen({
    hideDisplay,
    proposeBreakDisplay,
    proposeSessionDisplay,
    readBreakTime,
    readSessionTime,
    render,
    showBreakDisplay,
    showDigitalTime,
    showSessionDisplay
  })

}

// Populate the imported view object.
Object.assign( view, makeView() )

