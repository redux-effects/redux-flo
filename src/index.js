/**
 * Import
 */

import toPromise from '@f/to-promise'
import map from '@f/map'
import identity from '@f/identity'

const FLO = 'FLO'

/**
 * Flo middleWare
 * @param  {Function} errorHandler=defaultErrorHandler
 * @param  {Function} successHandler=identity
 * @return {Function} Redux middleware
 */

function flow (errorHandler = defaultErrorHandler, successHandler = identity) {
  return ({dispatch}) => next => action =>
    action && action.type === FLO
      ? toPromise(map(dispatch, action.payload)).then(successHandler, errorHandler)
      : next(action)
}

/**
 * Logs errors and then throws
 * @param  {Error} err
 */

function defaultErrorHandler (err) {
  if (!(err instanceof Error)) {
    throw new TypeError('Non error thrown: ' + String(err))
  }

  let msg = err.stack || err.toString()
  console.error()
  console.error(msg.replace(/^/gm, '  '))
  console.error()
  throw err
}

/**
 * Flo action creator
 * @param  {Array|Object|Generator|Functor} obj
 * @return {Object}
 */

function flo (obj) {
  return {type: FLO, payload: obj}
}

export default flow
export {
  flo,
  flow
}
