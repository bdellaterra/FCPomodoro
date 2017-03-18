import { DEFAULT_BREAK_TIME, DEFAULT_SESSION_TIME } from 'config'
import { makeAnimator } from 'time/animator'
import { makeBreakAnalog } from 'ui/breakAnalog'
import { makeSessionAnalog } from 'ui/sessionAnalog'
import { pick } from 'utility/fn'

export { action } from 'app/action'

// Create an animator to be shared across components.
export const animator = makeAnimator()

// Return only the state-control functions of a timer analog.
const makeTimerAnalogController = (timerAnalog) => pick( timerAnalog,
  ['animate', 'countdown', 'deanimate']
)

// Return only the display functions of a timer analog.
const makeTimerAnalogDisplayer = (timerAnalog) => pick( timerAnalog,
  ['draw']
)

// Create analog displays.
const sessionAnalog = makeSessionAnalog({ animator })
const breakAnalog = makeBreakAnalog({ animator })

// To enforce separation of concerns, split the timer analogs into a
// display interface (for the view) and a control interface (for stateControl).
export const sessionControl = makeTimerAnalogController(sessionAnalog)
export const sessionDisplay = makeTimerAnalogDisplayer(sessionAnalog)
export const breakControl = makeTimerAnalogController(breakAnalog)
export const breakDisplay = makeTimerAnalogDisplayer(breakAnalog)

// Export empty view/stateControl/model to avoid cyclical dependencies.
export const view = {}
export const stateControl = {}
export const model = {}

// Populate the view/state/model objects co-dependently.
require('./view')
require('./stateControl')
require('./model')

// Perform initial render.
export const init = () => {
  stateControl.render({
    sessionTime: DEFAULT_SESSION_TIME,
    breakTime:   DEFAULT_BREAK_TIME
  })
}

