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
/* eslint-disable amphtml-internal/html-template */
'use strict';

// pass-through for syntax highlighting
const html = (strings, ...values) =>
  strings.map((string, i) => string + (values[i] || '')).join('');

const renderTemplate = ({bundle, css, initialState}) => html`
  <!doctype html>
  <html>
  <head>
    <title>AMP Dev Server</title>
    <meta charset="utf-8">
    <style>
    ${css}
    </style>
  </head>
  <body>
    <div class="component-root"></div>
    <script>
      window.AMP_PREACT_STATE = ${JSON.stringify(initialState)};
    </script>
    <script>
      ${bundle}
    </script>
    <div class="center">
      Built with 💙  by
      <a href="https://ampproject.org" class="underlined">the AMP Project</a>.
    </div>
  </body>
  </html>`;

module.exports = {renderTemplate};
