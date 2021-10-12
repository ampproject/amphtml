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
  const document = request.document ?? {
    root: 0,
    tree: [{tagid: 92, children: []}],
    'quirks_mode': false,
  };
  const versions = request.versions ?? {'amp-layout': 'v0'};

  return {document: compiler.renderAst(document, getBuilders(versions))};
}

globalThis['compile'] = compile;
