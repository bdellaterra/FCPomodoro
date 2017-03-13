/* global DEBUG */
import '../css/styles.css'
import sleep from './time/sleep'
import makePeriodicDispatcher from './time/periodicDispatcher'

const pd = makePeriodicDispatcher(),
      onMs = () => console.log('ms'),
      onS = () => console.log('s'),
      on5S = () => console.log('5s')
pd.addCallback(onMs, 1)
pd.addCallback(onS, 1000)
pd.addCallback(on5S, 5000)
console.log(pd.numCallbacks())
pd.next()
pd.removeCallback(onMs, 1)
pd.addCallback(onMs, 1)
sleep(5000).then(() => pd.next())
console.log(pd.numCallbacks())
