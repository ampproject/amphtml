/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

import {DIRTINESS_INDICATOR_CLASS, FormDirtiness} from '../form-dirtiness';
import {Services} from '../../../../src/services';

function getForm(doc) {
  const form = doc.createElement('form');
  form.setAttribute('method', 'POST');
  doc.body.appendChild(form);

  return form;
}

function changeInput(element, value) {
  element.value = value;
  const event = new Event('input', {bubbles: true});
  element.dispatchEvent(event);
}

describes.realWin('form-dirtiness', {}, env => {
  let doc, form, dirtinessHandler;

  beforeEach(() => {
    doc = env.win.document;
    form = getForm(doc);
    sandbox.stub(Services, 'platformFor').returns({
      isIos() {
        return false;
      },
    });
    dirtinessHandler = new FormDirtiness(form, env.win);
  });

  describe('ignored elements', () => {
    it('does not add dirtiness class if a nameless element changes', () => {
      const nameless = doc.createElement('input');
      form.appendChild(nameless);

      changeInput(nameless, 'changed');

      expect(form).to.not.have.class(DIRTINESS_INDICATOR_CLASS);
    });

    it('does not add dirtiness class if a hidden element changes', () => {
      const hidden = doc.createElement('input');
      hidden.name = 'name';
      hidden.hidden = true;
      form.appendChild(hidden);

      changeInput(hidden, 'changed');

      expect(form).to.not.have.class(DIRTINESS_INDICATOR_CLASS);
    });

    it('does not add dirtiness class if a disabled element changes', () => {
      const disabled = doc.createElement('input');
      disabled.name = 'name';
      disabled.disabled = true;
      form.appendChild(disabled);

      changeInput(disabled, 'changed');
      expect(form).to.not.have.class(DIRTINESS_INDICATOR_CLASS);
    });
  });

  describe('text field changes', () => {
    let textField;

    beforeEach(() => {
      // Element is inserted as HTML so that the `defaultValue` property is
      // generated correctly, since it returns "the default value as
      // **originally specified in the HTML** that created this object."
      // https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement#Properties
      const html = '<input name="name" type="text" value="default">';
      form.insertAdjacentHTML('afterbegin', html);
      textField = form.querySelector('input');
    });

    it('removes dirtiness class when text field is in default state', () => {
      changeInput(textField, textField.defaultValue);
      expect(form).to.not.have.class(DIRTINESS_INDICATOR_CLASS);
    });

    it('removes dirtiness class when text field is empty', () => {
      changeInput(textField, '');
      expect(form).to.not.have.class(DIRTINESS_INDICATOR_CLASS);
    });

    it('adds dirtiness class when text field is changed', () => {
      changeInput(textField, 'changed');
      expect(form).to.have.class(DIRTINESS_INDICATOR_CLASS);
    });

    it('removes dirtiness class when its value matches the submitted value', () => {
      changeInput(textField, 'submitted');
      dirtinessHandler.onSubmitting();
      dirtinessHandler.onSubmitSuccess();
      changeInput(textField, 'submitted');

      expect(form).to.not.have.class(DIRTINESS_INDICATOR_CLASS);
    });
  });

  describe('textarea changes', () => {
    let textarea;

    beforeEach(() => {
      const html = '<textarea name="comment">default</textarea>';
      form.insertAdjacentHTML('afterbegin', html);
      textarea = form.querySelector('textarea');
    });

    it('removes dirtiness class when textarea is in default state', () => {
      changeInput(textarea, textarea.defaultValue);
      expect(form).to.not.have.class(DIRTINESS_INDICATOR_CLASS);
    });

    it('removes dirtiness class when textarea is empty', () => {
      changeInput(textarea, '');
      expect(form).to.not.have.class(DIRTINESS_INDICATOR_CLASS);
    });

    it('adds dirtiness class when textarea is changed', () => {
      changeInput(textarea, 'changed');
      expect(form).to.have.class(DIRTINESS_INDICATOR_CLASS);
    });

    it('removes dirtiness class when its value matches the submitted value', () => {
      changeInput(textarea, 'submitted');
      dirtinessHandler.onSubmitting();
      dirtinessHandler.onSubmitSuccess();
      changeInput(textarea, 'submitted');

      expect(form).to.not.have.class(DIRTINESS_INDICATOR_CLASS);
    });
  });

  describe('#onSubmitting', () => {
    it('clears the dirtiness class', () => {
      const input = doc.createElement('input');
      input.type = 'text';
      input.name = 'text';
      form.appendChild(input);

      changeInput(input, 'changed');
      dirtinessHandler.onSubmitting();

      expect(form).to.not.have.class(DIRTINESS_INDICATOR_CLASS);
    });
  });

  describe('#onSubmitError', () => {
    let input;

    beforeEach(() => {
      input = doc.createElement('input');
      input.type = 'text';
      input.name = 'text';
      form.appendChild(input);
    });

    it('adds the dirtiness class if the form was dirty before submitting', () => {
      changeInput(input, 'changed');
      dirtinessHandler.onSubmitting();
      dirtinessHandler.onSubmitError();

      expect(form).to.have.class(DIRTINESS_INDICATOR_CLASS);
    });

    it('does not add the dirtiness class if the form was clean before submitting', () => {
      changeInput(input, '');
      dirtinessHandler.onSubmitting();
      dirtinessHandler.onSubmitError();

      expect(form).to.have.not.class(DIRTINESS_INDICATOR_CLASS);
    });
  });

  describe('#onSubmitSuccess', () => {
    it('clears the dirtiness class', () => {
      const input = doc.createElement('input');
      input.type = 'text';
      input.name = 'text';
      form.appendChild(input);

      changeInput(input, 'changed');
      dirtinessHandler.onSubmitting();
      dirtinessHandler.onSubmitSuccess();

      expect(form).to.not.have.class(DIRTINESS_INDICATOR_CLASS);
    });
  });
});
