import { assign, frozen, keys, pick, sealed } from '../utility/fn'
import canvas from './canvas'
import makeEntity from './entity'

// USAGE NOTE: X,Y coordinates are pixel offsets from the top left corner.


// Create an entity that has a display location on the canvas.
// Centered by default.
const makeDisplayer = (spec) => {

  // Extends:
  const entity = makeEntity(spec)

  // Initial state will be restored upon reset.
  const initState = {
    x: canvas.width / 2,
    y: canvas.height / 2
  }

  // Adjust state to spec.
  const state = sealed({ ...initState })
  assign(state, pick(spec, keys(state)))

  // Return the x coordinate
  const getX = () => state.x

  // Set the x coordinate to the specified pixel value.
  const setX = (v) => state.x = v

  // Return the y coordinate
  const getY = () => state.y

  // Set the x coordinate to the specified pixel value.
  const setY = (v) => state.y = v

  // Return Interface.
  return frozen({
    ...entity,
    getX,
    getY,
    setX,
    setY
  })

}


export default makeDisplayer
