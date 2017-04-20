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

import * as sinon from 'sinon';
import {ValidationBubble} from '../validation-bubble';
import {createIframePromise} from '../../../../testing/iframe';

describe('validation-bubble', () => {

  let sandbox;
  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should append a dom element to the document', () => {
    return createIframePromise().then(iframe => {
      new ValidationBubble(iframe.ampdoc);
      expect(iframe.doc.querySelector('.i-amphtml-validation-bubble'))
          .to.not.be.null;
    });
  });

  it('should show and hide bubble', () => {
    return createIframePromise().then(iframe => {
      const targetEl = iframe.doc.createElement('div');
      targetEl.textContent = 'I am the target!';
      targetEl.style.position = 'absolute';
      targetEl.style.top = '300px';
      targetEl.style.left = '400px';
      targetEl.style.width = '200px';
      iframe.doc.body.appendChild(targetEl);

      const bubble = new ValidationBubble(iframe.ampdoc);
      bubble.vsync_ = {
        run: (task, state) => {
          if (task.measure) {
            task.measure(state);
          }
          if (task.mutate) {
            task.mutate(state);
          }
        },
      };
      const bubbleEl = iframe.doc.querySelector('.i-amphtml-validation-bubble');
      bubble.show(targetEl, 'Hello World');
      expect(bubbleEl).to.not.be.null;
      expect(bubbleEl.textContent).to.equal('Hello World');
      expect(bubbleEl.style.display).to.equal('block');
      expect(bubbleEl.style.top).to.equal('290px');
      expect(bubbleEl.style.left).to.equal('500px');

      bubble.hide();
      expect(bubbleEl.style.display).to.equal('none');
    });
  });
});
