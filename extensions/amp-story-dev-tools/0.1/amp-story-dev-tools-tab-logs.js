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

import {Services} from '../../../src/services';
import {htmlFor} from '../../../src/static-template';
import {loadScript} from '../../../src/validator-integration';
import {urls} from '../../../src/config';
import {user, userAssert} from '../../../src/log';

/**
 * Creates a tab content, will be deleted when the tabs get implemented.
 * @param {!Window} win
 * @param {string} storyUrl
 * @return {!Element} the layout
 */
export function createTabLogsElement(win, storyUrl) {
  const element = win.document.createElement('amp-story-dev-tools-tab-logs');
  element.setAttribute('data-story-url', storyUrl);
  return element;
}

/**
 * Returns a "failed" or "passed" icon from the status
 * @param {!Element} element
 * @param {boolean} statusPassed
 * @return {!Element}
 */
function buildStatusIcon(element, statusPassed) {
  const html = htmlFor(element);
  if (statusPassed) {
    return html`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20">
      <path
        d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM8 15L4 11L5.4 9.6L8 12.2L14.6 5.6L16 7L8 15Z"
        fill="#2DE561"
      />
    </svg>`;
  } else {
    return html`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20">
      <path
        xmlns="http://www.w3.org/2000/svg"
        d="M9.99 0C4.47 0 0 4.48 0 10C0 15.52 4.47 20 9.99 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 9.99 0ZM11 10C11 10.55 10.55 11 10 11C9.45 11 9 10.55 9 10V6C9 5.45 9.45 5 10 5C10.55 5 11 5.45 11 6V10ZM11 14C11 14.55 10.55 15 10 15C9.45 15 9 14.55 9 14C9 13.45 9.45 13 10 13C10.55 13 11 13.45 11 14Z"
        fill="#FF5252"
      />
    </svg>`;
  }
}

const buildLogMessageTemplate = (element) => {
  const html = htmlFor(element);
  return html`<div class="i-amphtml-story-dev-tools-log-message">
    <div>
      <span class="i-amphtml-story-dev-tools-log-type"></span>
      <span> at </span>
      <span class="i-amphtml-story-dev-tools-log-position"></span>
    </div>
    <span class="i-amphtml-story-dev-tools-log-description"></span>
    <a class="i-amphtml-story-dev-tools-log-spec" target="_blank">Learn more</a>
    <pre class="i-amphtml-story-dev-tools-log-code"></pre>
  </div>`;
};

/** @const {string} */
const TAG = 'AMP_STORY_DEV_TOOLS_LOGS';

export class AmpStoryDevToolsTabLogs extends AMP.BaseElement {
  /** @param {!Element} element */
  constructor(element) {
    super(element);

    /** @private  {string} */
    this.storyUrl_ = '';
  }

  /** @override */
  buildCallback() {
    this.storyUrl_ = this.element.getAttribute('data-story-url');
    this.element.classList.add('i-amphtml-story-dev-tools-tab');
  }

  /** @override */
  layoutCallback() {
    return loadScript(
      this.element.ownerDocument,
      `${urls.cdn}/v0/validator.js`
    ).then(() => {
      this.validateUrl_(/* global amp: false */ amp.validator, this.storyUrl_);
    });
  }

  /**
   * Validates a URL input, showing the errors on the screen.
   *
   * @private
   * @param {!Validator} validator
   * @param {string} url
   * @return {!Promise}
   */
  validateUrl_(validator, url) {
    return Services.xhrFor(this.win)
      .fetchText(url)
      .then((response) => {
        userAssert(response.ok, 'Invalid story url');
        return response.text();
      })
      .then((html) => {
        const htmlLines = html.split('\n');
        const validationResult = validator.validateString(html);
        const errorList = validationResult.errors.map((error) => {
          error.htmlLines = htmlLines.slice(error.line - 2, error.line + 3);
          error.message = validator.renderErrorMessage(error);
          return error;
        });
        return this.buildLogsList_(errorList);
      })
      .catch((error) => {
        user().error(TAG, error);
      });
  }

  /**
   * @private
   * @param {Array<Object>} errorList
   * @return {!Promise}
   */
  buildLogsList_(errorList) {
    const logsContainer = this.element.ownerDocument.createElement('div');
    logsContainer.appendChild(this.buildLogsTitle_(errorList.length));
    errorList.forEach((content) => {
      const logEl = buildLogMessageTemplate(this.element);
      logEl.querySelector('.i-amphtml-story-dev-tools-log-type').textContent =
        content.code;
      const codeEl = logEl.querySelector('.i-amphtml-story-dev-tools-log-code');
      content.htmlLines.forEach((l, i) => {
        const lineEl = this.element.ownerDocument.createElement('span');
        lineEl.classList.add('i-amphtml-story-dev-tools-log-code-line');
        lineEl.textContent = (i + content.line - 1).toString() + '|' + l;
        codeEl.appendChild(lineEl);
      });
      logEl.querySelector(
        '.i-amphtml-story-dev-tools-log-position'
      ).textContent = `${content.line}:${content.col}`;
      logEl.querySelector(
        '.i-amphtml-story-dev-tools-log-description'
      ).textContent = content.message;
      const specUrlElement = logEl.querySelector(
        '.i-amphtml-story-dev-tools-log-spec'
      );
      if (content.specUrl) {
        specUrlElement.href = content.specUrl;
      } else {
        specUrlElement.remove();
      }
      logsContainer.appendChild(logEl);
    });
    this.mutateElement(() => {
      this.element.textContent = '';
      this.element.appendChild(logsContainer);
    });
  }

  /**
   *
   * @private
   * @param {number} errorCount
   * @return {!Element}
   */
  buildLogsTitle_(errorCount) {
    const statusIcon = buildStatusIcon(this.element, errorCount == 0);
    statusIcon.classList.add('i-amphtml-story-dev-tools-log-status-icon');
    const title = htmlFor(
      this.element
    )`<div class="i-amphtml-story-dev-tools-log-status-title"></div>`;
    const statusText = htmlFor(this.element)`<span></span>`;
    statusText.textContent = errorCount
      ? `Failed - ${errorCount} errors`
      : 'Passed';
    title.appendChild(statusIcon);
    title.appendChild(statusText);
    return title;
  }
}
