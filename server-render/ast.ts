import * as parse5 from 'parse5';

export type Attribute = {
  name: undefined | string;
  value: undefined | string;
};

export type NodeProto = {
  tagName: undefined | string;
  value: undefined | string;
  attributes: Array<Attribute>;
  children: Array<NodeProto>;
};

export type TreeProto = {
  tree: Array<NodeProto>;
  root: number;
  quirks_mode: undefined | boolean;
};

export function parse(html: string): TreeProto {
  return mapParse5ToTreeProto(parse5.parse(html));
}

function mapParse5ToTreeProto(doc: parse5.Document): TreeProto {
  throw new Error('TODO');
}

export function print(ast: TreeProto): string {
  throw new Error('TODO');
}

function writeAstToDom(ast: TreeProto): Document {
  throw new Error('TODO');
}

function writeDomToAst(doc: Document): TreeProto {
  throw new Error('TODO');
}
