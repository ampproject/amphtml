import {createElementWithAttributes} from '#core/dom';
import {htmlFor} from '#core/dom/static-template';

import {Services} from '#service';

import {userAssert} from '#utils/log';

import * as urls from '../../../src/config/urls';
import {loadScript} from '../../../src/validator-integration';

/**
 * Creates a tab content, will be deleted when the tabs get implemented.
 * @param {!Window} win
 * @param {string} storyUrl
 * @return {!Element} the layout
 */
export function createTabDebugElement(win, storyUrl) {
  const element = win.document.createElement('amp-story-dev-tools-tab-debug');
  element.setAttribute('data-story-url', storyUrl);
  return element;
}

/**
 * Creates the success message when there are no errors.
 * @param {!ELement} element
 * @return {!Element} the layout
 */
const buildSuccessMessageTemplate = (element) => {
  const html = htmlFor(element);
  return html`<div class="i-amphtml-story-dev-tools-debug-success">
    <div class="i-amphtml-story-dev-tools-debug-success-image"></div>
    <h1 class="i-amphtml-story-dev-tools-debug-success-message">
      Great Job!<br />No issues found
    </h1>
  </div>`;
};

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

export class AmpStoryDevToolsTabDebug extends AMP.BaseElement {
  /** @override  */
  static prerenderAllowed() {
    return false;
  }

  /** @param {!Element} element */
  constructor(element) {
    super(element);

    /** @private  {string} */
    this.storyUrl_ = '';

    /** @private {!Array} */
    this.errorList_ = [];
  }

  /** @override */
  isLayoutSupported() {
    return true;
  }

  /** @override */
  buildCallback() {
    this.storyUrl_ = this.element.getAttribute('data-story-url');
    this.element.classList.add('i-amphtml-story-dev-tools-tab');
    return loadScript(
      this.element.ownerDocument,
      `${urls.cdn}/v0/validator_wasm.js`
    )
      .then(() => amp.validator.init())
      .then(() =>
        this.validateUrl_(/* global amp: false */ amp.validator, this.storyUrl_)
      )
      .then((errorList) => {
        this.errorList_ = errorList;
        this.updateDebugTabIcon(errorList);
      });
  }

  /** @override */
  layoutCallback() {
    return this.buildDebugContent_();
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
      });
  }

  /**
   * @private
   * @return {!Promise}
   */
  buildDebugContent_() {
    const debugContainer = this.errorList_.length
      ? this.createErrorsList_()
      : buildSuccessMessageTemplate(this.element);
    debugContainer.prepend(this.buildDebugTitle_(this.errorList_.length));
    this.mutateElement(() => {
      this.element.textContent = '';
      this.element.appendChild(debugContainer);
    });
  }

  /**
   *
   * @private
   * @param {number} errorCount
   * @return {!Element}
   */
  buildDebugTitle_(errorCount) {
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
   * Updates the icon (passed / failed) next to the debug tab selector.
   * @param {!Array} errorList
   */
  updateDebugTabIcon(errorList) {
    const debugTabSelector =
      this.win.document.querySelector('[data-tab="Debug"]');
    if (!debugTabSelector) {
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
    this.mutateElement(() => debugTabSelector.appendChild(statusIcon));
  }

  /**
   * @private
   * @return {!Element}
   */
  createErrorsList_() {
    const debugContainer = this.element.ownerDocument.createElement('div');
    this.errorList_.forEach((content) => {
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
      debugContainer.appendChild(logEl);
    });
    return debugContainer;
  }
}
