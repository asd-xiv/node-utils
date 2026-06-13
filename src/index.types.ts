/** A type that represents either a type T or a Promise that resolves to type T */
type MaybePromise<T> = T | Promise<T>

export type { MaybePromise }
