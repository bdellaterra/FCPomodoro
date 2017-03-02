/* global DEBUG */
import '../css/styles.css'

import now from 'present'
import * as most from 'most'

import { assign, frozen, keys, pick, sealed } from './fn'
// import { degToRadians, msecsToHours, msecsToMinutes,
//         msecsToSeconds, timeToDegrees, timeToRadians } from './conv'
// import { sleep, jiffy, delta } from './time'
// import { nullIterator } from './util'
//
import { sleep, makePacer, makeTimer } from './time'
// import makeTimer from './timer'
// import makeArcTimer from './arcTimer'

// Asynchronous generator - a generator that yields promises
function* wait() {
  let x = 1
  while (true) {
    // console.log('...')
    yield sleep(1000).then(() => x++)
  }
}

const add = (x, y) => x + y

function* countTo(limit) {
  let x = 1
  while (x <= limit) {
    // console.log(x)
    yield x++
  }
}

function* count4Eva() {
  let x = 1
  while (true) {
    delay(1000)
    yield x++
  }
}

function* alphaTo(limit) {
  const alpha = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i',
                 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r',
                 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']
  let l,
      i = 0
  while (l !== limit && i < alpha.length) {
    l = alpha[i++]
    yield l
  }
}

let pacer = makePacer()

const pmake = (message, timeout = 1) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log(message)
      resolve(1)
    }, timeout)
  })
}

pacer.addUpdate(pmake('First Promise!', 1))
pacer.addUpdate(pmake('2nd promizzy', 1000))
pacer.addUpdate(pmake('#3 p', 3000))
pacer.run()

