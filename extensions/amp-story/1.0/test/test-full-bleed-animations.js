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
import {AmpStoryPage} from '../amp-story-page';
import {AmpStoryStoreService} from '../amp-story-store-service';
import {LocalizationService} from '../../../../src/service/localization';
import {Services} from '../../../../src/services';
import {
  calculateTargetScalingFactor,
  targetFitsWithinPage,
} from '../animation-presets-utils';
import {getPresetDef} from '../animation-presets';
import {registerServiceBuilder} from '../../../../src/service';

describes.realWin(
  'amp-story-full-bleed-animations',
  {
    amp: {
      runtimeOn: true,
      extensions: ['amp-story:1.0'],
    },
  },
  env => {
    let win;
    let storyElem;
    let ampStory;

    beforeEach(() => {
      win = env.win;

      sandbox
        .stub(Services, 'storyStoreService')
        .callsFake(() => new AmpStoryStoreService(win));

      storyElem = win.document.createElement('amp-story');
      win.document.body.appendChild(storyElem);

      const localizationService = new LocalizationService(win);
      registerServiceBuilder(win, 'localization', () => localizationService);

      AmpStory.isBrowserSupported = () => true;
      ampStory = new AmpStory(storyElem);
    });

    afterEach(() => {
      storyElem.remove();
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
          page.getImpl = () => Promise.resolve(new AmpStoryPage(page));
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
      () => {
        createPages(ampStory.element, 2, ['cover', 'page-1']);
        return ampStory
          .layoutCallback()
          .then(() => {
            // Get pages.
            const pageElements = ampStory.element.getElementsByTagName(
              'amp-story-page'
            );
            const pages = Array.from(pageElements).map(el => el.getImpl());
            return Promise.all(pages);
          })
          .then(pages => {
            // Append an image animated with a full-bleed animation inside a grid-
            // layer with a `fill` template of the first page.
            addAnimationToImage(pages[1].element, 'pan-down', 'fill');

            pages[1].layoutCallback().then(() => {
              const imgEls = pages[1].element.getElementsByTagName('amp-img');
              expect(imgEls[0]).to.have.class(
                'i-amphtml-story-grid-template-with-full-bleed-animation'
              );
            });
          });
      }
    );

    it(
      'Should not add additional CSS class to the target when a full-bleed ' +
        'animation is used BUT the target is a child of a grid layer with a ' +
        'template other than `fill`.',
      () => {
        createPages(ampStory.element, 2, ['cover', 'page-1']);
        return ampStory
          .layoutCallback()
          .then(() => {
            // Get pages.
            const pageElements = ampStory.element.getElementsByTagName(
              'amp-story-page'
            );
            const pages = Array.from(pageElements).map(el => el.getImpl());
            return Promise.all(pages);
          })
          .then(pages => {
            // Append an image animated with a full-bleed animation inside a grid-
            // layer with a template other than fill.
            addAnimationToImage(pages[1].element, 'fade-in', 'vertical');

            pages[1].layoutCallback().then(() => {
              const imgEls = pages[1].element.getElementsByTagName('amp-img');
              expect(imgEls[0]).to.not.have.class(
                'i-amphtml-story-grid-template-with-full-bleed-animation'
              );
            });
          });
      }
    );

    it(
      'Should not add additional CSS class to the target when a non-full-bleed' +
        'animation is used.',
      () => {
        createPages(ampStory.element, 2, ['cover', 'page-1']);
        return ampStory
          .layoutCallback()
          .then(() => {
            // Get pages.
            const pageElements = ampStory.element.getElementsByTagName(
              'amp-story-page'
            );
            const pages = Array.from(pageElements).map(el => el.getImpl());
            return Promise.all(pages);
          })
          .then(pages => {
            // Append an image animated with a non-full-bleed animation.
            addAnimationToImage(pages[1].element, 'fade-in', 'fill');

            pages[1].layoutCallback().then(() => {
              const imgEls = pages[1].element.getElementsByTagName('amp-img');
              expect(imgEls[0]).to.not.have.class(
                'i-amphtml-story-grid-template-with-full-bleed-animation'
              );
            });
          });
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

      const calculatedKeyframes = getPresetDef('pan-up', {});
      calculatedKeyframes.keyframes = calculatedKeyframes.keyframes(dimensions);

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
