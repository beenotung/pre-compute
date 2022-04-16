import { PreCompute } from '../src/pre-compute'

let delay = 10

function producer(idx: number) {
  return new Promise<number>(resolve => setTimeout(() => resolve(idx), delay))
}

let compute = new PreCompute({
  producer,
  bufferSize: 5,
  max: 10,
})

async function main() {
  let startTime = Date.now()
  for (let i = 0; i <= 10; i++) {
    let res = await compute.get(i)
    console.assert(res === i, 'wrong result from producer')
  }
  let endTime = Date.now()
  let usedTime = endTime - startTime
  console.assert(usedTime <= delay * 3, 'producer is not pre-computed')
}
main().catch(error => {
  console.error(error)
  process.exit(1)
})
