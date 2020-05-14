import { Buffer } from './buffer'
import { Result } from './then'

export class PreCompute<T> {
  bufferSize: number
  producer: (idx: number) => T | Promise<T>
  private buffer = new Buffer<Result<T>>()

  private lastConsumption?: number
  private lastProduction?: number

  constructor(o: {
    producer: (idx: number) => T | Promise<T>
    bufferSize: number
  }) {
    this.producer = o.producer
    this.bufferSize = o.bufferSize
  }

  /**
   * @param idx {number} : increasing, non-repeatable integer
   * @param max {number} : indicate when the pre-compute should early terminate even when the buffer has space
   * */
  get(idx: number, max?: number): T | Promise<T> {
    this.lastConsumption = idx
    let data: T | Promise<T>
    if (idx <= this.lastProduction!) {
      data = this.buffer.take(idx)!
    } else {
      this.lastProduction = idx
      data = this.producer(idx)
    }
    this.preCompute(max)
    return data
  }

  private preCompute(max: number | undefined) {
    while (this.lastProduction! < this.lastConsumption! + this.bufferSize) {
      const idx = this.lastProduction! + 1
      if (!idx || idx > max!) {
        break
      }
      this.lastProduction = idx
      const data = this.producer(idx)
      this.buffer.put(idx, data)
    }
  }
}
