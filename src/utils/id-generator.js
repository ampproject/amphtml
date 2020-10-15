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

/**
 * Returns the "next" function that generates a new sequential ID on each call.
 * @return {function():string}
 */
export function sequentialIdGenerator() {
  let counter = 0;
  return () => String(++counter);
}

/**
 * Returns a function that generates a random id in string format.  The random
 * id will be an integer from 0-99999.
 * @return {function():string}
 */
export function randomIdGenerator() {
  return () => String(Math.floor(Math.random() * 100000));
}
