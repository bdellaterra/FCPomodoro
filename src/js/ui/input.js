import { msecsToHours, msecsToMinutes, msecsToSeconds } from '../utility/conv'
import { MINUTES_PER_HOUR, SECONDS_PER_MINUTE } from '../utility/constants'

// DOM element containing digital time readout
const digitalTime = document.getElementById('digitalTime')

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
  const time = Math.max(0, t),
        seconds = Math.floor(msecsToSeconds(t) % SECONDS_PER_MINUTE),
        minutes = Math.floor(msecsToMinutes(t) % MINUTES_PER_HOUR),
        hours = Math.floor(msecsToHours(t))
  console.log(hours, minutes, seconds)
  return [hours, zeroPad(minutes), zeroPad(seconds)].join(':')
}

// Update digital time display based on the millisecond time value provided.
export const displayDigitalTime = (time = 0) => {
  digitalTime.innerHTML = formatTime(time)
}

