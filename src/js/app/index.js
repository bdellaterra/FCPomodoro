import { DEFAULT_BREAK_TIME, DEFAULT_SESSION_TIME } from '..//config'
import { makeAnimator } from '../time/animator'
import { makeBreakAnalog } from '../ui/breakAnalog'
import { makeSessionAnalog } from '../ui/sessionAnalog'

export { action } from './action'

// Create an animator to be shared across components.
export const animator = makeAnimator()

// Create analog displays to be shared between the view and model.
export const sessionAnalog = makeSessionAnalog({ animator })
export const breakAnalog = makeBreakAnalog({ animator })

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

