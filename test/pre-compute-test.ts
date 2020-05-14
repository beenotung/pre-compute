import { later } from '@beenotung/tslib/async/wait'
import { catchMain } from '@beenotung/tslib/node'
import { PreCompute } from '../src/pre-compute'

function time() {
  return new Date().toLocaleString()
}

async function fetch(idx: number) {
  console.log(time(), 'fetch:', idx)
  await later(500)
  console.log(time(), 'fetched:', idx)
  return idx
}

type Data = number

const n = 20
const compute = new PreCompute<Promise<Data>>({
  bufferSize: 5,
  producer: fetch,
})

async function process(data: Data) {
  console.log(time(), 'process:', data)
  await later(50)
  console.log(time(), 'processed:', data)
}

async function main() {
  const start = Date.now()
  for (let i = 0; i < n; i++) {
    const data = await compute.get(i, n - 1)
    // const data = await fetch(i)
    await process(data)
    const now = Date.now()
    console.log('time passed:', now - start, 'ms')
  }
  const end = Date.now()
  console.log('total time used:', end - start, 'ms')
}

catchMain(main())
