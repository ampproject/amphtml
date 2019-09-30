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

import {
  ADSENSE_MCRSPV_TAG,
  ADSENSE_RSPV_TAG,
  ADSENSE_RSPV_WHITELISTED_HEIGHT,
} from '../../../../ads/google/utils';
import {MAX_HEIGHT_EXP, ResponsiveState} from '../responsive-state';
import {Services} from '../../../../src/services';
import {
  addAttributesToElement,
  createElementWithAttributes,
} from '../../../../src/dom';
import {forceExperimentBranch} from '../../../../src/experiments';
import {layoutRectLtwh} from '../../../../src/layout-rect';

describes.realWin(
  'responsive-state',
  {
    amp: {
      extensions: [],
    },
  },
  env => {
    let win, doc;
    let lastSizeChangeAttempt;
    let element;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
      const viewport = Services.viewportForDoc(doc);
      env.sandbox.stub(viewport, 'getSize').returns({width: 375, height: 667});
      lastSizeChangeAttempt = null;

      const vsync = Services.vsyncFor(win);
      vsync.run = (vsyncTaskSpec, vsyncState) => {
        if (vsyncTaskSpec.measure) {
          vsyncTaskSpec.measure(vsyncState);
        }
        if (vsyncTaskSpec.mutate) {
          vsyncTaskSpec.mutate(vsyncState);
        }
      };
    });

    function createState(attributes) {
      element = createElementWithAttributes(doc, 'amp-ad', {
        'type': 'adsense',
        'data-ad-client': 'ca-pub-123',
      });
      addAttributesToElement(element, attributes);
      const parent = createElementWithAttributes(doc, 'div', {});
      parent.appendChild(element);
      doc.body.appendChild(parent);
      env.sandbox
        .stub(element, 'getLayoutBox')
        .returns(layoutRectLtwh(50, 200, 375, 100));

      env.sandbox.stub(element, 'getImpl').returns(
        Promise.resolve({
          attemptChangeSize: (h, w) => {
            lastSizeChangeAttempt = {height: h, width: w};
            return Promise.resolve();
          },
        })
      );

      return ResponsiveState.createIfResponsive(element);
    }

    describe('createIfResponsive', () => {
      it('should return non null for a responsive element', () => {
        const state = createState({'data-auto-format': [ADSENSE_RSPV_TAG]});
        expect(state).to.not.be.null;
      });
      it('should return null for a non responsive element', () => {
        const state = createState({});
        expect(state).to.be.null;
      });
    });

    describe('isValidElement', () => {
      it('should return false if there is no data-full-width attribute', () => {
        const state = createState({
          'data-auto-format': [ADSENSE_RSPV_TAG],
          'height': [ADSENSE_RSPV_WHITELISTED_HEIGHT],
          'width': '100vw',
        });
        expect(state.isValidElement()).to.be.false;
      });

      it('should return false if the height is not whitelisted', () => {
        const state = createState({
          'data-auto-format': [ADSENSE_RSPV_TAG],
          'height': '310',
          'width': '100vw',
        });
        expect(state.isValidElement()).to.be.false;
      });

      it('should return false if the width is not whitelisted', () => {
        const state = createState({
          'data-auto-format': [ADSENSE_RSPV_TAG],
          'data-full-width': '',
          'height': [ADSENSE_RSPV_WHITELISTED_HEIGHT],
          'width': '90vw',
        });
        expect(state.isValidElement()).to.be.false;
      });

      it('should return true for a valid element', () => {
        const state = createState({
          'data-auto-format': [ADSENSE_RSPV_TAG],
          'data-full-width': '',
          'height': [ADSENSE_RSPV_WHITELISTED_HEIGHT],
          'width': '100vw',
        });
        expect(state.isValidElement()).to.be.true;
      });
    });

    describe('getRafmtParam', () => {
      it(`should return 13 for data-auto-format="${ADSENSE_RSPV_TAG}"`, () => {
        const state = createState({
          'data-auto-format': [ADSENSE_RSPV_TAG],
          'data-full-width': '',
          'height': [ADSENSE_RSPV_WHITELISTED_HEIGHT],
          'width': '100vw',
        });
        expect(state.getRafmtParam()).to.be.equal(13);
      });

      it(`should return 15 for data-auto-format="${ADSENSE_MCRSPV_TAG}"`, () => {
        const state = createState({
          'data-auto-format': [ADSENSE_MCRSPV_TAG],
          'data-full-width': '',
          'height': [ADSENSE_RSPV_WHITELISTED_HEIGHT],
          'width': '100vw',
        });
        expect(state.getRafmtParam()).to.be.equal(15);
      });
    });

    describe('attemptChangeSize', () => {
      it(`should attempt to set the right size for data-auto-format="${ADSENSE_RSPV_TAG}" without height fix experiment`, async () => {
        const state = createState({
          'data-auto-format': [ADSENSE_RSPV_TAG],
          'data-full-width': '',
          'height': [ADSENSE_RSPV_WHITELISTED_HEIGHT],
          'width': '100vw',
        });

        await state.attemptChangeSize();

        expect(lastSizeChangeAttempt).to.be.deep.equal({
          height: 300,
          width: 375,
        });
      });

      it(`should attempt to set the right size for data-auto-format="${ADSENSE_RSPV_TAG}" with height fix experiment`, async () => {
        forceExperimentBranch(
          win,
          MAX_HEIGHT_EXP.branch,
          MAX_HEIGHT_EXP.experiment
        );

        const state = createState({
          'data-auto-format': [ADSENSE_RSPV_TAG],
          'data-full-width': '',
          'height': [ADSENSE_RSPV_WHITELISTED_HEIGHT],
          'width': '100vw',
        });

        await state.attemptChangeSize();

        expect(lastSizeChangeAttempt).to.be.deep.equal({
          height: 313,
          width: 375,
        });
      });

      it(`should attempt to set the right size for data-auto-format="${ADSENSE_MCRSPV_TAG}"`, async () => {
        const state = createState({
          'data-auto-format': [ADSENSE_MCRSPV_TAG],
          'data-full-width': '',
          'height': '500px',
          'width': '100vw',
        });

        await state.attemptChangeSize();

        expect(lastSizeChangeAttempt).to.be.deep.equal({
          height: 1386,
          width: 375,
        });
      });
    });

    describe('alignToViewport', () => {
      it('aligns a responsive element with the viewport edges in LTR', () => {
        const state = createState({
          'data-auto-format': [ADSENSE_RSPV_TAG],
          'data-full-width': '',
          'height': '500px',
          'width': '100vw',
        });

        state.alignToViewport();

        expect(element.style.marginLeft).to.be.equal('-50px');
        expect(element.style.marginRight).to.be.equal('');
      });

      it('aligns a responsive element with the viewport edges in RTL', () => {
        const state = createState({
          'data-auto-format': [ADSENSE_RSPV_TAG],
          'data-full-width': '',
          'height': '500px',
          'width': '100vw',
        });
        element.parentElement.style.direction = 'rtl';

        state.alignToViewport();

        expect(element.style.marginLeft).to.be.equal('');
        expect(element.style.marginRight).to.be.equal('50px');

        element.parentElement.style.direction = '';
      });
    });
  }
);
