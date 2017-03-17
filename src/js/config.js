import { MINUTE, SECOND } from './utility/constants'

// Time settings

export const DEFAULT_SESSION_TIME = 45 * MINUTE
export const DEFAULT_BREAK_TIME = 15 * MINUTE

// Text

export const READOUT_START_TXT = 'START'
export const MESSAGE_RUN_TXT = 'Click to Run Timer'
export const INPUT_CANCEL_TXT = 'Click Here to Cancel Input'

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

export const BREAK_MINUTES_STYLE = 'rgb(15, 190, 135)'
export const BREAK_CURSOR_STYLE = 'rgb(0, 100, 15)'
export const BREAK_CURSOR_STYLE_2 = CURSOR_STROKE_STYLE_2

