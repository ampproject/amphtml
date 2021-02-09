declare global {
  interface Error {
    showStack?: boolean;
    status?: string;
  }
}

export { }
