export type Box<T> = { key: string | symbol };

/**
 * TODO: Think of a nicer name
 * Like a symbol, but can carry a type that is used by BoxStorage
 */
export function Box<T>(symbol: string | symbol): Box<T> {
  return { key: symbol };
}
