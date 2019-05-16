/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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
  LayoutElement,
  installLayersServiceForDoc,
} from '../../src/service/layers-impl';
import {Services} from '../../src/services';
import {installDocService} from '../../src/service/ampdoc-impl';
import {installFriendlyIframeEmbed} from '../../src/friendly-iframe-embed';

describes.realWin('Layers', {amp: true}, env => {
  describes.repeated(
    'Layers',
    {
      'Real document scroller': 'native',
      'Overflow scroller': 'overflow',
      'Shadow DOM scroller': 'shadow',
    },
    (name, impl) => {
      let win;
      let root;
      let scrollingElement;

      function createElement(tag = 'div') {
        return win.document.createElement(tag);
      }

      function friendlyIframe() {
        const iframe = createElement('iframe');
        iframe.setAttribute('frameborder', '0');
        iframe.setAttribute('allowfullscreen', '');
        iframe.setAttribute('scrolling', 'no');

        const container = createElement('div');
        container.appendChild(iframe);
        root.appendChild(container);

        return installFriendlyIframeEmbed(iframe, container, {
          url: `${location.origin}/fie`,
          html: '<!doctype html><html ⚡><head></head><body></body></html>',
        }).then(() => {
          return {
            iframe,
            body: iframe.contentDocument.body,
          };
        });
      }

      before(function() {
        if (impl === 'shadow' && !Element.prototype.attachShadow) {
          this.skipTest();
        }
      });

      beforeEach(() => {
        win = env.win;
        switch (impl) {
          case 'native':
            root = scrollingElement = win.document.scrollingElement;
            break;

          case 'overflow':
            root = scrollingElement = createElement();
            win.document.body.appendChild(root);
            break;

          case 'shadow': {
            root = win.document.body;
            scrollingElement = createElement('div');
            const sd = root.attachShadow({mode: 'open'});
            const slot = createElement('slot');
            scrollingElement.appendChild(slot);
            sd.appendChild(scrollingElement);
          }
        }

        installDocService(win, true);
        const ampdoc = Services.ampdocServiceFor(win).getAmpDoc();
        installLayersServiceForDoc(ampdoc, scrollingElement, impl === 'native');
      });

      function scroll(element, top, left) {
        element.scrollTop = top;
        element.scrollLeft = left;
        const layout = LayoutElement.for(element);
        layout.dirtyScrollMeasurements();
      }

      describe('LayoutElement', () => {
        describe('.getParentLayer', () => {
          it('returns null for scrolling layer', () => {
            expect(LayoutElement.getParentLayer(scrollingElement)).to.be.null;
          });

          it('returns parent layer', () => {
            const div = createElement();
            root.appendChild(div);

            expect(LayoutElement.getParentLayer(div)).to.equal(
              LayoutElement.for(scrollingElement)
            );
          });

          it('returns null if element is fixed', () => {
            const div = createElement();
            root.appendChild(div);

            div.style.position = 'fixed';
            expect(LayoutElement.getParentLayer(div)).to.be.null;
          });

          it('returns parent if parent element is fixed', () => {
            const parent = createElement();
            const div = createElement();
            parent.appendChild(div);
            root.appendChild(parent);

            parent.style.position = 'fixed';
            const layer = LayoutElement.getParentLayer(div);
            expect(layer).to.equal(LayoutElement.for(parent));
          });

          it('does not cause double references in layer tree', () => {
            const layers = Services.layersForDoc(root);
            const div = createElement();
            root.appendChild(div);
            layers.add(div);

            const layout = LayoutElement.for(div);
            const rootLayout = LayoutElement.for(scrollingElement);
            expect(layout.getParentLayer()).to.equal(rootLayout);

            layout.forgetParentLayer();
            expect(layout.getParentLayer()).to.equal(rootLayout);

            const spy = sinon.sandbox.spy(div, 'getBoundingClientRect');
            rootLayout.dirtyMeasurements();
            rootLayout.remeasure();

            expect(spy).to.have.callCount(1);
          });

          describe('inside FIE', () => {
            let iframe;
            let iframeBody;

            beforeEach(() => {
              return friendlyIframe().then(struct => {
                iframe = struct.iframe;
                iframeBody = struct.body;
              });
            });

            it('returns parent layer', () => {
              const div = createElement();
              iframeBody.appendChild(div);

              expect(LayoutElement.getParentLayer(div)).to.equal(
                LayoutElement.for(scrollingElement)
              );
            });

            it('returns frameElement if element is fixed', () => {
              const div = createElement();
              iframeBody.appendChild(div);

              div.style.position = 'fixed';
              expect(LayoutElement.getParentLayer(div)).to.equal(
                LayoutElement.for(iframe)
              );
            });

            it('returns parent if parent element is fixed', () => {
              const parent = createElement();
              const div = createElement();
              parent.appendChild(div);
              iframeBody.appendChild(parent);

              parent.style.position = 'fixed';
              const layer = LayoutElement.getParentLayer(div);
              expect(layer).to.equal(LayoutElement.for(parent));
            });
          });
        });

        describes.repeated(
          'Parent layer',
          {
            'regular element': 'div',
            'FIE embed': 'fie',
          },
          (name, impl) => {
            describe('#getScrolledPosition', () => {
              let parent;
              let div;
              let layout;
              let parentLayout;
              let rootLayout;

              beforeEach(() => {
                return new Promise(res => {
                  if (impl === 'fie') {
                    res(
                      friendlyIframe().then(struct => {
                        const {iframe, body} = struct;
                        // ensure the scrolling element has enough content to scroll
                        iframe.style.width = '200vw';
                        iframe.style.height = '200vh';
                        return body;
                      })
                    );
                  } else {
                    res(root);
                  }
                }).then(container => {
                  parent = createElement();
                  div = createElement();
                  container.appendChild(parent);
                  parent.appendChild(div);

                  scrollingElement.style.width = '100vw';
                  scrollingElement.style.height = '100vh';
                  scrollingElement.style.position = 'absolute';
                  scrollingElement.style.overflow = 'scroll';
                  parent.style.width = '200vw';
                  parent.style.height = '200vh';
                  parent.style.position = 'absolute';
                  parent.style.overflow = 'scroll';
                  div.style.width = '250vw';
                  div.style.height = '250vh';
                  div.style.position = 'absolute';
                  div.style.overflow = 'scroll';

                  const layers = Services.layersForDoc(parent);
                  layers.declareLayer(parent);
                  layers.add(div);
                  layout = LayoutElement.for(div);
                  parentLayout = LayoutElement.for(parent);
                  rootLayout = LayoutElement.for(scrollingElement);
                });
              });

              it('calculates layout offsets without scrolls', () => {
                expect(layout.getScrolledPosition()).to.deep.equal({
                  left: 0,
                  top: 0,
                });

                div.style.top = '10px';
                rootLayout.dirtyMeasurements();
                expect(layout.getScrolledPosition()).to.deep.equal({
                  left: 0,
                  top: 10,
                });

                div.style.left = '10px';
                rootLayout.dirtyMeasurements();
                expect(layout.getScrolledPosition()).to.deep.equal({
                  left: 10,
                  top: 10,
                });
              });

              it('calculates parent offsets without scrolls', () => {
                expect(layout.getScrolledPosition()).to.deep.equal({
                  left: 0,
                  top: 0,
                });

                parent.style.top = '10px';
                rootLayout.dirtyMeasurements();
                expect(layout.getScrolledPosition()).to.deep.equal({
                  left: 0,
                  top: 10,
                });

                parent.style.left = '10px';
                rootLayout.dirtyMeasurements();
                expect(layout.getScrolledPosition()).to.deep.equal({
                  left: 10,
                  top: 10,
                });
              });

              it('calculates parent and offsets without scrolls', () => {
                expect(layout.getScrolledPosition()).to.deep.equal({
                  left: 0,
                  top: 0,
                });

                parent.style.top = '10px';
                div.style.left = '10px';
                rootLayout.dirtyMeasurements();
                expect(layout.getScrolledPosition()).to.deep.equal({
                  left: 10,
                  top: 10,
                });

                parent.style.left = '10px';
                div.style.top = '10px';
                rootLayout.dirtyMeasurements();
                expect(layout.getScrolledPosition()).to.deep.equal({
                  left: 20,
                  top: 20,
                });
              });

              it('does not change when layout itself scrolls', function*() {
                scroll(parent, 10, 0);
                expect(parentLayout.getScrollTop()).to.equal(10);
                expect(parentLayout.getScrolledPosition()).to.deep.equal({
                  left: 0,
                  top: 0,
                });
                rootLayout.dirtyMeasurements();
                expect(parentLayout.getScrolledPosition()).to.deep.equal({
                  left: 0,
                  top: 0,
                });

                scroll(scrollingElement, 10, 0);
                expect(rootLayout.getScrollTop()).to.equal(10);
                expect(rootLayout.getScrolledPosition()).to.deep.equal({
                  left: 0,
                  top: 0,
                });
                rootLayout.dirtyMeasurements();
                expect(rootLayout.getScrolledPosition()).to.deep.equal({
                  left: 0,
                  top: 0,
                });
              });

              it('updates as parent layers scroll', () => {
                scroll(parent, 10, 5);
                expect(parentLayout.getScrollTop()).to.equal(10);
                expect(layout.getScrolledPosition()).to.deep.equal({
                  left: -5,
                  top: -10,
                });
                rootLayout.dirtyMeasurements();
                expect(layout.getScrolledPosition()).to.deep.equal({
                  left: -5,
                  top: -10,
                });

                scroll(scrollingElement, 10, 5);
                expect(rootLayout.getScrollTop()).to.equal(10);
                expect(layout.getScrolledPosition()).to.deep.equal({
                  left: -10,
                  top: -20,
                });
                rootLayout.dirtyMeasurements();
                expect(layout.getScrolledPosition()).to.deep.equal({
                  left: -10,
                  top: -20,
                });
              });
            });

            describe('#getOffsetPosition', () => {
              let parent;
              let div;
              let layout;
              let parentLayout;
              let rootLayout;
              beforeEach(() => {
                return new Promise(res => {
                  if (impl === 'fie') {
                    res(
                      friendlyIframe().then(struct => {
                        const {iframe, body} = struct;
                        // ensure the scrolling element has enough content to scroll
                        iframe.style.width = '200vw';
                        iframe.style.height = '200vh';
                        return body;
                      })
                    );
                  } else {
                    res(root);
                  }
                }).then(container => {
                  parent = createElement();
                  div = createElement();
                  parent.appendChild(div);
                  container.appendChild(parent);

                  scrollingElement.style.width = '100vw';
                  scrollingElement.style.height = '100vh';
                  scrollingElement.style.position = 'absolute';
                  scrollingElement.style.overflow = 'scroll';
                  parent.style.width = '110vw';
                  parent.style.height = '110vh';
                  parent.style.position = 'absolute';
                  parent.style.overflow = 'scroll';
                  div.style.width = '120vw';
                  div.style.height = '120vh';
                  div.style.position = 'absolute';
                  div.style.overflow = 'scroll';

                  const layers = Services.layersForDoc(parent);
                  layers.declareLayer(parent);
                  layers.add(div);
                  layout = LayoutElement.for(div);
                  parentLayout = LayoutElement.for(parent);
                  rootLayout = LayoutElement.for(scrollingElement);
                });
              });

              it('calculates layout offsets without scrolls', () => {
                expect(layout.getOffsetPosition()).to.deep.equal({
                  left: 0,
                  top: 0,
                });

                div.style.top = '10px';
                rootLayout.dirtyMeasurements();
                expect(layout.getOffsetPosition()).to.deep.equal({
                  left: 0,
                  top: 10,
                });

                div.style.left = '10px';
                rootLayout.dirtyMeasurements();
                expect(layout.getOffsetPosition()).to.deep.equal({
                  left: 10,
                  top: 10,
                });
              });

              it('calculates parent offsets without scrolls', () => {
                expect(layout.getOffsetPosition()).to.deep.equal({
                  left: 0,
                  top: 0,
                });

                parent.style.top = '10px';
                rootLayout.dirtyMeasurements();
                expect(layout.getOffsetPosition()).to.deep.equal({
                  left: 0,
                  top: 10,
                });

                parent.style.left = '10px';
                rootLayout.dirtyMeasurements();
                expect(layout.getOffsetPosition()).to.deep.equal({
                  left: 10,
                  top: 10,
                });
              });

              it('calculates parent and offsets without scrolls', () => {
                expect(layout.getOffsetPosition()).to.deep.equal({
                  left: 0,
                  top: 0,
                });

                parent.style.top = '10px';
                div.style.left = '10px';
                rootLayout.dirtyMeasurements();
                expect(layout.getOffsetPosition()).to.deep.equal({
                  left: 10,
                  top: 10,
                });

                parent.style.left = '10px';
                div.style.top = '10px';
                rootLayout.dirtyMeasurements();
                expect(layout.getOffsetPosition()).to.deep.equal({
                  left: 20,
                  top: 20,
                });
              });

              it('does not change when layout itself scrolls', function*() {
                scroll(parent, 10, 0);
                expect(parentLayout.getScrollTop()).to.equal(10);
                expect(parentLayout.getOffsetPosition()).to.deep.equal({
                  left: 0,
                  top: 0,
                });
                rootLayout.dirtyMeasurements();
                expect(parentLayout.getOffsetPosition()).to.deep.equal({
                  left: 0,
                  top: 0,
                });

                scroll(scrollingElement, 10, 0);
                expect(rootLayout.getScrollTop()).to.equal(10);
                expect(rootLayout.getOffsetPosition()).to.deep.equal({
                  left: 0,
                  top: 0,
                });
                rootLayout.dirtyMeasurements();
                expect(rootLayout.getOffsetPosition()).to.deep.equal({
                  left: 0,
                  top: 0,
                });
              });

              it('doe snot change when parent layers scroll', () => {
                scroll(parent, 10, 5);
                expect(parentLayout.getScrollTop()).to.equal(10);
                expect(layout.getOffsetPosition()).to.deep.equal({
                  left: 0,
                  top: 0,
                });
                rootLayout.dirtyMeasurements();
                expect(layout.getOffsetPosition()).to.deep.equal({
                  left: 0,
                  top: 0,
                });

                scroll(scrollingElement, 10, 5);
                expect(rootLayout.getScrollTop()).to.equal(10);
                expect(layout.getOffsetPosition()).to.deep.equal({
                  left: 0,
                  top: 0,
                });
                rootLayout.dirtyMeasurements();
                expect(layout.getOffsetPosition()).to.deep.equal({
                  left: 0,
                  top: 0,
                });
              });
            });
          }
        );
      });
    }
  );
});
