/* global DEBUG */
import '../css/styles.css'

// import { ARC_CLOCK_ROTATION, HOUR, MILLISECOND, MINUTE, SECOND
//        } from './utility/constants'
// import { displayDigitalTime, populateSessionInput } from './ui/input'
// import makeBreakAnalog from './ui/breakAnalog'
// import makeSessionAnalog from './ui/sessionAnalog'
// import makeBlinkingCursor from './ui/blinkingCursor'
// import makeDispatcher from './utility/dispatcher'
// import makeHoursArc from './ui/hoursArc.js'
import makeMinutesArc from './ui/minutesArc'
// import makePacer from './time/pacer'
// import makeRateLimiter from './time/rateLimiter'
import makeSecondsArc from './ui/secondsArc'
import makeTimer from './time/timer'
import now from 'present'
import sleep from './time/sleep'
// import action from './app/action'
import makePeriodicDispatcher from './time/periodicDispatcher'
// import { action, mode, model, view } from './app'

const update = (analog, time) => {
  analog.sync(time)
  analog.style(time)
  analog.render()
}

const seconds = makeSecondsArc()

seconds.reset()
seconds.end(50 * 1000)
update(seconds)

