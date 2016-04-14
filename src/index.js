/**
 * Imports
 */

import toPromise from '@f/to-promise'
import map from '@f/map'
import identity from '@f/identity'
import isIterator from '@f/is-iterator'
import isGenerator from '@f/is-generator'
import isPromise from '@f/is-promise'
import isFunctor from '@f/is-functor'
import isFunction from '@f/is-function'
import logError from '@f/log-error'

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
      promise = toPromise(map(action => action && dispatch(action), action))
    } else if (isPromise(action) || isFunction(action)) {
      promise = toPromise(action)
    } else {
      return next(action)
    }
    return promise.then(successHandler, errorHandler)
  }
}

/**
 * Default error handler
 *
 * Logs the error and then throws it again to pass it back
 * to the calling code
 */

function defaultErrorHandler (err) {
  logError(err)
  throw err
}

/**
 * Exports
 */

export default flow
