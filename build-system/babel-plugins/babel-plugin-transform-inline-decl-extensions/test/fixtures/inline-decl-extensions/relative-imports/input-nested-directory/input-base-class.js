import '../../backwards';
import './for/wards';

import {leaveThis} from 'alone';
import {baz} from './foo/bar';

/**
 * @typedef {{
 *   something: string,
 *   somethingElse: ./relative.Relative
 * }}
 */
let MyTypeDef;

/** @implements {../whatever.Whatever} */
export class RelativeImports {
  /**
   * @param {../../child/pocket.Button} foo
   * @param {!../something.Something} bar
   * @param {Baz|!./something.Baz|string} baz
   */
  method(foom, bar, baz) {}
}
