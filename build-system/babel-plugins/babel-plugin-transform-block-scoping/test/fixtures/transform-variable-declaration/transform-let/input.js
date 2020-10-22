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
let a = 'abc';
{
  let a = 'xyz';
  console.log(a);
}
console.log(a);

function test() {
  let a = 1;
  {
    let a = 2;
    console.log(a);
  }
  console.log(a);
}

let z = [];

for (let i = 0; i < 10; i++) {
  z.push(function() {
    console.log(i);
  });

  let x = i;
  z.push(function() {
    console.log(x);
  });
}
