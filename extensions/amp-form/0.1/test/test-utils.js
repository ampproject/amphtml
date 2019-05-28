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
    describe('text field', () => {
      let textField;

      beforeEach(() => {
        const html = '<input type="text" value="default">';
        doc.body.insertAdjacentHTML('afterbegin', html);
        textField = doc.querySelector('input');
      });

      it("returns true if text field's value matches its default value", () => {
        expect(isFieldDefault(textField)).to.be.true;
      });

      it("returns false if text field's value does not match its default value", () => {
        textField.value = 'not default';
        expect(isFieldDefault(textField)).to.be.false;
      });
    });

    describe('textarea', () => {
      let textarea;

      beforeEach(() => {
        const html = '<textarea>default</textarea>';
        doc.body.insertAdjacentHTML('afterbegin', html);
        textarea = doc.querySelector('textarea');
      });

      it("returns true if textarea's value matches its default value", () => {
        expect(isFieldDefault(textarea)).to.be.true;
      });

      it("returns false if textarea's value does not match its default value", () => {
        textarea.value = 'not default';
        expect(isFieldDefault(textarea)).to.be.false;
      });
    });

    describe('radio button', () => {
      let optionA, optionB;

      beforeEach(() => {
        const html = `
          <input type="radio" id="radio-a" name="radio" value="A" checked>
          <input type="radio" id="radio-b" name="radio" value="B">
        `;
        doc.body.insertAdjacentHTML('afterbegin', html);
        optionA = doc.querySelector('#radio-a');
        optionB = doc.querySelector('#radio-b');
      });

      it('returns true if the radio button is in its default state', () => {
        expect(isFieldDefault(optionA)).to.be.true;
        expect(isFieldDefault(optionB)).to.be.true;
      });

      it('returns false if the radio button is not in its default state', () => {
        optionB.checked = true;
        expect(isFieldDefault(optionA)).to.be.false;
        expect(isFieldDefault(optionB)).to.be.false;
      });
    });

    describe('checkbox', () => {
      let checkbox;

      beforeEach(() => {
        const html = '<input type="checkbox" checked>';
        doc.body.insertAdjacentHTML('afterbegin', html);
        checkbox = doc.querySelector('input');
      });

      it('returns true if checkbox is in its default state', () => {
        expect(isFieldDefault(checkbox)).to.be.true;
      });

      it('returns false if checkbox is not in its default state', () => {
        checkbox.checked = false;
        expect(isFieldDefault(checkbox)).to.be.false;
      });
    });

    describe('single select dropdown', () => {
      let dropdown;

      beforeEach(() => {
        const html = `
          <select>
            <option value="A" selected>A</option>
            <option value="B">B</option>
          </select>
        `;
        doc.body.insertAdjacentHTML('afterbegin', html);
        dropdown = doc.querySelector('select');
      });

      it("returns true if the dropdown's selections match its default selections", () => {
        expect(isFieldDefault(dropdown)).to.be.true;
      });

      it("returns false if the dropdown's selections does not match its default selections", () => {
        dropdown.options[1].selected = true;
        expect(isFieldDefault(dropdown)).to.be.false;
      });
    });

    describe('multi select dropdown', () => {
      let dropdown;

      beforeEach(() => {
        const html = `
          <select>
            <option value="A" selected>A</option>
            <option value="B">B</option>
          </select>
        `;
        doc.body.insertAdjacentHTML('afterbegin', html);
        dropdown = doc.querySelector('select');
      });

      it("returns true if the dropdown's selections match its default selections", () => {
        expect(isFieldDefault(dropdown)).to.be.true;
      });

      it("returns false if the dropdown's selections does not match its default selections", () => {
        dropdown.options[1].selected = true;
        expect(isFieldDefault(dropdown)).to.be.false;
      });
    });
  });
});
