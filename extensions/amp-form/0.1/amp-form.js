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

import {isLayoutSizeDefined} from '../../../src/layout';
import {user} from '../../../src/log';
import {getService} from '../../../src/service';
import {xhrFor} from '../../../src/xhr';
import {childElement, removeElement} from '../../../src/dom';
import {templatesFor} from '../../../src/template';
import {toArray} from '../../../src/types';
import {onDocumentReady} from '../../../src/document-ready';
import {isExperimentOn} from '../../../src/experiments';

/** @const @type {string} */
const TAG = 'amp-form';

class AmpForm {

  constructor(element, win) {
    /** @const @private {!Window} */
    this.win_ = win;

    /** @const @private {!Element} */
    this.form_ = element;

    /** @const @private {!Templates} */
    this.templates_ = templatesFor(this.win_);

    /** @const @private {!Xhr} */
    this.xhr_ = xhrFor(this.win_);

    /** @const @private {string} */
    this.method_ = this.form_.getAttribute('method') || 'POST';

    /** @const @private {string} */
    this.action_ = user.assert(this.form_.getAttribute('action'),
        'amp-form requires action attribute %s', this.form_);

    this.installSubmitHandler_();
  }

  /** @private */
  installSubmitHandler_() {
    this.form_.addEventListener('submit', e => {
      // Safari does not trigger validation check on submission, hence we
      // trigger it manually. In other browsers this would never execute since
      // the submit event wouldn't be fired if the form is invalid.
      if (!this.form_.checkValidity()) {
        this.form_.classList.remove('valid');
        this.form_.classList.add('invalid');
        // TODO: This would prevent submission but Safari won't display any messaging.
        // Validation messages are available on fields provided by browser using
        // the .validity object. We need to provide a bubble UI to display
        // these messages.
        e.preventDefault();
        return false;
      }

      this.form_.classList.add('valid');
      if (this.form_.classList.contains('invalid')) {
        this.form_.classList.remove('invalid');
        this.form_.classList.add('was-invalid');
      }

      this.xhr_.fetchJson(this.action_, {
        body: new FormData(this.form_),
        method: this.method_,
      }).then(response => this.successHandler_(response))
          .catch(error => this.errorHandler_(error));

      e.preventDefault();
      return false;
    });
  }

  /**
   * @param {!Object} response.
   * @private
   */
  successHandler_(response) {
    this.form_.classList.remove('error');
    this.form_.classList.add('success');
    this.renderTemplate_('success', response);
  }

  /**
   * @param {!Object} error.
   * @private
   */
  errorHandler_(error) {
    this.form_.classList.remove('success');
    this.form_.classList.add('error');
    this.renderTemplate_('error', error);
  }

  /**
   * Renders the template with the given name if one exists.
   * @param {string} name
   * @param {!Object} data
   * @private
   */
  renderTemplate_(name, data) {
    const template = childElement(this.form_,
        el => el.tagName == 'TEMPLATE' && el.hasAttribute(name));
    if (template) {
      // Remove previously rendered messages to clear for new message.
      const messageElement = this.form_.querySelector('.amp-form-messages');
      if (messageElement) {
        removeElement(messageElement);
      }
      this.templates_.renderTemplate(template, data).then(element => {
        element.classList.add('amp-form-messages');
        this.form_.appendChild(element);
      });
    }
  }

}

function installSubmissionHandlers(win) {
  onDocumentReady(win.document, () => {
    toArray(win.document.forms).forEach(form => {
      new AmpForm(form, win);
    });
  });
}

export function installAmpForms(win) {
  return getService(win, 'amp-forms', () => {
    installSubmissionHandlers(win);
    return {};
  });
}

if (isExperimentOn(AMP.win, TAG)) {
  installAmpForms(AMP.win);
}
