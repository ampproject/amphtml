/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import {adopt} from '../../../../src/runtime';
import {createIframePromise} from '../../../../testing/iframe';
import {installImg} from '../../../../builtins/amp-img';
import {viewportForDoc} from '../../../../src/services';
import * as sinon from 'sinon';
import '../amp-fx-flying-carpet';

adopt(window);

describe('amp-fx-flying-carpet', () => {
  let iframe;

  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });
  afterEach(() => {
    sandbox.restore();
  });

  function getAmpFlyingCarpet(opt_childrenCallback, opt_top) {
    let viewport;
    const top = opt_top || '200vh';
    let flyingCarpet;
    return createIframePromise().then(i => {
      iframe = i;

      const bodyResizer = iframe.doc.createElement('div');
      bodyResizer.style.height = '400vh';
      bodyResizer.style.width = '1px';
      iframe.doc.body.appendChild(bodyResizer);

      iframe.doc.body.style.position = 'relative';
      viewport = viewportForDoc(iframe.win.document);
      viewport.resize_();

      const parent = iframe.doc.querySelector('#parent');
      parent.style.position = 'absolute';
      parent.style.top = top;

      flyingCarpet = iframe.doc.createElement('amp-fx-flying-carpet');
      flyingCarpet.setAttribute('height', '10px');
      if (opt_childrenCallback) {
        const children = opt_childrenCallback(iframe, flyingCarpet);
        children.forEach(child => {
          flyingCarpet.appendChild(child);
        });
      }

      return iframe.addElement(flyingCarpet);
    }).then(flyingCarpet => {
      viewport.setScrollTop(parseInt(top, 10));
      return flyingCarpet;
    }, error => {
      return Promise.reject({error, flyingCarpet});
    });
  }

  it('should move children into wrapping divs', () => {
    let img;
    return getAmpFlyingCarpet(iframe => {
      installImg(iframe.win);
      img = iframe.doc.createElement('amp-img');
      img.setAttribute('src', '/examples/img/sample.jpg');
      img.setAttribute('width', 300);
      img.setAttribute('height', 200);
      return [img];
    }).then(flyingCarpet => {
      const clip = flyingCarpet.firstChild;
      expect(clip.tagName).to.equal('DIV');
      expect(clip).to.have.class('i-amphtml-fx-flying-carpet-clip');

      const container = clip.firstChild;
      expect(container.tagName).to.equal('DIV');
      expect(container).to.have.class('i-amphtml-fx-flying-carpet-container');

      expect(container.firstChild).to.equal(img);
    });
  });

  it('should move text into wrapping divs', () => {
    let text;
    return getAmpFlyingCarpet(iframe => {
      text = iframe.doc.createTextNode('test');
      return [text];
    }).then(flyingCarpet => {
      const clip = flyingCarpet.firstChild;
      expect(clip.tagName).to.equal('DIV');
      expect(clip).to.have.class('i-amphtml-fx-flying-carpet-clip');

      const container = clip.firstChild;
      expect(container.tagName).to.equal('DIV');
      expect(container).to.have.class('i-amphtml-fx-flying-carpet-container');

      expect(container.firstChild).to.equal(text);
    });
  });

  it('should listen to build callback of children', () => {
    let img;
    let layoutSpy;
    let childLayoutSpy;
    return getAmpFlyingCarpet((iframe, flyingCarpet) => {
      // To make sure the flyingCarpet has already tried laying out children
      layoutSpy = sandbox.spy(flyingCarpet.implementation_, 'layoutCallback');

      // Add the image
      img = iframe.doc.createElement('amp-img');
      img.setAttribute('src', '/examples/img/sample.jpg');
      img.setAttribute('width', 300);
      img.setAttribute('height', 200);
      return [img];
    }).then(flyingCarpet => {
      expect(layoutSpy).to.have.been.called;

      // Now, allow the image to build.
      installImg(flyingCarpet.ownerDocument.defaultView);

      childLayoutSpy = sandbox.spy(img.implementation_, 'layoutCallback');
      return new Promise(resolve => {
        setTimeout(resolve, 32);
      });
    }).then(() => {
      expect(childLayoutSpy).to.have.been.called;
    });
  });

  it('should sync width of fixed container', () => {
    return getAmpFlyingCarpet().then(flyingCarpet => {
      const impl = flyingCarpet.implementation_;
      const container = flyingCarpet.firstChild.firstChild;
      let width = 10;

      impl.getVsync().mutate = function(callback) {
        callback();
      };
      impl.getLayoutWidth = () => width;

      impl.onLayoutMeasure();
      expect(container.style.width).to.equal(width + 'px');

      width++;
      impl.onLayoutMeasure();
      expect(container.style.width).to.equal(width + 'px');
    });
  });

  it('should not render in the 75% of first viewport', () => {
    return getAmpFlyingCarpet(null, '74vh').then(() => {
      throw new Error('should never reach this');
    }, ref => {
      expect(ref.error.message).to.have.string(
          'elements must be positioned after the 75% of first viewport'
      );
      expect(ref.flyingCarpet).to.not.display;
    });
  });

  it('should render past 75% of first viewport', () => {
    return getAmpFlyingCarpet(null, '80vh').then(flyingCarpet => {
      expect(flyingCarpet).to.display;
    });
  });

  it('should not render in the last viewport', () => {
    // Doc: 600px
    // Viewport: 150px
    return getAmpFlyingCarpet(null, '460px').then(() => {
      throw new Error('should never reach this');
    }, ref => {
      expect(ref.error.message).to.have.string(
          'elements must be positioned before the last viewport'
      );
      expect(ref.flyingCarpet).to.not.display;
    });
  });

  it('should render close to the last viewport', () => {
    // Doc: 600px
    // Viewport: 150px
    return getAmpFlyingCarpet(null, '455px').then(flyingCarpet => {
      expect(flyingCarpet).to.display;
    });
  });

  it('should attempt to collapse when its children collapse', () => {
    let img;
    return getAmpFlyingCarpet(iframe => {
      installImg(iframe.win);
      // Usually, the children appear on a new line with indentation
      const pretext = iframe.doc.createTextNode('\n  ');
      img = iframe.doc.createElement('amp-img');
      img.setAttribute('src', '/examples/img/sample.jpg');
      img.setAttribute('width', 300);
      img.setAttribute('height', 200);
      // Usually, the closing node appears on a new line
      const posttext = iframe.doc.createTextNode('\n');
      return [pretext, img, posttext];
    }).then(flyingCarpet => {
      const attemptCollapse = sandbox.stub(flyingCarpet.implementation_,
          'attemptCollapse', () => {
            return Promise.resolve();
          });
      expect(flyingCarpet.getBoundingClientRect().height).to.be.gt(0);
      img.collapse();
      expect(attemptCollapse).to.have.been.called;
    });
  });
});
