var test = require(process.env.JS_TEST_LIB).test

import makeTimer from '../src/js/timer'
import { sleep, jiffy } from '../src/js/time'

test.skip('Default timer has zero time remaining', (t) => {
  let timer = makeTimer()
  t.true(timer.read() === 0)
})

test.skip('Default timer is paused', (t) => {
  let timer = makeTimer()
  t.true(timer.isPaused())
})

test.skip('makeTimer() supports specifications', (t) => {
  let timer = makeTimer({ time: jiffy, isPaused: false })
  t.true(timer.isPaused() === false)
  t.true(timer.read() === jiffy)
})

test.skip('pause() and unpause() toggle pause state', (t) => {
  let timer = makeTimer({ time: jiffy, isPaused: false })
  timer.pause()
  t.true(timer.isPaused())
  timer.unpause()
  t.false(timer.isPaused())
})

test.skip('start() and stop() are aliases for unpause() and pause()', (t) => {
  let timer = makeTimer()
  t.true(timer.start == timer.unpause)
  t.true(timer.stop == timer.pause)
})

test.skip('update() subtracts time elapsed from time remaining', (t) => {
  let initTime = jiffy,
      timer = makeTimer({ time: initTime, isPaused: false })
  timer.update()
  t.true(timer.read() < initTime)
})

test.skip('Timer can be tested asyncronously', async (t) => {
  let initTime = jiffy * 2,
      interval = jiffy,
      timer = makeTimer({ time: initTime })
  timer.start()
  await sleep(interval)
  timer.update()
  let elapsed = initTime - timer.read()
  t.true( elapsed >= interval )
})

test.skip('Countdown stops at zero', async (t) => {
  let initTime = jiffy,
      interval = jiffy * 2,
      timer = makeTimer({ time: initTime })
  timer.start()
  await sleep(interval)
  timer.update()
  t.true( timer.read() === 0 )
})

test.skip('Pausing timer stops countdown', async (t) => {
  let initTime = jiffy * 2,
      interval = jiffy,
      timer = makeTimer({ time: initTime })
  timer.start()
  await sleep(interval)
  timer.stop()
  await sleep(interval)
  timer.update()
  t.true( timer.read() > 0 )
})

test.skip('Unpausing timer resumes countdown', async (t) => {
  let initTime = jiffy * 3,
      interval = jiffy * 2,
      timer = makeTimer({ time: initTime })
  timer.start()
  await sleep(interval)
  timer.stop()
  await sleep(interval)
  timer.start()
  await sleep(interval)
  timer.update()
  t.true( timer.read() === 0 )
})

test.skip('Timer resets to a zero-time/paused state', async (t) => {
  let initTime = jiffy * 2,
      interval = jiffy,
      timer = makeTimer({ time: initTime })
  timer.start()
  await sleep(interval)
  timer.reset()
  await sleep(interval)
  timer.update()
  t.true( timer.read() === 0 )
  t.true( timer.isPaused() === true )
})

test.skip('Time remaining can be reset to a specified value', async (t) => {
  let timer = makeTimer({ time: jiffy })
  timer.start()
  await sleep(jiffy)
  timer.reset(3000)
  await sleep(jiffy)
  timer.update()
  t.true( timer.read() === 3000 )
  t.true( timer.isPaused() === true )
})
