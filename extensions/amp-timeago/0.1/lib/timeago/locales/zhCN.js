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

export const zhCN = function(number, index) {
  return [
    ['刚刚', '片刻后'],
    ['%s秒前', '%s秒后'],
    ['1分钟前', '1分钟后'],
    ['%s分钟前', '%s分钟后'],
    ['1小时前', '1小时后'],
    ['%s小时前', '%s小时后'],
    ['1天前', '1天后'],
    ['%s天前', '%s天后'],
    ['1周前', '1周后'],
    ['%s周前', '%s周后'],
    ['1月前', '1月后'],
    ['%s月前', '%s月后'],
    ['1年前', '1年后'],
    ['%s年前', '%s年后'],
  ][index];
};
