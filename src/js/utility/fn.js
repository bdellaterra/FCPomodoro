import lodashMapValues from 'lodash/mapValues'
import lodashOmit from 'lodash/omit'
import lodashPick from 'lodash/pick'
import lodashPickBy from 'lodash/pickBy'

export const assign = Object.assign
export const frozen = Object.freeze
export const keys = Object.keys
export const mapValues = lodashMapValues
export const omit = lodashOmit
export const pick = lodashPick
export const pickBy = lodashPickBy
export const sealed = Object.seal

// Relay the function interface of an object in a lazy manner so function calls
// will reference a new object if the original is replaced.
export const relay = (obj) => {
  const facade = {}
  if (typeof obj === 'object') {
    keys(obj).map((key) => {
      if (typeof obj[key] === 'function') {
        facade[key] = (...args) => obj[key](...args)
      }
    })
  }
  return facade
}

// Convert the provided function to a closure. It will have private access to
// an object named 'state', which it must accept as it's first parameter.
// The state object can be initialized via a 2nd argument to the constructor.
// Returns function with the same signature minus the inital state parameter.
export const enclose = (func, initialState = {}) => (() => {
  let state = initialState
  return (...args) => func(state, ...args)
})()

