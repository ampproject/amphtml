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
const key = JSON.parse("{\"plugins\":[[\"../../../..\",{\"freeze\":true}]],\"sourceType\":\"module\"}", function (key, val) {
  if (typeof val === 'object') Object.freeze(val);
  return val;
});
const string = JSON.parse("{\"plugins\":[[\"../../../..\",{\"freeze\":true}]],\"sourceType\":\"module\"}", function (key, val) {
  if (typeof val === 'object') Object.freeze(val);
  return val;
});
