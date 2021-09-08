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

  const result = compiler.renderAst(document, getBuilders(versions));
  if (result.error) {
    const [tagName, errorMsg] = Array.from(result.error)[0];
    throw new Error(`Failure to render: ${tagName}: ${errorMsg}`);
  }
  return {document: result.value};
}

globalThis['compile'] = compile;
