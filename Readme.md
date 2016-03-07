# redux-flo

[![Build status][travis-image]][travis-url]
[![Git tag][git-image]][git-url]
[![NPM version][npm-image]][npm-url]
[![Code style][standard-image]][standard-url]

Redux style control flow middleware - inspired by haskel's free monad approach to io and [co](//github.com/tj/co).

## Installation

    $ npm install redux-flo

## Usage

```js
import flow from 'redux-flo'
import fetchMiddleware, {fetch} from 'redux-effects-fetch'
import {createStore, applyMiddleware} from 'redux'

const store = createStore(identity, applyMiddleware(flo(), fetchMiddleware))
const dispatch = store.dispatch

// simple parallel

dispatch([
  fetch('google.com'),
  fetch('facebook.com')
]).then(res => res /* [google, facebook] */)

// simple serial

dispatch(function * () {
  yield fetch('google.com') // google
  return yield fetch('facebook.com')
}).then(res => res /* facebook */)

// complex
dispatch(function * () {
  //sync
  yield fetch('google.com') // google
  yield fetch('facebook.com') // facebook
  //parallel
  yield [fetch('heroku.com'), fetch('segment.io')] // [heroku, segment]
  return 'done'
}).then(res => res /* 'done' */)
```

## API

### flow (errorHandler, successHandler)
FLO middleWare.

 - `errorHandler` - handles errors in flows (defualts to throws)
 - `successHandler` - handles successes in flow (defaults to identity function)

**Returns:** redux style middleware

Flo is simple and powerful:

**Functors and generators** will be mapped and converted to a promise (basically a map-reduce).
```js
toPromise(map(dispatch, action)).then(successHandler, errorHandler)
```

**Promises and thunks** are converted to a promise.
```js
toPromise(action).then(successHandler, errorHandler)
```

**All other types** (mostly we are talking about plain objects here) are passed down the middleware stack.

### Functors
Functors implement map. An array is a functor. A plain object is not. This is good, because we don't want Flo to handle plain objects. We can however coerce plain objects into functors, letting you define custome behavior for Flo. Here's an example:

```js
import flow from 'redux-flo'
import fetchMiddleware, {fetch} from 'redux-effects-fetch'
import bind from '@f/bind-middleware'
import ObjectF from '@f/obj-functor'

let dispatch = bind([flow(), fetchMiddleware])

dispatch(function * () {
  yield ObjectF({
    google: fetch('google.com'),
    facebook: fetch('facebook.com')
  }) // => {google: google, facebook: facebook}
})
```

## License

MIT

[travis-image]: https://img.shields.io/travis/redux-effects/redux-flo.svg?style=flat-square
[travis-url]: https://travis-ci.org/redux-effects/redux-flo
[git-image]: https://img.shields.io/github/tag/redux-effects/redux-flo.svg
[git-url]: https://github.com/redux-effects/redux-flo
[standard-image]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat
[standard-url]: https://github.com/feross/standard
[npm-image]: https://img.shields.io/npm/v/redux-flo.svg?style=flat-square
[npm-url]: https://npmjs.org/package/redux-flo
