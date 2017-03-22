var test = require( process.env.JS_TEST_LIB ).test

import { assign, keys, pick, relay, sealed } from '../src/js/utility/fn'


test( "Empty spec object doesn't change state.", (t) => {
  let spec = {},
      state = sealed({ a: 1, b: 2, c: 3 }),
      origState = state
  assign(state, pick( spec, keys( state )))
  t.deepEqual(state, origState)
})

test( 'Spec object overrides state.', (t) => {
  let spec = { a: 5, c: 7 },
      state = sealed({ a: 1, b: 2, c: 3 })
  assign( state, pick( spec, keys( state )) )
  t.deepEqual( state, { a: 5, b: 2, c: 7 } )
})

test( 'Spec object does not extend state.', (t) => {
  let spec = { d: 9 },
      state = sealed({ a: 1, b: 2, c: 3 }),
      origState = state
  assign( state, pick( spec, keys( state )) )
  t.deepEqual(state, origState)
})

test( 'Relay forwards API calls lazily.', (t) => {
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

