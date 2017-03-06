/* global DEBUG */
import '../css/styles.css'

import { MILLISECOND, MINUTE, SECOND } from './utility/constants'
import makeArc from './ui/arc'
import makeArcTimer from './ui/arcTimer.js'
import makeBlinkingCursor from './ui/blinkingCursor'
import makeDispatcher from './utility/dispatcher'
import makeMinutesArc from './ui/minutesArc'
import makePacer from './time/pacer'
import makeRateLimiter from './time/rateLimiter'
import makeSecondsArc from './ui/secondsArc'
import makeTimer from './time/timer'
import sleep from './time/sleep'

// Create a shared timer to synchronize components.
const timer = makeTimer()

// Create a pacer to drive updates/renders via a frame loop.
const pacer = makePacer()

// Create generators to dispatch updates at various time intervals.
const millisecondsGen = makeRateLimiter({ timer, interval: MILLISECOND })
const secondsGen = makeRateLimiter({ timer, interval: SECOND })
const minutesGen = makeRateLimiter({ timer, interval: MINUTE })

// Create a generator to dispatch rendering.
const renderGen = makeDispatcher()

// Create dispay elements for user interface.
const secondsArc = makeSecondsArc({ timer })
const minutesArc = makeMinutesArc({ timer })
const blinkingCursor = makeBlinkingCursor({ timer })

// Timer updates at millisecond-interval for accuracy.
millisecondsGen.addCallback(timer.update)

// Seconds display updates with smooth continuous motion.
millisecondsGen.addCallback(secondsArc.update)

// The cursor moves slowly and blinks at second-intervals.
secondsGen.addCallback(blinkingCursor.blink)
secondsGen.addCallback(blinkingCursor.update)

// The minutes display moves slowly updating once per second.
secondsGen.addCallback(minutesArc.update)

// Add render functions for ui components in order of layering.
renderGen.addCallback(minutesArc.render)
renderGen.addCallback(secondsArc.render)
renderGen.addCallback(blinkingCursor.render)

// Add generators to the pacer so it can drive iteration.
pacer.addUpdate(millisecondsGen)
pacer.addUpdate(secondsGen)
pacer.addUpdate(minutesGen)
pacer.addRender(renderGen)

// Run the pacer to begin animation.
pacer.run()
timer.reset()

