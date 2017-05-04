# worker-queue

[![version](https://img.shields.io/npm/v/worker-queue.svg?style=flat-square)][version]
[![build](https://img.shields.io/travis/theworkflow/worker-queue/master.svg?style=flat-square)][build]
[![license](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)][license]

Small sample queuing system implementation.

## Install

`$ npm install worker-queue`

## Usage

```javascript
const queue = require('worker-queue')

const worker = (data, done) => {
  // handle data
  done(null, data)
}

const notifier = () => console.log('all jobs completed')
const options = { concurrency: 1, notifier }

const client = queue(worker, options)

client.push({ test: true }, (err, result) => {
  // do something
})
```

## License

[MIT](LICENSE.md)

[version]: https://www.npmjs.com/package/worker-queue
[build]: https://travis-ci.org/theworkflow/sample-worker-queue
[license]: https://raw.githubusercontent.com/theworkflow/sample-worker-queue/master/LICENSE
