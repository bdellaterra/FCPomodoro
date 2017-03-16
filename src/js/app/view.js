import { frozen, keys, sealed } from '../utility/fn'
import { hoursToMsecs, minutesToMsecs, secondsToMsecs } from '../utility/conv'
import { action, getAnimator, model, stateControl, view } from './index'

// USAGE NOTE: This module is part of a State-Action-Model (SAM) pattern.


const makeView = () => {

  // Get access to the shared animator.
  const animator = getAnimator()

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
    digitalTime:   'START',
    message:       'Click to Run Timer',
    cancelMessage: 'Click Here to Cancel Input'
  })

  // Pull DOM targets into an object.
  const El = {}
  keys({ ...app, ...inputs, ...outputs })
    .map( (e) => El[e] = document.getElementById(e) )

  // Limit the time inputs to a range of positive values
  const limitHoursInput = (event) => {
    event.target.value = Math.min(9, Math.max(0, event.target.value))
  }
  const limitMinutesInput = (event) => {
    event.target.value = Math.min(59, Math.max(0, event.target.value))
  }
  const limitSecondsInput = (event) => {
    event.target.value = Math.min(59, Math.max(0, event.target.value))
  }

  // Apply numeric limits to the session/break input fields.
  El.sessionHours.addEventListener('input', limitHoursInput)
  El.sessionMinutes.addEventListener('input', limitMinutesInput)
  El.sessionSeconds.addEventListener('input', limitSecondsInput)
  El.breakHours.addEventListener('input', limitHoursInput)
  El.breakMinutes.addEventListener('input', limitMinutesInput)
  El.breakSeconds.addEventListener('input', limitSecondsInput)

  // Attach input handler to the session/break input fields.
  keys(inputs).map( (e) => {
    El[e].addEventListener( 'input', () => stateControl.registerInput() )
  })

  // Attach presentation focus to the session/break input fields.
  ;['sessionHours', 'sessionMinutes', 'sessionSeconds'].map( (e) => {
    El[e].addEventListener( 'click', () => model.present(action.inputSession) )
  })
  ;['breakHours', 'breakMinutes', 'breakSeconds'].map( (e) => {
    El[e].addEventListener( 'click', () => model.present(action.inputBreak) )
  })

  // Attach input toggle to click event on the digital display.
  El.digitalTime.addEventListener('click', () => stateControl.toggleInputMode())

  // Attach click event for cancel input link.
  El.cancelMessage.addEventListener('click', () => stateControl.cancelInputMode())

  // Disable input.
  const disableInput = () => keys(inputs).map( (e) => El[e].disabled = true )

  // Enable input.
  const enableInput = () => keys(inputs).map( (e) => El[e].disabled = false )

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

  // Set the text on the digital readout.
  const showDigitalTime = () => {
    El.digitalTime.innerHTML = stateControl.readout()
  }

  const presentState = (data) => {
    keys(app).map( (e) => El[e].className = data[e] )
  }

  // Render current state to the DOM.
  const render = (data) => {
    presentState(data)
    keys(inputs).map( (e) => El[e].value = data[e] )
    keys(outputs).map( (e) => El[e].innerHTML = data[e] )
    if (data.isInputAllowed) {
      enableInput()
    } else {
      disableInput()
    }
  }

  // Return interface.
  return frozen({
    readBreakTime,
    readSessionTime,
    render,
    showDigitalTime
  })

}

// Populate the imported view object.
Object.assign( view, makeView() )

