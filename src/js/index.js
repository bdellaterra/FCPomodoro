/* global DEBUG */
import '../css/styles.css'

import { HOUR, MINUTE, SECOND } from './utility/constants'
import makeAnimator from './time/animator'
import makeBlinkingCursor from './ui/blinkingCursor'
import makeHoursArc from './ui/hoursArc'
import makeMinutesArc from './ui/minutesArc'
import makeSecondsArc from './ui/secondsArc'
import { once } from './utility/iter'
import sleep from './time/sleep'

const animator = makeAnimator({ endTime: 60000 }),
      hoursArc = makeHoursArc({ animator }),
      minutesArc = makeMinutesArc({ animator }),
      secondsArc = makeSecondsArc({ animator }),
      blinkingCursor = makeBlinkingCursor({ animator })

console.log('Zeros:', animator.numUpdates(0))
animator.ending(2 * HOUR + 20 * SECOND)
animator.run()

sleep(5 * SECOND).then(() => console.log('Zeros:', animator.numUpdates(0)))

