import * as compiler from '@ampproject/bento-compiler';

import {getBuilders} from './builders';

/**
 * Returns the AST for an AMP Document with eligible components server-rendered.
 *
 * @param {import('./types').CompilerRequest} request
 * @return {import('./types').CompilerResponse}
 */
export function compile(request) {
  if (!request || (!request.document && !request.nodes)) {
    throw new Error('Must provide either document or nodes');
  }

  // TODO(samouri): remove the defaults.
  const versions = request.versions ?? [
    {component: 'amp-layout', version: 'v0'},
  ];

  const {document, nodes} = request;
  if (document) {
    return {
      document: compiler.renderAstDocument(document, getBuilders(versions)),
    };
  }
  return {nodes: compiler.renderAstNodes(nodes, getBuilders(versions))};
}
