var test = require(process.env.JS_TEST_LIB).test

import now from 'present'
import { sleep, jiffy, makeDeltaTimer, makeTimeKeeper } from '../src/js/time'

test('Initial call to delta() returns zero', (t) => {
  let delta = makeDeltaTimer()
  t.true(delta() === 0)
})

test('delta() returns time since last call', async (t) => {
  let delta = makeDeltaTimer()
  delta()
  await sleep(jiffy)
  let elapsed = delta()
  t.true(jiffy % elapsed === jiffy)
  await sleep(jiffy)
  t.true(delta() > delta())
})

test('delta() returns time since argument provided', async (t) => {
  let delta = makeDeltaTimer()
  let startTime = now()
  await sleep(jiffy)
  delta()
  await sleep(jiffy)
  t.true(delta() < delta(startTime))
})

