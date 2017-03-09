import { assign, frozen, keys, pick, sealed } from '../utility/fn'
import { msecsToHours, msecsToMinutes, msecsToSeconds } from '../utility/conv'
import { MINUTES_PER_HOUR, SECONDS_PER_MINUTE } from '../utility/constants'

// Pull DOM elements into an object.
const El = {}
;['digitalTime', 'sessionHours', 'sessionMinutes', 'sessionSeconds',
  'breakHours', 'breakMinutes', 'breakSeconds']
  .map( (e) => El[e] = document.getElementById(e) )

const addInputs = () => {
  var c = document.createDocumentFragment()
  for (var i = 0; i < 10000; i++) {
    var e = document.createElement('div')
    e.className = 'test-div'
    c.appendChild(e)
  }
  document.body.appendChild(c)
}

// Pad numers less than ten with a leading zero.
// Assumes argument is a positive number.
const zeroPad = (n) => (n < 10 ? '0' : '') + n

// Converts a millisecond time value to HH:MM:SS formatted string.
const formatTime = (t) => {
  const time = Math.max(0, t)
  let hours = Math.floor(msecsToHours(t))
  let minutes = Math.floor(msecsToMinutes(t) % MINUTES_PER_HOUR)
  let seconds = msecsToSeconds(t) % SECONDS_PER_MINUTE
  // Round away from zero so that rollovers seem "sharper"
  if (seconds < 1) {
    seconds = Math.round(seconds) % SECONDS_PER_MINUTE
  } else {
    seconds = Math.floor(seconds)
  }
  return [hours, minutes, seconds]
    .map(zeroPad).join(':')
}

// Update digital time display based on the millisecond time value provided.
export const displayDigitalTime = (time = 0) => {
  El.digitalTime.innerHTML = formatTime(time)
}

