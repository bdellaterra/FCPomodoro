
// Time units from a base of one millisecond.

export const MILLISECONDS_PER_SECOND = 1000
export const SECONDS_PER_MINUTE = 60
export const MINUTES_PER_HOUR = 60
export const SECONDS_PER_HOUR = SECONDS_PER_MINUTE * MINUTES_PER_HOUR

export const MILLISECOND = 1
export const SECOND = MILLISECOND * MILLISECONDS_PER_SECOND
export const MINUTE = SECOND * SECONDS_PER_MINUTE
export const HOUR = MINUTE * MINUTES_PER_HOUR

// Arc units in radians

export const ARC_ORIGIN = 0
export const ARC_CYCLE = 2 * Math.PI
export const ARC_CLOCK_ROTATION = -0.5 * Math.PI

