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
/* eslint-disable indent */
/* eslint-disable amphtml-internal/html-template */
const {html, joinFragments} = require('./html');

const serveModes = [
  {
    value: 'default',
    description: `Unminified AMP JavaScript is served from the local server. For
    local development you will usually want to serve unminified JS to test your
    changes.`,
  },
  {
    value: 'compiled',
    description: `Minified AMP JavaScript is served from the local server. This
      is only available after running \`gulp dist--fortesting \`.`,
  },
  {
    value: 'cdn',
    description: 'Minified AMP JavaScript is served from the AMP Project CDN.',
  },
];

const SelectorBlock = ({id, value, selected, children}) => html`
  <div
    class="selector-block"
    ${selected ? ' selected' : ''}
    id="${id}"
    option="${value}"
  >
    <div class="check-icon icon"></div>
    ${children}
  </div>
`;

const ServeModeSelector = ({serveMode}) => html`
  <form
    action="/serve_mode_change"
    action-xhr="/serve_mode_change"
    target="_blank"
    id="serve-mode-form"
  >
    <amp-selector
      layout="container"
      on="select:serve-mode-form.submit"
      name="mode"
    >
      ${joinFragments(serveModes, ({value, description}) =>
        SelectorBlock({
          id: `serve_mode_${value}`,
          value,
          selected: serveMode == value,
          children: html`
            <strong>${value}</strong>
            <p>${description}</p>
          `,
        })
      )}
    </amp-selector>
  </form>
`;

const SettingsOpenButton = () => html`
  <div
    on="tap: settings-modal.open"
    role="button"
    tabindex="0"
    class="settings-cog-icon icon"
  >
    Settings
  </div>
`;

const SettingsCloseButton = () => html`
  <div
    on="tap: settings-modal.close"
    role="button"
    tabindex="1"
    class="close-icon icon"
  >
    Close Settings
  </div>
`;

const SettingsModal = ({serveMode}) => html`
  <amp-lightbox layout="nodisplay" id="settings-modal">
    <div
      class="settings-modal-header"
      on="tap: settings-modal.close"
      role="button"
      tabindex="1"
    >
      <div class="wrap">
        <div class="settings-close-button-container">
          ${SettingsCloseButton()}
        </div>
      </div>
    </div>
    <div class="settings-modal-content">
      <div class="wrap settings-modal-main">
        <h3>Settings</h3>
        <h4>JavaScript Serve Mode</h4>
        ${ServeModeSelector({serveMode})}
      </div>
    </div>
  </amp-lightbox>
`;

module.exports = {SettingsModal, SettingsOpenButton};
