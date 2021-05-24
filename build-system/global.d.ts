declare global {
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

  interface Window {
    queryXpath: (xpath: string, root: unknown /** Puppeteer.ElementHandle */) => unknown[] | null;
    AMP: Function[];
    viewer?: {
      receivedMessages?: number;
    };
    __coverage__: any;
  }

  interface Error {
    status?: string;
  }

  namespace Mocha {
    interface TestFunction {
      configure: Function;
    }
  }

  namespace NodeJS {
    interface Global {
      repl?: () => Promise<unknown> & {
        controller;
        env;
        continue;
      };
      Key?: string;
      describes?: unknown;
      expect?: Function;
    }
  }
}

export { }
