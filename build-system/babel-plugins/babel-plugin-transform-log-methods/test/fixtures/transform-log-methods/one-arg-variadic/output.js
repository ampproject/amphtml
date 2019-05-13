/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
// One argument in variadic method, should be indirected unless the message
// argument itself is variable or the string is small enough that indirection
// would increase file size.
user().assert(false, variableMessage);
user().assert(false, 'Hello');
user().assert(user(), user().l("0", name));
const result3 = user().assert(user(), user().l("0", name));
user().assertElement(element, user().l("1", element));
dev().assertEnumValue(foo, bar, dev().l("2"));
