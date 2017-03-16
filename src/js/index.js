/* global DEBUG */
import '../css/styles.css'

import { HOUR, MINUTE, SECOND } from './utility/constants'
import { action, getAnimator, model, stateControl, view } from './app'
import { GeneratorFunction, once, oneOff } from './utility/iter'
import makeAnimator from './time/animator'
import makeBreakAnalog from './ui/breakAnalog'
import makeSessionAnalog from './ui/sessionAnalog'
import sleep from './time/sleep'

// const intro = () => console.log('Once upon a time...')
// const closing = () => console.log('...they lived happily ever after.')
//
// console.dir(GeneratorFunction)
//
// const one = (cb) => {
//   // const g = new GeneratorFunction('cb', 'yield cb()')
//   // return g()
// }

