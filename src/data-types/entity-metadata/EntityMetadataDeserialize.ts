import { EntityMetadata, EntityClass } from './EntityMetadata';
import { BufferReader } from '../BufferReader';

// TODO: Implement. Then BufferReader.readEntity
export function deserializeEntityMetadata<T extends EntityMetadata>(
  reader: BufferReader,
  clazz: EntityClass<T>,
): T {
  // TODO:
  return new clazz();
}
