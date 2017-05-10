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

import {actionServiceForDoc} from './services';
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
  ampdoc.getRootNode().addEventListener('submit', onDocumentFormSubmit_, true);
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

  const form = dev().assertElement(e.target);
  if (!form || form.tagName != 'FORM') {
    return;
  }

  // amp-form extension will add novalidate to all forms to manually trigger
  // validation. In that case `novalidate` doesn't have the same meaning.
  const isAmpFormMarked = form.classList.contains('i-amphtml-form');
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

  if (actionXhr) {
    assertHttpsUrl(actionXhr, form, 'action-xhr');
    user().assert(!isProxyOrigin(actionXhr),
        'form action-xhr should not be on AMP CDN: %s', form);
    checkCorsUrl(actionXhr);
  }
  if (action) {
    assertHttpsUrl(action, form, 'action');
    user().assert(!isProxyOrigin(action),
        'form action should not be on AMP CDN: %s', form);
    checkCorsUrl(action);
  }

  if (method == 'GET') {
    user().assert(actionXhr || action,
        'form action-xhr or action attribute is required for method=GET: %s',
        form);
  } else if (method == 'POST') {
    if (action) {
      const TAG = 'form';
      user().error(TAG,
          'action attribute is invalid for method=POST: %s', form);
    }

    if (!actionXhr) {
      e.preventDefault();
      user().assert(false,
          'Only XHR based (via action-xhr attribute) submissions are support ' +
          'for POST requests. %s',
          form);
    }
  }

  const target = form.getAttribute('target');
  if (target) {
    user().assert(target == '_blank' || target == '_top',
        'form target=%s is invalid can only be _blank or _top: %s',
        target, form);
  } else {
    form.setAttribute('target', '_top');
  }

  // For xhr submissions relay the submission event through action service to
  // allow us to wait for amp-form (and possibly its dependencies) to execute
  // the actual submission. For non-XHR GET we let the submission go through
  // to allow _blank target to work.
  if (actionXhr) {
    e.preventDefault();

    // It's important to stop propagation of the submission to avoid double
    // handling of the event in cases were we are delegating to action service
    // to deliver the submission event.
    e.stopImmediatePropagation();
    actionServiceForDoc(form).execute(form, 'submit', /*args*/ null, form, e);
  }
}
