/* global DEBUG */
import '../css/styles.css'

import { ARC_CLOCK_ROTATION, HOUR, MILLISECOND, MINUTE, SECOND
       } from './utility/constants'
import { displayDigitalTime, populateSessionInput } from './ui/input'
import makeBlinkingCursor from './ui/blinkingCursor'
import makeDispatcher from './utility/dispatcher'
import makeHoursArc from './ui/hoursArc.js'
import makeMinutesArc from './ui/minutesArc'
import makePacer from './time/pacer'
import makeRateLimiter from './time/rateLimiter'
import makeSecondsArc from './ui/secondsArc'
import makeTimer from './time/timer'
import now from 'present'
import sleep from './time/sleep'
import view from './app/view'

// Create a shared timer to synchronize components.
const timer = makeTimer()

// Create display elements for the user interface.
const display = {
  seconds: makeSecondsArc({ timer }),
  minutes: makeMinutesArc({ timer }),
  hours:   makeHoursArc({ timer }),
  cursor:  makeBlinkingCursor({ timer })
}

// Create generators to dispatch updates at various time intervals.
const watch = {
  milliseconds: makeRateLimiter({ interval: MILLISECOND }),
  seconds:      makeRateLimiter({ interval: SECOND }),
  minutes:      makeRateLimiter({ interval: MINUTE }),
  hours:        makeRateLimiter({ interval: HOUR })
}

// The timer updates at a milliseconds interval for accuracy.
watch.milliseconds.addCallback(timer.sync)

// The seconds display updates with a smooth continuous motion.
watch.milliseconds.addCallback(display.seconds.style)

// The minutes display moves slowly updating once per second.
watch.seconds.addCallback(display.minutes.style)

// The cursor moves with the minutes arc and blinks at second-intervals.
watch.seconds.addCallback(display.cursor.style)

// The hours display as semi-transparent full circles for each hour remaining.
watch.seconds.addCallback(display.hours.style)

// Continuously rotate the seconds arc so it tracks with the minutes arc.
watch.seconds.addCallback(() => {
  display.seconds.setRotation(ARC_CLOCK_ROTATION + display.minutes.getEnd())
})

// Update the digital timer display once per second.
// watch.milliseconds.addCallback( () => displayDigitalTime(timer.remaining()) )

// Create a generator to dispatch rendering of various ui components.
watch.renders = makeDispatcher()

// Add render functions for ui components in order of layering.
watch.renders.addCallback(display.hours.render)
watch.renders.addCallback(display.minutes.render)
watch.renders.addCallback(display.seconds.render)
watch.renders.addCallback(display.cursor.render)

// Create a pacer to drive updates/renders via a frame loop.
const pacer = makePacer()

// Add generators to the pacer so it can trigger iteration.
pacer.addUpdate(watch.milliseconds)
pacer.addUpdate(watch.seconds)
pacer.addUpdate(watch.minutes)
pacer.addUpdate(watch.hours)
pacer.addRender(watch.renders)

// Initialize the timer.
timer.reset()
timer.end(45 * MINUTE)

// Run the pacer to begin animation.
sleep(SECOND).then(pacer.run)

view()

