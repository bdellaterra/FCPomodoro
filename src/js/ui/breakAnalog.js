import { BREAK_CURSOR_STYLE, BREAK_CURSOR_STYLE_2, BREAK_MINUTES_STYLE
       } from '../config'
import { makeBlinkingCursor } from './blinkingCursor'
import { makeMinutesArc } from './minutesArc'
import { makeTimerAnalog } from './timerAnalog'


// Create analog display for break time.
export const makeBreakAnalog = (spec = {}) => makeTimerAnalog({
  cursor: makeBlinkingCursor({
    animator:     spec.animator,
    strokeStyle:  BREAK_CURSOR_STYLE,
    strokeStyle2: BREAK_CURSOR_STYLE_2
  }),
  minutes: makeMinutesArc({
    animator:    spec.animator,
    strokeStyle: BREAK_MINUTES_STYLE
  }),
  ...spec
})


export default makeBreakAnalog
