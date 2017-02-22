
// Minimum milisecond delay for safely testing asyncronous timing
export const jiffy = 50

// Returns a promise that resolves after specified timeout in miliseconds
export function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms))
}

