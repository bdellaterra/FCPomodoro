import lodashIsFunction from 'lodash/isFunction'
import lodashMapValues from 'lodash/mapValues'
import lodashOmit from 'lodash/omit'
import lodashPick from 'lodash/pick'
import lodashPickBy from 'lodash/pickBy'

export const assign = Object.assign
export const frozen = Object.freeze
export const isFunction = lodashIsFunction
export const keys = Object.keys
export const mapValues = lodashMapValues
export const omit = lodashOmit
export const pick = lodashPick
export const pickBy = lodashPickBy
export const sealed = Object.seal


// Relay the interface of a dynamic sub-object so functions will reference
// the current value instead of being tied to the original.
export const relay = (obj = {}, key = '') => {
  const r = {}
  if (obj[key] && typeof obj[key] === 'object') {
    const t = {}
    assign(r, pickBy(obj[key], isFunction))
    keys(r).map((f) => r[f] = (...params) => obj[key][f](...params))
  }
  return r
}

