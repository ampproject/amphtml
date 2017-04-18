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

import {
  addScreenReaderButton,
  initializeScreenReaderButton,
} from '../../src/a11y';

describes.realWin('a11y', {ampCss: true}, env => {
  let parent;
  beforeEach(() => {
    parent = env.win.document.createElement('div');
    parent.id = 'parentId';
    env.win.document.body.appendChild(parent);
  });

  afterEach(() => {
    env.win.document.body.removeChild(parent);
  });

  describe('addScreenReaderButton', () => {
    it('should create screen-reader button', done => {
      const onClick = () => {
        done();
      };

      const button = addScreenReaderButton(parent, 'myLabel', onClick);
      assertScreenReaderElement(button);
      expect(button.getAttribute('aria-label')).to.equal('myLabel');
      expect(button.getAttribute('aria-controls')).to.equal('parentId');
      button.click();
    });

    it('should sequentially position each button', () => {
      const button1 = addScreenReaderButton(parent, 'b1', null);
      const button2 = addScreenReaderButton(parent, 'b2', null);
      const button3 = addScreenReaderButton(parent, 'b3', null);
      const button4 = addScreenReaderButton(parent, 'b4', null);
      const button5 = addScreenReaderButton(parent, 'b5', null);

      assertScreenReaderElement(button1, /** opt_left */ 0);
      assertScreenReaderElement(button2, /** opt_left */ 2);
      assertScreenReaderElement(button3, /** opt_left */ 4);
      assertScreenReaderElement(button4, /** opt_left */ 6);
      assertScreenReaderElement(button5, /** opt_left */ 8);
    });
  });

  describe('initializeScreenReaderButton', () => {
    it('should sequentially position each button', () => {
      const button1 = initializeScreenReaderButton(parent,
          addExistingScreenReaderButton(parent));
      const button2 = initializeScreenReaderButton(parent,
          addExistingScreenReaderButton(parent));
      const button3 = initializeScreenReaderButton(parent,
          addExistingScreenReaderButton(parent));
      const button4 = initializeScreenReaderButton(parent,
          addExistingScreenReaderButton(parent));
      const button5 = initializeScreenReaderButton(parent,
          addExistingScreenReaderButton(parent));

      assertScreenReaderElement(button1, /** opt_left */ 0);
      assertScreenReaderElement(button2, /** opt_left */ 2);
      assertScreenReaderElement(button3, /** opt_left */ 4);
      assertScreenReaderElement(button4, /** opt_left */ 6);
      assertScreenReaderElement(button5, /** opt_left */ 8);
    });

    function addExistingScreenReaderButton(parent) {
      const button = document.createElement('button');
      button.textContent = 'button';
      parent.appendChild(button);
      return button;
    }
  });
});


/**
 * Asserts that the given element is only visible to screen readers.
 */
function assertScreenReaderElement(element, opt_marginLeft) {
  expect(element).to.exist;
  expect(element.classList.contains('i-amphtml-screen-reader')).to.be.true;
  const win = element.ownerDocument.defaultView;
  const computedStyle = win.getComputedStyle(element);
  expect(computedStyle.getPropertyValue('position')).to.equal('absolute');
  expect(computedStyle.getPropertyValue('top')).to.equal('12px');
  expect(computedStyle.getPropertyValue('left')).to.equal('12px');
  expect(computedStyle.getPropertyValue('width')).to.equal('2px');
  expect(computedStyle.getPropertyValue('height')).to.equal('2px');
  expect(computedStyle.getPropertyValue('opacity')).to.equal('0');
  expect(computedStyle.getPropertyValue('overflow')).to.equal('hidden');
  expect(computedStyle.getPropertyValue('border')).to.contain('none');
  expect(computedStyle.getPropertyValue('padding')).to.equal('0px');
  expect(computedStyle.getPropertyValue('display')).to.equal('block');
  expect(computedStyle.getPropertyValue('visibility')).to.equal('visible');

  if (opt_marginLeft != null && opt_marginLeft !== 0) {
    expect(computedStyle.getPropertyValue('margin')).to.equal(
        `0px 0px 0px ${opt_marginLeft}px`);
  } else {
    expect(computedStyle.getPropertyValue('margin')).to.equal('0px');
  }
}
