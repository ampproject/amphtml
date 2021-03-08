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

  interface Window extends Window {
    queryXpath: (xpath: string, root: unknown /** Puppeteer.ElementHandle */) => unknown | null;
  }
}

export { }
