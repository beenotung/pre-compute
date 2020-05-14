export type Result<T> = T | Promise<T>

export function then<T>(f: () => Result<T>, then: (data: T) => void) {
  const res = f() as Promise<T>
  if (res && typeof res === 'object' && typeof res.then === 'function') {
    res.then(data => then(data))
  } else {
    then(res as any)
  }
}
