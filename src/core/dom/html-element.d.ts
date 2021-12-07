export {};

declare global {
  interface HTMLElement {
    nonce?: string;

    mozMatchesSelector?: (string) => boolean;
    msMatchesSelector?: (string) => boolean;
    oMatchesSelector?: (string) => boolean;

    createdCallback?: () => void;
  }
}
