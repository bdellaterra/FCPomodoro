var test = require(process.env.JS_TEST_LIB).test

import { degToRadians, formatTime, hoursToMsecs, minutesToMsecs,
         msecsToHours, msecsToMinutes, msecsToSeconds, secondsToMsecs
       } from 'utility/conv.js'


test('Degrees convert to radians.', (t) => {
  t.true(degToRadians(0) === 0)
  t.true(degToRadians(180) === Math.PI)
  t.true(degToRadians(360) === 2 * Math.PI)
})

