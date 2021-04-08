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
const x = function(thing) {
  return console.log(thing + 1);
}

function fixedEncodeURIComponent(str) {
  return encodeURIComponent(str).replace(/[!'()*]/g, function (c) {
    return '%' + c.charCodeAt(0).toString(16);
  });
}

let fixedEncodeURIComponentArrow = str => encodeURIComponent(str).replace(/[!'()*]/g, function (c) {
  return '%' + c.charCodeAt(0).toString(16);
});

let y;
let fixedEncodeURIComponentArrowAssignment = str => encodeURIComponent(str).replace(/[!'()*]/g, y = function (c) {
  return '%' + c.charCodeAt(0).toString(16);
});