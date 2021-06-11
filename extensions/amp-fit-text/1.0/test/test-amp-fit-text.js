/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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

import '../amp-fit-text';
import {computedStyle} from '#core/dom/style';
import {createElementWithAttributes} from '#core/dom';
import {expect} from 'chai';
import {toggleExperiment} from '#experiments';
import {useStyles} from '../component.jss';
import {waitFor} from '../../../../testing/test-helper';

describes.realWin(
  'amp-fit-text component',
  {
    amp: {
      extensions: ['amp-fit-text:1.0'],
    },
  },
  (env) => {
    let win, doc;
    const styles = useStyles();

    async function waitForRender(element) {
      doc.body.appendChild(element);
      await element.buildInternal();
      const getContent = () => {
        return (
          element.shadowRoot &&
          element.shadowRoot.querySelector('slot:not([name])')
        );
      };
      await waitFor(getContent, 'rendered');
    }

    async function expectAsyncStyle(element, property, value) {
      const content = element.shadowRoot.querySelector(
        `[class*=${styles['fitTextContent']}]`
      );
      await waitFor(
        () => computedStyle(win, content)[property] === value,
        `${property} applied`
      );
      expect(computedStyle(win, content)[property]).to.equal(value);
    }

    beforeEach(() => {
      win = env.win;
      doc = win.document;
      toggleExperiment(win, 'bento-fit-text', true);
    });

    afterEach(() => {
      toggleExperiment(win, 'bento-timeago', false);
    });

    it('renders', async () => {
      const text = 'Lorem ipsum';
      const element = createElementWithAttributes(doc, 'amp-fit-text', {
        width: '100',
        height: '200',
        style: 'font-family: Arial;',
      });
      element.textContent = text;
      await waitForRender(element);

      const assignedNodes = element.shadowRoot
        .querySelector('slot:not([name])')
        .assignedNodes();
      expect(assignedNodes).to.have.lengthOf(1);
      expect(assignedNodes[0].nodeType).to.equal(3);
      expect(assignedNodes[0].wholeText).to.equal(text);
      await expectAsyncStyle(element, 'fontSize', '35px');
    });

    it('respects min-font-size', async () => {
      const text = 'Lorem ipsum';
      const element = createElementWithAttributes(doc, 'amp-fit-text', {
        width: '100',
        height: '200',
        style: 'font-family: Arial;',
        'min-font-size': 40,
      });
      element.textContent = text;
      await waitForRender(element);

      const assignedNodes = element.shadowRoot
        .querySelector('slot:not([name])')
        .assignedNodes();
      expect(assignedNodes).to.have.lengthOf(1);
      expect(assignedNodes[0].nodeType).to.equal(3);
      expect(assignedNodes[0].wholeText).to.equal(text);
      await expectAsyncStyle(element, '40px');
    });

    it('respects max-font-size', async () => {
      const text = 'Lorem ipsum';
      const element = createElementWithAttributes(doc, 'amp-fit-text', {
        width: '100',
        height: '200',
        style: 'font-family: Arial;',
        'max-font-size': 32,
      });
      element.textContent = text;
      await waitForRender(element);

      const assignedNodes = element.shadowRoot
        .querySelector('slot:not([name])')
        .assignedNodes();
      expect(assignedNodes).to.have.lengthOf(1);
      expect(assignedNodes[0].nodeType).to.equal(3);
      expect(assignedNodes[0].wholeText).to.equal(text);
      await expectAsyncStyle(element, 'fontSize', '32px');
    });

    it('respects equal min-font-size and max-font-size', async () => {
      const text = 'Lorem ipsum';
      const element = createElementWithAttributes(doc, 'amp-fit-text', {
        width: '100',
        height: '200',
        style: 'font-family: Arial;',
        'min-font-size': 50,
        'max-font-size': 50,
      });
      element.textContent = text;
      await waitForRender(element);

      const assignedNodes = element.shadowRoot
        .querySelector('slot:not([name])')
        .assignedNodes();
      expect(assignedNodes).to.have.lengthOf(1);
      expect(assignedNodes[0].nodeType).to.equal(3);
      expect(assignedNodes[0].wholeText).to.equal(text);
      await expectAsyncStyle(element, '50px');
    });

    it('respects min-font-size over max-font-size', async () => {
      const text = 'Lorem ipsum';
      const element = createElementWithAttributes(doc, 'amp-fit-text', {
        width: '100',
        height: '200',
        style: 'font-family: Arial;',
        'max-font-size': 40,
        'min-font-size': 50,
      });
      element.textContent = text;
      await waitForRender(element);

      const assignedNodes = element.shadowRoot
        .querySelector('slot:not([name])')
        .assignedNodes();
      expect(assignedNodes).to.have.lengthOf(1);
      expect(assignedNodes[0].nodeType).to.equal(3);
      expect(assignedNodes[0].wholeText).to.equal(text);
      await expectAsyncStyle(element, '50px');
    });

    it('supports update of textContent', async () => {
      const text = 'Lorem ipsum';
      const element = createElementWithAttributes(doc, 'amp-fit-text', {
        width: '100',
        height: '200',
        style: 'font-family: Arial;',
      });
      element.textContent = text;
      await waitForRender(element);

      const assignedNodes = element.shadowRoot
        .querySelector('slot:not([name])')
        .assignedNodes();
      expect(assignedNodes).to.have.lengthOf(1);
      expect(assignedNodes[0].nodeType).to.equal(3);
      expect(assignedNodes[0].wholeText).to.equal(text);
      await expectAsyncStyle(element, 'fontSize', '35px');

      const newText = 'updated';
      element.textContent = newText;
      const newAssignedNodes = element.shadowRoot
        .querySelector('slot:not([name])')
        .assignedNodes();
      expect(newAssignedNodes).to.have.lengthOf(1);
      expect(newAssignedNodes[0].nodeType).to.equal(3);
      expect(newAssignedNodes[0].wholeText).to.equal(newText);

      await expectAsyncStyle(element, 'fontSize', '27px');
    });

    it('re-calculates font size if a resize is detected by the measurer', async () => {
      const text = 'Lorem ipsum';
      const element = createElementWithAttributes(doc, 'amp-fit-text', {
        width: '100',
        height: '200',
        style: 'font-family: Arial;',
      });
      element.textContent = text;
      await waitForRender(element);

      const assignedNodes = element.shadowRoot
        .querySelector('slot:not([name])')
        .assignedNodes();
      expect(assignedNodes).to.have.lengthOf(1);
      expect(assignedNodes[0].nodeType).to.equal(3);
      expect(assignedNodes[0].wholeText).to.equal(text);
      await expectAsyncStyle(element, 'fontSize', '35px');

      element.setAttribute('width', '50');
      element.setAttribute('height', '100');
      element.style.width = '50px';
      element.style.height = '100px';
      await expectAsyncStyle(element, 'fontSize', '17px');
    });
  }
);
