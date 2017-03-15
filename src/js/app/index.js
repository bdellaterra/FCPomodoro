import { clearCanvas } from '../ui/canvas'
import { frozen } from '../utility/fn'
import { SECOND } from '../utility/constants'
import makeAnimator from '../time/animator'
import sleep from '../time/sleep'

// Create an animator to be shared across components.
const animator = makeAnimator()

// Export actions that can be presented to the model.
export const action = frozen({
  monitor: { },
  session: { onBreak: false },
  break:   { onBreak: true },
  start:   { isRunning: true },
  stop:    { isRunning: false },
  input:   { hasInput: true },
  cancel:  { hasInput: false }
})

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

// Monitor for state changes.
animator.addUpdate( () => model.present(action.monitor), SECOND )

