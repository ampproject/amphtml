/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

/**
 * @fileoverview Tests full-bleed animations like panning and zooming.
 */

import {AmpStory} from '../amp-story';
import {AmpStoryStoreService} from '../amp-story-store-service';
import {LocalizationService} from '../../../../src/service/localization';
import {Services} from '../../../../src/services';
import {
  calculateTargetScalingFactor,
  targetFitsWithinPage,
} from '../animation-presets-utils';
import {presets} from '../animation-presets';
import {registerServiceBuilder} from '../../../../src/service';

describes.realWin(
  'amp-story-full-bleed-animations',
  {
    amp: {
      runtimeOn: true,
      extensions: ['amp-story:1.0'],
    },
  },
  (env) => {
    let win;
    let storyEl;
    let ampStory;

    beforeEach(() => {
      win = env.win;

      // Required by the bookend code.
      win.document.title = 'Story';

      env.sandbox.stub(win.history, 'replaceState');

      const viewer = Services.viewerForDoc(env.ampdoc);
      env.sandbox.stub(Services, 'viewerForDoc').returns(viewer);

      registerServiceBuilder(win, 'performance', function () {
        return {
          isPerformanceTrackingOn: () => false,
        };
      });

      const localizationService = new LocalizationService(win.document.body);
      env.sandbox
        .stub(Services, 'localizationForDoc')
        .returns(localizationService);

      const storeService = new AmpStoryStoreService(win);
      registerServiceBuilder(win, 'story-store', function () {
        return storeService;
      });

      storyEl = win.document.createElement('amp-story');
      win.document.body.appendChild(storyEl);

      AmpStory.isBrowserSupported = () => true;

      return storyEl.getImpl().then((impl) => {
        ampStory = impl;
      });
    });

    afterEach(() => {
      storyEl.remove();
    });

    /**
     * @param {!Element} container
     * @param {number} count
     * @param {Array<string>=} opt_ids
     * @return {!Array<!Element>}
     */
    function createPages(container, count, opt_ids) {
      return Array(count)
        .fill(undefined)
        .map((unused, i) => {
          const page = win.document.createElement('amp-story-page');
          page.id = opt_ids && opt_ids[i] ? opt_ids[i] : `-page-${i}`;
          container.appendChild(page);
          return page;
        });
    }

    /**
     * @param {!Element} container
     * @param {string} animationName
     * @param {string=} opt_gridLayerTempalate
     */
    function addAnimationToImage(
      container,
      animationName,
      opt_gridLayerTempalate
    ) {
      const img = win.document.createElement('amp-img');
      img.setAttribute('animate-in', animationName);
      img.setAttribute('layout', 'fill');

      env.sandbox
        .stub(img, 'signals')
        .callsFake({whenSignal: () => Promise.resolve()});

      const gridLayer = win.document.createElement('amp-story-grid-layer');
      opt_gridLayerTempalate = opt_gridLayerTempalate.length
        ? opt_gridLayerTempalate
        : 'fill';
      gridLayer.setAttribute('template', opt_gridLayerTempalate);

      gridLayer.appendChild(img);
      container.appendChild(gridLayer);
    }

    it(
      'Should add corresponding CSS class when a full bleed animation target is' +
        ' attached as a child of a grid layer with fill template.',
      async () => {
        const pageEls = createPages(ampStory.element, 1, ['page-1']);
        const pageImpl = await pageEls[0].getImpl();

        // Append an image animated with a full-bleed animation inside a grid-
        // layer with a `fill` template of the first page.
        addAnimationToImage(pageImpl.element, 'pan-down', 'fill');
        pageImpl.buildCallback();
        await pageImpl.layoutCallback();

        ampStory.buildCallback();
        await ampStory.layoutCallback();

        expect(pageImpl.element.firstElementChild).to.have.class(
          'i-amphtml-story-grid-template-with-full-bleed-animation'
        );
      }
    );

    it(
      'Should not add additional CSS class to the target when a full-bleed ' +
        'animation is used BUT the target is a child of a grid layer with a ' +
        'template other than `fill`.',
      async () => {
        const pageEls = createPages(ampStory.element, 1, ['page-1']);
        const pageImpl = await pageEls[0].getImpl();

        // Append an image animated with a full-bleed animation inside a grid-
        // layer with a template other than fill.
        addAnimationToImage(pageEls[0], 'fade-in', 'vertical');
        pageImpl.buildCallback();
        await pageImpl.layoutCallback();

        ampStory.buildCallback();
        await ampStory.layoutCallback();

        expect(pageImpl.element.firstElementChild).to.not.have.class(
          'i-amphtml-story-grid-template-with-full-bleed-animation'
        );
      }
    );

    it(
      'Should not add additional CSS class to the target when a non-full-bleed' +
        'animation is used.',
      async () => {
        const pageEls = createPages(ampStory.element, 1, ['page-1']);
        const pageImpl = await pageEls[0].getImpl();

        // Append an image animated with a non-full-bleed animation.
        addAnimationToImage(pageEls[0], 'fade-in', 'fill');
        pageImpl.buildCallback();
        await pageImpl.layoutCallback();

        ampStory.buildCallback();
        await ampStory.layoutCallback();

        expect(pageImpl.element.firstElementChild).to.not.have.class(
          'i-amphtml-story-grid-template-with-full-bleed-animation'
        );
      }
    );
  }
);

describes.realWin(
  'amp-story-animations-utils',
  {
    amp: {
      runtimeOn: true,
      extensions: ['amp-story'],
    },
  },
  () => {
    /**
     * @param {number} pageW
     * @param {number} pageH
     * @param {number} targetW
     * @param {number} targetH
     * @return {!StoryAnimationDimsDef}
     */
    function setDimensions(pageW, pageH, targetW, targetH) {
      return /** @type {!StoryAnimationDimsDef} */ ({
        pageWidth: pageW,
        pageHeight: pageH,
        targetWidth: targetW,
        targetHeight: targetH,
        targetX: 0,
        targetY: 0,
      });
    }

    it('Should fit target same size as the screen.', () => {
      const dimensions = setDimensions(380, 580, 360, 580);
      expect(targetFitsWithinPage(dimensions)).to.be.true;
    });

    it('Should fit target with bigger width but same height as screen.', () => {
      const dimensions = setDimensions(380, 580, 400, 580);
      expect(targetFitsWithinPage(dimensions)).to.be.true;
    });

    it('Should not fit target with larger width and height than screen.', () => {
      const dimensions = setDimensions(380, 580, 400, 600);
      expect(targetFitsWithinPage(dimensions)).to.be.false;
    });

    it('Should scale the target accordingly.', () => {
      const dimensions = setDimensions(380, 580, 360, 580);
      expect(targetFitsWithinPage(dimensions)).to.be.true;

      const factorThatWillMakeTargetFitPage = 380 / 360;
      const factor = factorThatWillMakeTargetFitPage * 1.25;
      expect(calculateTargetScalingFactor(dimensions)).to.equal(factor);

      const calculatedKeyframes = presets['pan-up'];
      calculatedKeyframes.keyframes = calculatedKeyframes.keyframes(
        dimensions,
        /* options */ {}
      );

      const offsetX = -dimensions.targetWidth / 2;
      const offsetY = dimensions.pageHeight - dimensions.targetHeight;

      const expectedKeyframes = [
        {
          'transform': `translate(${offsetX}px, ${offsetY}px) scale(${factor})`,
          'transform-origin': 'left top',
        },
        {
          'transform': `translate(${offsetX}px, 0px) scale(${factor})`,
          'transform-origin': 'left top',
        },
      ];

      expect(calculatedKeyframes.keyframes).to.deep.equal(expectedKeyframes);
    });
  }
);
