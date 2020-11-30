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

import {dev} from '../../../src/log';
import {getInstance} from 'amphtml-validator';
import {htmlFor} from '../../../src/static-template';

/**
 * Creates a tab content, will be deleted when the tabs get implemented.
 * @param {!Window} win
 * @param {string} storyUrl
 * @param {string} name
 * @return {!Element} the layout
 */
export function createTabLogsElement(win, storyUrl) {
  const element = win.document.createElement('amp-story-dev-tools-tab-logs');
  element.setAttribute('story-url', storyUrl);
  return element;
}

/**
 * Fetches the contents of a URL as a Promise.
 * @private
 * @param {string} url
 * @return {!Promise<string>} The fetched document.
 */
function getUrl(url) {
  return new Promise(function (resolve, reject) {
    const xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () {
      if (xhr.readyState == 4) {
        if (xhr.status == 200) {
          resolve(xhr.responseText);
        } else {
          reject('Fetching file for validation failed: ' + url);
        }
      }
    };
    xhr.open('GET', url, true);
    xhr.send();
  });
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

export class AmpStoryDevToolsTabLogs extends AMP.BaseElement {
  /** @param {!Element} element */
  constructor(element) {
    super(element);

    /** @protected  {string} */
    this.storyUrl_ = '';
  }

  /** @override */
  buildCallback() {
    this.storyUrl_ = this.element.getAttribute('story-url');
    this.element.classList.add('i-amphtml-story-dev-tools-tab');

    getInstance().then((validator) => {
      this.validateUrl_(validator.sandbox.amp.validator, this.storyUrl_);
    });
  }

  /**
   * Validates a URL input, showing the errors on the screen.
   *
   * @private
   * @param {!Validator} validator
   * @param {string} url
   */
  validateUrl_(validator, url) {
    getUrl(url).then(
      (html) => {
        const htmlLines = html.split('\n');
        const validationResult = validator.validateString(html);
        const errorList = validationResult.errors.map((error) => {
          error.lineContent = htmlLines.slice(error.line - 2, error.line + 3);
          error.message = validator.renderErrorMessage(error);
          return error;
        });
        this.buildLogsList_(errorList);
      },
      (reason) => {
        dev().error('AMP-STORY-DEV-TOOLS', reason);
      }
    );
  }

  /**
   * @private
   * @param {Array<Object>} errorList
   */
  buildLogsList_(errorList) {
    this.mutateElement(() => {
      this.element.appendChild(this.buildLogsTitle_(errorList.length));
      errorList.forEach((content) => {
        const logEl = buildLogMessageTemplate(this.element);
        logEl.querySelector('.i-amphtml-story-dev-tools-log-type').textContent =
          content.code;
        const codeEl = logEl.querySelector(
          '.i-amphtml-story-dev-tools-log-code'
        );
        content.lineContent.forEach((l, i) => {
          const lineEl = this.element.ownerDocument.createElement('div');
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
        this.element.appendChild(logEl);
      });
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
    const title = htmlFor(this.element)`<h1></h1>`;
    const statusText = htmlFor(this.element)`<span></span>`;
    statusText.textContent = errorCount
      ? `Failed - ${errorCount} errors`
      : 'Passed';
    title.appendChild(statusIcon);
    title.appendChild(statusText);
    return title;
  }
}
