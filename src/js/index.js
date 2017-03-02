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

function* countTo(limit) {
  let x = 1
  while (x <= limit) {
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

function* stooges() {
  let names = ['Larry', 'Curly', 'Moe', 'Shemp']
  for (let n in names) {
    yield names[n]
  }
}

const iterate = (gs) => {
  return gs.filter((gen) => {
    let n = gen.next()
    if (!n.done) { console.log(n.value) }
    return !n.done
  })
}

let gs = [countTo(15), alphaTo('m'), stooges()]

let guard = 50
while (gs.length > 0 && guard-- > 0) {
  gs = iterate(gs)
}

