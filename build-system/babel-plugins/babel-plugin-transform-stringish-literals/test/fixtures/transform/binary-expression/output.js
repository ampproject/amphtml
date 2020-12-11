/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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
let add = "/rtv/bar";
let multipleAdd = "/rtv/bar/";
let subtract = "/rtv" - "r";
let multiply = "/rtv" * "r";
let divide = "/rtv" / "r";
let numberStart = "1/foo";
let stringStart = "1/foo";
let numberEnd = "foo/1";
let stringEnd = "foo/1";
let illegalCharacterString = "Invalid share providers configuration for in bookend. Value must be `true` or a params object.";
let illegalCharacterTemplate = `Invalid ${x}Value must be \`true\` or a params object.`;
let illegalEscapeValue = `Invalid ${x}\${foo}`;

inverted: {
  let illegalCharacterString = "Value must be `true` or a params object. Invalid share providers configuration for in bookend.";
  let illegalCharacterTemplate = `Value must be \`true\` or a params object. Invalid ${x}`;
  let illegalEscapeValue = `\${foo}Invalid ${x}`;
}

let stringLiterals = "12";
let numberLiterals = 3;
let booleanLiterals = 1;
let identifiers = `${foo}${bar}`;
