import { clearCanvas } from '../ui/canvas'
import { frozen } from '../utility/fn'
import { SECOND } from '../utility/constants'
import { DEFAULT_BREAK_TIME, DEFAULT_SESSION_TIME } from '../utility/conf'
import actionStates from './action'
import makeAnimator from '../time/animator'
import sleep from '../time/sleep'

// Create an animator to be shared across components.
const animator = makeAnimator()

// Export actions that can be presented to the model.
export const action = actionStates

// Export empty view/stateControl/model to avoid cyclical dependencies.
export const view = {}
export const stateControl = {}
export const model = {}

// Export access to the shared animator.
export const getAnimator = () => animator

// Populate the view/state/model objects co-dependently.
require('./view')
require('./stateControl')
require('./model')

// Perform initial render.
stateControl.render({
  sessionTime: DEFAULT_SESSION_TIME,
  breakTime:   DEFAULT_BREAK_TIME
})

