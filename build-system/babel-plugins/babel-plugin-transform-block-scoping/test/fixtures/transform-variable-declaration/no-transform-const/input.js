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
const a = 'abc';

{
  const a = 'xyz';
}

function test() {
  const a = 1;
  {
    const a = 2;
    const b = 2;
  }
}

const z = [];

for (const i = 0; i < 10; i++) {
  z.push(function() {
    return function() {
      console.log(i);
    };
  });
}
