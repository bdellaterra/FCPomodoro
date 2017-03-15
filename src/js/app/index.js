import { clearCanvas } from '../ui/canvas'
import { frozen } from '../utility/fn'
import { SECOND } from '../utility/constants.js'
import makeDispatcher from '../utility/dispatcher'
import makePacer from '../time/pacer'
import makePeriodicDispatcher from '../time/periodicDispatcher'
import makeTimer from '../time/timer'
import sleep from '../time/sleep'
import makeSessionAnalog from '../ui/sessionAnalog'

// Create a pacer to trigger callbacks.
const pacer = makePacer()

// Create a shared timer to coordinate display components.
const timer = makeTimer()

// Create a periodic dispatcher to schedule cyclically timed events.
const updater = makePeriodicDispatcher({ timer })

// Create a dispatcher for rendering various ui components.
const renderer = makeDispatcher()

// Add dispatchers to the pacer so it can trigger iteration.
pacer.addUpdate(updater)
pacer.addRender(renderer)

// Export access to shared functions/resources.
export const action = frozen({
  monitor: { },
  session: { onBreak: false },
  break:   { onBreak: true },
  start:   { isRunning: true },
  stop:    { isRunning: false },
  input:   { hasInput: true },
  cancel:  { hasInput: false }
})

export const view = {}
export const mode = {}
export const model = {}

export const getPacer = () => pacer
export const getRenderer = () => renderer
export const getTimer = () => timer
export const getUpdater = () => updater

require('./view')
require('./mode')
require('./model')

// Timer polls for the current time as frequently as possible for best accuracy.
// updater.addCallback(() => timer.sync())

// Clear the canvas before each render cycle.
// renderer.addCallback(clearCanvas)

// Monitor state each second while session/break is running.
updater.addCallback(() => {
  DEBUG && console.log('...')
  // model.present(action.monitor), SECOND
}, SECOND)

// Start the app loop.
// pacer.run()

