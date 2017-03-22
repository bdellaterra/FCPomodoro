var test = require(process.env.JS_TEST_LIB).test

import { JIFFY, MICROJIFFY, NANOJIFFY } from '../src/js/utility/constants'
import { filterNext, isIterable, nullIterator, once
       } from '../src/js/utility/iter'
import { sleep } from '../src/js/time/sleep'
import now from 'present'

test('Null iterator is iterable.', (t) => {
  t.true( isIterable(nullIterator) )
})

test('Once produces iterator.', (t) => {
  t.true( isIterable(once()) )
})

test('Once() allows a single iteration.', (t) => {
  let i = once(() => 0)
  i.next()
  t.true( i.next().done )
})

test('filerNext() removes iterators that are done.', (t) => {
  let i = once(() => 0),
      arr = [nullIterator, i]
  t.true( arr.length === 2 )
  t.true( filterNext(arr).length === 1 )
  t.true( filterNext(arr).length === 0 )
})

