/* global DEBUG */
import '../css/styles.css'

import { makeDeltaGen } from './time/deltaGen'
import { makePacer } from './time/pacer'
import { makeTimer } from './time/timer'
import sleep from './time/sleep'

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

let sw = sandwich()

const saySomething = (t, d) => console.log('Something!', t)
const saySomethingElse = (t, d) => console.log('Aardvark!', t)

let secondsGen = makeDeltaGen({ interval: 1000, callbacks: [saySomething] })
let doubleSecondsGen = makeDeltaGen({ interval: 2000 })
doubleSecondsGen.addCallback(saySomethingElse)

let pacer = makePacer()
pacer.addUpdate(secondsGen)
pacer.addUpdate(doubleSecondsGen)
pacer.run()
sleep(8000).then(() => secondsGen.addCallback(() => sw.next()))

