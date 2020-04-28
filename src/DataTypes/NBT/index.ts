/* How to convert from JS to NBT?
 * It should be easy, making JS objects the obvious choice.
 * NBT supports Byte, Short, Int, Long, Float, Double. Making JS's types hard to use.
 * Solution: Custom DataTypes! They will make use of buffers (duh!)
 */

import { Compound } from './DataTypes'

// All NBT tags are contained within compound tags, so lets just export that
export const NBT = Compound
