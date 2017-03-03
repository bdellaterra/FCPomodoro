
// Minimal null-form of an iterator.
export const nullIterator = (function* () {}())

// Iterate each generator in a list, removing those that are done.
// If an optional value is provided it is passed to the generators.
export const filterNext = (gs, v) => {
  return gs.filter((gen) => {
    let { done } = gen.next(v)
    return !done
  })
}

