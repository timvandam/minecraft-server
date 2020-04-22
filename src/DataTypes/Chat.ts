import { DataType } from './DataType'

export default class Chat extends DataType<string> {
  protected read (data: Buffer): string {
  }

  protected write (value: string) {
  }
}

const prefix = '&'

const colors = new Map<string, string>()
  .set('0', 'black')
  .set('1', 'dark_blue')
  .set('2', 'dark_green')
  .set('3', 'dark_aqua')
  .set('4', 'dark_red')
  .set('5', 'dark_purple')
  .set('6', 'gold')
  .set('7', 'gray')
  .set('8', 'dark_gray')
  .set('9', 'blue')
  .set('a', 'green')
  .set('b', 'aqua')
  .set('c', 'red')
  .set('d', 'light_purple')
  .set('e', 'yellow')
  .set('f', 'white')

const formats = new Map<string, string>()
  .set('k', 'obfuscated')
  .set('l', 'bold')
  .set('m', 'strikethrough')
  .set('n', 'underline')
  .set('o', 'italic')
  .set('r', 'reset')

/**
 * Converts a string into a Chat object
 */
export function parseChatString (str: string): object {
  const chunks = str.split(new RegExp(`${prefix}([^${prefix}])`, 'g'))
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: Record<string, any> = {
    text: chunks.shift(),
    extra: []
  }

  let currentColor = 'reset'
  let currentFormat = 'reset'
  for (let chunk of chunks) {
    if (!chunk) continue
    const next = chunk.charAt(0)
    const color = colors.get(next)
    const format = formats.get(next)
    if (color) currentColor = color
    if (format) currentFormat = format
    if (format || color) chunk = chunk.slice(1)
    if (!chunk) continue
    result.extra.push({
      text: chunk,
      color: currentColor,
      [currentFormat]: true
    })
  }

  if (result.extra.length === 0) delete result.extra
  return result
}
