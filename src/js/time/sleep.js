
// USAGE NOTE: All time values are in miliseconds, unless noted otherwise.

// Returns a promise that resolves after specified timeout.
export const sleep = (m) => {
  return new Promise((res) => setTimeout(res, m))
}

export default sleep
