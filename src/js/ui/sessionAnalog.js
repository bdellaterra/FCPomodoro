import { assign, frozen, keys, pick, relay, sealed } from '../utility/fn'
import { ARC_CLOCK_ROTATION, SECOND } from '../utility/constants'
import makeAnimator from '../time/animator'
import makeBlinkingCursor from './blinkingCursor'
import makeHoursArc from './hoursArc'
import makeMinutesArc from './minutesArc'
import makeSecondsArc from './secondsArc'


// Create analog display for session time.
export const makeSessionAnalog = (spec = {}) => {

  // Initialize state.
  const state = sealed({
    animator: null,
    cursor:   null,
    hours:    null,
    minutes:  null,
    seconds:  null
  })

  // Adjust state to spec.
  assign(state, pick(spec, keys(state)))

  // Create a periodic dispatcher if none provided.
  if (!state.animator) {
    state.animator = makeAnimator(spec)
  }

  // Create a cursor.
  if (!state.cursor) {
    state.cursor = makeBlinkingCursor({ animator: state.animator })
  }

  // Create an arc to indicate hours remaining.
  if (!state.hours) {
    state.hours = makeHoursArc({ animator: state.animator })
  }

  // Create an arc to indicate minutes remaining.
  if (!state.minutes) {
    state.minutes = makeMinutesArc({ animator: state.animator })
  }

  // Create an arc to indicate seconds remaining.
  if (!state.seconds) {
    state.seconds = makeSecondsArc({ animator: state.animator })
  }

  // Style individual components.
  const styleSeconds = (time) => {
    state.seconds.setRotation(ARC_CLOCK_ROTATION + state.minutes.getEnd())
  }

  // Style all components
  const style = (time) => {
    styleSeconds(time)
  }

  // Return a reference to the periodicDispatcher.
  const getAnimator = () => state.animator

  // Set session to use a different periodicDispatcher.
  const setAnimator = (v) => {
    state.animator = v
    state.hours.setAnimator(t)
    state.minutes.setAnimator(t)
    state.seconds.setAnimator(t)
    state.cursor.setAnimator(t)
  }

  // Schedule hours/minutes/seconds updates to the periodic dispatcher.
  const animate = () => {
    state.hours.animate()
    state.minutes.animate()
    state.seconds.animate()
    state.cursor.animate()
    state.animator.addUpdate(style, SECOND)
  }

  // Unschedule hours/minutes/seconds updates.
  const deanimate = () => {
    state.hours.deanimate()
    state.minutes.deanimate()
    state.seconds.deanimate()
    state.cursor.deanimate()
  }

  // Perform initialization.
  style()
  animate()

  // Return Interface.
  return frozen({
    ...relay(state.animator),  // support animator interface
    animate,
    deanimate,
    getAnimator,
    setAnimator,
    style
  })

}


export default makeSessionAnalog
