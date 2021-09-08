import './polyfills';
import * as compiler from '@ampproject/bento-compiler';

import {getBuilders} from './builders';

/**
 * Returns the AST for an AMP Document with eligible components server-rendered.
 *
 * @param {!./types.CompilerRequest} request
 * @return {!./types.CompilerResponse}
 */
function compile(request) {
  // TODO(samouri): remove the defaults.
  const document = request.document ?? {root: 0, tree: []};
  const versions = request.versions ?? {'amp-layout': 'v0'};

  // TODO(samouri): handle type=error case.
  return {document: compiler.renderAst(document, getBuilders(versions)).value};
}

globalThis['compile'] = compile;
