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

export function resolveURL(url, path) {
  // Invalid URL
  if (typeof url !== 'string' || url === '') {return '';}
  // Absolute URL http://,https://,//
  if (/^(https?:)?\/\//i.test(url)) {return url;}
  // Data URI
  if (/^data:.*,.*$/i.test(url)) {return url;}
  // Blob URL
  if (/^blob:.*$/i.test(url)) {return url;}
  // Relative URL
  return path + url;
}
