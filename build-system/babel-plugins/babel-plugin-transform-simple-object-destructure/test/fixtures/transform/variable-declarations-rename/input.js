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

const {head: h, body: b} = document;

const {x: myX} = get();

function func() {
  const {head: h, body: b} = document;
  let {x: myX, y: myY, z: myZ} = get();
  myX = 3;
  myY = 4;
  myZ = 5;
  console.log(document);
  console.log(h);
  console.log(b);
  console.log(myX + myY + myZ);
}

console.log(document);
console.log(h);
console.log(b);
console.log(myX);
