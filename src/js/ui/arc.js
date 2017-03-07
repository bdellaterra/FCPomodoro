import { assign, frozen, keys, pick, sealed } from '../utility/fn'
import { context } from './canvas'
import { ARC_CLOCK_ROTATION, ARC_CYCLE, ARC_ORIGIN
       } from '../utility/constants'
import makeDisplayer from './displayer'


// A partial circle
const makeArc = (spec) => {

  // Extends:
  const displayer = makeDisplayer(spec)

  // Initialize state.
  const state = sealed({
    start:              ARC_ORIGIN,
    end:                ARC_CYCLE,
    rotation:           ARC_CLOCK_ROTATION,
    isCounterclockwise: false,
    isInverse:          false,
    radius:             100,
    lineWidth:          5,
    strokeStyle:        'blue'
  })

  // Adjust state to spec.
  assign(state, pick(spec, keys(state)))

  // Draw the arc.
  const render = () => {
    let start = state.start + state.rotation,
        end = state.end + state.rotation
    if (state.isInverse) {
      [start, end] = [end, start]
    }
    context.beginPath()
    context.lineWidth = state.lineWidth
    context.arc( displayer.getX(), displayer.getY(), state.radius,
                 start, end, state.isCounterclockwise )
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

  // Return rotation in radians.
  const getRotation = () => state.rotation

  // Set rotation to the specified radian value.
  const setRotation = (v) => state.rotation = v

  // Return width of arc line in pixels.
  const getLineWidth = () => state.lineWidth

  // Set width of arc line to specified pixel value.
  const setLineWidth = (v) => state.lineWidth = v

  // Return stroke style.
  const getStrokeStyle = () => state.strokeStyle

  // Set the stroke style.
  const setStrokeStyle = (v) => state.strokeStyle = v

  // Return boolean indicating if the arc runs counterclockwise.
  const isCounterclockwise = () => state.isCounterclockwise

  // Set boolean indicating whether the arc runs counterclockwise.
  const setCounterclockwise = (v) => state.isCounterclockwise = v

  // Return boolean indicating if the arc is inverted.
  const isInverse = () => state.isInverse

  // Set boolean indicating whether the arc is inverted.
  const setInverse = (v) => state.isInverse = v

  // Return Interface.
  return frozen({
    ...displayer,
    getEnd,
    getLineWidth,
    getRadius,
    getRotation,
    getStart,
    getStrokeStyle,
    isCounterclockwise,
    isInverse,
    render,
    setCounterclockwise,
    setEnd,
    setInverse,
    setLineWidth,
    setRadius,
    setRotation,
    setStart,
    setStrokeStyle
  })

}


export default makeArc
