import 'css/styles.css'

import { makeCountdownTimer } from 'time/countdownTimer'
import { sleep } from 'time/sleep'

let t = makeCountdownTimer()

t.countdown(3000)

console.log(t.remaining())

t.waitAlarm()
  .then(() => console.log('Wake up!'))
  .catch(() => console.log('...zzzzzzzzzzzz...'))

sleep(3000).then(t.sync)

// import { init } from 'app'

// function* notifyer(cb) {
//   cb()
// }
//
// let state = {}
//
// state.promise = new Promise((resolve) => {
//   state.notifyer = (function* () { resolve() }())
// })
//
// state.promise.then((res) => console.log('Promise done!', res))
//
// function* timer() {
//   let currentTime = -1
//   while (currentTime = yield) {
//     console.log('current time:', currentTime)
//   }
//   state.notifyer.next(7)
//   console.log('timer done.')
// }
//
// let t = timer()
//
// let now = 5
// const sync = () => {
//   t.next(now--)
// }
//
// sync()
// sync()
// sync()
// sync()
// sync()
// sync()
//
// let w = state.promise
// w.then(() => console.log('You woke me up too!'))

