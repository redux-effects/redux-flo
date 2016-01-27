/**
 * Import
 */

import toPromise from '@f/to-promise'
import map from '@f/map'
import identity from '@f/identity'
import isIterator from '@f/is-iterator'
import isGenerator from '@f/is-generator'
import isPromise from '@f/is-promise'
import isFunctor from '@f/is-functor'
import isFunction from '@f/is-function'

const FLO = 'FLO'

/**
 * Flo middleWare
 * @param  {Function} errorHandler=defaultErrorHandler
 * @param  {Function} successHandler=identity
 * @return {Function} Redux middleware
 */

function flow (errorHandler = defaultErrorHandler, successHandler = identity) {
  return ({dispatch}) => next => action => {
    let promise
    if (isFunctor(action) || isGenerator(action) || isIterator(action)) {
      promise = toPromise(map(dispatch, action))
    } else if (isPromise(action) || isFunction(action)) {
      promise = toPromise(action)
    } else {
      return next(action)
    }
    return promise.then(successHandler, errorHandler)
  }
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

export default flow
