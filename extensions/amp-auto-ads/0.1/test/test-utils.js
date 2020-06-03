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

import {Services} from '../../../../src/services';
import {getElementLayoutBox} from '../utils';
import {layoutRectLtwh} from '../../../../src/layout-rect';

const BOX = layoutRectLtwh(1, 5, 10, 10);

describes.realWin('amp-auto-ads utils', {amp: true}, (env) => {
  let win;
  let element;
  let measureStub;

  beforeEach(() => {
    win = env.win;

    element = env.createAmpElement('amp-foobar');
    win.document.body.appendChild(element);
  });

  describe('getElementLayoutBox', () => {
    beforeEach(() => {
      const viewport = Services.viewportForDoc(element);
      measureStub = env.sandbox
        .stub(viewport, 'getLayoutRect')
        .callsFake((el) => {
          if (el === element) {
            return BOX;
          }
        });
    });

    it('should measure the element', () => {
      return expect(getElementLayoutBox(element)).to.eventually.eql(BOX);
    });

    it('should only measure once for resource backed element', () => {
      const resources = Services.resourcesForDoc(element);
      resources.add(element);
      return getElementLayoutBox(element)
        .then((layoutBox) => {
          expect(layoutBox).to.eql(BOX);
          expect(measureStub).to.be.calledOnce;
        })
        .then(() => {
          return getElementLayoutBox(element);
        })
        .then((layoutBox) => {
          expect(layoutBox).to.eql(BOX);
          expect(measureStub).to.be.calledOnce;
        });
    });
  });
});
