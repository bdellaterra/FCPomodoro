import { INPUT_CANCEL_TXT, MESSAGE_RUN_TXT, READOUT_START_TXT } from 'config'
import { ARC_CYCLE, MAX_HOURS, MAX_MINUTES, MAX_SECONDS, MILLISECOND,
         MINUTE, SECOND
       } from 'utility/constants'
import { action, breakDisplay, model, sessionDisplay, stateControl, view
       } from 'app'
import { frozen, keys } from 'utility/fn'
import { hoursToMsecs, minutesToMsecs, secondsToMsecs } from 'utility/conv'
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
    readout:       READOUT_START_TXT,
    message:       MESSAGE_RUN_TXT,
    cancelMessage: INPUT_CANCEL_TXT
  })

  // Pull DOM targets into an object.
  const El = {}
  keys({ ...root, ...inputs, ...outputs })
    .map((e) => El[e] = document.getElementById(e))

  // Limit the time input fields to a range of positive values.
  const limitHoursInput = (event) => {
    event.target.value = Math.min(MAX_HOURS, Math.max(0, event.target.value))
  }
  const limitMinutesInput = (event) => {
    event.target.value = Math.min(MAX_MINUTES, Math.max(0, event.target.value))
  }
  const limitSecondsInput = (event) => {
    event.target.value = Math.min(MAX_SECONDS, Math.max(0, event.target.value))
  }

  // Apply numeric limits to the session/break input fields.
  El.sessionHours.addEventListener('input', limitHoursInput)
  El.sessionMinutes.addEventListener('input', limitMinutesInput)
  El.sessionSeconds.addEventListener('input', limitSecondsInput)
  El.breakHours.addEventListener('input', limitHoursInput)
  El.breakMinutes.addEventListener('input', limitMinutesInput)
  El.breakSeconds.addEventListener('input', limitSecondsInput)

  // Attach presentation focus to the input fields.
  keys(inputs).map((e) => {
    El[e].addEventListener('input', () => model.present(action.input))
    El[e].addEventListener('click', () => model.present(action.input))
  })

  // Attach input handlers to the session/break input fields.
  keys(sessionInputs).map((e) => {
    El[e].addEventListener('input', () => {
      previewInput({ isOnBreak: false })
    })
  })
  keys(breakInputs).map((e) => {
    El[e].addEventListener('input', () => {
      previewInput({ isOnBreak: true })
    })
  })

  // Attach callback to specified event on the provided element.
  // Removes any existing callback that was attached on previous invocation.
  const switchCallback = (() => {
    // Using closure to keep a record of the last callback for removal.
    let lastCallback
    return ({ element, event, callback } = {}) => {
      if (lastCallback) {
        element.removeEventListener(event, callback)
      }
      lastCallback = callback
      element.addEventListener(event, callback)
    }
  })()

  // Attach next-mode callback to click event on the digital display.
  const attachModeToggle = (cb) => {
    switchCallback({ element: El.readout, event: 'click', callback: cb })
  }

  // Attach cancel-input callback to click event on the cancel link.
  const attachInputCancel = (cb) => {
    switchCallback({ element: El.cancelMessage, event: 'click', callback: cb })
  }

  // Disable input.
  const disableInput = () => keys(inputs).map((e) => El[e].disabled = true)

  // Enable input.
  const enableInput = () => keys(inputs).map((e) => El[e].disabled = false)

  // Calculate total time in milliseconds using hours/minutes/seconds values.
  const calcTime = ({ hours, minutes, seconds }) => {
    return hoursToMsecs(hours)
           + minutesToMsecs(minutes)
           + secondsToMsecs(seconds)
  }

  // Read time values from the session input fields.
  const readSessionValues = () => {
    const [h, m, s] = keys(sessionInputs).map((e) => El[e].value)
    return { sessionHours: h, sessionMinutes: m, sessionSeconds: s }
  }

  // Calculate the next session time.
  const calcSessionTime = (data) => {
    if (data === undefined) {
      data = readSessionValues()
    }
    const { sessionHours, sessionMinutes, sessionSeconds } = data
    return calcTime({
      hours:   sessionHours,
      minutes: sessionMinutes,
      seconds: sessionSeconds
    })
  }

  // Read time values from the break input fields.
  const readBreakValues = () => {
    const [h, m, s] = keys(breakInputs).map((e) => El[e].value)
    return { breakHours: h, breakMinutes: m, breakSeconds: s }
  }

  // Calculate the next break time.
  const calcBreakTime = (data) => {
    if (data === undefined) {
      data = readBreakValues()
    }
    const { breakHours, breakMinutes, breakSeconds } = data
    return calcTime({
      hours:   breakHours,
      minutes: breakMinutes,
      seconds: breakSeconds
    })
  }

  // Adjust for edge case where floating-point math causes seconds analog
  // to sometimes display empty and sometimes as a full-circle.
  const calcPreviewTimes = (data) => {
    const gotSession = (data.sessionTime !== undefined),
          gotBreak = (data.breakTime !== undefined)
    let { sessionTime } = gotSession ? data : calcSessionTime(),
        { breakTime } = gotBreak ? data : calcBreakTime()
    // On edge-case for session seconds at minute-mark...
    if (Number(El.sessionSeconds.value) === 0) {
      // ...Bias towards empty seconds analog
      if (Number(El.sessionMinutes.value) !== 0) {
        sessionTime -= MILLISECOND
      }
      // ...Bias towards full hours analog
      if (Number(El.sessionHours.value) !== 0) {
        if (Number(El.sessionMinutes.value) === 0) {
          sessionTime += MILLISECOND
        }
      }
    }
    // On edge-case for break seconds at minute-mark...
    if (Number(El.breakSeconds.value) === 0) {
      // ...Bias towards empty seconds analog
      if (Number(El.breakMinutes.value) !== 0) {
        breakTime -= MILLISECOND
      }
      // ...Bias towards full hours analog
      if (Number(El.breakHours.value) !== 0) {
        if (Number(El.breakMinutes.value) === 0) {
          breakTime += MILLISECOND
        }
      }
    }
    return { sessionTime, breakTime }
  }

  // Display a preview of the input values being entered by the user.
  const previewInput = (data) => {
    const { isOnBreak } = data,
          { sessionTime, breakTime } = calcPreviewTimes(data)
    clearCanvas()
    if (isOnBreak) {
      breakDisplay.draw(breakTime)
    } else {
      sessionDisplay.draw(sessionTime)
    }
  }

  // Set the text on the digital readout.
  const showReadout = ({ readout } = {}) => {
    El.readout.innerHTML = readout
  }

  // Set presentation classes on the root element.
  const presentState = (data) => {
    keys(root).map((e) => El[e].className = data[e])
  }

  // Render current state to the DOM.
  const render = (data) => {
    presentState(data)
    keys(inputs).map((e) => El[e].value = data[e])
    keys(outputs).map((e) => El[e].innerHTML = data[e])
    attachModeToggle(data.onToggle)
    attachInputCancel(data.onInputCancel)
    previewInput(data)
  }

  // Return interface.
  return frozen({
    calcBreakTime,
    calcSessionTime,
    render,
    showReadout
  })

}

// Populate the imported view object.
Object.assign(view, makeView())

