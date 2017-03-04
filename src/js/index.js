/* global DEBUG */
import '../css/styles.css'

import makeArc from './ui/arc'
import makeSecondsArc from './ui/secondsArc'
import makeBlinkingCursor from './ui/blinkingCursor'
import makeDeltaGen from './time/deltaGen'
import makeDispatcher from './utility/dispatcher'
import makePacer from './time/pacer'
import sleep from './time/sleep'

const pacer = makePacer()
const milisecondsGen = makeDeltaGen({ interval: 1, callbacks: [] })
const secondsGen = makeDeltaGen({ interval: 1000, callbacks: [] })
const secondsArc = makeSecondsArc()
const blinkingCursor = makeBlinkingCursor()
const renderGen = makeDispatcher()

milisecondsGen.addCallback(secondsArc.update)
secondsGen.addCallback(blinkingCursor.update)

renderGen.addCallback(secondsArc.render)
renderGen.addCallback(blinkingCursor.render)

pacer.addUpdate(milisecondsGen)
pacer.addUpdate(secondsGen)
pacer.addRender(renderGen)
pacer.run()

