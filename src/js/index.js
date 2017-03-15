/* global DEBUG */
import '../css/styles.css'

import { SECOND } from './utility/constants'
import makeAnimator from './time/animator'
import makeBlinkingCursor from './ui/blinkingCursor'
import makeSecondsArc from './ui/secondsArc'
import sleep from './time/sleep'

const animator = makeAnimator({ endTime: 60000 }),
      // blinkingCursor = makeBlinkingCursor({ animator }),
      secondsArc = makeSecondsArc({ animator })

// animator.reset()
// animator.end(50 * SECOND)
animator.run()

sleep(5 * SECOND).then(() => console.log('REMAINING:', secondsArc.remaining()))

