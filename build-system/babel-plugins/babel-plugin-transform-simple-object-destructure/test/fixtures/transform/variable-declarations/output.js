/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

const _document = document,head = _document.head,body = _document.body,_foo = void 0;

const _get = get(),x = _get.x,_foo2 = void 0;

function func() {
  const _document2 = document,head = _document2.head,body = _document2.body,_foo3 = void 0;
  let _get2 = get(),x = _get2.x,y = _get2.y,z = _get2.z,_foo4 = void 0;
  x = 3;
  y = 4;
  z = 5;
  console.log(document);
  console.log(head);
  console.log(body);
  console.log(x + y + z);
}

console.log(document);
console.log(head);
console.log(body);
console.log(x);
