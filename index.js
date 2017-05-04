const assert = require('assert')

const isFunction = (fn) => typeof fn === 'function'
const isValidNumber = (num) => typeof num === 'number' && num > 0

module.exports = (worker, { concurrency, notifier }) => {
  let runningJobs = 0
  let processing = false
  let tasks = []

  assert(isFunction(worker), 'worker function is required')
  assert(isValidNumber(concurrency), '`concurrency` must be a number greater than 0')

  if (notifier) assert(isFunction(notifier), '`notifier` must be a function')
  else notifier = Function.prototype

  const push = (data, done) => {
    assert(isFunction(done), 'callback is required')
    tasks.push({ data, callback: done })
    setImmediate(execute)
  }

  const execute = () => {
    // $lab:coverage:off$
    if (processing) return // queue is currently busy
    // $lab:coverage:on$

    processing = true
    while (runningJobs < concurrency && tasks.length) {
      runningJobs += 1

      const task = tasks.shift()
      const cb = complete(task)
      worker(task.data, cb)
    }

    processing = false
  }

  const complete = (task) => (args) => {
    runningJobs -= 1
    task.callback.apply(task, args)

    if (tasks.length + runningJobs === 0) notifier()
    setImmediate(execute) // ready for the next task
  }

  return {
    concurrency,
    length: () => tasks.length,
    push,
    runningJobs: () => runningJobs
  }
}
