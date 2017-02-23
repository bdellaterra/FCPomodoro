var test = require(process.env.JS_TEST_LIB).test

import now from 'present'
import { sleep, makeDeltaTimer, makeKeepTimer,
         makeCountdown, makePacer } from '../src/js/time'

// Minimum milisecond delay for safely testing asyncronous timing
const jiffy = 50

// Pad timing results to account for margin of error
const pad = (t) => Math.ceil(t + jiffy / 10)

// Returns natural numbers up to specified count.
// Used to test iteration behavior.
function *countTo(limit) {
  let x = 1
  while (x <= limit) { yield x++ }
}


// countTo
// :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

test('countTo() generates natural numbers up to specified limit.', (t) => {
  let iter = countTo(5)
  t.true(iter.next().value === 1)
  t.true(iter.next().value === 2)
  t.true(iter.next().value === 3)
  t.true(iter.next().value === 4)
  t.true(iter.next().value === 5)
  t.true(iter.next().done)
})

// DeltaTimer
// :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

test('Initial call to delta() returns zero.', (t) => {
  let delta = makeDeltaTimer()
  t.true(delta() === 0)
})

test('delta() returns time since last call.', async (t) => {
  let delta = makeDeltaTimer()
  delta()
  await sleep(jiffy)
  let elapsed = delta()
  t.true(jiffy % pad(elapsed) === jiffy)
  await sleep(jiffy)
  t.true(delta() > delta())
})

test('delta() returns time since argument provided.', async (t) => {
  let delta = makeDeltaTimer()
  let startTime = now()
  await sleep(jiffy)
  delta()
  await sleep(jiffy)
  t.true(delta() < delta(startTime))
})


// KeepTimer
// :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

test('Initial call to keeptime() returns zero.', (t) => {
  let keeptime = makeKeepTimer()
  t.true(keeptime() === 0)
})

test('keeptime() returns time since initialization.', async (t) => {
  let keeptime = makeKeepTimer()
  keeptime()
  await sleep(jiffy)
  keeptime()
  await sleep(jiffy)
  let elapsed = keeptime()
  t.true(pad(elapsed) >= jiffy * 2)
})

test('keeptime() returns time since argument provided.', async (t) => {
  let keeptime = makeKeepTimer()
  keeptime()
  await sleep(jiffy)
  let click = now()
  await sleep(jiffy)
  let timeFromClick = pad(keeptime(click))
  t.true(timeFromClick >= jiffy && timeFromClick <= jiffy * 2)
})


// Countdown
// :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

test('countdown() returns zero if initial call has no argument.', (t) => {
  let countdown = makeCountdown()
  t.true(countdown() === 0)
})

test('countdown() returns argument if provided.', async (t) => {
  let countdown = makeCountdown()
  t.true(countdown(500) === 500)
  await sleep(jiffy)
  t.true(countdown(500) === 500)
})

test('countdown() subtracts time passed from time remaining.', async (t) => {
  let countdown = makeCountdown()
  countdown(jiffy * 2)
  await sleep(pad(jiffy))
  t.true(countdown() <= jiffy)
})

test('countdown() resets time remaining to argument provided.', async (t) => {
  let countdown = makeCountdown()
  countdown(jiffy * 5)
  await sleep(jiffy)
  countdown(jiffy * 7)
  await sleep(jiffy)
  let remaining = pad(countdown())
  t.true(remaining > jiffy * 5 && remaining < jiffy * 7)
})


// Pace
// :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

test('pacer() can run a counter at specified time interval.', async (t) => {
  let pace = makePacer(countTo(3))
  t.true(pace(jiffy) === null)
  await sleep(pad(jiffy))
  t.true(pace().value === 1)
  await sleep(pad(jiffy))
  t.true(pace().value === 2)
  await sleep(pad(jiffy))
  t.true(pace().value === 3)
  await sleep(pad(jiffy))
  t.true(pace().done)
})

test('pacer() returns null during wait for next interval.', async (t) => {
  let pace = makePacer(countTo(3))
  t.true(pace(jiffy) === null)
  t.true(pace() === null)
  t.true(pace() === null)
  t.true(pace() === null)
  await sleep(pad(jiffy))
  t.true(pace().value === 1)
  t.true(pace() === null)
})
