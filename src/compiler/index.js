import './polyfills';
import * as compiler from '@ampproject/bento-compiler';

import {getBuilders} from './builders';

/**
 * Returns the AST for an AMP Document with eligible components server-rendered.
 *
 * @param {!./types.TreeProtoDef} ast
 * @param {!./types.VersionsDef} versions
 * @return {!./types.TreeProtoDef}
 */
function compileAst(ast, versions) {
  return compiler.renderAst(ast, getBuilders(versions));
}

globalThis['compileAst'] = compileAst;
