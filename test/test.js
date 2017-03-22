var test = require(process.env.JS_TEST_LIB).test

import now from 'present'


test('now() returns sequential timestamps.', (t) => {
  t.true(now() < now())
})

