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
// import makeMinutesArc from './ui/minutesArc'
// import makePacer from './time/pacer'
// import makeRateLimiter from './time/rateLimiter'
// import makeSecondsArc from './ui/secondsArc'
// import makeTimer from './time/timer'
// import now from 'present'
// import sleep from './time/sleep'
// import action from './app/action'

import action from './app/action'
import model from './app/model'
// import mode from './app/mode'
import view from './app/view'

model.present(action.start)

// // Create a shared timer to synchronize components.
// const timer = makeTimer()
// const timer2 = makeTimer()
//
// // Create display elements for the user interface.
// const display = {
//   session: makeSessionAnalog({ timer }),
//   break:   makeBreakAnalog({ timer })
// }
//
// // Create generators to dispatch updates at various time intervals.
// const watch = {
//   milliseconds: makeRateLimiter({ interval: MILLISECOND }),
//   seconds:      makeRateLimiter({ interval: SECOND }),
//   minutes:      makeRateLimiter({ interval: MINUTE }),
//   hours:        makeRateLimiter({ interval: HOUR })
// }
//
// // The timer updates at a milliseconds interval for accuracy.
// watch.milliseconds.addCallback(timer.sync)
// watch.milliseconds.addCallback(display.session.style)
//
// // Create a generator to dispatch rendering of various ui components.
// watch.renders = makeDispatcher()
//
// // Add render functions for ui components in order of layering.
// watch.renders.addCallback(display.session.render)
//
// // Create a pacer to drive updates/renders via a frame loop.
// const pacer = makePacer()
//
// // Add generators to the pacer so it can trigger iteration.
// pacer.addUpdate(watch.milliseconds)
// pacer.addUpdate(watch.seconds)
// pacer.addUpdate(watch.minutes)
// pacer.addUpdate(watch.hours)
// pacer.addRender(watch.renders)
//
// // Initialize the timer.
// timer.reset()
// timer.end(45 * MINUTE)
//
// // Run the pacer to begin animation.
// sleep(SECOND).then(pacer.run)
//
// view()
//
// let r = 0
// sleep(5 * SECOND).then(() => {
//   r = timer.remaining()
//   pacer.stop()
// })
//
// sleep(10 * SECOND).then(() => {
//   timer.reset()
//   timer.end(r)
//   pacer.run()
// })

