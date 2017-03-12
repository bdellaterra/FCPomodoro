import { mapValues } from '../utility/fn'
import { present } from './model'

// USAGE NOTE: This code is based on the Sate-Action-Model methodology. (SAM)


export const action = mapValues({
  session: { onBreak: false },
  break:   { onBreak: true },
  start:   { isRunning: true },
  stop:    { isRunning: false },
  input:   { hasInput: true }
}, (v) => () => present(v) )


export default action
