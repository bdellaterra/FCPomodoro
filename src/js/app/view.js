import { INPUT_CANCEL_TXT, MESSAGE_RUN_TXT, READOUT_START_TXT } from 'config'
import { action, breakDisplay, model, sessionDisplay, stateControl, view
       } from 'app'
import { hoursToMsecs, minutesToMsecs, secondsToMsecs } from 'utility/conv'
import { frozen, keys } from 'utility/fn'
import { clearCanvas } from 'ui/canvas'

// USAGE NOTE: This module is part of a State-Action-Model (SAM) pattern.


const makeView = () => {

  // Declare root element, which will receive classes to adjust presentation.
  const root = frozen({ pomodoro: ['started'] })

  // Declare input fields with their default values.
  const sessionInputs = frozen({
    sessionHours:   0,
    sessionMinutes: 0,
    sessionSeconds: 0
  })
  const breakInputs = frozen({
    breakHours:   0,
    breakMinutes: 0,
    breakSeconds: 0
  })
  const inputs = frozen({
    ...sessionInputs,
    ...breakInputs
  })

  // Declare output elements with their default content.
  const outputs = frozen({
    digitalTime:   READOUT_START_TXT,
    message:       MESSAGE_RUN_TXT,
    cancelMessage: INPUT_CANCEL_TXT
  })

  // Pull DOM targets into an object.
  const El = {}
  keys({ ...root, ...inputs, ...outputs })
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

  // Attach input handlers to the session/break input fields.
  keys(sessionInputs).map( (e) => {
    El[e].addEventListener( 'input', () => {
      previewInput({ inSession: true })
      stateControl.registerInput()
    })
  })
  keys(breakInputs).map( (e) => {
    El[e].addEventListener( 'input', () => {
      previewInput({ inSession: false })
      stateControl.registerInput()
    })
  })

  // Attach presentation focus to the session/break input fields.
  keys(sessionInputs).map( (e) => {
    El[e].addEventListener( 'click', () => model.present(action.inputSession) )
  })
  keys(breakInputs).map( (e) => {
    El[e].addEventListener( 'click', () => model.present(action.inputBreak) )
  })

  // Attach input toggle to click event on the digital display.
  El.digitalTime.addEventListener('click', () => stateControl.toggleInputMode())

  // Attach click event for cancel input link.
  El.cancelMessage.addEventListener('click', () => {
    stateControl.cancelInputMode()
  })

  // Disable input.
  const disableInput = () => keys(inputs).map( (e) => El[e].disabled = true )

  // Enable input.
  const enableInput = () => keys(inputs).map( (e) => El[e].disabled = false )

  // Display a preview of the input values being entered by the user.
  const previewInput = ({ inSession, sessionTime, breakTime }) => {
    if (sessionTime === undefined) {
      sessionTime = readSessionTime()
    }
    if (breakTime === undefined) {
      breakTime = readBreakTime()
    }
    clearCanvas()
    if (inSession) {
      sessionDisplay.draw(sessionTime)
    } else {
      breakDisplay.draw(breakTime)
    }
  }

  // Read session time from the relevant input fields.
  const readSessionTime = () => {
    const [h, m, s] = keys(sessionInputs).map((e) => El[e].value)
    return hoursToMsecs(h) + minutesToMsecs(m) + secondsToMsecs(s)
  }

  // Read break time from the relevant input fields.
  const readBreakTime = () => {
    const [h, m, s] = keys(breakInputs).map((e) => El[e].value)
    return hoursToMsecs(h) + minutesToMsecs(m) + secondsToMsecs(s)
  }

  // Set the text on the digital readout.
  const showDigitalTime = () => {
    El.digitalTime.innerHTML = stateControl.readout()
  }

  // Set presentation classes on the root element.
  const presentState = (data) => {
    keys(root).map( (e) => El[e].className = data[e] )
  }

  // Render current state to the DOM.
  const render = (data) => {
    const { inInputMode, inSession } = data
    presentState(data)
    keys(inputs).map( (e) => El[e].value = data[e] )
    keys(outputs).map( (e) => El[e].innerHTML = data[e] )
    if (inInputMode) {
      enableInput()
      previewInput({ inSession })
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

