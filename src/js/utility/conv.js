import { DEGREES_PER_HALF_CYCLE, MILLISECONDS_PER_HOUR,
         MILLISECONDS_PER_MINUTE, MILLISECONDS_PER_SECOND
       } from './constants'

export const degToRadians = (deg) => deg * Math.PI / DEGREES_PER_HALF_CYCLE

export const msecsToSeconds = (ms) => ms / MILLISECONDS_PER_SECOND
export const msecsToMinutes = (ms) => ms / MILLISECONDS_PER_MINUTE
export const msecsToHours = (ms) => ms / MILLISECONDS_PER_HOUR

export const secondsToMsecs = (s) => s * MILLISECONDS_PER_SECOND
export const minutesToMsecs = (m) => m * MILLISECONDS_PER_MINUTE
export const hoursToMsecs = (h) => h * MILLISECONDS_PER_HOUR

