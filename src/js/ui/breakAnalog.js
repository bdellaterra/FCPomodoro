import { assign, frozen, keys, pick, relay, sealed } from '../utility/fn'
import { SECOND, SECONDS_PER_HOUR } from '../utility/constants'
import { BREAK_CURSOR_STYLE, BREAK_CURSOR_STYLE_2, BREAK_MINUTES_STYLE
       } from '..//config'
import makeBlinkingCursor from './blinkingCursor'
import makeMinutesArc from './minutesArc'
import makeSessionAnalog from './sessionAnalog'


// Create analog display for break time.
export const makeBreakAnalog = (spec = {}) => {

  // Create a shared animator if none provided.
  if (!spec.animator) {
    spec.animator = makeAnimator(spec)
  }

  return makeSessionAnalog({
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
}


export default makeBreakAnalog
