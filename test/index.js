/**
 * Imports
 */

import test from 'tape'
import {flo, flow} from '../src'
import {stderr} from 'test-console'
import isFunction from '@f/is-function'
import compose from '@f/compose-middleware'
import isGenerator from '@f/is-generator'
import identity from '@f/identity'
import map from '@f/map'

/**
 * Tests
 */

var log = []
const doDispatch = (v) => {
  log.push(v)
}
const nextHandler = flow()({dispatch: doDispatch})

const wrapEach = function(fn) {
  return function(t) {
    // before
    log = []
    fn(t)
    //after
  }
}

test('is generator', t => {
  t.equal(isGenerator(map(identity, function * () {})), true)
  t.end()
})

test('must return a function to handle next', t => {
  t.plan(2)
  t.ok(isFunction(nextHandler))
  t.equal(nextHandler.length, 1)
})

test('handle next must return a function to handle action', t => {
  t.plan(2)

  const actionHandler = nextHandler()
  t.ok(isFunction(actionHandler))
  t.equal(actionHandler.length, 1)
})

test('must run the given action generator function with dispatch', wrapEach(t => {
  t.plan(1)

  const actionHandler = nextHandler();

  actionHandler(flo(function * () {
    yield 'foo'
    t.deepEqual(log, ['foo'])
  }))

}))

test('must run the given action generator object with dispatch', wrapEach(t => {
  t.plan(1)

  const actionHandler = nextHandler();

  actionHandler(flo((function * () {
    yield 'foo'
    t.deepEqual(log, ['foo'])
  })()))

}))

test('must pass action to next if not flo action', wrapEach(t => {

  const actionObj = {type: 'action', payload: 'foo'}

  const actionHandler = nextHandler(action => {
    t.equal(action, actionObj)
    t.end()
  })

  actionHandler(actionObj)
}))

test('must return the return value if not mappable', wrapEach(t => {
  t.plan(1)

  const expected = 'foo'
  const actionHandler = nextHandler(() => expected)

  let outcome = actionHandler()
  t.equal(outcome, expected)
}))

test('must return promise if a generator', wrapEach(t => {
  t.plan(1)

  const expected = 'foo'
  const actionHandler = nextHandler()

  let promise = actionHandler(flo(function * () {
    return expected
  }))
  promise.then(function(outcome) {
    t.equal(outcome, expected)
  })
}))

test('must throw error if argument is non-object', wrapEach(t => {
  t.plan(1)

  t.throws(() => flow()())
}))

test('must log errors to stderr', t => {
  t.plan(1)

  const dispatch = () => {
    var err = new Error()
    err.stack = 'Foo'
    throw err
  }
  const nextHandler = flow()({dispatch: dispatch})
  const actionHandler = nextHandler()

  let inspect = stderr.inspect()

  actionHandler(flo(function *() {
    yield 'foo'
  })).catch(function(e) {
    t.deepEqual(inspect.output, ["\n", "  Foo\n", "\n"])
    inspect.restore()
  })

})

test('must allow custom error handler', t => {
  t.plan(2)

  const dispatch = () => {
    var err = new Error()
    err.stack = 'Foo'
    throw err
  }

  let handlerCalled = false
  const errorHandler = () => {
    console.log('error handler')
    handlerCalled = true
  }

  const nextHandler = flow(errorHandler)({dispatch: dispatch})
  const actionHandler = nextHandler()

  let inspect = stderr.inspect()

  actionHandler(flo(function *() {
    yield 'foo'
  })).then(function() {
    t.deepEqual(inspect.output, [])
    t.equal(handlerCalled, true)
    inspect.restore()
  })
})

test('must throw error when non error given', t => {
  t.plan(2)

  const dispatch = () => {
    throw 'foo'
  }
  const nextHandler = flow()({dispatch: dispatch})
  const actionHandler = nextHandler()

  actionHandler(flo(function *() {
    yield 'foo'
  })).catch(function(err) {
    t.ok(err instanceof TypeError)
    t.equal(err.message, 'Non error thrown: foo')
  })
})

test('should dispatch nested flos', wrapEach(t => {
  t.plan(2)

  const dispatch = compose([
    flow(),
    ctx => next => action => action.type === 'fetch' ? 200 : next(action),
    ctx => next => action => 'foo'
  ])

  dispatch(flo(function * () {
    let res = yield flo({
      google: {type: 'fetch', payload: 'google'},
      facebook: {type: 'fetch', payload: 'facebook'}
    })
    t.deepEqual(res, {google: 200, facebook: 200})
    t.deepEqual('foo', yield {type: 'bar'})
    t.end()
  }))
}))
