/* global DEBUG */
import '../css/styles.css'

import { MILISECOND, MINUTE, SECOND } from './utility/constants'
import makeArc from './ui/arc'
import makeBlinkingCursor from './ui/blinkingCursor'
import makeDispatcher from './utility/dispatcher'
import makeRateLimiter from './time/rateLimiter'
import makePacer from './time/pacer'
import makeSecondsArc from './ui/secondsArc'
import sleep from './time/sleep'

const secondsArc = makeSecondsArc()
const blinkingCursor = makeBlinkingCursor()

const pacer = makePacer()
const milisecondsGen = makeRateLimiter({ interval: MILISECOND })
const secondsGen = makeRateLimiter({ interval: SECOND })
const minutesGen = makeRateLimiter({ interval: MINUTE })
const renderGen = makeDispatcher()

milisecondsGen.addCallback(secondsArc.update)
secondsGen.addCallback(blinkingCursor.blink)
minutesGen.addCallback(blinkingCursor.update)

renderGen.addCallback(secondsArc.render)
renderGen.addCallback(blinkingCursor.render)

pacer.addUpdate(milisecondsGen)
pacer.addUpdate(secondsGen)
pacer.addUpdate(minutesGen)
pacer.addRender(renderGen)
pacer.run()

