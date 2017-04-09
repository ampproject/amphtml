/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

export const ml = function(number, index) {
  return [
    ['ഇപ്പോള്‍', 'കുറച്ചു മുന്‍പ്'],
    ['%s സെക്കന്റ്‌കള്‍ക്ക് മുന്‍പ്', '%s സെക്കന്റില്‍'],
    ['1 മിനിറ്റിനു മുന്‍പ്', '1 മിനിറ്റില്‍'],
    ['%s മിനിറ്റുകള്‍ക്ക് മുന്‍പ', '%s മിനിറ്റില്‍'],
    ['1 മണിക്കൂറിനു മുന്‍പ്', '1 മണിക്കൂറില്‍'],
    ['%s മണിക്കൂറുകള്‍ക്കു മുന്‍പ്', '%s മണിക്കൂറില്‍'],
    ['1 ഒരു ദിവസം മുന്‍പ്', '1 ദിവസത്തില്‍'],
    ['%s ദിവസങ്ങള്‍ക് മുന്‍പ്', '%s ദിവസങ്ങള്‍ക്കുള്ളില്‍'],
    ['1 ആഴ്ച മുന്‍പ്', '1 ആഴ്ചയില്‍'],
    ['%s ആഴ്ചകള്‍ക്ക് മുന്‍പ്', '%s ആഴ്ചകള്‍ക്കുള്ളില്‍'],
    ['1 മാസത്തിനു മുന്‍പ്', '1 മാസത്തിനുള്ളില്‍'],
    ['%s മാസങ്ങള്‍ക്ക് മുന്‍പ്', '%s മാസങ്ങള്‍ക്കുള്ളില്‍'],
    ['1 വര്‍ഷത്തിനു  മുന്‍പ്', '1 വര്‍ഷത്തിനുള്ളില്‍'],
    ['%s വര്‍ഷങ്ങള്‍ക്കു മുന്‍പ്', '%s വര്‍ഷങ്ങള്‍ക്കുല്ല്ളില്‍'],
  ][index];
};
