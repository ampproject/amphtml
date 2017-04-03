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

export const inBG = function(number, index) {
  return [
    ['এইমাত্র', 'একটা সময়'],
    ['%s সেকেন্ড আগে', '%s এর সেকেন্ডের মধ্যে'],
    ['1 মিনিট আগে', '1 মিনিটে'],
    ['%s এর মিনিট আগে', '%s এর মিনিটের মধ্যে'],
    ['1 ঘন্টা আগে', '1 ঘন্টা'],
    ['%s ঘণ্টা আগে', '%s এর ঘন্টার মধ্যে'],
    ['1 দিন আগে', '1 দিনের মধ্যে'],
    ['%s এর দিন আগে', '%s এর দিন'],
    ['1 সপ্তাহ আগে', '1 সপ্তাহের মধ্যে'],
    ['%s এর সপ্তাহ আগে', '%s সপ্তাহের মধ্যে'],
    ['1 মাস আগে', '1 মাসে'],
    ['%s মাস আগে', '%s মাসে'],
    ['1 বছর আগে', '1 বছরের মধ্যে'],
    ['%s বছর আগে', '%s বছরে'],
  ][index];
};
