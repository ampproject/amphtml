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

import {createIframePromise} from '../../../../testing/iframe';
import {installParallaxForDoc} from '../../../../src/service/parallax-impl';
import {parallaxForDoc} from '../../../../src/services';
import {toggleExperiment} from '../../../../src/experiments';
import {viewportForDoc} from '../../../../src/services';
import {vsyncFor} from '../../../../src/services';

describes.sandboxed('amp-fx-parallax', {}, () => {
  const DEFAULT_FACTOR = 1.7;

  function addTextChildren(iframe) {
    return [iframe.doc.createTextNode('AMP: Accelerated Mobile Pages')];
  }

  function getAmpParallaxElement(opt_childrenCallback, opt_factor, opt_top) {
    const factor = opt_factor || DEFAULT_FACTOR;
    const top = opt_top || 0;
    let viewport;
    let parallaxElement;

    return createIframePromise().then(iframe => {
      const bodyResizer = iframe.doc.createElement('div');
      bodyResizer.style.height = '4000px';
      bodyResizer.style.width = '1px';
      iframe.doc.body.appendChild(bodyResizer);

      viewport = viewportForDoc(iframe.win.document);
      viewport.resize_();

      toggleExperiment(iframe.win, 'amp-fx-parallax', true);

      parallaxElement = iframe.doc.createElement('div');
      parallaxElement.setAttribute('amp-fx-parallax', factor);
      if (opt_childrenCallback) {
        const children = opt_childrenCallback(iframe, parallaxElement);
        children.forEach(child => {
          parallaxElement.appendChild(child);
        });
      }

      const parent = iframe.doc.querySelector('#parent');
      parent.appendChild(parallaxElement);
      installParallaxForDoc(iframe.doc);

      return new Promise(resolve => {
        vsyncFor(iframe.win).mutate(() => {
          resolve({
            element: parallaxElement,
            iframe,
            viewport,
          });
        });
        viewport.setScrollTop(top);
      });
    }).catch(error => {
      return Promise.reject({error, parallaxElement, stack: error.stack});
    });
  }

  it('should move when the user scrolls, if visible', () => {
    const scroll = 10;
    const expectedParallax = -1 * DEFAULT_FACTOR * scroll;

    return getAmpParallaxElement(addTextChildren)
        .then(({element, iframe, viewport}) => {
          const parallaxService = parallaxForDoc(iframe.doc);
          const top = element.getBoundingClientRect().top;
          expect(top).to.equal(viewport.getScrollTop());

          return new Promise(resolve => {
            parallaxService.addScrollListener_(() => {
              const top = element.getBoundingClientRect().top;
              expect(top).to.equal(expectedParallax);
              resolve();
            });
            viewport.setScrollTop(scroll);
          });
        });
  });

  it('should not move after it is outside of the viewport', () => {
    const scroll = 100;
    const expectedParallax = -1 * DEFAULT_FACTOR * scroll;

    return getAmpParallaxElement(addTextChildren, DEFAULT_FACTOR)
        .then(({element, iframe, viewport}) => {
          const parallaxService = parallaxForDoc(iframe.doc);

          return new Promise(resolve => {
            parallaxService.addScrollListener_(() => {
              const top = element.getBoundingClientRect().top;
              expect(top).to.not.equal(expectedParallax);
              resolve();
            });
            viewport.setScrollTop(scroll);
          });
        });
  });

  it('should move downward with a negative parallax factor', () => {
    const scroll = 10;
    const expectedParallax = -1 * DEFAULT_FACTOR * scroll;

    return getAmpParallaxElement(addTextChildren, DEFAULT_FACTOR)
        .then(({element, iframe, viewport}) => {
          const parallaxService = parallaxForDoc(iframe.doc);
          return new Promise(resolve => {
            parallaxService.addScrollListener_(() => {
              const top = element.getBoundingClientRect().top;
              expect(top).to.equal(expectedParallax);
              resolve();
            });
            viewport.setScrollTop(scroll);
          });
        });
  });

  it('should apply multiple scrolls as if they were one large scroll', () => {
    const scroll = 10;
    const factor = -1.7; // move downward so it stays in the viewport
    const expectedParallax = -1 * factor * 2 * scroll;

    return getAmpParallaxElement(addTextChildren, factor)
        .then(({element, iframe, viewport}) => {
          const parallaxService = parallaxForDoc(iframe.doc);
          return new Promise(resolve => {
            parallaxService.addScrollListener_(afterFirstScroll);
            viewport.setScrollTop(scroll);

            function afterFirstScroll() {
              parallaxService.removeScrollListener_(afterFirstScroll);
              parallaxService.addScrollListener_(afterSecondScroll);
              viewport.setScrollTop(2 * scroll);
            }

            function afterSecondScroll() {
              const top = element.getBoundingClientRect().top;
              expect(top).to.equal(expectedParallax);
              resolve();
            }
          });
        });
  });

  it('should return to its original position when scrolling back', () => {
    const factor = -1.7; // move downward so it stays in the viewport

    return getAmpParallaxElement(addTextChildren, factor)
        .then(({element, iframe, viewport}) => {
          const parallaxService = parallaxForDoc(iframe.doc);
          return new Promise(resolve => {
            parallaxService.addScrollListener_(afterFirstScroll);
            viewport.setScrollTop(10);

            function afterFirstScroll() {
              parallaxService.removeScrollListener_(afterFirstScroll);
              parallaxService.addScrollListener_(afterSecondScroll);
              viewport.setScrollTop(200);
            }

            function afterSecondScroll() {
              parallaxService.removeScrollListener_(afterSecondScroll);
              parallaxService.addScrollListener_(afterThirdScroll);
              viewport.setScrollTop(0);
            }

            function afterThirdScroll() {
              const top = element.getBoundingClientRect().top;
              expect(top).to.equal(0);
              resolve();
            }
          });
        });
  });

  it('should render moved if the page loads partially scrolled', () => {
    const scroll = 10;
    const expectedParallax = -1 * DEFAULT_FACTOR * scroll;

    return getAmpParallaxElement(addTextChildren, DEFAULT_FACTOR, scroll)
        .then(({element}) => {
          const top = element.getBoundingClientRect().top;
          expect(top).to.equal(expectedParallax);
        });
  });
});
