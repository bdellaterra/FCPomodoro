var test = require(process.env.JS_TEST_LIB).test

import now from 'present'
import { sleep, makeDeltaTimer, makeKeepTimer,
         makeCountdown, makeFeeder } from '../src/js/time'

const jiffy = 50,               // Safe delay for testing async timing
      microJiffy = jiffy / 10,  // for shift from multiple operations
      nanoJiffy = jiffy / 100   // for close-to-exact values

// Pad timing results to account for margin of error
const pad = (t) => Math.ceil(t + nanoJiffy)

// Returns natural numbers up to specified count.
// Used to test iteration behavior.
function* countTo(limit) {
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
  let timer = makeDeltaTimer()
  t.true(timer.delta() === 0)
})

test('delta() returns time since last call.', async (t) => {
  let timer = makeDeltaTimer()
  timer.delta()
  await sleep(jiffy)
  let elapsed = timer.delta()
  t.true(pad(elapsed) / jiffy > 1)
  await sleep(jiffy)
  t.true(timer.delta() > timer.delta())
})

test('delta() returns time since argument provided.', async (t) => {
  let timer = makeDeltaTimer()
  let startTime = now()
  await sleep(jiffy)
  timer.delta()
  await sleep(jiffy)
  t.true(timer.delta() < timer.delta(startTime))
})

test('Resetting delta() by passing in now() returns zero.', async (t) => {
  let timer = makeDeltaTimer()
  let startTime = now()
  await sleep(jiffy)
  t.true(timer.delta(now()) < nanoJiffy)
})


// KeepTimer
// :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

test.only('Initial call to keeptime() returns zero.', (t) => {
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


// Feed
// :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

test('Initial call to feed() returns null if given positive value.', (t) => {
  let feed = makeFeeder(countTo(3))
  t.true(feed(1) === null)
})

test('feed() with zero value performs immediate iteration.', async (t) => {
  let feed = makeFeeder(countTo(3))
  t.true(feed(0).value === 1)
  await sleep(jiffy)
  t.true(feed(0).value === 2)
})

test('Intial call to feed() with no arg implies pace of zero.', async (t) => {
  let feed = makeFeeder(countTo(3))
  t.true(feed().value === 1)
  await sleep(jiffy)
  t.true(feed().value === 2)
})

test('feed() can run a counter at specified time interval.', async (t) => {
  let feed = makeFeeder(countTo(3))
  t.true(feed(jiffy) === null)
  await sleep(pad(jiffy))
  t.true(feed().value === 1)
  await sleep(pad(jiffy))
  t.true(feed().value === 2)
  await sleep(pad(jiffy))
  t.true(feed().value === 3)
  await sleep(pad(jiffy))
  t.true(feed().done)
})

test('feed() returns null during wait for next interval.', async (t) => {
  let feed = makeFeeder(countTo(3))
  t.true(feed(jiffy) === null)
  t.true(feed() === null)
  t.true(feed() === null)
  t.true(feed() === null)
  await sleep(pad(jiffy))
  t.true(feed().value === 1)
  t.true(feed() === null)
})

test('feed() can change establised pace to provided value.', async (t) => {
  let feed = makeFeeder(countTo(3))
  t.true(feed(jiffy) === null)
  t.true(feed() === null)
  await sleep(pad(jiffy))
  t.true(feed().value === 1)
  t.true(feed(jiffy * 2) === null)
  await sleep(pad(jiffy))
  t.true(feed() === null)
  await sleep(pad(jiffy))
  t.true(feed().value === 2)
})

