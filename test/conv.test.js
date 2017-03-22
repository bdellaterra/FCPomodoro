var test = require(process.env.JS_TEST_LIB).test

import { DEGREES_PER_HALF_CYCLE, HOUR, MILLISECONDS_PER_HOUR,
         MILLISECONDS_PER_MINUTE, MILLISECONDS_PER_SECOND,
         MINUTE, MINUTES_PER_HOUR, SECOND, SECONDS_PER_MINUTE
       } from 'utility/constants'
import { degToRadians, formatTime, hoursToMsecs, minutesToMsecs,
         msecsToHours, msecsToMinutes, msecsToSeconds, secondsToMsecs
       } from 'utility/conv'


test('Degrees convert to radians.', (t) => {
  t.true(degToRadians(0) === 0)
  t.true(degToRadians(180) === Math.PI)
  t.true(degToRadians(360) === 2 * Math.PI)
})

test('Time values format to strings as expected.', (t) => {
  t.true(formatTime(0) === '0:00:00')
  t.true(formatTime(15 * SECOND) === '0:00:15')
  t.true(formatTime(25 * MINUTE) === '0:25:00')
  t.true(formatTime(12 * HOUR) === '12:00:00')
  t.true(formatTime(90 * MINUTE + 90 * SECOND) === '1:31:30')
})

test('Time values convert as expected', (t) => {
  t.true(msecsToSeconds(0) === 0)
  t.true(msecsToMinutes(0) === 0)
  t.true(msecsToHours(0) === 0)
  t.true(secondsToMsecs(0) === 0)
  t.true(minutesToMsecs(0) === 0)
  t.true(hoursToMsecs(0) === 0)
  t.true(msecsToSeconds(15000) === 15)
  t.true(msecsToMinutes(120000) === 2)
  t.true(msecsToHours(7200000) === 2)
  t.true(secondsToMsecs(15) === 15000)
  t.true(minutesToMsecs(2) === 120000)
  t.true(hoursToMsecs(2) === 7200000)
  t.true(msecsToSeconds(-15000) === -15)
  t.true(msecsToMinutes(-120000) === -2)
  t.true(msecsToHours(-7200000) === -2)
  t.true(secondsToMsecs(-15) === -15000)
  t.true(minutesToMsecs(-2) === -120000)
  t.true(hoursToMsecs(-2) === -7200000)
})

