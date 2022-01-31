export class PreCompute<T> {
  producer: (idx: number) => T
  bufferSize: number
  max?: number

  private buffer: T[] = []

  private lastProduction?: number

  constructor(options: {
    producer: (idx: number) => T
    bufferSize: number
    max?: number
  }) {
    this.producer = options.producer
    this.bufferSize = options.bufferSize
    this.max = options.max
  }

  get(idx: number) {
    let data: T
    if (this.lastProduction! >= idx) {
      data = this.buffer[idx]
      delete this.buffer[idx]
    } else {
      this.lastProduction = idx
      data = this.producer(idx)
    }
    this.preCompute(idx + 1)
    return data
  }

  private preCompute(lastConsumption: number) {
    while (this.lastProduction! < lastConsumption + this.bufferSize) {
      let idx = this.lastProduction! + 1
      if (idx > this.max!) {
        break
      }
      let data = this.producer(idx)
      this.buffer[idx] = data
      this.lastProduction = idx
    }
  }
}
