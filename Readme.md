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
import flow, {flo} from 'redux-flo'
import fetchMiddleware, {fetch} from 'redux-effects-fetch'
import bind from '@f/bind-middleware'

let dispatch = bind([flow(), fetchMiddleware])

// simple parallel

dispatch(flo([
  fetch('google.com'),
  fetch('facebook.com')]
)).then(res => res /* [google, facebook] */)

// or

dispatch(flo({
  google: fetch('google.com')
  facebook: fetch('facebook.com')
})).then(res => res /* {google: google, facebook: facebook} */)

// simple serial

dispatch(flo(function * () {
  yield fetch('google.com') // google
  return yield fetch('facebook.com')
})).then(res => res /* facebook */)

// complex
dispatch(flo(function * () {
  //sync
  yield fetch('google.com') // google
  yield fetch('facebook.com') // facebook
  //parallel
  yield flo([fetch('heroku.com'), fetch('segment.io')]) // [heroku, segment]
  // parallel
  yield flo({github: fetch('github.com'), travis: fetch('travis-ci.org')}) // {github: github, travis: travis-ci}
  return 'done'
})).then(res => res /* 'done' */)
```

## API

### flow (errorHandler, successHandler)
FLO middleWare.

 - `errorHandler` - handles errors in flows (defualts to logging and throwing errors)
 - `successHandler` - handles successes in flow (defaults to identity function)

**Returns:** redux style middleware

Flo is simple and powerful:

```js
action.type === FLO
  ? toPromise(map(dispatch, action.payload)).then(successHandler, errorHandler)
  : next(action)
```

`map` can map FLO payloads that are mappable (Arrays, Objects, Generators, and Functors). Arrays, Objects, and Generators have default map functions. If you want to create a custom flow, just add a map method to the FLO payload object.

`toPromise` is similar to the toPromise in [co](github.com/tj/co), but is not recursive. It can take Arrays, Objects, Generators, and Thunks.

### flo(obj)
FLO action creator

- `obj` - mappable object

**Returns:** FLO action

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
