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
import { sleep, makePacer, makeDeltaGen } from './time'
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

function* sandwich(g) {
  let layers = ['bread', 'meat', 'cheese', 'pickles', 'condiments'],
      i = 0
  while (i < layers.length) {
    console.log(layers[i])
    i += 1
    yield
  }
}

const saySomething = (t, d) => console.log('Something!', t)
const saySomethingElse = (t, d) => console.log('Aardvark!', t)

let secondsGen = makeDeltaGen({ interval: 2, callbacks: [saySomething] })
console.log('NumCallbacks:', secondsGen.numCallbacks())
console.log('NumCallbacks:', secondsGen.addCallback(saySomethingElse))
console.log(secondsGen.next(now()))
console.log(secondsGen.next(now()))
console.log(secondsGen.next(now()))
secondsGen.removeCallback(saySomething)
console.log(secondsGen.next(now()))
console.log(secondsGen.next(now()))
console.log(secondsGen.next(now()))

// console.log(secondsGen.next(now()))
// console.log(secondsGen.next(now()))
// console.log(secondsGen.next(now()))
// console.log(secondsGen.next(now()))
// console.dir(secondsGen.getCallbacks())

// let pacer = makePacer()
// pacer.addUpdate(countTo(15))
// pacer.addUpdate(alphaTo('m'))
// pacer.addUpdate(stooges('m'))
// pacer.run(1000)

// const makeP = (value = 5, timeout = 1000) => {
//  return new Promise((resolve, reject) => {
//    setTimeout(() => {
//      resolve(value)
//    }, timeout)
//  })
// }
//
// function* pCount(limit = 50) {
//  let x = 1
//  while (x <= limit) {
//    yield makeP(x)
//    x += 1
//  }
// }
//
// const asyncCount = async (limit = 50) => {
//  console.log('Begin Counting...')
//  let gen = pCount(limit)
//  let n = gen.next()
//  while (!n.done) {
//    let r = await n.value
//    console.log('got:', r)
//    n = gen.next()
//  }
// }
//
// const nextP = (pIterator) => {
//  const n = pIterator.next()
//  if (!n.done) {
//    return n.value
//  }
// }

// // Asynchronous generator - a generator that yields promises
// function* wait() {
//  let x = 1
//  while (true) {
//    // console.log('...')
//    yield sleep(1000).then(() => x++)
//  }
// }
//
// const add = (x, y) => x + y
//
// function* countTo(limit) {
//  let x = 1
//  while (x <= limit) {
//    // console.log(x)
//    yield x++
//  }
// }
//
// function* count4Eva() {
//  let x = 1
//  while (true) {
//    yield x++
//  }
// }
//
// function* alphaTo(limit) {
//  const alpha = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i',
//                 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r',
//                 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']
//  let l,
//      i = 0
//  while (l !== limit && i < alpha.length) {
//    l = alpha[i++]
//    yield l
//  }
// }
//
// // let pacer = makePacer()
// function* asyncCountTo(limit = 50, timeout = 1000) {
//  let c = 0
//  while (c < limit) {
//    c += 1
//    // yield c++
//    yield new Promise((resolve, reject) => {
//      setTimeout(() => {
//        resolve(c)
//      }, timeout)
//    })
//  }
// }
//
// const iterateACT = async () => {
//  let i = asyncCountTo(5)
//  let c = i.next()
//  while (!c.done) {
//    await c.value.then((r) => console.log('got:', r))
//    c = i.next()
//  }
// }
// iterateACT()


// const pFact = () => {
//  return new Promise((resolve, reject) => {
//    setTimeout(() => {
//      let time = now()
//      console.log('Just got the time:', time)
//      resolve(time)
//    }, 1000)
//  })
// }
//
// let pGenCount = 20
// function* pGen() {
//  let finished = false
//  while (!finished && pGenCount-- > 0) {
//    let p = pFact()
//    p.then((r) => finished = r > 10000)
//    yield p
//  }
// }
//
// const iteratePGen = async () => {
//  let i = pGen()
//  let n = i.next()
//  while (!n.done) {
//    let v = await n.value
//    console.log(v)
//    n = i.next()
//  }
// }
// iteratePGen()

// const pmake = (message, timeout = 1) => {
//  return new Promise((resolve, reject) => {
//    setTimeout(() => {
//      console.log(message)
//      resolve(1)
//    }, timeout)
//  })
// }
//
// const pal = (i = 0, timeout = 1) => {
//  const alpha = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i',
//                 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r',
//                 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']
//  return new Promise((resolve, reject) => {
//    setTimeout(() => {
//      resolve(alpha[i])
//    }, timeout)
//  })
// }
//
// function* ralph(i, timeout) {
//  while (i < 26) {
//    yield pal(i++, timeout)
//  }
// }
//
// // Logs
// // 3 (after 1 second)
// // 2 (after 1 more second)
// // 1 (after 1 more second)
// most.generate(ralph, 0, 1000)
//  .observe((x) => console.log(x))


// pacer.addUpdate(pmake('First Promise!', 1))
// pacer.addUpdate(pmake('2nd promizzy', 1000))
// pacer.addUpdate(pmake('#3 p', 3000))
// pacer.run()

