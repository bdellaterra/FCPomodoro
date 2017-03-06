/* global DEBUG */
import '../css/styles.css'

import { MILISECOND, MINUTE, SECOND } from './utility/constants'
import makeArc from './ui/arc'
import makeBlinkingCursor from './ui/blinkingCursor'
import makeDispatcher from './utility/dispatcher'
import makePacer from './time/pacer'
import makeRateLimiter from './time/rateLimiter'
import makeSecondsArc from './ui/secondsArc'
import makeTimer from './time/timer'
import sleep from './time/sleep'

// Create a shared timer to synchronize components.
const timer = makeTimer()

// Create a pacer to drive updaates/renders via a frame loop.
const pacer = makePacer()

// Create generators to dispatch updates at various time intervals.
const milisecondsGen = makeRateLimiter({ timer, interval: MILISECOND })
const secondsGen = makeRateLimiter({ timer, interval: SECOND })
const minutesGen = makeRateLimiter({ timer, interval: MINUTE })

// Create a generator to dispatch rendering.
const renderGen = makeDispatcher()

const secondsArc = makeSecondsArc({ timer })
const blinkingCursor = makeBlinkingCursor({ timer })

// The shared timer is updated frequently for accurate timing.
milisecondsGen.addCallback(timer.update)

// The seconds display is updated frequently for a smooth continuous motion.
milisecondsGen.addCallback(secondsArc.update)

// The cursor display blinks at second-intervals,
// but progresses only once per minute.
secondsGen.addCallback(blinkingCursor.blink)
minutesGen.addCallback(blinkingCursor.update)

// Add render functions for ui components in proper order so they
// layer one on top of the other.
renderGen.addCallback(secondsArc.render)
renderGen.addCallback(blinkingCursor.render)

// Add all generators to the pacer so it can drive iteration.
pacer.addUpdate(milisecondsGen)
pacer.addUpdate(secondsGen)
pacer.addUpdate(minutesGen)
pacer.addRender(renderGen)

// Run the pacer to begin animation.
pacer.run()

