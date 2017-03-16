/* global DEBUG */
import '../css/styles.css'

import { HOUR, MINUTE, SECOND } from './utility/constants'
import { action, getAnimator, model, stateControl, view } from './app'
import makeAnimator from './time/animator'
import makeBreakAnalog from './ui/breakAnalog'
import makeSessionAnalog from './ui/sessionAnalog'
import sleep from './time/sleep'

const animator = getAnimator()

model.present(action.input)

