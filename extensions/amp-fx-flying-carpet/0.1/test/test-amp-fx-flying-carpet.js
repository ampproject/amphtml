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

import {AmpFlyingCarpet} from '../amp-fx-flying-carpet';
import {Resource} from '../../../../src/service/resource';
import {Services} from '../../../../src/services';


describes.realWin('amp-fx-flying-carpet', {
  amp: {
    extensions: ['amp-fx-flying-carpet'],
  },
}, env => {
  let win, doc;
  let viewport;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
    viewport = Services.viewportForDoc(env.ampdoc);
  });

  function getAmpFlyingCarpet(opt_childrenCallback, opt_top) {
    const top = opt_top || '200vh';

    const bodyResizer = doc.createElement('div');
    bodyResizer.style.height = '400vh';
    bodyResizer.style.width = '1px';
    doc.body.appendChild(bodyResizer);

    doc.body.style.position = 'relative';
    viewport.resize_();

    const parent = doc.querySelector('#parent');
    parent.style.position = 'absolute';
    parent.style.top = top;

    const flyingCarpet = doc.createElement('amp-fx-flying-carpet');
    flyingCarpet.setAttribute('height', '10px');
    if (opt_childrenCallback) {
      const children = opt_childrenCallback(flyingCarpet);
      children.forEach(child => {
        flyingCarpet.appendChild(child);
      });
    }

    parent.appendChild(flyingCarpet);
    return flyingCarpet.build().then(() => {
      const resource = Resource.forElement(flyingCarpet);
      resource.measure();
      return flyingCarpet.layoutCallback();
    }).then(() => {
      viewport.setScrollTop(parseInt(top, 10));
      return flyingCarpet;
    }, error => {
      return Promise.reject({error, flyingCarpet});
    });
  }

  it('should move children into wrapping divs', () => {
    let img;
    return getAmpFlyingCarpet(() => {
      img = doc.createElement('amp-img');
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
    return getAmpFlyingCarpet(() => {
      text = doc.createTextNode('test');
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
    const scheduleLayoutStub = sandbox.stub(
        AmpFlyingCarpet.prototype, 'scheduleLayout');
    let img;
    return getAmpFlyingCarpet(() => {
      // Add the image
      img = doc.createElement('amp-img');
      img.setAttribute('src', '/examples/img/sample.jpg');
      img.setAttribute('width', 300);
      img.setAttribute('height', 200);
      return [img];
    }).then(() => {
      expect(scheduleLayoutStub).to.have.been.called;
      expect(scheduleLayoutStub).to.have.been.calledWith([img]);
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
    return getAmpFlyingCarpet(() => {
      // Usually, the children appear on a new line with indentation
      const pretext = doc.createTextNode('\n  ');
      img = doc.createElement('amp-img');
      img.setAttribute('src', '/examples/img/sample.jpg');
      img.setAttribute('width', 300);
      img.setAttribute('height', 200);
      // Usually, the closing node appears on a new line
      const posttext = doc.createTextNode('\n');
      return [pretext, img, posttext];
    }).then(flyingCarpet => {
      const attemptCollapse = sandbox.stub(flyingCarpet.implementation_,
          'attemptCollapse').callsFake(() => {
        return Promise.resolve();
      });
      expect(flyingCarpet.getBoundingClientRect().height).to.be.gt(0);
      img.collapse();
      expect(attemptCollapse).to.have.been.called;
    });
  });
});
