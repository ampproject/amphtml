/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { cssParser as parser } from "../../../../build/parsers/css-expr-impl";

/**
 * @param {string} cssString
 * @return {?./css-expr-ast.CssNode}
 */
export function parseCss(cssString) {
  return parser.parse(cssString);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNzcy1leHByLmpzIl0sIm5hbWVzIjpbImNzc1BhcnNlciIsInBhcnNlciIsInBhcnNlQ3NzIiwiY3NzU3RyaW5nIiwicGFyc2UiXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBLFNBQVFBLFNBQVMsSUFBSUMsTUFBckI7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPLFNBQVNDLFFBQVQsQ0FBa0JDLFNBQWxCLEVBQTZCO0FBQ2xDLFNBQU9GLE1BQU0sQ0FBQ0csS0FBUCxDQUFhRCxTQUFiLENBQVA7QUFDRCIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IDIwMTcgVGhlIEFNUCBIVE1MIEF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUy1JU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG5pbXBvcnQge2Nzc1BhcnNlciBhcyBwYXJzZXJ9IGZyb20gJyNidWlsZC9wYXJzZXJzL2Nzcy1leHByLWltcGwnO1xuXG4vKipcbiAqIEBwYXJhbSB7c3RyaW5nfSBjc3NTdHJpbmdcbiAqIEByZXR1cm4gez8uL2Nzcy1leHByLWFzdC5Dc3NOb2RlfVxuICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VDc3MoY3NzU3RyaW5nKSB7XG4gIHJldHVybiBwYXJzZXIucGFyc2UoY3NzU3RyaW5nKTtcbn1cbiJdfQ==
// /Users/mszylkowski/src/amphtml/extensions/amp-animation/0.1/parsers/css-expr.js