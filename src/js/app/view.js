import { assign, frozen, keys, pick, sealed } from '../utility/fn'

// USAGE NOTE: This code is based on the Sate-Action-Model methodology. (SAM)


export const view = (s) => {

  const state = {
    pomodoro:       ['inSession'],
    sessionHours:   0,
    sessionMinutes: 45,
    sessionSeconds: 0,
    breakHours:     0,
    breakMinutes:   15,
    breakSeconds:   0,
    digitalTime:    '0:45:00',
    message:        'Click to Run Timer'
  }

  // Root element which will receive a list of classes to adjust presentation.
  const app = { pomodoro: ['started'] }

  // Declare input fields with default values.
  const inputs = {
    sessionHours:   0,
    sessionMinutes: 0,
    sessionSeconds: 0,
    breakHours:     0,
    breakMinutes:   0,
    breakSeconds:   0
  }

  // Declare ouput elements with default content.
  const outputs = {
    digitalTime: '0:00:00',
    message:     'Click to Set Timer'
  }

  // Pull DOM targets into an object.
  const El = {}
  keys({ ...app, ...inputs, ...outputs })
    .map( (e) => El[e] = document.getElementById(e) )

  // Render current state to the DOM.
  const render = () => {
    keys(app).map( (e) => {
      El[e].className = state[e]
    })
    keys(inputs).map( (e) => El[e].value = state[e] )
    keys(outputs).map( (e) => El[e].innerHTML = state[e] )
  }

  render()

}


export default view
