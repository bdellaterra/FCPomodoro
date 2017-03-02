
// Minimal null-form of an iterator.
export const nullIterator = (function* () {}())

// Iterate each generator in a list, removing those that are done.
export const filterNext = (gs) => {
  return gs.filter((gen) => {
    let n = gen.next()
    return !n.done
  })
}

