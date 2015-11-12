/**
 * Exports
 */

 export default function mapMiddleware ({dispatch}) {
   return next => action =>
     action && typeof action.map === 'function'
       ? action.map(dispatch)
       : next(action)
 }
