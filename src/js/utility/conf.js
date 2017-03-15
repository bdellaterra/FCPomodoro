import { MILLISECONDS_PER_MINUTE, MILLISECONDS_PER_SECOND } from './constants'

// Time settings

export const DEFAULT_SESSION_TIME = 15 * MILLISECONDS_PER_SECOND
export const DEFAULT_BREAK_TIME = 15 * MILLISECONDS_PER_MINUTE

// Styles

export const DEFAULT_ARC_RADIUS = 200
export const DEFAULT_ARC_LINE_WIDTH = 18
export const DEFAULT_ARC_STROKE_STYLE = 'blue'

export const CURSOR_RADIUS = DEFAULT_ARC_RADIUS
export const CURSOR_LINE_WIDTH = DEFAULT_ARC_LINE_WIDTH - 2
export const CURSOR_STROKE_STYLE_1 = 'rgb(0, 20, 250)'
export const CURSOR_STROKE_STYLE_2 = 'rgb(245, 245, 245)'

export const HOURS_RADIUS = DEFAULT_ARC_RADIUS
export const HOURS_LINE_WIDTH = DEFAULT_ARC_LINE_WIDTH
export const HOURS_STROKE_STYLE = 'rgb(15, 12, 5)'

export const MINUTES_RADIUS = DEFAULT_ARC_RADIUS
export const MINUTES_LINE_WIDTH = DEFAULT_ARC_LINE_WIDTH
export const MINUTES_STROKE_STYLE = 'rgb(35, 170, 250)'

export const SECONDS_RADIUS = DEFAULT_ARC_RADIUS - 8
export const SECONDS_LINE_WIDTH = 2
export const SECONDS_STROKE_STYLE = 'rgb(0, 0, 0)'

export const BREAK_RADIUS = MINUTES_RADIUS
export const BREAK_LINE_WIDTH = MINUTES_LINE_WIDTH
export const BREAK_STROKE_STYLE = 'rgb(15, 190, 125)'
export const BREAK_STROKE_STYLE_2 = 'rgb(10, 20, 50)'

