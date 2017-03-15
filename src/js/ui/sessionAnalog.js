import { assign, frozen, keys, pick, relay, sealed } from '../utility/fn'
import { ARC_CLOCK_ROTATION, HOUR, MILLISECOND, MILLISECONDS_PER_SECOND,
         MINUTE, MINUTES_PER_HOUR, SECOND, SECONDS_PER_MINUTE
       } from '../utility/constants'
import makeBlinkingCursor from './blinkingCursor'
import makeHoursArc from './hoursArc'
import makePeriodicDispatcher from '../time/periodicDispatcher'
import makeMinutesArc from './minutesArc'
import makeSecondsArc from './secondsArc'


// Create analog display for session time.
export const makeSessionAnalog = (spec = {}) => {

  // Initialize state.
  const state = sealed({
    periodicDispatcher: null,
    cursor:             null,
    hours:              null,
    minutes:            null,
    seconds:            null
  })

  // Adjust state to spec.
  assign(state, pick(spec, keys(state)))

  // Create a periodic dispatcher if none provided.
  if (!state.periodicDispatcher) {
    state.periodicDispatcher = makePeriodicDispatcher(spec)
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

  // Style individual components.
  const styleCursor = state.cursor.style
  const styleHours = state.hours.style
  const styleMinutes = state.minutes.style
  const styleSeconds = (time) => {
    state.seconds.style(time)
    state.seconds.setRotation(ARC_CLOCK_ROTATION + state.minutes.getEnd())
  }

  // Style all components
  const style = (time) => {
    styleCursor(time)
    styleHours(time)
    styleMinutes(time)
    styleSeconds(time)
  }

  // Render components in order of layering.
  const render = () => {
    state.hours.render()
    state.minutes.render()
    state.seconds.render()
    state.cursor.render()
  }

  // Return a reference to the periodicDispatcher.
  const getPeriodicDispatcher = () => state.periodicDispatcher

  // Set session to use a different periodicDispatcher.
  const setPeriodicDispatcher = (v) => {
    const t = v.getTimer()
    state.periodicDispatcher = v
    state.hours.setTimer(t)
    state.minutes.setTimer(t)
    state.seconds.setTimer(t)
    state.cursor.setTimer(t)
  }

  // Schedule hours/minutes/seconds updates to the periodic dispatcher.
  const animate = () => {
    state.periodicDispatcher.addCallback(styleSeconds, MILLISECOND)
    state.periodicDispatcher.addCallback(styleCursor, SECOND)
    state.periodicDispatcher.addCallback(styleMinutes, SECOND)
    state.periodicDispatcher.addCallback(styleHours, HOUR)
  }

  // Unschedule hours/minutes/seconds updates.
  const deanimate = () => {
    state.periodicDispatcher.removeCallback(styleSeconds, MILLISECOND)
    state.periodicDispatcher.removeCallback(styleCursor, SECOND)
    state.periodicDispatcher.removeCallback(styleMinutes, SECOND)
    state.periodicDispatcher.removeCallback(styleHours, HOUR)
  }

  // Return Interface.
  return frozen({
    ...relay(state, 'periodicDispatcher'),  // support dispatcher interface
    animate,
    deanimate,
    getPeriodicDispatcher,
    render,
    setPeriodicDispatcher,
    style
  })

}


export default makeSessionAnalog
