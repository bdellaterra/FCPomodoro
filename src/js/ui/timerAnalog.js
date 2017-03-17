import { ARC_CLOCK_ROTATION, SECOND } from '../utility/constants'
import { assign, frozen, keys, pick, relay, sealed } from '../utility/fn'
import { makeAnimator } from '../time/animator'
import { makeBlinkingCursor } from './blinkingCursor'
import { makeHoursArc } from './hoursArc'
import { makeMinutesArc } from './minutesArc'
import { makeSecondsArc } from './secondsArc'
import { once } from '../utility/iter'


// Create analog display for visually representing a timer.
export const makeTimerAnalog = (spec = {}) => {

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

  // Create an animator if none provided.
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

  // Rotate the seconds arc so it tracks with the minutes arc.
  const rotateSeconds = () => {
    state.seconds.setRotation(ARC_CLOCK_ROTATION + state.minutes.getEnd())
  }

  // Style all components.
  const style = (time) => {
    state.hours.style(time)
    state.minutes.style(time)
    state.seconds.style(time)
    state.cursor.style(time)
    rotateSeconds()
  }

  // Render all components,
  const render = () => {
    state.hours.render()
    state.minutes.render()
    state.seconds.render()
    state.cursor.render()
  }

  // Return a reference to the animator.
  const getAnimator = () => state.animator

  // Set analog to use a different animator.
  const setAnimator = (v) => {
    state.animator = v
    state.hours.setAnimator(v)
    state.minutes.setAnimator(v)
    state.seconds.setAnimator(v)
    state.cursor.setAnimator(v)
  }

  // Animate hours/minutes/seconds changes.
  const animate = () => {
    state.hours.animate()
    state.minutes.animate()
    state.seconds.animate()
    state.cursor.animate()
    state.animator.addUpdate(once(rotateSeconds), 0)  // Initial display
    state.animator.addUpdate(rotateSeconds, SECOND)
  }

  // Stop animating hours/minutes/seconds changes.
  const deanimate = () => {
    state.hours.deanimate()
    state.minutes.deanimate()
    state.seconds.deanimate()
    state.cursor.deanimate()
    state.animator.removeUpdate(rotateSeconds, SECOND)
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
    render,
    style
  })

}


export default makeTimerAnalog
