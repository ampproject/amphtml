import './polyfills';
import * as compiler from '@ampproject/bento-compiler';

import {getBuilders} from './builders';

/**
 * Returns the AST for an AMP Document with eligible components server-rendered.
 *
 * @param {import('./types').CompilerRequest} request
 * @return {import('./types').CompilerResponse}
 */
function compile(request) {
  // TODO(samouri): remove the defaults.
  const document = request.document ?? /** @type {any}*/ ({root: 0, tree: []});
  const versions = request.versions ?? {'amp-layout': 'v0'};

  return {document: compiler.renderAst(document, getBuilders(versions))};
}

globalThis['compile'] = compile;
