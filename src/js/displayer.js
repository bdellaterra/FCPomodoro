import canvas from './canvas'
import { assign, frozen, keys, pick, sealed } from './fn'
import makeEntity from './entity'

const makeDisplayer = (spec) => {
  const entity = makeEntity(spec)
  const initState = {
    x: canvas.width / 2,
    y: canvas.height / 2
  }
  const state = sealed({ ...initState })
  assign(state, pick(spec, keys(state)))
  return frozen({
    ...entity,
    getX: () => state.x,
    setX: (v) => state.x = v,
    getY: () => state.y,
    setY: (v) => state.y = v
  })
}

export default makeDisplayer
