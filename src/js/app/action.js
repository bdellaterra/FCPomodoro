import { frozen } from '../utility/fn'
// import { mapValues } from '../utility/fn'
// import model from './model'

// USAGE NOTE: This module is part of a Sate-Action-Model (SAM) pattern.


export const action = frozen({
  session: { onBreak: false },
  break:   { onBreak: true },
  start:   { isRunning: true },
  stop:    { isRunning: false },
  input:   { hasInput: true },
  cancel:  { hasInput: false }
})


export default action
