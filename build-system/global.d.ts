// TODO(#28387) delete this once all uses of these properties have been removed.
declare global {
  interface Error {
    /**
     * In the build-system, Error objects contain useful info like underlying
     * stack traces in the message field, so we print that and hide the less
     * useful nodejs stack.
     */
    showStack?: boolean;
    status?: string;
  }
}

export { }
