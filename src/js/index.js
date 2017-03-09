/* global DEBUG */
import '../css/styles.css'

import { ARC_CLOCK_ROTATION, HOUR, MILLISECOND, MINUTE, SECOND
       } from './utility/constants'
import { displayDigitalTime } from './ui/input'
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


// Create a shared timer to synchronize components.
const timer = makeTimer()

// Create display elements for the user interface.
const secondsArc = makeSecondsArc({ timer })
const minutesArc = makeMinutesArc({ timer })
const hoursArc = makeHoursArc({ timer })
const blinkingCursor = makeBlinkingCursor({ timer })

// Create generators to dispatch updates at various time intervals.
const millisecondsGen = makeRateLimiter({ interval: MILLISECOND })
const secondsGen = makeRateLimiter({ interval: SECOND })
const minutesGen = makeRateLimiter({ interval: MINUTE })
const hoursGen = makeRateLimiter({ interval: HOUR })

// The timer updates at a milliseconds interval for accuracy.
millisecondsGen.addCallback(timer.sync)

// The seconds display updates with a smooth continuous motion.
millisecondsGen.addCallback(secondsArc.style)

// The minutes display moves slowly updating once per second.
secondsGen.addCallback(minutesArc.style)

// The cursor moves with the minutes arc and blinks at second-intervals.
secondsGen.addCallback(blinkingCursor.blink)
secondsGen.addCallback(blinkingCursor.style)

// The hours display as semi-transparent full circles for each hour remaining.
hoursGen.addCallback(hoursArc.style)

// Continuously rotate the seconds arc so it tracks with the minutes arc.
secondsGen.addCallback(() => {
  secondsArc.setRotation(ARC_CLOCK_ROTATION + minutesArc.getEnd())
})

// Update the digital timer display once per second.
millisecondsGen.addCallback( () => displayDigitalTime(timer.remaining()) )

// Create a generator to dispatch rendering of various ui components.
const renderGen = makeDispatcher()

// Add render functions for ui components in order of layering.
renderGen.addCallback(hoursArc.render)
renderGen.addCallback(minutesArc.render)
renderGen.addCallback(secondsArc.render)
renderGen.addCallback(blinkingCursor.render)

// Create a pacer to drive updates/renders via a frame loop.
const pacer = makePacer()

// Add generators to the pacer so it can trigger iteration.
pacer.addUpdate(millisecondsGen)
pacer.addUpdate(secondsGen)
pacer.addUpdate(minutesGen)
pacer.addUpdate(hoursGen)
pacer.addRender(renderGen)

// Initialize the timer.
timer.reset()
timer.end(Number(HOUR) + 5 * SECOND)

// Run the pacer to begin animation.
sleep(SECOND).then(pacer.run)

sleep(MINUTE).then( () => console.log('AFTER 1 MIN:', timer.remaining() / MINUTE ) )

// secondsGen.addCallback( () => console.log(pacer.getAverageFrameRate()) )

