import * as compiler from '@ampproject/bento-compiler';

import {getBuilders} from './builders';
import type {CompilerRequest, CompilerResponse} from './types';

const missingPropErrorMsg =
  'Must provide component_versions and either document or nodes';

/**
 * Returns the AST for an AMP Document with eligible components server-rendered.
 */
export function compile(request: CompilerRequest): CompilerResponse {
  const {component_versions: versions, document, nodes} = request ?? {};
  if (!versions) {
    throw new Error(missingPropErrorMsg);
  }
  const builders = getBuilders(versions);

  if (document) {
    return {document: compiler.renderAstDocument(document, builders)};
  } else if (nodes) {
    return {nodes: compiler.renderAstNodes(nodes, builders)};
  } else {
    throw new Error(missingPropErrorMsg);
  }
}
