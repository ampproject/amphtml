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

document.getElementById('hello').addEventListener('click', () => {
  const el = document.createElement('h1');
  el.textContent = 'Hello World!';
  document.body.appendChild(el);
});

// <amp-img> should be allowed.
document.getElementById('amp-img').addEventListener('click', () => {
  const el = document.createElement('amp-img');
  el.setAttribute('width', '300');
  el.setAttribute('height', '200');
  el.setAttribute('src', '/examples/img/hero@1x.jpg')
  document.body.appendChild(el);
});

// <script> should be sanitized.
document.getElementById('script').addEventListener('click', () => {
  const el = document.createElement('script');
  document.body.appendChild(el);
});

// <img> should be sanitized.
document.getElementById('img').addEventListener('click', () => {
  const el = document.createElement('img');
  document.body.appendChild(el);
});
