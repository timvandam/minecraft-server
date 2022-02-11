import { Box } from './Box';

/**
 * Like a map, but using Boxes (i.e. symbols with an attached type)
 */
export class BoxStorage {
  protected storage: Record<string | symbol, unknown> = {};

  get<T>(box: Box<T>): T | undefined {
    return this.storage[box.key] as T | undefined;
  }

  getOrThrow<T>(box: Box<T>): T {
    if (!this.has(box)) {
      throw new Error(`Box '${box.key.toString()}' not found!`);
    }

    return this.storage[box.key] as T;
  }

  put<T>(box: Box<T>, data: T): void {
    this.storage[box.key] = data;
  }

  has<T>(box: Box<T>): boolean {
    return box.key in this.storage;
  }

  delete<T>(box: Box<T>) {
    delete this.storage[box.key];
  }
}
