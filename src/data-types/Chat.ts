export type Chat = {
  text?: string;
  bold?: boolean;
  italic?: boolean;
  underlined?: boolean;
  strikethrough?: boolean;
  obfuscated?: boolean;
  font?: 'minecraft:uniform' | 'minecraft:alt' | 'minecraft:default';
  color?: ChatColor | string;
  extra?: Chat[];
};

export enum ChatColor {
  BLACK = 'black',
  DARK_BLUE = 'dark_blue',
  DARK_GREEN = 'dark_green',
  DARK_CYAN = 'dark_aqua',
  DARK_RED = 'dark_red',
  PURPLE = 'dark_purple',
  GOLD = 'gold',
  GRAY = 'gray',
  DARK_GRAY = 'dark_gray',
  BLUE = 'blue',
  BRIGHT_GREEN = 'green',
  CYAN = 'aqua',
  RED = 'red',
  PINK = 'light_purple',
  YELLOW = 'yellow',
  WHITE = 'white',
}

interface ChatTag {
  (strings: TemplateStringsArray, ...rest: (Chat | string)[]): Chat;
  black: ChatTag;
  darkBlue: ChatTag;
  darkGreen: ChatTag;
  darkCyan: ChatTag;
  darkRed: ChatTag;
  purple: ChatTag;
  gold: ChatTag;
  gray: ChatTag;
  darkGray: ChatTag;
  blue: ChatTag;
  brightGreen: ChatTag;
  cyan: ChatTag;
  red: ChatTag;
  pink: ChatTag;
  yellow: ChatTag;
  white: ChatTag;
  bold: ChatTag;
  italic: ChatTag;
  underlined: ChatTag;
  strikethrough: ChatTag;
  obfuscated: ChatTag;
}

const createChatTag = (base: Omit<Chat, 'extra'> = {}): ChatTag => {
  const chatTag = (strings: TemplateStringsArray, ...rest: (Chat | string)[]): Chat => {
    const chats: Chat[] = strings.map((text) => ({ ...base, text }));
    for (let i = rest.length - 1; i >= 0; i--) {
      const el = rest[i];
      const chat: Chat = typeof el === 'string' ? { text: el } : el;
      chats.splice(i + 1, 0, { ...base, ...chat });
    }

    return {
      text: '',
      extra: chats,
    };
  };

  Object.defineProperties(chatTag, {
    black: { get: () => createChatTag({ ...base, color: ChatColor.BLACK }) },
    darkBlue: { get: () => createChatTag({ ...base, color: ChatColor.DARK_BLUE }) },
    darkGreen: { get: () => createChatTag({ ...base, color: ChatColor.DARK_GREEN }) },
    darkCyan: { get: () => createChatTag({ ...base, color: ChatColor.DARK_CYAN }) },
    darkRed: { get: () => createChatTag({ ...base, color: ChatColor.DARK_RED }) },
    purple: { get: () => createChatTag({ ...base, color: ChatColor.PURPLE }) },
    gold: { get: () => createChatTag({ ...base, color: ChatColor.GOLD }) },
    gray: { get: () => createChatTag({ ...base, color: ChatColor.GRAY }) },
    darkGray: { get: () => createChatTag({ ...base, color: ChatColor.DARK_GRAY }) },
    blue: { get: () => createChatTag({ ...base, color: ChatColor.BLUE }) },
    brightGreen: { get: () => createChatTag({ ...base, color: ChatColor.BRIGHT_GREEN }) },
    cyan: { get: () => createChatTag({ ...base, color: ChatColor.CYAN }) },
    red: { get: () => createChatTag({ ...base, color: ChatColor.RED }) },
    pink: { get: () => createChatTag({ ...base, color: ChatColor.PINK }) },
    yellow: { get: () => createChatTag({ ...base, color: ChatColor.YELLOW }) },
    white: { get: () => createChatTag({ ...base, color: ChatColor.WHITE }) },
    bold: { get: () => createChatTag({ ...base, bold: true }) },
    italic: { get: () => createChatTag({ ...base, italic: true }) },
    underlined: { get: () => createChatTag({ ...base, underlined: true }) },
    strikethrough: { get: () => createChatTag({ ...base, strikethrough: true }) },
    obfuscated: { get: () => createChatTag({ ...base, obfuscated: true }) },
  });

  return chatTag as ChatTag;
};

export const chat = createChatTag();
