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

describes.realWin('Layers', {amp: false}, env => {
  let win;
  let root;

  function createElement() {
    const div = win.document.createElement('div');
    Object.defineProperty(div, 'isConnected', {
      value: true,
    });
    return div;
  }

  beforeEach(() => {
    win = env.win;
    root = win.document.scrollingElement;
    installDocService(win, true);
    const ampdoc = Services.ampdocServiceFor(win).getAmpDoc();
    installLayersServiceForDoc(ampdoc, root);
  });

  function scroll(element, top, left) {
    element.scrollTop = top;
    element.scrollLeft = left;
    const layout = LayoutElement.for(element);
    layout.dirtyScrollMeasurements();
  }

  describe('LayoutElement', () => {

    describe('.getParentLayer', () => {
      it('returns null for root layer', () => {
        expect(LayoutElement.getParentLayer(root)).to.be.null;
      });

      it('returns parent layer', () => {
        const div = createElement();
        root.appendChild(div);

        expect(LayoutElement.getParentLayer(div)).to.equal(
            LayoutElement.for(root));
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
    });

    describe('#getScrolledPosition', () => {
      let parent;
      let div;
      let layout;
      let parentLayout;
      let rootLayout;
      beforeEach(() => {
        parent = createElement();
        div = createElement();
        parent.appendChild(div);
        root.appendChild(parent);

        root.style.width = '100vw';
        root.style.height = '100vh';
        root.style.position = 'absolute';
        root.style.overflow = 'scroll';
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
        rootLayout = LayoutElement.for(root);
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

        scroll(root, 10, 0);
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

        scroll(root, 10, 5);
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
        parent = createElement();
        div = createElement();
        parent.appendChild(div);
        root.appendChild(parent);

        root.style.width = '100vw';
        root.style.height = '100vh';
        root.style.position = 'absolute';
        root.style.overflow = 'scroll';
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
        rootLayout = LayoutElement.for(root);
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

        scroll(root, 10, 0);
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

        scroll(root, 10, 5);
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
  });
});
