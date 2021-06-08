import * as parse5 from 'parse5';

export type Attribute = {
  name: undefined | string;
  value: undefined | string;
};

export type NodeProto = {
  // TODO: can tagid be a string instead of a number?
  tagid: undefined | number;
  value: undefined | string;
  attributes: Array<Attribute>;
  children: Array<NodeProto>;

  // TODO: do we need these?
  num_terms: undefined | number;
  position: undefined | number;
  end_position: undefined | number;
  hover_styles: undefined | string;
  non_hover_styles_override: undefined | string;
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
