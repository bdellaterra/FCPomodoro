/* global DEBUG */
import '../css/styles.css'

import { HOUR, MINUTE, SECOND } from './utility/constants'
import makeAnimator from './time/animator'
import makeSessionAnalog from './ui/sessionAnalog'
import sleep from './time/sleep'

const animator = makeAnimator({ endTime: 60000 }),
      session = makeSessionAnalog({ animator })

animator.ending(2 * HOUR + 20 * SECOND)
animator.run()

