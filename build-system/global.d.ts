declare global {
  interface CompilerNode {
    type: string;
    name: string;
    arguments: [];
    left: CompilerNode;
    right: CompilerNode;
  }

  interface EslintContext {
    report: Function;
  }

  interface Window {
    queryXpath: Function;
    wgxpath: {
      install: Function;
    };
    AMP: Function[];
    viewer: {
      receivedMessages?: number;
    };
    __coverage__: any;
    longTasks: PerformanceEntry[];
    cumulativeLayoutShift: number;
    largestContentfulPaint: number;
    measureStarted: number;
  }

  interface PerformanceEntry {
    loadTime: number;
    renderTime: number;
    value: number;
  }
  interface Error {
    status?: string | number;
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

export {};
