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

const documentModes = require('./document-modes');
const {html} = require('./html');
const {KeyValueOptions} = require('./form');

module.exports = () => html`
  <div class="block">
    <form id="proxy-form" action="/proxy" target="_top">
      <label for="proxy-input">
        <span>Load URL by Proxy</span>
        <select name="mode">
          ${KeyValueOptions(documentModes)}
        </select>
        <input
          type="text"
          class="text-input"
          id="proxy-input"
          name="url"
          required
          aria-required="true"
          placeholder="https://"
          pattern="^(https?://)?[^\\s]+$"
        />
      </label>
      <div class="form-info">
        <span>Takes canonical, AMPHTML and Google viewer URLs.</span>
        <a
          href="https://github.com/ampproject/amphtml/blob/master/contributing/TESTING.md#document-proxy"
          target="_blank"
        >
          What's this?
        </a>
      </div>
    </form>
  </div>
`;
