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

import {getServiceForDoc} from './service';
import {dev, user} from './log';
import {
  assertHttpsUrl,
  checkCorsUrl,
  SOURCE_ORIGIN_PARAM,
  isProxyOrigin,
} from './url';

/**
 * @param {!./service/ampdoc-impl.AmpDoc} ampdoc
 */
export function installGlobalSubmitListenerForDoc(ampdoc) {
  return getServiceForDoc(ampdoc, 'submit', ampdoc => {
    ampdoc.getRootNode().addEventListener(
        'submit', onDocumentFormSubmit_, true);
    return {};
  });
}


/**
 * Intercept any submit on the current document and prevent invalid submits from
 * going through.
 *
 * @param {!Event} e
 */
export function onDocumentFormSubmit_(e) {
  if (e.defaultPrevented) {
    return;
  }

  const form = e.target;
  if (!form || form.tagName != 'FORM') {
    return;
  }

  // amp-form extension will add novalidate to all forms to manually trigger
  // validation. In that case `novalidate` doesn't have the same meaning.
  const isAmpFormMarked = form.classList.contains('-amp-form');
  let shouldValidate;
  if (isAmpFormMarked) {
    shouldValidate = !form.hasAttribute('amp-novalidate');
  } else {
    shouldValidate = !form.hasAttribute('novalidate');
  }

  // Safari does not trigger validation check on submission, hence we
  // trigger it manually. In other browsers this would never execute since
  // the submit event wouldn't be fired if the form is invalid.
  if (shouldValidate && form.checkValidity && !form.checkValidity()) {
    e.preventDefault();
  }

  const inputs = form.elements;
  for (let i = 0; i < inputs.length; i++) {
    user().assert(!inputs[i].name ||
        inputs[i].name != SOURCE_ORIGIN_PARAM,
        'Illegal input name, %s found: %s', SOURCE_ORIGIN_PARAM, inputs[i]);
  }

  const action = form.getAttribute('action');
  const actionXhr = form.getAttribute('action-xhr');
  const method = (form.getAttribute('method') || 'GET').toUpperCase();
  if (method == 'GET') {
    // TODO(#5670): Make action optional for method=GET when action-xhr is provided.
    user().assert(action,
        'form action attribute is required for method=GET: %s', form);
    assertHttpsUrl(action, dev().assertElement(form), 'action');
    user().assert(!isProxyOrigin(action),
        'form action should not be on AMP CDN: %s', form);
    checkCorsUrl(action);
  } else if (method == 'POST') {
    if (action) {
      e.preventDefault();
      user().assert(false,
          'form action attribute is invalid for method=POST: %s', form);
    }

    if (!actionXhr) {
      e.preventDefault();
      user().assert(false,
          'Only XHR based (via action-xhr attribute) submissions are support ' +
          'for POST requests. %s',
          form);
    }
  }

  // TODO(#5607): Only require this with method=GET.
  const target = form.getAttribute('target');
  user().assert(target,
      'form target attribute is required: %s', form);
  user().assert(target == '_blank' || target == '_top',
      'form target=%s is invalid can only be _blank or _top: %s', target, form);
  if (actionXhr) {
    checkCorsUrl(actionXhr);
  }
}
