export class Buffer<T> {
  cache: T[] = []

  put(idx: number, data: T): void {
    this.cache[idx] = data
  }

  take(idx: number): T | undefined {
    const data = this.cache[idx]
    delete this.cache[idx]
    return data
  }
}
