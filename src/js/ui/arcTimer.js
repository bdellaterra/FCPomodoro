import makeArc from './arc'
import makeTimer from '../time/timer.js'
import { assign, frozen, keys, pick, sealed } from '../utility/fn'
import { degToRadians, msecsToHours, msecsToMinutes, msecsToSeconds,
         timeToDegrees, timeToRadians
       } from '../utility/conv'


// Create an arc that updates itself over time.
export const makeArcTimer = (spec) => {

  // Extends:
  const arc = makeArc(spec),
        timer = makeTimer(spec)

  // Initialize state.
  // const state = sealed({})

  // Adjust state to spec.
  // assign(state, pick(spec, keys(state)))

  const baseStart = arc.getStart()
  const baseEnd = arc.getEnd()

  const update = (time) => {
    timer.update(time)
    let elapsed = timeToRadians(msecsToSeconds(timer.elapsed()))
    console.log('Arc Time:', elapsed)
    arc.setStart( baseStart )
    arc.setEnd( baseStart + elapsed )
    return time
  }

  // Return Interface.
  return frozen({
    ...arc,
    update
  })

}


export default makeArcTimer
