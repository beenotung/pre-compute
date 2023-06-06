# pre-compute

pre-compute or pre-fetch resources into buffer/cache to maximize concurrent processing capacity.
With automatic back-pressure management.

[![npm Package Version](https://img.shields.io/npm/v/pre-compute)](https://www.npmjs.com/package/pre-compute)
[![Minified Package Size](https://img.shields.io/bundlephobia/min/pre-compute)](https://bundlephobia.com/package/pre-compute)
[![Minified and Gzipped Package Size](https://img.shields.io/bundlephobia/minzip/pre-compute)](https://bundlephobia.com/package/pre-compute)

## Use Case

producer: pull-based resources, e.g. network/disk IO

consumer: CPU intensive processing logic / async processor, that cannot catch up the data production rate

## Features

- optimized for IO-intensive task with latency, e.g. network/disk IO
- isomorphic (support browser, node.js in CommonJS and ESM)
- memory-efficient (using ring-buffer)
- lightweight (<1KB)
- built-in typescript support

## Installation

### Install with package manager

```bash
npm i pre-compute
```

You can also install it with [pnpm](https://www.npmjs.com/package/pnpm) or [yarn](https://www.npmjs.com/package/yarn)

import from typescript or javascript (ESM)

```typescript
import { PreCompute } from 'pre-compute'
```

import from node.js (CommonJS)

```javascript
const { PreCompute } = require('pre-compute')
```

### To use in browser directly

```html
<script src="https://cdn.jsdelivr.net/npm/pre-compute@1/dist/browser.min.js"></script>
<script>
  const compute =  new PreCompute({...})
</script>
```

## Usage Example

```typescript
import { PreCompute } from 'pre-compute'

let n = 100
// a list of resources we want to fetch and process
let urls = new Array(n).fill('').map((_, i) => 'http://example.com/post/' + i)

// fetch a resource
function producer(i: number) {
  return fetch(urls[i]).then(res => res.text())
}

// the state of the processor
let wordCounts = new Map<string, number>()

// process a fetched resource
function consume(text: string) {
  text.split(' ').forEach(word => {
    let count = wordCounts.get(word) || 0
    wordCounts.set(word, count + 1)
  })
}

const compute = new PreCompute({
  // pre-fetch this amount of resources for the downstream consumer
  bufferSize: 20,
  // the resource producer, takes idx as parameter
  producer,
  // eagerly pre-fetch until this index inclusively
  // optional, default is unlimited
  max: n,
})

async function main() {
  // the main loop
  for (let i = 0; i < n; i++) {
    // get i^th resources, and pre-fetch next 20 resources (sliding window)
    let text = await compute.get(i)
    consume(text) // can put await if needed, this can cause back-pressure on the pre-fetching
  }
  // print the final result
  let total = Array.from(wordCounts.values()).reduce((acc, c) => acc + c)
  console.log('number of words:', total)
}

main()
```

Complete example in: [test/pre-compute-test.ts](./test/pre-compute-test.ts)

## Tips to speed up consumer

This library applies concurrent computing for consumer that need to mutate the same memory.

The IO calls in producer are executed in parallel underneath while the consumer is executed sequentially.

For CPU-intensive work that can be parallelized without mutex lock, you can use [workerpool](https://www.npmjs.com/package/workerpool) for the consumer, then both the producer and consumer will be multiple-threaded.

## Todo

- [ ] auto adjust the buffer size by time/memory constraint

## License

This project is licensed with [BSD-2-Clause](./LICENSE)

This is free, libre, and open-source software. It comes down to four essential freedoms [[ref]](https://seirdy.one/2021/01/27/whatsapp-and-the-domestication-of-users.html#fnref:2):

- The freedom to run the program as you wish, for any purpose
- The freedom to study how the program works, and change it so it does your computing as you wish
- The freedom to redistribute copies so you can help others
- The freedom to distribute copies of your modified versions to others
