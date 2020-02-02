const _vendorComponentConfig__a = 'value for a',
      _vendorComponentConfig__b = 'value for b',
      _vendorComponentConfig__d = 'value for c';
import "../backwards";
import "./input-nested-directory/for/wards";
import { leaveThis } from 'alone';
import { baz } from "./input-nested-directory/foo/bar";
/**
 * @typedef {{
 *   something: string,
 *   somethingElse: ./input-nested-directory/relative.Relative
 * }}
 */

let MyTypeDef;
/** @implements {./whatever.Whatever} */

export class RelativeImports {
  /**
   * @param {../child/pocket.Button} foo
   * @param {!./something.Something} bar
   * @param {Baz|!./input-nested-directory/something.Baz|string} baz
   */
  method(foom, bar, baz) {}

}
import { RelativeImports as _RelativeImports } from './input-nested-directory/input-base-class';
foo(RelativeImports);
