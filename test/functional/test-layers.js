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
    let viewport;

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
    let viewport;

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
            layoutRectLtwh(0, 30, 100, 100));

        viewport.top = 100;
        viewport.left = 10;
        expect(layout.getPageLayoutBox()).to.jsonEqual(
            layoutRectLtwh(00, 30, 100, 100));
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
});
