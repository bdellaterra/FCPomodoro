var test = require(process.env.JS_TEST_LIB).test

import { JIFFY, MICROJIFFY } from 'utility/constants'
import { sleep } from 'time/sleep'
import now from 'present'


test('Returns a promise that resolves a specified time later.', async (t) => {
  const firstTime = now()
  await sleep(JIFFY)
  const shift = now() - firstTime - JIFFY
  t.true(shift < MICROJIFFY)
})

