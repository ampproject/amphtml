import './amp-globals.d';

declare global {
  interface Error {
    // Allows error handlers to display errors with console-interactive values.
    messageArray?: any[];
  }
}
