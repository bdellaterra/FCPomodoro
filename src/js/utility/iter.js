
// Minimal null-form of an iterator.
export const nullIterator = (function* () {}())

// Minimal null-form of an iterator.
export const isIterable = (x) => x && typeof x[Symbol.iterator] === 'function'

// Iterate each generator in a list, removing those that are done.
// If an optional value is provided it is passed to the generators.
export const filterNext = (gs, v) => gs.filter((g) => !g.next(v).done)

