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

export const ko = function(number, index) {
  return [
    ['방금', '곧'],
    ['%s초 전', '%s초 후'],
    ['1분 전', '1분 후'],
    ['%s분 전', '%s분 후'],
    ['1시간 전', '1시간 후'],
    ['%s시간 전', '%s시간 후'],
    ['1일 전', '1일 후'],
    ['%s일 전', '%s일 후'],
    ['1주일 전', '1주일 후'],
    ['%s주일 전', '%s주일 후'],
    ['1개월 전', '1개월 후'],
    ['%s개월 전', '%s개월 후'],
    ['1년 전', '1년 후'],
    ['%s년 전', '%s년 후'],
  ][index];
};
