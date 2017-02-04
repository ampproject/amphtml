/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

import {AmpForm} from '../amp-form';
import {timerFor} from '../../../../src/timer';

describes.realWin('AmpForm Integration', {
  amp: {
    runtimeOn: true,
    ampdoc: 'single',
  },
}, env => {
  const baseUrl = 'http://localhost:31862';
  let doc;
  let sandbox;
  let timer;

  beforeEach(() => {
    sandbox = env.sandbox;
    doc = env.win.document;
    timer = timerFor(env.win);
  });

  function getForm(config) {
    const form = doc.createElement('form');
    form.id = config.id || 'test-form';
    form.setAttribute('method', config.method || 'POST');
    form.setAttribute('target', config.target || '_top');

    const nameInput = doc.createElement('input');
    nameInput.setAttribute('name', 'name');
    nameInput.setAttribute('value', 'John Miller');
    form.appendChild(nameInput);
    form.setAttribute('action-xhr', config.actionXhr);

    const submitButton = doc.createElement('input');
    submitButton.setAttribute('type', 'submit');
    form.appendChild(submitButton);

    if (config.on) {
      form.setAttribute('on', config.on);
    }
    doc.body.appendChild(form);
    return form;
  }

  describe('on=submit:form.submit', () => {
    it('should be protected from recursive-submission', () => {
      const form = getForm({
        id: 'sameform',
        actionXhr: baseUrl + '/form/post',
        on: 'submit:sameform.submit',
      });
      const ampForm = new AmpForm(form);
      sandbox.spy(ampForm, 'handleXhrSubmit_');
      sandbox.spy(ampForm, 'handleSubmitAction_');
      sandbox.spy(ampForm.xhr_, 'fetch');
      form.dispatchEvent(new Event('submit'));
      return timer.promise(10).then(() => {
        // Due to recursive nature of 'on=submit:sameform.submit' we expect
        // the action handler to be called twice, the first time for the
        // actual user submission.
        // The second time in response to the `submit` event being triggered
        // and sameform.submit being invoked.
        expect(ampForm.handleSubmitAction_).to.have.been.calledTwice;

        // However, only the first invocation should be handled completely.
        // and any subsequent calls should be stopped early-on.
        expect(ampForm.handleXhrSubmit_).to.have.been.calledOnce;
        expect(ampForm.xhr_.fetch).to.have.been.calledOnce;
      });
    });
  });

});
