
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

// Minimal null-form of an iterator.
export const isIterable = (x) => x && typeof x[Symbol.iterator] === 'function'

// Increment each iterator in a list, removing those that are done.
// If an optional value is provided it is passed during each call to next().
export const filterNext = (iters, v) => iters.filter((i) => !i.next(v).done)

