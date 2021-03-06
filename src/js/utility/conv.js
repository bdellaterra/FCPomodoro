import { DEGREES_PER_HALF_CYCLE, MILLISECONDS_PER_HOUR,
         MILLISECONDS_PER_MINUTE, MILLISECONDS_PER_SECOND,
         MINUTES_PER_HOUR, SECONDS_PER_MINUTE
       } from 'utility/constants'

// Convert degrees to radians
export const degToRadians = (deg) => deg * Math.PI / DEGREES_PER_HALF_CYCLE

// Convert time values
export const msecsToSeconds = (ms) => ms / MILLISECONDS_PER_SECOND
export const msecsToMinutes = (ms) => ms / MILLISECONDS_PER_MINUTE
export const msecsToHours = (ms) => ms / MILLISECONDS_PER_HOUR
export const secondsToMsecs = (s) => s * MILLISECONDS_PER_SECOND
export const minutesToMsecs = (m) => m * MILLISECONDS_PER_MINUTE
export const hoursToMsecs = (h) => h * MILLISECONDS_PER_HOUR

// Converts a millisecond time value to HH:MM:SS formatted string.
export const formatTime = (t) => {
  const time = Math.max(0, t),
        zeroPad = (n) => (n < 10 ? '0' : '') + n
  let hours = Math.floor(msecsToHours(t))
  let minutes = Math.floor(msecsToMinutes(t) % MINUTES_PER_HOUR)
  let seconds = msecsToSeconds(t) % SECONDS_PER_MINUTE
  // Round away from zero so that rollovers seem "sharper"
  if (seconds < 1) {
    seconds = Math.round(seconds) % SECONDS_PER_MINUTE
  } else {
    seconds = Math.floor(seconds)
  }
  return [hours, zeroPad(minutes), zeroPad(seconds)].join(':')
}

// Calculate total time in milliseconds using hours/minutes/seconds values.
export const calcTime = ({ hours, minutes, seconds }) => {
  return hoursToMsecs(hours)
    + minutesToMsecs(minutes)
    + secondsToMsecs(seconds)
}

