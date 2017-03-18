import { ARC_CLOCK_ROTATION, SECOND } from 'utility/constants'
import { assign, frozen, keys, pick, relay, sealed } from 'utility/fn'
import { makeAnimator } from 'time/animator'
import { makeBlinkingCursor } from 'ui/blinkingCursor'
import { makeHoursArc } from 'ui/hoursArc'
import { makeMinutesArc } from 'ui/minutesArc'
import { makeSecondsArc } from 'ui/secondsArc'
import { makeStaticCircle } from 'ui/staticCircle'


// Create analog display for visually representing a timer.
export const makeTimerAnalog = (spec = {}) => {

  // Initialize state.
  const state = sealed({
    animator: null,
    circle:   null,
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

  // Create a circle that displays continuously.
  if (!state.circle) {
    state.circle = makeStaticCircle({ animator: state.animator })
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

  // Return a reference to the animator.
  const getAnimator = () => state.animator

  // Set analog to use a different animator.
  const setAnimator = (v) => {
    state.animator = v
    state.circle.setAnimator(v)
    state.cursor.setAnimator(v)
    state.hours.setAnimator(v)
    state.minutes.setAnimator(v)
    state.seconds.setAnimator(v)
  }

  // Rotate the seconds arc so it tracks with the minutes arc.
  const rotateSeconds = () => {
    state.seconds.setRotation(ARC_CLOCK_ROTATION + state.minutes.getEnd())
  }

  // Style all components to represent the current time.
  // Optionally style them to represent the time value provided.
  const style = (time) => {
    state.circle.style(time)
    state.cursor.style(time)
    state.hours.style(time)
    state.minutes.style(time)
    state.seconds.style(time)
    rotateSeconds()
  }

  // Render all components,
  const render = () => {
    state.circle.render()
    state.hours.render()
    state.minutes.render()
    state.seconds.render()
    state.cursor.render()
  }

  // Immediately draw the analog styled to the current time,
  // or styled to an optional time value.
  const draw = (time) => {
    style(time)
    render()
  }

  // Animate hours/minutes/seconds changes.
  const animate = () => {
    state.animator.sync()
    draw()
    state.circle.animate()
    state.cursor.animate()
    state.hours.animate()
    state.minutes.animate()
    state.seconds.animate()
    state.animator.addUpdate(rotateSeconds, SECOND)
    state.animator.run()  // Does nothing if animator is already running.
  }

  // Stop animating hours/minutes/seconds changes.
  const deanimate = () => {
    state.circle.deanimate()
    state.cursor.deanimate()
    state.hours.deanimate()
    state.minutes.deanimate()
    state.seconds.deanimate()
    state.animator.removeUpdate(rotateSeconds, SECOND)
  }

  // Start new animation, counting down the given length of time.
  const countdown = (duration) => {
    deanimate()
    state.animator.countdown(duration)
    animate()
  }

  // Perform initialization.
  style()
  animate()

  // Return Interface.
  return frozen({
    ...relay(state.animator),  // support animator interface
    animate,
    countdown,
    deanimate,
    draw,
    getAnimator,
    setAnimator,
    render,
    style
  })

}


export default makeTimerAnalog
