var test = require(process.env.JS_TEST_LIB).test

import { JIFFY, MICROJIFFY, NANOJIFFY } from 'utility/constants'
import { keys } from 'utility/fn'
import { makeCountdownTimer } from 'time/countdownTimer'
import { makeTimer } from 'time/timer'
import now from 'present'


test('Aliases are just aliases.', (t) => {
  let timer = makeCountdownTimer()
  t.true(makeTimer.until === makeTimer.remaining)
})

test('Supports timer interface.', (t) => {
  let timer = makeTimer(),
      countdownTimer = makeCountdownTimer()
  for (let k in keys(timer)) {
    t.true(k in keys(countdownTimer))
  }
})

test('Defaults to zeroes.', (t) => {
  let timer = makeCountdownTimer()
  t.true(timer.time() === 0)
  t.true(timer.elapsed() === 0)
  t.true(timer.remaining() === 0)
  t.true(timer.delta() === 0)
})

test('Can be updated predictably.', (t) => {
  let timer = makeCountdownTimer()
  timer.time(2 * JIFFY)
  t.true(timer.time() === 2 * JIFFY)
  timer.sync(3 * JIFFY)
  t.true(timer.time() === 3 * JIFFY)
  t.true(timer.delta() === JIFFY)
  timer.beginning(JIFFY)
  t.true(timer.elapsed() === 2 * JIFFY)
  timer.ending(5 * JIFFY)
  t.true(timer.remaining() === 2 * JIFFY)
})

test('Supports specifications', (t) => {
  let timer = makeCountdownTimer({
    beginning: 0,
    time:      2 * JIFFY,
    last:      JIFFY,
    ending:    4 * JIFFY
  })
  t.true(timer.time() === 2 * JIFFY)
  t.true(timer.delta() === JIFFY)
  t.true(timer.elapsed() === 2 * JIFFY)
  t.true(timer.remaining() === 2 * JIFFY)
})

test('Syncs time properly.', (t) => {
  let timer = makeCountdownTimer(),
      a = now(),
      b = timer.sync()
  timer.beginning(a)
  timer.ending(10 * a)
  t.true(b - a <= MICROJIFFY)
  t.true(timer.beginning() === a)
  t.true(timer.time() === b)
  t.true(timer.elapsed() === b - a)
  let c = timer.sync()
  t.true(timer.time() === c)
  t.true(timer.delta() === c - b)
  t.true(timer.elapsed() === c - a)
  let expected = 10 * a - c
  t.true(timer.remaining() === expected)
})

test('Resets properly.', (t) => {
  let firstTime = now(),
      timer = makeCountdownTimer({
        beginning: firstTime,
        ending:    firstTime + JIFFY
      })
  t.true(timer.beginning() > 0)
  timer.sync()
  t.true(timer.remaining() < JIFFY)
  t.true(timer.time() > timer.beginning())
  timer.sync()
  t.true(timer.delta() > 0)
  t.true(timer.elapsed() > timer.delta())
  t.true(JIFFY - timer.elapsed() - timer.remaining() < NANOJIFFY)
  timer.reset()
  t.true(timer.time() === timer.beginning()
         && timer.delta() === 0 && timer.remaining() === 0)
})

