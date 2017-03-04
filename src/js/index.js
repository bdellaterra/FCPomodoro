/* global DEBUG */
import '../css/styles.css'

import makeArc from './ui/arc'
import makeArcTimer from './ui/arcTimer'
import makeDeltaGen from './time/deltaGen'
import makeDispatcher from './utility/dispatcher'
import makePacer from './time/pacer'
import sleep from './time/sleep'

const pacer = makePacer()
const secondsGen = makeDeltaGen({ interval: 1000, callbacks: [] })
const secondsArc = makeArcTimer()
const renderGen = makeDispatcher()

secondsGen.addCallback(secondsArc.update)
renderGen.addCallback(secondsArc.render)

pacer.addUpdate(secondsGen)
pacer.addRender(renderGen)
pacer.run()

