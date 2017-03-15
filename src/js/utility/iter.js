
// Minimal null-form of an iterator.
export const nullIterator = (function* () {}())

// Iterator that returns after executing provided callback a single time.
export function* once(cb, ...args) {
  yield cb(...args)
}

// Minimal null-form of an iterator.
export const isIterable = (x) => x && typeof x[Symbol.iterator] === 'function'

// Iterate each generator in a list, removing those that are done.
// If an optional value is provided it is passed to the generators.
export const filterNext = (gs, v) => gs.filter((g) => !g.next(v).done)

