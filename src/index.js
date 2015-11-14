import toPromise from 'to-promise'

/**
 * Exports
 */

export default function genMiddleware(errorHandler=defaultErrorHandler, successHandler=identity) {
  return ({dispatch}) => next => action =>
    action && typeof action.map === 'function'
      ? toPromise(action.map(dispatch)).then(successHandler, errorHandler)
      : next(action)
}

function identity (v) {
  return v
}

function defaultErrorHandler (err) {
  assert(err instanceof Error, 'non-error thrown: ' + err)

  let msg = err.stack || err.toString()
  console.error()
  console.error(msg.replace(/^/gm, '  '))
  console.error()
  throw err
}
