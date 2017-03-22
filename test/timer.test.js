var test = require(process.env.JS_TEST_LIB).test

import { JIFFY, MICROJIFFY, NANOJIFFY } from '../src/js/utility/constants'
import { makeTimer } from '../src/js/time/timer'
import { sleep } from '../src/js/time/sleep'
import now from 'present'

test('Aliases are just aliases.', (t) => {
  let timer = makeTimer()
  t.true(makeTimer.since === makeTimer.elapsed)
  t.true(makeTimer.until === makeTimer.remaining)
})

test('Defaults to zeroes.', (t) => {
  let timer = makeTimer()
  t.true(timer.time() === 0)
  t.true(timer.elapsed() === 0)
  t.true(timer.delta() === 0)
})

test('Can be updated predictably.', (t) => {
  let timer = makeTimer()
  timer.time(2 * JIFFY)
  t.true(timer.time() === 2 * JIFFY)
  timer.sync(3 * JIFFY)
  t.true(timer.time() === 3 * JIFFY)
  t.true(timer.delta() === JIFFY)
  timer.beginning(JIFFY)
  t.true(timer.elapsed() === 2 * JIFFY)
})

test.skip('Supports specifications', (t) => {
  let timer = makeTimer({ beginning: JIFFY, time: 3 * JIFFY, last: 2 * JIFFY })
  t.true(timer.time() === 3 * JIFFY)
  t.true(timer.delta() === JIFFY)
  t.true(timer.elapsed() === 2 * JIFFY)
})

test('Syncs time properly.', (t) => {
  let timer = makeTimer(),
      a = now(),
      b = timer.sync()
  timer.beginning(a)
  t.true(b - a <= MICROJIFFY)
  t.true(timer.beginning() === a)
  t.true(timer.time() === b)
  t.true(timer.elapsed() === b - a)
  let c = timer.sync()
  t.true(timer.time() === c)
  t.true(timer.elapsed() === c - a)
  t.true(timer.delta() === c - b)
})

test('Resets properly.', (t) => {
  let timer = makeTimer({ beginning: now() })
  t.true(timer.beginning() > 0)
  timer.sync()
  t.true(timer.time() > timer.beginning())
  timer.sync()
  t.true(timer.delta() > 0)
  t.true(timer.elapsed() > timer.delta())
  timer.reset()
  t.true(timer.time() === timer.beginning() && timer.delta() === 0)
})

