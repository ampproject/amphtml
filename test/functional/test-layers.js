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

import {Layers, LayerElement} from "../../src/service/layers-impl";
import {layoutRectLtwh} from '../../src/layout-rect';

describes.fakeWin('Layers', {amp: true}, (env) => {
  let win;
  let sandbox;
  let layers;

  beforeEach(() => {
    win = env.win;
    sandbox = env.sandbox;
    layers = new Layers(env.ampdoc);
  });

  describe('#add', () => {
    it('creates a LayerElement for the element', () => {
      const element = {};
      layers.add(element);

      expect(LayerElement.for(element)).to.not.be.null;
    });
  });

  describe('ferrying', () => {
    let element;
    let layout;

    beforeEach(() => {
      element = {};
      layers.add(element);
      layout = LayerElement.for(element);
    });

    it('#remeasure', () => {
      const stub = sandbox.stub(layout, 'remeasure', () => stub);
      const ret = layers.remeasure(element);

      expect(stub).to.have.been.called;
      expect(ret).to.equal(stub);
    });

    it('#getPageLayoutBox', () => {
      const stub = sandbox.stub(layout, 'getPageLayoutBox', () => stub);
      const ret = layers.getPageLayoutBox(element);

      expect(stub).to.have.been.called;
      expect(ret).to.equal(stub);
    });

    it('#getAbsoluteLayoutBox', () => {
      const stub = sandbox.stub(layout, 'getAbsoluteLayoutBox', () => stub);
      const ret = layers.getAbsoluteLayoutBox(element);

      expect(stub).to.have.been.called;
      expect(ret).to.equal(stub);
    });

    it('#isFixed', () => {
      const stub = sandbox.stub(layout, 'isFixed', () => stub);
      const ret = layers.isFixed(element);

      expect(stub).to.have.been.called;
      expect(ret).to.equal(stub);
    });
  });

});

describes.fakeWin.only('LayerElement', {amp: true}, (env) => {
  let win;
  let sandbox;
  let layers;
  let element;
  let layout;
  let viewport;

  beforeEach(() => {
    win = env.win;
    sandbox = env.sandbox;
    layers = new Layers(env.ampdoc);
    element = {};
    layers.add(element);
    layout = LayerElement.for(element);

    viewport = {
      left: 0,
      top: 20,

      getScrollLeft() {
        return this.left;
      },

      getScrollTop() {
        return this.top;
      },

      getLayoutRect(element) {
        return layoutRectLtwh(0, 30, 100, 100);
      },

      isDeclaredFixed() {
        return false;
      }
    };
    sandbox.stub(layers, 'getViewport', () => viewport);
  });

  describe('.for', () => {
    it('retries LayerElement instance tied to element', () => {
      expect(LayerElement.for(element)).to.equal(layout);
    });

    it('throws when element is unregistered', () => {
      expect(() => {
        LayerElement.for({});
      }).to.throw(/Missing layer prop/);
    });
  });

  describe('.forOptional', () => {
    it('retries LayerElement instance tied to element', () => {
      expect(LayerElement.forOptional(element)).to.equal(layout);
    });

    it('returns undefined when unregistered', () => {
      expect(LayerElement.forOptional({})).to.be.undefined;
    });
  });

  describe('#getAbsoluteLayoutBox', () => {
    beforeEach(() => {
      element.isAlwaysFixed = () => false;
      layout.remeasure();
    });

    describe('when element is fixed-position', () => {
      beforeEach(() => {
        element.isAlwaysFixed = () => true;
        layout.remeasure();
      });

      it('returns rect based on viewport scroll', () => {
        expect(layout.getAbsoluteLayoutBox()).to.jsonEqual(
            layoutRectLtwh(0, 30, 100, 100));

        viewport.top = 100;
        viewport.left = 10;
        expect(layout.getAbsoluteLayoutBox()).to.jsonEqual(
            layoutRectLtwh(10, 110, 100, 100));
      });
    });

    describe('when element is not fixed-position', () => {
      it('returns absolute rect', () => {
        expect(layout.getAbsoluteLayoutBox()).to.jsonEqual(
            layoutRectLtwh(0, 30, 100, 100));

        viewport.top = 200;
        viewport.left = 10;
        expect(layout.getAbsoluteLayoutBox()).to.jsonEqual(
            layoutRectLtwh(0, 30, 100, 100));
      });
    });
  });

  describe('#getPageLayoutBox', () => {
    beforeEach(() => {
      element.isAlwaysFixed = () => false;
      layout.remeasure();
    });

    describe('when element is fixed-position', () => {
      beforeEach(() => {
        element.isAlwaysFixed = () => true;
        layout.remeasure();
      });

      it('returns page relative rect', () => {
        expect(layout.getPageLayoutBox()).to.jsonEqual(
            layoutRectLtwh(0, 10, 100, 100));

        viewport.top = 100;
        viewport.left = 10;
        expect(layout.getPageLayoutBox()).to.jsonEqual(
            layoutRectLtwh(0, 10, 100, 100));
      });
    });

    describe('when element is not fixed-position', () => {
      it('returns absolute rect', () => {
        expect(layout.getPageLayoutBox()).to.jsonEqual(
            layoutRectLtwh(0, 30, 100, 100));

        viewport.top = 200;
        viewport.left = 10;
        expect(layout.getPageLayoutBox()).to.jsonEqual(
            layoutRectLtwh(0, 30, 100, 100));
      });
    });
  });

  describe('#remeasure', () => {
    beforeEach(() => {
      element.isAlwaysFixed = () => false;
    });

    it('updates the elements rect based on viewport measurement', () => {
      layout.remeasure();
      expect(layout.getPageLayoutBox()).to.jsonEqual(
          layoutRectLtwh(0, 30, 100, 100));

      sandbox.stub(viewport, 'getLayoutRect', () => {
        return layoutRectLtwh(10, 100, 100, 100);
      });
      layout.remeasure();
      expect(layout.getPageLayoutBox()).to.jsonEqual(
          layoutRectLtwh(10, 100, 100, 100));
    });

    it('returns the newly measured page layout rect', () => {
      const ret = layout.remeasure();
      expect(ret).to.jsonEqual(layoutRectLtwh(0, 30, 100, 100));
    });

    describe('when element is fixed', () => {
      beforeEach(() => {
        element.isAlwaysFixed = () => true;
      });

      it('sets isFixed', () => {
        expect(layout.isFixed()).to.be.false;

        layout.remeasure();
        expect(layout.isFixed()).to.be.true;
      });

      it('updates elements rect to a viewport relative layout rect', () => {
        layout.remeasure();
        expect(layout.getPageLayoutBox()).to.jsonEqual(
            layoutRectLtwh(0, 10, 100, 100));
      });

      it('returns the newly measured viewport relative layout rect', () => {
        const ret = layout.remeasure();
        expect(ret).to.jsonEqual(layoutRectLtwh(0, 10, 100, 100));
      });
    });
  });

  describe('#isFixed', () => {
    it('returns whether element was last measured as fixed-position', () => {
      element.isAlwaysFixed = () => false;
      layout.remeasure();
      expect(layout.isFixed()).to.be.false;

      element.isAlwaysFixed = () => true;
      layout.remeasure();
      expect(layout.isFixed()).to.be.true;

      element.isAlwaysFixed = () => false;
      layout.remeasure();
      expect(layout.isFixed()).to.be.false;
    });
  });
});
