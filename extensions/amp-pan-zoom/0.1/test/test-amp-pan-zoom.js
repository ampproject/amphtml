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

import '../amp-pan-zoom';

describes.realWin('amp-pan-zoom', {
  amp: {
    extensions: ['amp-pan-zoom'],
  },
}, env => {
  let win, doc, sandbox;
  let el, impl;
  let svg;

  const measureMutateElementStub = (measure, mutate) => {
    let result = Promise.resolve();
    if (measure) {
      result = result.then(measure);
    }
    if (mutate) {
      result = result.then(mutate);
    }
    return result;
  };

  /**
   * This function takes an object of attributes and constructs and builds
   * an amp-pan-zoom element and attaches it to the page. Assumes the contents
   * to be an SVG of width and height 300x300.
   * @param {Object} opt_attributes
   */
  function getPanZoom(opt_attributes) {
    el = doc.createElement('amp-pan-zoom');
    // Default attributes that can be overidden
    el.setAttribute('layout', 'fixed');
    el.setAttribute('width', '300');
    el.setAttribute('height', '400');

    for (const key in opt_attributes) {
      el.setAttribute(key, opt_attributes[key]);
    }

    svg = doc.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100');
    svg.setAttribute('height', '100');
    const svgNS = svg.namespaceURI;
    const rect = doc.createElementNS(svgNS,'rect');
    rect.setAttribute('x', '0');
    rect.setAttribute('y', '0');
    rect.setAttribute('width','100');
    rect.setAttribute('height','100');
    rect.setAttribute('fill','#95B3D7');
    svg.appendChild(rect);

    el.appendChild(svg);
    doc.body.appendChild(el);
    return el.build().then(() => {
      impl = el.implementation_;
      sandbox.stub(impl, 'measureMutateElement')
          .callsFake(measureMutateElementStub);
      sandbox.stub(impl, 'mutateElement')
          .callsFake(mutate => {
            mutate();
            return Promise.resolve();
          });
    });
  }

  beforeEach(() => {
    win = env.win;
    doc = win.document;
    sandbox = env.sandbox;
    env.iframe.height = 500;
    env.iframe.width = 400;
  });

  it('should initialize all attributes correctly', () => {
    return getPanZoom({
      'max-scale': '4',
      'initial-scale': '2',
      'initial-x': '1',
      'initial-y': '5',
      'reset-on-resize': '',
      'disable-double-tap': '',
    }).then(() => {
      expect(impl.initialScale_).to.equal(2);
      expect(impl.initialX_).to.equal(1);
      expect(impl.initialY_).to.equal(5);
      expect(impl.maxScale_).to.equal(4);
      expect(impl.resetOnResize_).to.equal(true);
      expect(impl.disableDoubleTap_).to.equal(true);
    });
  });

  it('should size contents correctly', () => {
    return getPanZoom().then(() => el.layoutCallback()).then(() => {
      expect(svg.style.width).to.equal('300px');
      expect(svg.style.height).to.equal('300px');
      expect(svg.classList.contains('i-amphtml-pan-zoom-child')).to.equal(true);
      expect(el.classList.contains('i-amphtml-pan-zoom')).to.equal(true);
    });
  });

  it('should position and scale correctly based on initial values', () => {
    return getPanZoom({
      'initial-scale': '2',
      'initial-x': '10',
      'initial-y': '50',
    }).then(() => el.layoutCallback()).then(() => {
      expect(impl.startX_).to.equal(10);
      expect(impl.posX_).to.equal(10);
      expect(impl.startY_).to.equal(50);
      expect(impl.posY_).to.equal(50);
      expect(svg.style.transform).to.equal('translate(10px, 50px) scale(2)');
    });
  });

  it('should initialize all measured variables correctly', () => {
    return getPanZoom().then(() => el.layoutCallback()).then(() => {
      expect(impl.startScale_).to.equal(1);
      expect(impl.startX_).to.equal(0);
      expect(impl.startY_).to.equal(0);
      expect(impl.sourceWidth_).to.equal(100);
      expect(impl.sourceHeight_).to.equal(100);
    });
  });

  it('should update pan and zoom bounds correctly', () => {
    return getPanZoom().then(() => {
      el.getBoundingClientRect = () => {
        return {
          'top': 0,
          'left': 0,
          'height': 400,
          'width': 300,
        };
      };
      return el.layoutCallback();
    }).then(() => {
      expect(impl.elementBox_.height).to.equal(400);
      expect(impl.elementBox_.width).to.equal(300);
      expect(impl.contentBox_.height).to.equal(300);
      expect(impl.contentBox_.width).to.equal(300);

      expect(impl.minX_).to.equal(0);
      expect(impl.maxX_).to.equal(0);
      expect(impl.minY_).to.equal(0);
      expect(impl.maxY_).to.equal(0);

      impl.updatePanZoomBounds_(2);
      // (600 - 300) / 2
      expect(impl.minX_).to.equal(-150);
      expect(impl.maxX_).to.equal(150);
      // (600 - 400) / 2
      expect(impl.minY_).to.equal(-100);
      expect(impl.maxY_).to.equal(100);

      impl.updatePanZoomBounds_(3);
      // (900 - 300) / 2
      expect(impl.minX_).to.equal(-300);
      expect(impl.maxX_).to.equal(300);
      // (900 - 400) / 2
      expect(impl.minY_).to.equal(-250);
      expect(impl.maxY_).to.equal(250);
    });
  });

  it('should correctly update pan zoom bounds with y offset', () => {
    return getPanZoom({
      'style': 'display: initial',
    }).then(() => {
      el.getBoundingClientRect = () => {
        return {
          'top': 0,
          'left': 0,
          'height': 400,
          'width': 300,
        };
      };
      return el.layoutCallback();
    }).then(() => {
      expect(impl.minY_).to.equal(0);
      expect(impl.maxY_).to.equal(0);

      impl.updatePanZoomBounds_(2);
      // min((400 - 600) / 2 - (-50), (400 - 600) / 2)
      expect(impl.minY_).to.equal(-100);
      // max(600 - 400) / 2 + (-50), (600 - 400) / 2)
      expect(impl.maxY_).to.equal(150);

      impl.updatePanZoomBounds_(3);
      // min((400 - 900) / 2 - (-50), (400 - 900) / 2 )
      expect(impl.minY_).to.equal(-250);
      // max((900 - 400) / 2 - (-50), (900 - 400) / 2 )
      expect(impl.maxY_).to.equal(300);
    });
  });

  it('should correctly update css after calling transform', () => {
    return getPanZoom()
        .then(() => el.layoutCallback())
        .then(() => impl.transform(10, 20, 2))
        .then(() => {
          expect(impl.posX_).to.equal(10);
          expect(impl.posY_).to.equal(20);
          expect(impl.scale_).to.equal(2);
          expect(svg.style.transform)
              .to.equal('translate(10px, 20px) scale(2)');
        });
  });

});
