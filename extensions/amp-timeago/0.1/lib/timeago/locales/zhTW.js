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

export const zhTW = function(number, index) {
  return [
    ['剛剛', '片刻後'],
    ['%s秒前', '%s秒後'],
    ['1分鐘前', '1分鐘後'],
    ['%s分鐘前', '%s分鐘後'],
    ['1小時前', '1小時後'],
    ['%s小時前', '%s小時後'],
    ['1天前', '1天後'],
    ['%s天前', '%s天後'],
    ['1周前', '1周後'],
    ['%s周前', '%s周後'],
    ['1月前', '1月後'],
    ['%s月前', '%s月後'],
    ['1年前', '1年後'],
    ['%s年前', '%s年後'],
  ][index];
};
