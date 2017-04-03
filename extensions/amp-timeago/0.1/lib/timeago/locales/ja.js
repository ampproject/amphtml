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

export const ja = function(number, index) {
  return [
    ['すこし前', 'すぐに'],
    ['%s秒前', '%s秒以内'],
    ['1分前', '1分以内'],
    ['%s分前', '%s分以内'],
    ['1時間前', '1時間以内'],
    ['%s時間前', '%s時間以内'],
    ['1日前', '1日以内'],
    ['%s日前', '%s日以内'],
    ['1週間前', '1週間以内'],
    ['%s週間前', '%s週間以内'],
    ['1ヶ月前', '1ヶ月以内'],
    ['%sヶ月前', '%sヶ月以内'],
    ['1年前', '1年以内'],
    ['%s年前', '%s年以内'],
  ][index];
};
