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

import {isFieldDefault} from '../utils';

describes.realWin('amp-form-utils', {}, env => {
  let doc;

  beforeEach(() => {
    doc = env.win.document;
  });

  describe('isFieldDefault', () => {
    it("returns if a text field's value matches its default value", () => {
      const html = '<input type="text" value="default">';
      doc.body.insertAdjacentHTML('afterbegin', html);
      const element = doc.querySelector('input');

      element.value = 'not default';
      expect(isFieldDefault(element)).to.be.false;

      element.value = 'default';
      expect(isFieldDefault(element)).to.be.true;
    });

    it("returns if a textarea's value matches its default value", () => {
      const html = '<textarea>default</textarea>';
      doc.body.insertAdjacentHTML('afterbegin', html);
      const element = doc.querySelector('textarea');

      element.value = 'not default';
      expect(isFieldDefault(element)).to.be.false;

      element.value = 'default';
      expect(isFieldDefault(element)).to.be.true;
    });

    it("returns if a radio button's value matches its default value", () => {
      const html = `
        <input type="radio" id="radio-a" name="radio" value="A" checked>
        <input type="radio" id="radio-b" name="radio" value="B">
      `;
      doc.body.insertAdjacentHTML('afterbegin', html);

      const optionA = doc.querySelector('#radio-a');
      const optionB = doc.querySelector('#radio-b');

      optionB.checked = true;
      expect(isFieldDefault(optionA)).to.be.false;
      expect(isFieldDefault(optionB)).to.be.false;

      optionA.checked = true;
      expect(isFieldDefault(optionA)).to.be.true;
      expect(isFieldDefault(optionB)).to.be.true;
    });

    it("returns if a checkbox's value matches its default value", () => {
      const html = '<input type="checkbox" checked>';
      doc.body.insertAdjacentHTML('afterbegin', html);
      const checkbox = doc.querySelector('input');

      checkbox.checked = false;
      expect(isFieldDefault(checkbox)).to.be.false;

      checkbox.checked = true;
      expect(isFieldDefault(checkbox)).to.be.true;
    });

    it("returns if a single-select dropdown's selection matches its default selection", () => {
      const html = `
        <select>
          <option value="A" selected>A</option>
          <option value="B">B</option>
        </select>
      `;
      doc.body.insertAdjacentHTML('afterbegin', html);
      const dropdown = doc.querySelector('select');

      dropdown.options[1].selected = true;
      expect(isFieldDefault(dropdown)).to.be.false;

      dropdown.options[0].selected = true;
      expect(isFieldDefault(dropdown)).to.be.true;
    });

    it("returns if a multi-select dropdown's selections match its default selections", () => {
      const html = `
        <select multiple>
          <option value="A" selected>A</option>
          <option value="B">B</option>
        </select>
      `;
      doc.body.insertAdjacentHTML('afterbegin', html);
      const dropdown = doc.querySelector('select');

      dropdown.options[1].selected = true;
      expect(isFieldDefault(dropdown)).to.be.false;

      dropdown.options[1].selected = false;
      expect(isFieldDefault(dropdown)).to.be.true;
    });
  });
});
