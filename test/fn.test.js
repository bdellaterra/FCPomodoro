var test = require(process.env.JS_TEST_LIB).test

import { assign, enclose, keys, pick, relay, sealed } from 'utility/fn'


test("Empty spec object doesn't change state.", (t) => {
  let spec = {},
      state = sealed({ a: 1, b: 2, c: 3 }),
      origState = state
  assign(state, pick(spec, keys(state)))
  t.deepEqual(state, origState)
})

test('Spec object overrides state.', (t) => {
  let spec = { a: 5, c: 7 },
      state = sealed({ a: 1, b: 2, c: 3 })
  assign(state, pick(spec, keys(state)))
  t.deepEqual(state, { a: 5, b: 2, c: 7 })
})

test('Spec object does not extend state.', (t) => {
  let spec = { d: 9 },
      state = sealed({ a: 1, b: 2, c: 3 }),
      origState = state
  assign(state, pick(spec, keys(state)))
  t.deepEqual(state, origState)
})

test('relay() forwards API calls lazily.', (t) => {
  let f = () => 'original',
      g = () => 'new',
      o = { query: f },
      p = { ...relay(o) }
  t.true(o.query() === 'original')
  t.true(p.query() === 'original')
  p.query = g
  t.false(o.query() === 'new')
  t.true(p.query() === 'new')
})

test('enclose() constructs closure with persistent private state.', (t) => {
  const add = enclose((state, val) => {
    return state.count += val
  }, { count: 0 })
  t.true(add() === 0)
  t.true(add(5) === 5)
  t.true(add(5) === 10)
})

test('enclose() works with destructured function parameters.', (t) => {
  const both = enclose((state, { a, b } = {}) => {
    if (a !== undefined) {
      state.a = a
    }
    if (b !== undefined) {
      state.b = b
    }
    return state.a && state.b
  }, { a: true, b: false })
  t.false(both())
  t.true(both({ b: true }))
  t.true(both())
  t.false(both({ a: false }))
  t.false(both({ b: false }))
  t.true(both({ a: true, b: true }))
})

