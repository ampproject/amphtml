/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import {isExperimentOn} from '../../../src/experiments';
import {getService} from '../../../src/service';
import {assertHttpsUrl} from '../../../src/url';
import {user, rethrowAsync} from '../../../src/log';
import {onDocumentReady} from '../../../src/document-ready';
import {xhrFor} from '../../../src/xhr';
import {toArray} from '../../../src/types';
import {startsWith} from '../../../src/string';
import {templatesFor} from '../../../src/template';
import {removeElement} from '../../../src/dom';

/** @type {string} */
const TAG = 'amp-form';

/** @const @enum {string} */
const FormState_ = {
  SUBMITTING: 'submitting',
  SUBMIT_ERROR: 'submit-error',
  SUBMIT_SUCCESS: 'submit-success',
};

export class AmpForm {

  /**
   * Adds functionality to the passed form element and listens to submit event.
   * @param {!HTMLFormElement} element
   */
  constructor(element) {
    /** @const @private {!Window} */
    this.win_ = element.ownerDocument.defaultView;

    /** @const @private {!Element} */
    this.form_ = element;

    /** @const @private {!Templates} */
    this.templates_ = templatesFor(this.win_);

    /** @const @private {!Xhr} */
    this.xhr_ = xhrFor(this.win_);

    /** @const @private {string} */
    this.method_ = this.form_.getAttribute('method') || 'GET';

    /** @const @private {string} */
    this.target_ = this.form_.getAttribute('target');

    /** @const @private {?string} */
    this.xhrAction_ = this.form_.getAttribute('action-xhr');
    if (this.xhrAction_) {
      assertHttpsUrl(this.xhrAction_, this.form_, 'action-xhr');
      user.assert(!startsWith(this.xhrAction_, 'https://cdn.ampproject.org'),
          'form action-xhr should not be on cdn.ampproject.org: %s',
          this.form_);
    }

    const submitButtons = this.form_.querySelectorAll('input[type=submit]');
    user.assert(submitButtons && submitButtons.length > 0,
        'form requires at least one <input type=submit>: %s', this.form_);

    /** @const @private {!Array<!Element>} */
    this.submitButtons_ = toArray(submitButtons);

    /** @private {?string} */
    this.state_ = null;

    this.installSubmitHandler_();
  }

  /** @private */
  installSubmitHandler_() {
    this.form_.addEventListener('submit', e => this.handleSubmit_(e));
  }

  /**
   * @param {!Event} e
   * @private
   */
  handleSubmit_(e) {
    if (e.defaultPrevented) {
      return;
    }

    if (this.state_ == FormState_.SUBMITTING) {
      e.preventDefault();
      return;
    }

    if (this.xhrAction_) {
      e.preventDefault();
      this.setState_(FormState_.SUBMITTING);
      this.xhr_.fetchJson(this.xhrAction_, {
        body: new FormData(this.form_),
        method: this.method_,
        credentials: 'include',
        requireAmpResponseSourceOrigin: true,
      }).then(response => {
        this.setState_(FormState_.SUBMIT_SUCCESS);
        this.renderTemplate_(FormState_.SUBMIT_SUCCESS, response);
      }).catch(error => {
        this.setState_(FormState_.SUBMIT_ERROR);
        this.renderTemplate_(FormState_.SUBMIT_ERROR, error).then(
            rethrowAsync.bind(null, 'Form submission failed:', error));
      });
    } else if (this.target_ == '_top' && this.method_ == 'POST') {
      this.setState_(FormState_.SUBMITTING);
    }
  }

  /**
   * Adds proper classes for the state passed.
   * @param {string} state
   * @private
   */
  setState_(state) {
    this.form_.classList.remove(`amp-form-${this.state_}`);
    this.form_.classList.add(`amp-form-${state}`);
    this.state_ = state;
    this.submitButtons_.forEach(button => {
      if (state == FormState_.SUBMITTING) {
        button.setAttribute('disabled', '');
      } else {
        button.removeAttribute('disabled');
      }
    });
  }

  /**
   * @param {string} state
   * @param {!Object} data
   * @private
   */
  renderTemplate_(state, data) {
    const container = this.form_.querySelector(`[${state}]`);
    if (container) {
      const previousRender = container.querySelector(`.${state}-message`);
      if (previousRender) {
        removeElement(previousRender);
      }
      return this.templates_.findAndRenderTemplate(container, data)
          .then(rendered => {
            rendered.classList.add(`${state}-message`);
            container.appendChild(rendered);
          });
    }
  }
}


/**
 * Installs submission handler on all forms in the document.
 * @param {!Window} win
 */
function installSubmissionHandlers(win) {
  onDocumentReady(win.document, () => {
    toArray(win.document.forms).forEach(form => {
      new AmpForm(form);
    });
  });
}


function installAmpForm(win) {
  return getService(win, 'amp-form', () => {
    if (isExperimentOn(win, TAG)) {
      installSubmissionHandlers(win);
    }
    return {};
  });
}

installAmpForm(AMP.win);
