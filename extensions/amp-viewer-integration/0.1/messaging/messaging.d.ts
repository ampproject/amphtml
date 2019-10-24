export const TAG = 'amp-viewer-messaging';

export const enum MessageType {
  REQUEST = 'q',
  RESPONSE = 's',
}

export interface Message {
  app: string;
  type: string;
  requestid: number;
  name: string;
  data: any;
  rsvp?: boolean;
  error?: string;
  messagingToken?: string;
}

export type RequestHandler = () => void;

export function parseMessage(message: any): Message;

export class WindowPortEmulator {
  constructor(win: Window, origin: string, target: Window);
  readonly win: Window;
  addEventListener(eventType: string, handler: (...params: any[]) => any): void;
  postMessage(data: any): void;
  start(): void;
}

export class Messaging {
  static initiateHandshakeWithDocument(
    target: Window,
    opt_token?: string,
    opt_interval?: number
  ): Promise<Messaging>;
  static waitForHandshakeFromDocument(
    source: Window,
    target: Window,
    origin: string,
    opt_token?: string
  ): Promise<Messaging>;
  constructor(
    win: Window,
    port: MessagePort | WindowPortEmulator,
    opt_isWebview?: boolean,
    opt_token?: string
  );
  readonly win: Window;
  registerHandler(messageName: string, requestHandler: RequestHandler): void;
  unregisterHandler(messageName: string): void;
  setDefaultHandler(requestHandler: RequestHandler): void;
  sendRequest(
    messageName: string,
    messageData: any,
    awaitResponse: boolean
  ): Promise<any> | undefined;
}
