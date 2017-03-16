
// Minimal null-form of a generator.
export const nullGenerator = (function* () {})

// Minimal null-form of an iterator.
export const nullIterator = nullGenerator()

// Get access to the GeneratorFuction constructor.
export const GeneratorFunction
  = Object.getPrototypeOf(nullGenerator).constructor

// Generator that will execute the provided callback a single time.
export function* once(cb, ...args) {
  yield cb(...args)
}
// Return iterator
// export const once = (cb, ...args) => {
//   return (function* (cb, ...args) {
//     yield cb(...args)
//   }())
// }


// Minimal null-form of an iterator.
export const isIterable = (x) => x && typeof x[Symbol.iterator] === 'function'

// Iterate each generator in a list, removing those that are done.
// If an optional value is provided it is passed to the generators.
export const filterNext = (gs, v) => gs.filter((g) => !g.next(v).done)

