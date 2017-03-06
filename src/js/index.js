/* global DEBUG */
import '../css/styles.css'

import { ARC_CLOCK_ROTATION, MILLISECOND, MINUTE, SECOND
       } from './utility/constants'
import makeBlinkingCursor from './ui/blinkingCursor'
import makeDispatcher from './utility/dispatcher'
import makeMinutesArc from './ui/minutesArc'
import makePacer from './time/pacer'
import makeRateLimiter from './time/rateLimiter'
import makeSecondsArc from './ui/secondsArc'
import makeTimer from './time/timer'


// Create a shared timer to synchronize components.
const timer = makeTimer()


// Create display elements for the user interface.
const secondsArc = makeSecondsArc({ timer })
const minutesArc = makeMinutesArc({ timer })
const blinkingCursor = makeBlinkingCursor({ timer })


// Create generators to dispatch updates at various time intervals.
const millisecondsGen = makeRateLimiter({ interval: MILLISECOND })
const secondsGen = makeRateLimiter({ interval: SECOND })
const minutesGen = makeRateLimiter({ interval: MINUTE })

// The timer updates at a milliseconds interval for accuracy.
millisecondsGen.addCallback(timer.update)

// Seconds display updates with smooth continuous motion.
millisecondsGen.addCallback(secondsArc.update)

// The cursor moves slowly and blinks at second-intervals.
secondsGen.addCallback(blinkingCursor.blink)
secondsGen.addCallback(blinkingCursor.update)

// The minutes display moves slowly updating once per second.
secondsGen.addCallback(minutesArc.update)

// Rotate the seconds arc so it starts from the end of the minutes arc.
secondsGen.addCallback(() => {
  secondsArc.setRotation(ARC_CLOCK_ROTATION + minutesArc.getEnd())
})


// Create a generator to dispatch rendering.
const renderGen = makeDispatcher()

// Add render functions for ui components in order of layering.
renderGen.addCallback(minutesArc.render)
renderGen.addCallback(secondsArc.render)
renderGen.addCallback(blinkingCursor.render)


// Create a pacer to drive updates/renders via a frame loop.
const pacer = makePacer()

// Add generators to the pacer so it can drive iteration.
pacer.addUpdate(millisecondsGen)
pacer.addUpdate(secondsGen)
pacer.addUpdate(minutesGen)
pacer.addRender(renderGen)

// Run the pacer to begin animation.
timer.reset()
pacer.run()

