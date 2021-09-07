import './polyfills';
import * as compiler from '@ampproject/bento-compiler';

import {getBuilders} from './builders';

/**
 * Returns the AST for an AMP Document with eligible components server-rendered.
 *
 * @param {{
 *   document: !./types.TreeProtoDef,
 *   versions: !./types.VersionsDef
 * }} request
 * @return {!./types.TreeProtoDef}
 */
function compile(request) {
  // TODO(samouri): remove the defaults.
  const document = request.document ?? {root: 0, tree: []};
  const versions = request.versions ?? {'amp-layout': 'v0'};

  return compiler.renderAst(document, getBuilders(versions));
}

globalThis['compile'] = compile;
