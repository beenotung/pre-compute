# pre-compute

pre-compute or pre-fetch resources into buffer/cache to maximize concurrent processing capacity.
With automatic back-pressure management.

[![npm Package Version](https://img.shields.io/npm/v/pre-compute.svg?maxAge=3600)](https://www.npmjs.com/package/pre-compute)

## Use Case

producer: pull-based resources, e.g. network/disk IO

consumer: CPU intensive processing logic / async processor, that cannot catch up the data production rate

## Features

- optimized for IO-intensive task with latency, e.g. network/disk IO
- isomorphic (support node.js and browser)
- memory-efficient (using ring-buffer)
- lightweight (<1KB)

## Example

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
