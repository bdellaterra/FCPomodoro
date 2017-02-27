/* global DEBUG */
import '../css/styles.css'

import { from, fromPromise, just } from 'most'
import now from 'present'

import { assign, frozen, keys, pick, sealed } from './fn'
// import { degToRadians, msecsToHours, msecsToMinutes,
//         msecsToSeconds, timeToDegrees, timeToRadians } from './conv'
// import { sleep, jiffy, delta } from './time'
// import { nullIterator } from './util'
//
import { sleep, makePacer, makeTimer } from './time'
// import makeTimer from './timer'
// import makeArcTimer from './arcTimer'

function* countTo(limit) {
  let x = 1
  while (x <= limit) {
    // console.log(x)
    yield x++
  }
}

function* spellTo(limit) {
  let az = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
                'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'],
      i = 0,
      l = az[i++]
  while (i < az.length) {
    //    console.log(l)
    yield l
    l = az[i++]
  }
}

var p = new Promise((resolve, reject) => {
  setTimeout(() => resolve(4), 2000)
})

const valStream = just('hello')
valStream.observe((x) => console.log(x))

const promiseStream = fromPromise(p)
promiseStream.observe((r) => console.log('promiseStream returned:', r))
p.then(() => console.log('Promise resolved!'))

const containerStream = from([1, 2, 3, 4, 5])
containerStream.forEach((v) => console.log(v))

const generatorStream = from(spellTo('z'))
generatorStream.take(5).forEach((v) => console.log(v))

