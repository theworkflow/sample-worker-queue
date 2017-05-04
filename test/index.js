const { expect } = require('code')
const lab = require('lab')
const td = require('testdouble')

const queue = require('../')
const { describe, it } = exports.lab = lab.script()

describe('worker-queue', () => {
  const notifier = td.function('notifier')
  const worker = (data, done) => setTimeout(done, 1000)

  describe('instantiating new queue', () => {
    it('throws if no worker function passed', (done) => {
      expect(() => {
        queue()
        queue('true')
        queue(true)
        queue(false)
        queue(null)
        queue(undefined)
        queue(1)
      }).to.throw()

      done()
    })

    it('throws for invalid concurrency', (done) => {
      expect(() => {
        queue(worker, { concurrency: true })
        queue(worker, { concurrency: false })
        queue(worker, { concurrency: undefined })
        queue(worker, { concurrency: null })
        queue(worker, { concurrency: 0 })
        queue(worker, { concurrency: 'string' })
        queue(worker, {})
        queue(worker)
      }).to.throw()

      done()
    })

    it('throws for invalid notifier', (done) => {
      expect(() => {
        queue(worker, { concurrency: 1, notifier: null })
        queue(worker, { concurrency: 1, notifier: undefined })
        queue(worker, { concurrency: 1, notifier: true })
        queue(worker, { concurrency: 1, notifier: false })
        queue(worker, { concurrency: 1, notifier: 1 })
        queue(worker, { concurrency: 1, notifier: 'string' })
      }).to.throw()

      done()
    })
  })

  describe('queue.push', () => {
    const { length, push, runningJobs } = queue(worker, { concurrency: 1 })

    it('throws if no callback passed', (done) => {
      expect(() => {
        push({ test: true })
      }).to.throw()

      done()
    })

    it('adds tasks to the queue', (done) => {
      push({ test: true, index: 1 }, () => {})
      push({ test: true, index: 2 }, () => {})
      push({ test: true, index: 3 }, () => {})
      push({ test: true, index: 4 }, () => {})
      push({ test: true, index: 5 }, () => {})

      expect(length()).to.equal(5)
      done()
    })

    it('processes jobs once added to queue', (done) => {
      push({ test: true, index: 1 }, () => {})
      expect(runningJobs()).to.equal(1)
      done()
    })
  })

  describe('queue.concurrency', () => {
    it('sets queue concurrency', (done) => {
      const { concurrency } = queue(worker, { concurrency: 10 })
      expect(concurrency).to.equal(10)
      done()
    })

    it('only executes max number of jobs based on concurrency', (done) => {
      const { length, push, runningJobs } = queue(worker, { concurrency: 3 })

      push({ test: true, index: 1 }, () => {})
      push({ test: true, index: 2 }, () => {})
      push({ test: true, index: 3 }, () => {})
      push({ test: true, index: 4 }, () => {})
      push({ test: true, index: 5 }, () => {})

      setTimeout(() => {
        expect(runningJobs()).to.equal(3)
        expect(length()).to.equal(2)
        done()
      }, 1000)
    })
  })

  describe('queue.length', () => {
    it('exports a length function', (done) => {
      const { length } = queue(worker, { concurrency: 1 })
      expect(length).to.be.a.function()
      done()
    })

    it('returns a length of 0 on initialization', (done) => {
      const { length } = queue(worker, { concurrency: 1 })
      expect(length()).to.equal(0)
      done()
    })
  })

  describe('queue.runningJobs', () => {
    it('exposes number of running jobs', (done) => {
      const { runningJobs, push } = queue(worker, { concurrency: 5 })
      expect(runningJobs()).to.equal(0)

      push({ test: true, index: 1 }, () => {})
      push({ test: true, index: 2 }, () => {})
      push({ test: true, index: 3 }, () => {})
      push({ test: true, index: 4 }, () => {})
      push({ test: true, index: 5 }, () => {})

      setTimeout(() => {
        expect(runningJobs()).to.equal(5)
        done()
      }, 1000)
    })
  })

  describe('notifier', () => {
    it('runs options.notifier when queue gets cleared', (done) => {
      const { push } = queue(worker, { concurrency: 6, notifier })

      push({ test: true, index: 1 }, () => {})
      push({ test: true, index: 2 }, () => {})
      push({ test: true, index: 3 }, () => {})
      push({ test: true, index: 4 }, () => {})
      push({ test: true, index: 5 }, () => {})

      setTimeout(() => {
        const call = td.explain(notifier)
        expect(call.callCount).to.equal(1)
        done()
      }, 1500)
    })
  })
})
