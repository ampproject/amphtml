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
import {loadPromise} from '../../../src/event-helper';
import {user} from '../../../src/log';
import {xhrFor} from '../../../src/xhr';
import {childElements, childElement, removeChildren} from '../../../src/dom';
import {templatesFor} from '../../../src/template';
import {CSS} from '../../../build/amp-form-0.1.css';

class AmpForm extends AMP.BaseElement {

  /** @override */
  preconnectCallback(onLayout) {
    this.preconnect.url(this.action_, onLayout);
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == 'container';
  }

  /** @override */
  buildCallback() {
    /** @const @private {!Templates} */
    this.templates_ = templatesFor(this.getWin());

    /** @const @private {!Element} */
    this.container_ = this.getWin().document.createElement('div');
    this.element.appendChild(this.container_);

    /** @const @private {!Element} */
    this.messagesContainer_ = this.getWin().document.createElement('div');
    this.messagesContainer_.classList.add('amp-hidden');
    this.container_.appendChild(this.messagesContainer_);

    //this.messagesContainer_.appendChild();

    /** @const @private {!Xhr} */
    this.xhr_ = xhrFor(this.getWin());

    /** @const @private {!Element} */
    this.form_ = this.getWin().document.createElement('form');

    /** @const @private {!Array<!Element>} */
    this.fields_ = childElements(this.element, el => el.tagName == 'AMP-FIELD');
    this.fields_.forEach(el => {
      this.setAsOwner(el);
      this.form_.appendChild(el);
    });
    this.container_.appendChild(this.form_);

    /** @const @private {string} */
    this.method_ = this.element.getAttribute('method') || 'POST';

    /** @const @private {string} */
    this.action_ = user.assert(this.element.getAttribute('action'),
        'amp-form requires action attribute %s', this.element);

    // TODO: Maybe use an number instead?
    /** @const @private {boolean} */
    this.allowMultipleSubmissions_ = this.element.getAttribute(
        'data-allow-multiple-submissions');
  }

  /** @override */
  layoutCallback() {
    // TODO: Check cookie. If it exists, get it and call renderTemplate_.
    // TODO: Maybe collapse the form and don't show it if already submitted.
    this.form_.addEventListener('submit', e => {
      e.preventDefault();

      this.xhr_.fetchJson(this.action_, {
        body: new FormData(this.form_),
        method: this.method_,
      }).then(response => this.successHandler_(response))
          .catch(error => this.errorHandler_(error));

      return false;
    });
    return Promise.resolve();
  }

  /** @private */
  successHandler_(response) {
    this.renderTemplate_('success', response);
    // TODO: Set cookie.
  }


  /** @private */
  errorHandler_(error) {
    this.renderTemplate_('error', error);
  }

  /** @private */
  renderTemplate_(name, data) {
    removeChildren(this.messagesContainer_);
    const template = childElement(this.element,
        el => el.tagName == 'TEMPLATE' && el.hasAttribute(name));
    this.templates_.renderTemplate(template, data).then(element => {
      element.classList.add(name);
      this.messagesContainer_.appendChild(element);
      this.form_.classList.add('amp-hidden');
      this.messagesContainer_.classList.remove('amp-hidden');
    });
  }

}

AMP.registerElement('amp-form', AmpForm, CSS);
