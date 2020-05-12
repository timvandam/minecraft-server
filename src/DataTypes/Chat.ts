import { DataType } from './DataType'
import LString from './LString'
import { EColors } from '../enums/EColors'
import { EFormat } from '../enums/EFormat'

const prefix = '&'

// TODO: Fix chat. &abye creates `ye`

interface ChatObj {
  text: string;
  color?: EColors;
  bold?: boolean;
  italic?: boolean;
  underlined?: boolean;
  strikethrough?: boolean;
  obfuscated?: boolean;
  extra?: ChatObj[];
}

/**
 * Converts a string into a Chat object
 */
export function parseChatString (str: string): ChatObj {
  const chunks = str.split(new RegExp(`${prefix}([^${prefix}])`, 'g'))
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: ChatObj = {
    text: chunks.shift() ?? '',
    extra: []
  }

  let currentColor: EColors | undefined
  let currentFormat: EFormat | undefined
  for (let chunk of chunks) {
    if (!chunk) continue
    const next = chunk.charAt(0)
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    const color = EColors[next]
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    const format = EFormat[next]
    if (color) currentColor = color
    if (format) currentFormat = format
    if (format || color) chunk = chunk.slice(1)
    if (!chunk) continue
    const obj: ChatObj = {
      text: chunk,
      color: currentColor,
      [currentFormat ?? '']: true
    }
    // eslint-disable-next-line no-unused-expressions
    result.extra?.push(obj)
  }

  if (!result.extra?.length) delete result.extra

  return result
}

/**
 * Takes a Chat object and makes it a string
 */
export function stringifyChatObj (chat: ChatObj): string {
  const { text, color, extra = [], bold, italic, obfuscated, strikethrough, underlined } = chat
  let result = ''

  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  if (color) result += prefix + EColors[color]
  if (bold) result += prefix + EFormat.bold
  if (italic) result += prefix + EFormat.italic
  if (obfuscated) result += prefix + EFormat.obfuscated
  if (strikethrough) result += prefix + EFormat.strikethrough
  if (underlined) result += prefix + EFormat.underlined

  result += text

  for (const chunk of extra) {
    result += stringifyChatObj(chunk)
  }

  return result
}

export default class Chat extends DataType<string> {
  protected read (data: Buffer): string {
    const chat = JSON.parse(new LString({ buffer: data }).value)
    return stringifyChatObj(chat)
  }

  protected write (value: string): Buffer {
    return new LString({ value: JSON.stringify(parseChatString(value)) }).buffer
  }
}
