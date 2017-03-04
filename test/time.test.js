var test = require(process.env.JS_TEST_LIB).test

import now from 'present'
import { sleep, makeTimer, makePacer } from '../src/js/time'

const jiffy = 50,               // safe delay for testing async timing
      microJiffy = jiffy / 10,  // to account for time-shift during operations
      nanoJiffy = jiffy / 100   // for close-to-exact values

// Pad timing results to account for margin of error
const pad = (t) => Math.ceil(t + microJiffy)

// Return true if two values are equal within margin of error.
const sameTime = (t1, t2) => pad(t1) > t2 && pad(t2) > t1

// Returns natural numbers up to specified count.
// Used to test iteration behavior.
function* countTo(limit) {
  let x = 1
  while (x <= limit) { yield x++ }
}


// countTo
// :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

test.skip('countTo() generates natural numbers up to specified limit.', (t) => {
  let iter = countTo(5)
  t.true(iter.next().value === 1)
  t.true(iter.next().value === 2)
  t.true(iter.next().value === 3)
  t.true(iter.next().value === 4)
  t.true(iter.next().value === 5)
  t.true(iter.next().done)
})


// Timer
// :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

// Initialization

test.skip('Initial call to time() returns zero.', (t) => {
  let timer = makeTimer()
  t.true(timer.time() === 0)
})

test.skip('Initial call to delta() returns zero.', (t) => {
  let timer = makeTimer()
  t.true(timer.delta() === 0)
})

test.skip('Initial call to elapsed() returns zero.', (t) => {
  let timer = makeTimer()
  t.true(timer.elapsed() === 0)
})

test.skip('time(), delta(), and elapsed() work to spec.', (t) => {
  let timer = makeTimer({
    currentTime: 100,
    startTime:   50,
    lastTime:    80
  })
  t.true(timer.time() === 100)
  t.true(timer.delta() === 20)
  t.true(timer.elapsed() === 50)
})

// Resets

test.skip('Time values all sync to now() on reset.', (t) => {
  let timer = makeTimer()
  timer.reset()
  t.true( sameTime( now(), timer.time() ) )
  t.true(timer.delta() === 0)
  t.true(timer.elapsed() === 0)
})

test.skip('Time values all sync to specified time on reset.', (t) => {
  let timer = makeTimer()
  timer.reset(5000)
  t.true(timer.time() === 5000)
  t.true(timer.delta() === 0)
  t.true(timer.elapsed() === 0)
})

// Updates

test.skip('Update sets current time to now().', (t) => {
  let timer = makeTimer()
  let time = timer.update()
  t.true( sameTime( now(), timer.time() ) )
  t.true(timer.delta() === time)
  t.true(timer.elapsed() === time)
})

test.skip('Update sets current time to specified value', (t) => {
  let timer = makeTimer()
  let time = timer.update(5000)
  t.true(timer.time() === time)
  t.true(timer.delta() === time)
  t.true(timer.elapsed() === time)
})

// Delta

test.skip('delta() returns time since last call.', async (t) => {
  let timer = makeTimer()
  timer.update()
  await sleep(jiffy)
  timer.update()
  t.true( sameTime( jiffy, timer.delta() ) )
})

// Elapsed

test.skip('elapsed() returns time since initialization.', async (t) => {
  let timer = makeTimer()
  timer.reset()
  await sleep(jiffy)
  timer.update()
  t.true( sameTime( jiffy, timer.elapsed() ) )
  await sleep(jiffy)
  timer.update()
  t.true( sameTime( jiffy * 2, timer.elapsed() ) )
})


// Pacer
// :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

// Initialization

test.skip('Default pacer initializes state to expected values.', (t) => {
  let pacer = makePacer()
  t.true( pacer.getFrameInterval() === 0 )
  t.true( pacer.getNumIterators() === 0 )
  t.false( pacer.isRunning() )
})

test.skip('Default pacer initializes timer to expected values.', (t) => {
  let pacer = makePacer()
  t.true( pacer.getTime() === 0 )
  t.true( pacer.getDelta() === 0 )
  t.true( pacer.getElapsed() === 0 )
})

test.skip('Pacer creates timer to spec.', (t) => {
  let timer = makeTimer({
    currentTime: 100,
    startTime:   50,
    lastTime:    80
  })
  let pacer = makePacer({ timer })
  t.true( pacer.getTime() === 100 )
  t.true( pacer.getDelta() === 20 )
  t.true( pacer.getElapsed() === 50 )
})

// Running

test.skip('Pacer can add iterators and remove them when done.', (t) => {
  let pacer = makePacer()
  pacer.addIterator( countTo(5) )
  t.true( pacer.getTime() === 0 )
  t.true( pacer.getDelta() === 0 )
  t.true( pacer.getElapsed() === 0 )
})


// Feed
// :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

test.skip('Initial call to feed() returns null if given positive value.', (t) => {
  let feed = makeFeeder(countTo(3))
  t.true(feed(1) === null)
})

test.skip('feed() with zero value performs immediate iteration.', async (t) => {
  let feed = makeFeeder(countTo(3))
  t.true(feed(0).value === 1)
  await sleep(jiffy)
  t.true(feed(0).value === 2)
})

test.skip('Intial call to feed() with no arg implies pace of zero.', async (t) => {
  let feed = makeFeeder(countTo(3))
  t.true(feed().value === 1)
  await sleep(jiffy)
  t.true(feed().value === 2)
})

test.skip('feed() can run a counter at specified time interval.', async (t) => {
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

test.skip('feed() returns null during wait for next interval.', async (t) => {
  let feed = makeFeeder(countTo(3))
  t.true(feed(jiffy) === null)
  t.true(feed() === null)
  t.true(feed() === null)
  t.true(feed() === null)
  await sleep(pad(jiffy))
  t.true(feed().value === 1)
  t.true(feed() === null)
})

test.skip('feed() can change establised pace to provided value.', async (t) => {
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

