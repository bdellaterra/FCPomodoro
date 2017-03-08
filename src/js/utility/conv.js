
export const degToRadians = (deg) => deg * Math.PI / 180

export const msecsToSeconds = (ms) => ms / 1000
export const msecsToMinutes = (ms) => ms / 1000 / 60
export const msecsToHours = (ms) => ms / 1000 / 3600

export const timeToDegrees = (t) => t * 6
export const timeToRadians = (t) => degToRadians(timeToDegrees(t))

