import { assign, frozen, keys, pick, relay, sealed } from '../utility/fn'
import { ARC_CLOCK_ROTATION, MILLISECONDS_PER_SECOND, MINUTES_PER_HOUR,
         SECONDS_PER_MINUTE
       } from '../utility/constants'
import makeBlinkingCursor from './blinkingCursor'
import makeHoursArc from './hoursArc'
import makeMinutesArc from './minutesArc'
import makeSecondsArc from './secondsArc'
import makeTimer from '../time/timer'


// Create analog display for session time.
export const makeSessionAnalog = (spec = {}) => {

  // Initialize state.
  const state = sealed({
    timer:   null,
    cursor:  null,
    hours:   null,
    minutes: null,
    seconds: null
  })

  // Adjust state to spec.
  assign(state, pick(spec, keys(state)))

  // Create a timer.
  if (!state.timer) {
    state.timer = makeTimer()
  }

  // Create a cursor.
  if (!state.cursor) {
    state.cursor = makeBlinkingCursor({ timer: state.timer })
  }

  // Create an arc to indicate hours remaining.
  if (!state.hours) {
    state.hours = makeHoursArc({ timer: state.timer })
  }

  // Create an arc to indicate minutes remaining.
  if (!state.minutes) {
    state.minutes = makeMinutesArc({ timer: state.timer })
  }

  // Create an arc to indicate seconds remaining.
  if (!state.seconds) {
    state.seconds = makeSecondsArc({ timer: state.timer })
  }

  // Style components.
  const style = (time) => {
    state.seconds.setRotation(ARC_CLOCK_ROTATION + state.minutes.getEnd())
    state.seconds.style()
    state.hours.style()
    state.minutes.style()
    state.cursor.style()
  }

  // Render components in order of layering.
  const render = () => {
    state.hours.render()
    state.minutes.render()
    state.seconds.render()
    state.cursor.render()
  }

  // Return a reference to the timer.
  const getTimer = () => state.timer

  // Set session to track a different timer.
  const setTimer = (v) => {
    state.timer = v
    state.hours.setTimer(v)
    state.minutes.setTimer(v)
    state.seconds.setTimer(v)
    state.cursor.setTimer(v)
  }

  // Return Interface.
  return frozen({
    ...relay(state, 'timer'),
    getTimer,
    render,
    setTimer,
    style
  })

}


export default makeSessionAnalog
