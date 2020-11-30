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
import {loadScript} from '../../../src/validator-integration';
import {urls} from '../../../src/config';

/**
 * Creates a tab content, will be deleted when the tabs get implemented.
 * @param {!Window} win
 * @param {string} storyUrl
 * @param {string} name
 * @return {!Element} the layout
 */
export function createTabLogsElement(win, storyUrl, name) {
  const element = win.document.createElement('amp-story-dev-tools-tab-logs');
  element.setAttribute('story-url', storyUrl);
  const innerTitle = win.document.createElement('h1');
  innerTitle.textContent = name;
  element.appendChild(innerTitle);
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

    loadScript(this.element.ownerDocument, `${urls.cdn}/v0/validator.js`)
      .then(() => getInstance())
      .then((validator) => {
        this.validateUrlAndLog_(
          validator.sandbox.amp.validator,
          this.storyUrl_
        );
      });
  }

  /**
   * Validates a URL input, logging to the console the result.
   *
   * @private
   * @param {!Validator} validator
   * @param {string} url
   */
  validateUrlAndLog_(validator, url) {
    getUrl(url).then(
      (html) => {
        const htmlLines = html.split('\n');
        const validationResult = validator.validateString(html);
        const errorList = validationResult.errors.map((error) => {
          error.lineContent = htmlLines.slice(error.line - 2, error.line + 3);
          error.message = validator.renderErrorMessage(error);
          return error;
        });
        this.buildErrorList_(errorList);
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
  buildErrorList_(errorList) {
    this.mutateElement(() => {
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
}
