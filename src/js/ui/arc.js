import { context } from './canvas'
import makeDisplayer from './displayer.js'
import { assign, frozen, keys, pick, sealed } from '../utility/fn'


// A partial circle
const makeArc = (spec) => {

  // Extends:
  const displayer = makeDisplayer(spec)

  // Initialize state.
  const state = sealed({
    start:       -0.5 * Math.PI,
    end:         1.5 * Math.PI,
    radius:      100,
    lineWidth:   5,
    strokeStyle: 'blue'
  })

  // Adjust state to spec.
  assign(state, pick(spec, keys(state)))

  // Draw the arc.
  const render = () => {
    context.beginPath()
    context.lineWidth = state.lineWidth
    context.arc( displayer.getX(), displayer.getY(),
                 state.radius, state.start, state.end )
    context.strokeStyle = state.strokeStyle
    context.stroke()
  }

  // Return start location of arc in radians.
  const getStart = () => state.start

  // Set start location of arc to radian value.
  const setStart = (v) => state.start = v

  // Return end location of arc in radians.
  const getEnd = () => state.end

  // Set end location of arc to radian value.
  const setEnd = (v) => state.end = v

  // Return radius of arc in pixels.
  const getRadius = () => state.radius

  // Set radius of arc to specified pixel length.
  const setRadius = (v) => state.radius = v

  // Return width of arc line in pixels.
  const getLineWidth = () => state.lineWidth

  // Set width of arc line to specified pixel value.
  const setLineWidth = (v) => state.lineWidth = v

  // Return Interface.
  return frozen({
    ...displayer,
    getEnd,
    getLineWidth,
    getRadius,
    getStart,
    render,
    setEnd,
    setLineWidth,
    setRadius,
    setStart
  })

}


export default makeArc
