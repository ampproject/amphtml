export interface AmpViewerMessage {
  app: string;
  type: string;
  requestid: number;
  name: string;
  data: any;
  rsvp?: boolean;
  error?: string;
  messagingToken?: string;
}

export function parseMessage(message: any): AmpViewerMessage | null;

export type RequestHandler = () => void;

export class WindowPortEmulator {
  constructor(win: Window, origin: string, target: Window);
  addEventListener(eventType: string, handler: EventListener): void;
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
  registerHandler(messageName: string, requestHandler: RequestHandler): void;
  unregisterHandler(messageName: string): void;
  setDefaultHandler(requestHandler: RequestHandler): void;
  sendRequest(
    messageName: string,
    messageData: any,
    awaitResponse: boolean
  ): Promise<any> | undefined;
}
