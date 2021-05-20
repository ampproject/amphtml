/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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
import 'another-import';
import { user, dev, userAssert } from 'wherever';
const resolvable = {
  FOO: 1,
  BAR: 2
};
userAssert(isEnumValue(unresolvable, x), "Unknown enum value: \"" + x + '"'), x;
userAssert(y === 1 || y === 2, "Unknown enum value: \"" + y + '"'), y;
userAssert(z === 1 || z === 2, "Unknown foo value: \"" + z + '"'), z;
userAssert(a === 1 || a === 2, "Unknown enum value: \"" + a + '"'), a;
userAssert(b === "X" || b === 2, "Unknown bar value: \"" + b + '"'), b;
subjectOnlyX;
subjectOnlyY;
subjectOnlyZ;
dev().ignoreMe();
user().ignoreMe();
