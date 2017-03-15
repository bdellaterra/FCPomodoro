/* global DEBUG */
import '../css/styles.css'

import { SECOND } from './utility/constants'
import animator from './time/animator'
import makeBlinkingCursor from './ui/blinkingCursor'
import makeSecondsArc from './ui/secondsArc'
import sleep from './time/sleep'

const blinkingCursor = makeBlinkingCursor({ end: 50 * SECOND })
blinkingCursor.run()

sleep(5 * SECOND).then(() => blinkingCursor.deanimate())

