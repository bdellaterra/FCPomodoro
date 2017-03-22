
// Time units from a base of one millisecond.
// ============================================================================

export const MILLISECONDS_PER_SECOND = 1000
export const SECONDS_PER_MINUTE = 60
export const MINUTES_PER_HOUR = 60
export const SECONDS_PER_HOUR = SECONDS_PER_MINUTE * MINUTES_PER_HOUR
export const MILLISECONDS_PER_MINUTE
               = MILLISECONDS_PER_SECOND * SECONDS_PER_MINUTE
export const MILLISECONDS_PER_HOUR = MILLISECONDS_PER_SECOND * SECONDS_PER_HOUR

export const MILLISECOND = 1
export const SECOND = MILLISECOND * MILLISECONDS_PER_SECOND
export const MINUTE = SECOND * SECONDS_PER_MINUTE
export const HOUR = MINUTE * MINUTES_PER_HOUR

// Quick enough to barely be noticable.
export const BLINK = SECOND / 5

// Safe delay for testing asynchronous timing operations
export const JIFFY = 50

// Margin of error to account for time-shift during operations
export const MICROJIFFY = JIFFY / 5

// For testing close-to-exact time values
export const NANOJIFFY = JIFFY / 10


// Arc units based in radians
// ============================================================================

export const ARC_ORIGIN = 0
export const ARC_CYCLE = 2 * Math.PI
export const ARC_CLOCK_ROTATION = -0.5 * Math.PI

export const DEGREES_PER_CYCLE = 360
export const DEGREES_PER_HALF_CYCLE = DEGREES_PER_CYCLE / 2

