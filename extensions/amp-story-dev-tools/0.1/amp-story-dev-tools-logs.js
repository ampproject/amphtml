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

import {getInstance} from 'amphtml-validator';
import {htmlFor} from '../../../src/static-template';
import {loadScript} from '../../../src/validator-integration';
import {urls} from '../../../src/config';

const buildLogMessageTemplate = (element) => {
  const html = htmlFor(element);
  return html`<div class="i-amphtml-dev-tools-log-message">
    <div>
      <span class="i-amphtml-dev-tools-log-type"></span>
      <span> at </span>
      <span class="i-amphtml-dev-tools-log-position"></span>
    </div>
    <span class="i-amphtml-dev-tools-log-description"></span>
    <a class="i-amphtml-dev-tools-log-spec" target="_blank">Learn more</a>
    <pre class="i-amphtml-dev-tools-log-code"></pre>
  </div>`;
};

export class DevToolsLogTab {
  /**
   *
   * @param {!Element} element the element that will be used to log everything.
   */
  constructor(element) {
    this.element = element;
  }

  /**
   * @public
   * @param {string} url
   */
  setStoryUrl(url) {
    this.element.innerHTML = '<h1>Logs</h1>';
    loadScript(this.element.ownerDocument, `${urls.cdn}/v0/validator.js`)
      .then(() => getInstance())
      .then((validator) => {
        this.validateUrlAndLog_(validator.sandbox.amp.validator, url, (error) =>
          this.addLog_(error)
        );
      });
  }

  /**
   * Returns the root element of the logs.
   * @return {!Element}
   */
  getElement() {
    return this.element;
  }

  /**
   * @private
   * @param {string} content
   */
  addLog_(content) {
    const {code, line, col, specUrl, lineContent, message} = content;
    const logEl = buildLogMessageTemplate(this.element);
    logEl.querySelector('.i-amphtml-dev-tools-log-type').textContent = code;
    const codeEl = logEl.querySelector('.i-amphtml-dev-tools-log-code');
    lineContent.forEach((l, i) => {
      const lineEl = this.element.ownerDocument.createElement('div');
      lineEl.textContent = (i + line - 1).toString() + '|' + l;
      codeEl.appendChild(lineEl);
    });
    logEl.querySelector(
      '.i-amphtml-dev-tools-log-position'
    ).textContent = `${line}:${col}`;
    logEl.querySelector(
      '.i-amphtml-dev-tools-log-description'
    ).textContent = message;
    const specUrlElement = logEl.querySelector('.i-amphtml-dev-tools-log-spec');
    if (specUrl) {
      specUrlElement.href = specUrl;
    } else {
      specUrlElement.remove();
    }
    this.element.appendChild(logEl);
  }

  /**
   * Validates a URL input, logging to the console the result.
   *
   * @private
   * @param {!Validator} validator
   * @param {string} url
   * @param {any} loggingCallback
   */
  validateUrlAndLog_(validator, url, loggingCallback) {
    getUrl_(url).then(
      (html) => {
        const validationResult = validator.validateString(html);
        validationResult.errors.forEach((error) => {
          error.lineContent = html
            .split('\n')
            .slice(error.line - 2, error.line + 3);
          error.message = validator.renderErrorMessage(error);
          loggingCallback(error);
        });
      },
      (reason) => {
        // Failure
        console.error(reason);
      }
    );
  }
}

/**
 * Fetches the contents of a URL as a Promise.
 * @private
 * @param {string} url
 * @return {!Promise<string>} The fetched document.
 */
function getUrl_(url) {
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
