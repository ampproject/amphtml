export {};

declare global {
  interface HTMLElement {
    nonce?: string;

    mozMatchesSelector?: (s: string) => boolean;
    msMatchesSelector?: (s: string) => boolean;
    oMatchesSelector?: (s: string) => boolean;

    createdCallback?: () => void;
  }
}
