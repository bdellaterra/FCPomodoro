import { INPUT_CANCEL_TXT, MESSAGE_RUN_TXT, READOUT_START_TXT } from 'config'
import { MAX_HOURS, MAX_MINUTES, MAX_SECONDS, MILLISECOND
       } from 'utility/constants'
import { breakDisplay, sessionDisplay, view } from 'app'
import { frozen, keys } from 'utility/fn'
import { calcTime } from 'utility/conv'
import { clearCanvas } from 'ui/canvas'

// USAGE NOTE: This module is part of a State-Action-Model (SAM) pattern.


const makeView = () => {

  // Declare root element, which will receive classes to adjust presentation.
  const root = 'app'

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
  const el = { [root]: document.getElementById(root) }
  keys({ ...inputs, ...outputs })
    .map((e) => el[e] = document.getElementById(e))

  // Limit time fields to a range of positive values.
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
  el.sessionHours.addEventListener('input', limitHoursInput)
  el.sessionMinutes.addEventListener('input', limitMinutesInput)
  el.sessionSeconds.addEventListener('input', limitSecondsInput)
  el.breakHours.addEventListener('input', limitHoursInput)
  el.breakMinutes.addEventListener('input', limitMinutesInput)
  el.breakSeconds.addEventListener('input', limitSecondsInput)

  // Disable input fields.
  const disableInput = () => keys(inputs).map((e) => el[e].disabled = true)

  // Enable input fields.
  const enableInput = () => keys(inputs).map((e) => el[e].disabled = false)

  // Return an object mapping inputs to their current values.
  const readInputVals = () => keys(inputs).reduce((vals, e) => {
    return Object.assign(vals, { [e]: el[e].value })
  }, {})

  // Read session time from the input fields
  const readSessionTime = () => {
    const {
      sessionHours: hours,
      sessionMinutes: minutes,
      sessionSeconds: seconds
    } = readInputVals()
    return calcTime({ hours, minutes, seconds })
  }

  // Read break time from the input fields
  const readBreakTime = () => {
    const {
      breakHours: hours,
      breakMinutes: minutes,
      breakSeconds: seconds
    } = readInputVals()
    return calcTime({ hours, minutes, seconds })
  }

  // Return true if last user input was for break vs. session values.
  // Optionally set focus to break if provided value is true.
  const isBreakFocused = (() => {
    // Using closure to retain the last input focus.
    let lastOnBreak = false
    return (isOnBreak) => {
      if (isOnBreak !== undefined) {
        lastOnBreak = Boolean(isOnBreak)
      }
      return lastOnBreak
    }
  })()

  // Return style classes representing current app state.
  const style = (() => {
    // Using closure to retain previous styling information.
    let lastStyles = {}
    return (styles = {}) => {
      Object.assign(lastStyles, styles)
      return keys(lastStyles).reduce((classes, c) => {
        if (lastStyles[c]) {
          classes.push(c)
        }
        return classes
      }, []).join(' ')
    }
  })()

  // Focus user input on the session input fields.
  const focusSession = () => {
    const isOnBreak = isBreakFocused(false)
    style({ onBreak: isOnBreak, inSession: !isOnBreak })
    presentState()
  }

  // Focus user input on the break input fields.
  const focusBreak = () => {
    const isOnBreak = isBreakFocused(true)
    style({ onBreak: isOnBreak, inSession: !isOnBreak })
    presentState()
  }

  // Return sesson/break times from the input fields.
  const readInput = () => {
    return frozen({
      isOnBreak:   isBreakFocused(),
      sessionTime: readSessionTime(),
      breakTime:   readBreakTime()
    })
  }

  // Adjust for edge case where floating-point math causes seconds analog
  // to sometimes display empty and sometimes as a full-circle.
  const calcPreviewTime = ({ sessionTime, breakTime, isOnBreak } = {}) => {
    const [hoursInput, minutesInput, secondsInput] = isOnBreak
              ? ['breakHours', 'breakMinutes', 'breakSeconds']
              : ['sessionHours', 'sessionMinutes', 'sessionSeconds']
    let animationTime = isOnBreak ? breakTime : sessionTime
    // On edge-case for seconds at minute-mark...
    if (Number(el[secondsInput].value) === 0) {
      // ...Bias towards empty seconds analog
      if (Number(el[minutesInput].value) !== 0) {
        animationTime -= MILLISECOND
      }
      // ...Bias towards full hours analog
      if (Number(el[hoursInput].value) !== 0) {
        if (Number(el[minutesInput].value) === 0) {
          animationTime += MILLISECOND
        }
      }
    }
    return animationTime
  }

  // Display a preview of the input being entered by the user.
  const previewInput = (data) => {
    const { sessionTime, breakTime, isOnBreak } = (data !== undefined)
              ? data
              : readInput(),
          display = isOnBreak ? breakDisplay : sessionDisplay
    clearCanvas()
    display.draw(calcPreviewTime({ sessionTime, breakTime, isOnBreak }))
  }

  // Visually preview the session time entered by the user.
  const previewSession = () => {
    focusSession()
    previewInput()
  }

  // Visually preview the break time entered by the user.
  const previewBreak = () => {
    focusBreak()
    previewInput()
  }

  // Attach input-preview handlers to the session/break input fields.
  keys(sessionInputs).map((e) => {
    el[e].addEventListener('click', previewSession)
  })
  keys(sessionInputs).map((e) => {
    el[e].addEventListener('input', previewSession)
  })
  keys(breakInputs).map((e) => {
    el[e].addEventListener('click', previewBreak)
  })
  keys(breakInputs).map((e) => {
    el[e].addEventListener('input', previewBreak)
  })

  // Attach input-focus handler to the click and input events on input fields.
  // Remove it once the app is in input mode.
  const attachInputFocuser = (() => {
    // Using closure to keep a record of the last callback for removal.
    let lastInputFocuser
    return ({ inputFocuser, isAnimating }) => {
      const isSwap = lastInputFocuser && inputFocuser !== lastInputFocuser
      if (!isAnimating || isSwap) {
        // Remove previous callback.
        keys(inputs).map((e) => {
          el[e].removeEventListener('click', lastInputFocuser)
        })
        keys(inputs).map((e) => {
          el[e].removeEventListener('input', lastInputFocuser)
        })
        lastInputFocuser = null
      }
      if (isAnimating) {
        // Attach new callback which will a trigger transition to input mode.
        keys(inputs).map((e) => {
          el[e].addEventListener('click', inputFocuser)
        })
        keys(inputs).map((e) => {
          el[e].addEventListener('input', inputFocuser)
        })
        lastInputFocuser = inputFocuser
      }
    }
  })()

  // Attach mode-toggle handler to click event on the digital display.
  const attachModeToggler = (() => {
    // Using closure to keep a record of the last callback for removal.
    let lastModeToggler
    return ({ modeToggler, isAnimating } = {}) => {
      if (lastModeToggler) {
        el.readout.removeEventListener('click', lastModeToggler)
      }
      el.readout.addEventListener('click', modeToggler)
      lastModeToggler = modeToggler
    }
  })()

  // Attach input-cancel handler to click event on the cancel link.
  const attachInputCanceller = (() => {
    // Using closure to keep a record of the last callback for removal.
    let lastInputCanceller
    return ({ inputCanceller, isAnimating } = {}) => {
      if (lastInputCanceller) {
        el.cancelMessage.removeEventListener('click', lastInputCanceller)
      }
      el.cancelMessage.addEventListener('click', inputCanceller)
      lastInputCanceller = inputCanceller
    }
  })()

  // Set the text on the digital readout.
  const displayReadout = ({ readout } = {}) => {
    el.readout.innerHTML = readout
  }

  // Attach handlers to user events on the DOM elements.
  const attachHandlers = (data) => {
    attachModeToggler(data)
    attachInputFocuser(data)
    attachInputCanceller(data)
  }

  // Inject content into DOM elements.
  const populate = (data) => {
    keys(inputs).map((e) => el[e].value = data[e])
    keys(outputs).map((e) => el[e].innerHTML = data[e])
    displayReadout(data)
  }

  // Set presentation classes on the root element.
  const presentState = (classes = {}) => {
    el[root].className = style(classes)
  }

  // Render current state to the DOM.
  const render = (data) => {
    presentState(data[root])
    populate(data)
    attachHandlers(data)
    if (!data.isAnimating) {
      previewInput(data)
    }
  }

  // Return interface.
  return frozen({
    isBreakFocused,
    focusBreak,
    focusSession,
    readInput,
    render,
    displayReadout
  })

}

// Populate the imported view object.
Object.assign(view, makeView())

