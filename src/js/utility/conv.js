export const degToRadians = (deg) => deg * Math.PI / 180
export const msecsToHours = (ms) => ms / 1000 / 360
export const msecsToMinutes = (ms) => ms / 1000 / 60
export const msecsToSeconds = (ms) => ms / 1000
export const timeToDegrees = (t) => t * 6
export const timeToRadians = (t) => degToRadians(timeToDegrees(t))
