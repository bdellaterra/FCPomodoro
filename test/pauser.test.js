var test = require(process.env.JS_TEST_LIB).test

import makePauser from '../src/js/pauser'

test('Default pauser is unpaused', (t) => {
  let pauser = makePauser()
  t.false(pauser.isPaused())
})

test('makePauser() supports specifications', (t) => {
  let pauser = makePauser({ isPaused: true })
  t.true(pauser.isPaused())
})

test('pause() and unpause() work correctly', (t) => {
  let pauser = makePauser()
  pauser.pause()
  t.true(pauser.isPaused())
  pauser.unpause()
  t.false(pauser.isPaused())
})

