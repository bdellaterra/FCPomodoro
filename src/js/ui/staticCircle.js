import { HOUR } from 'utility/constants'
import { CIRCLE_LINE_WIDTH, CIRCLE_RADIUS, CIRCLE_STROKE_STYLE,
         HOURS_LINE_WIDTH, HOURS_RADIUS, HOURS_STROKE_STYLE
       } from 'config'
import { assign, frozen, keys, pick, sealed } from 'utility/fn'
import { context } from 'ui/canvas'
import { makeArcTimer } from 'ui/arcTimer'
import { once } from 'utility/iter'


// Create a full-circle that remains in place.
export const makeStaticCircle = (spec) => {

  // Extends:
  const arcTimer = makeArcTimer({
    radius:      CIRCLE_RADIUS,
    lineWidth:   CIRCLE_LINE_WIDTH,
    strokeStyle: CIRCLE_STROKE_STYLE,
    ...spec
  })

  // Don't style. Just remain a full-circle.
  const style = Function.prototype

  // Render the circle, adjusting opacity via the context alpha setting.
  const render = (time) => {
    arcTimer.render(0)
    return time
  }

  // Setup animation callbacks.
  const animate = () => {
    arcTimer.addRender(render)
  }

  // Teardown animation callbacks.
  const deanimate = () => {
    arcTimer.removeRender(render)
  }

  // Perform initialization.
  animate()

  // Return Interface.
  return frozen({
    ...arcTimer,
    animate,
    deanimate,
    render,
    style
  })

}


export default makeStaticCircle
