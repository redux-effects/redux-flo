/**
 * Imports
 */

import test from 'tape'
import flow from '../src'
import {stderr} from 'test-console'
import isFunction from '@f/is-function'
import compose from '@f/bind-middleware'
import isGenerator from '@f/is-generator'
import identity from '@f/identity'
import map from '@f/map'
import rlog from 'redux-log'
import ObjectF from '@f/obj-functor'

/**
 * Tests
 */

var log = []
const doDispatch = (v) => {
  log.push(v)
}
const nextHandler = flow()({dispatch: doDispatch})

const wrapEach = (fn) => {
  return (t) => {
    // before
    log = []
    fn(t)
    // after
  }
}

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

  const actionHandler = nextHandler()

  actionHandler(function * () {
    yield 'foo'
    t.deepEqual(log, ['foo'])
  })
}))

test('must run the given action array with dispatch', wrapEach(t => {
  t.plan(1)

  const actionHandler = nextHandler()

  actionHandler(['foo']).then(function () {
    t.deepEqual(log, ['foo'])
  })

}))

test('must run the given nested action array with dispatch', wrapEach(t => {
  t.plan(1)

  let l = []
  let dispatch = compose([flow(), rlog(l)])

  dispatch(function * () {
      yield ['foo', 'bar']
      yield 'qux'
  }).then(function () {
    t.deepEqual(l, ['foo', 'bar', 'qux'])
  })

}))

test('must run the given nested action functor with dispatch', wrapEach(t => {
  t.plan(1)

  let l = []
  let dispatch = compose([flow(), rlog(l)])

  dispatch(ObjectF({foo: 'bar'})).then(function (res) {
    console.log('res', res)
    t.deepEqual(l, ['bar'])
  })

}))

test('must run the given action generator object with dispatch', wrapEach(t => {
  t.plan(1)

  const actionHandler = nextHandler()

  actionHandler((function * () {
    yield 'foo'
    t.deepEqual(log, ['foo'])
  })())
}))

test('must pass action to next if not iterable', wrapEach(t => {
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

  let promise = actionHandler(function * () {
    return expected
  })
  promise.then(outcome => {
    t.equal(outcome, expected)
  })
}))

test('must throw error if argument is non-object', wrapEach(t => {
  t.plan(1)

  t.throws(() => flow()())
}))

test('must allow custom error handler', t => {
  t.plan(2)

  const dispatch = () => {
    var err = new Error()
    err.stack = 'Foo'
    throw err
  }

  let handlerCalled = false
  const errorHandler = () => {
    handlerCalled = true
  }

  const nextHandler = flow(errorHandler)({dispatch: dispatch})
  const actionHandler = nextHandler()

  let inspect = stderr.inspect()

  actionHandler(function * () {
    yield 'foo'
  }).then(() => {
    t.deepEqual(inspect.output, [])
    t.equal(handlerCalled, true)
    inspect.restore()
  })
})

test('should dispatch nested flos', wrapEach(t => {
  t.plan(3)

  const dispatch = compose([
    flow(),
    ctx => next => action => action.type === 'fetch' ? 200 : next(action),
    ctx => next => action => 'foo'
  ])

  dispatch(function * () {
    let [google, facebook] = yield [{type: 'fetch', payload: 'google'}, {type: 'fetch', payload: 'facebook'}]

    t.deepEqual(google, 200)
    t.deepEqual(facebook, 200)
    t.deepEqual('foo', yield {type: 'bar'})
    t.end()
  })
}))
