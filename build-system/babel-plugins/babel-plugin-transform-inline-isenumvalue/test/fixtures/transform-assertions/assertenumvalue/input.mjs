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
import { user, dev } from 'wherever';

const resolvable = {FOO: 1, BAR: 2};

user().assertEnumValue(unresolvable, x);
user().assertEnumValue(resolvable, y);
user().assertEnumValue(resolvable, z, "foo");

user().assertEnumValue({FOO: 1, BAR: 2}, a);
user().assertEnumValue({FOO: 'X', BAR: 2}, b, "bar");

dev().assertEnumValue(unresolvable, subjectOnlyX);
dev().assertEnumValue(resolvable, subjectOnlyY);
dev().assertEnumValue({FOO: 1, BAR: 'Z'}, subjectOnlyZ);

dev().ignoreMe();
user().ignoreMe();
