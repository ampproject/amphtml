export type RequestHandler = (
  name: string,
  data: any,
  rsvp: boolean
) => Promise<any> | undefined;

export class Messaging {
  static initiateHandshakeWithDocument(
    target: Window,
    opt_token?: string
  ): Promise<Messaging>;
  static waitForHandshakeFromDocument(
    source: Window,
    target: Window,
    origin: string,
    opt_token?: string
  ): Promise<Messaging>;
  constructor(
    win: Window,
    port: MessagePort,
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
