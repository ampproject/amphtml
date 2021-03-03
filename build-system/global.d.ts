declare global {
  // TODO(#28387) delete this once all uses of these properties have been removed.
  interface Error {
    /**
     * In the build-system, Error objects contain useful info like underlying
     * stack traces in the message field, so we print that and hide the less
     * useful nodejs stack.
     */
    showStack?: boolean;
    status?: string;
  }

  interface CompilerNode {
    type: string;
    name: string;
    arguments: [];
    left: CompilerNode;
    right: CompilerNode;
  }

  interface BabelPath {
    node: CompilerNode;
  }

  interface EslintContext {
    report: (val: any) => void;
  }
}

export { }
