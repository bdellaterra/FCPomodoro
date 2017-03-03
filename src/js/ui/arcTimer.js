import makeArc from './arc'
import makeTimer from './timer'
import { assign, frozen, keys, pick, sealed } from './fn'
import { degToRadians, msecsToHours, msecsToMinutes,
         msecsToSeconds, timeToDegrees, timeToRadians } from './conv'

const makeArcTimer = (spec) => {
  const arc = makeArc(spec)
  const state = sealed({ timer: makeTimer(spec) })
  assign(state, pick(spec, keys(state)))
  return frozen({
    ...arc,
    getTimer: () => state.timer,
    setTimer: (v) => state.timer = v,
    update:   (t) => {
      let time = t !== undefined ? t : state.timer.read()
      arc.setEnd( arc.getStart() + timeToRadians(msecsToSeconds(time)) )
      return time
    }
  })
}

export default makeArcTimer
