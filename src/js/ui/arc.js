import { context } from './canvas'
import makeDisplayer from './displayer.js'
import { assign, frozen, keys, pick, sealed } from './fn'

const makeArc = (spec) => {
  const displayer = makeDisplayer(spec)
  const state = sealed({
    start:       -0.5 * Math.PI,
    end:         1.5 * Math.PI,
    radius:      100,
    lineWidth:   5,
    strokeStyle: 'blue'
  })
  assign(state, pick(spec, keys(state)))
  return frozen({
    ...displayer,
    draw: () => {
      context.beginPath()
      context.lineWidth = state.lineWidth
      context.arc( displayer.getX(), displayer.getY(),
                   state.radius, state.start, state.end )
      context.strokeStyle = state.strokeStyle
      context.stroke()
    },
    getStart:     () => state.start,
    setStart:     (v) => state.start = v,
    getEnd:       () => state.end,
    setEnd:       (v) => state.end = v,
    getRadius:    () => state.radius,
    setRadius:    (v) => state.radius = v,
    getLineWidth: () => state.lineWidth,
    setLineWidth: (v) => state.lineWidth = v
  })
}

export default makeArc
