var test = require(process.env.JS_TEST_LIB).test

import { makeDispatcher } from 'utility/dispatcher'


test('Works from spec.', (t) => {
  const state = { result: 0 },
        d = makeDispatcher({
      callbacks: [(v) => v.result += 5, (v) => v.result *= 10],
      args:      [state]
        })
  t.true(d.numCallbacks() === 2)
  t.true(state.result === 0)
  d.next()
  t.true(state.result === 50)
})

test('Initializes to zero callbacks.', (t) => {
  const d = makeDispatcher()
  t.true(d.numCallbacks() === 0)
})

test('Callbacks can be added and removed.', (t) => {
  const d = makeDispatcher(),
        f = () => 1,
        g = () => 2
  d.addCallback(f)
  t.true(d.numCallbacks() === 1)
  d.addCallback(g)
  t.true(d.numCallbacks() === 2)
  d.removeCallback(f)
  t.true(d.numCallbacks() === 1)
  d.removeCallback(g)
  t.true(d.numCallbacks() === 0)
  d.removeCallback(f)
  d.removeCallback(g)
  t.true(d.numCallbacks() === 0)
})

test('The same callback is not added twice.', (t) => {
  const d = makeDispatcher(),
        f = Function.prototype,
        g = Function.prototype
  d.addCallback(f)
  t.true(d.numCallbacks() === 1)
  d.addCallback(g)
  t.true(d.numCallbacks() === 1)
})

