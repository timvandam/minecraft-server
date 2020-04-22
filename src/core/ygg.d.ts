// Some types because yggdrasil doesn't have them
declare module 'yggdrasil' {
  export function server (options?: ServerOptions): Server

  interface ServerOptions {
    agent?: string;
    host?: string;
  }

  interface Server {
    hasJoined: (username: string, serverid: string|Buffer, sharedsecret: string|Buffer, serverkey: string|Buffer, cb: (error: Error, data: Profile) => void) => void;
  }
}

interface Profile {
  id: string;
  name: string;
  properties: ProfileProperty[];
}

interface ProfileProperty {
  name: string;
  value: string;
  signature: string;
}
