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
import {createElementWithAttributes} from '../../../src/dom';
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
  const iconEl = html`<div
    class="i-amphtml-story-dev-tools-log-status-icon"
  ></div>`;
  iconEl.classList.add(
    'i-amphtml-story-dev-tools-log-status-icon-' +
      (statusPassed ? 'passed' : 'failed')
  );
  return iconEl;
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

    /** @private {!Array} */
    this.errorList_ = [];
  }

  /** @override */
  buildCallback() {
    this.storyUrl_ = this.element.getAttribute('data-story-url');
    this.element.classList.add('i-amphtml-story-dev-tools-tab');
    return loadScript(this.element.ownerDocument, `${urls.cdn}/v0/validator.js`)
      .then(() =>
        this.validateUrl_(/* global amp: false */ amp.validator, this.storyUrl_)
      )
      .then((errorList) => {
        this.errorList_ = errorList;
        this.updateLogsTabIcon(errorList);
      });
  }

  /** @override */
  layoutCallback() {
    return this.buildLogsList_(this.errorList_);
  }

  /** @override */
  prerenderAllowed() {
    return false;
  }

  /**
   * Validates a URL input, showing the errors on the screen.
   *
   * @private
   * @param {!Validator} validator
   * @param {string} url
   * @return {!Promise<Array>} promise of list of errors
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
        return validationResult.errors.map((error) => {
          error.htmlLines = htmlLines.slice(error.line - 2, error.line + 3);
          error.message = validator.renderErrorMessage(error);
          return error;
        });
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

  /**
   * Updates the icon (passed / failed) next to the logs tab selector.
   * @param {!Array} errorList
   */
  updateLogsTabIcon(errorList) {
    const logsTabSelector = this.win.document.querySelector(
      '[data-tab="Logs"]'
    );
    if (!logsTabSelector) {
      return;
    }
    let statusIcon;
    if (errorList.length) {
      statusIcon = createElementWithAttributes(
        this.element.ownerDocument,
        'span',
        {
          'class': 'i-amphtml-story-dev-tools-log-status-number-failed',
        }
      );
      statusIcon.textContent = errorList.length;
    } else {
      statusIcon = buildStatusIcon(this.element, true);
    }
    this.mutateElement(() => logsTabSelector.appendChild(statusIcon));
  }
}
