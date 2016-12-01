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

import {timerFor} from '../../../../src/timer';
import {
  AmpIframe,
  isAdLike,
  setTrackingIframeTimeoutForTesting,
} from '../amp-iframe';
import {adopt} from '../../../../src/runtime';
import {
  createIframePromise,
  poll,
} from '../../../../testing/iframe';
import {viewportForDoc} from '../../../../src/viewport';
import * as sinon from 'sinon';

adopt(window);

describe('amp-iframe', () => {

  const iframeSrc = 'http://iframe.localhost:' + location.port +
      '/test/fixtures/served/iframe.html';
  const clickableIframeSrc = 'http://iframe.localhost:' + location.port +
      '/test/fixtures/served/iframe-clicktoplay.html';

  const timer = timerFor(window);
  let ranJs = 0;
  let content = '';
  let sandbox;

  beforeEach(() => {
    ranJs = 0;
    sandbox = sinon.sandbox.create();
    window.onmessage = function(message) {
      if (!message.data) {
        return;
      }
      if (message.data == 'loaded-iframe') {
        ranJs++;
      }

      if (message.data.indexOf('content-iframe:') == 0) {
        content = message.data.replace('content-iframe:', '');
      }
    };
    setTrackingIframeTimeoutForTesting(20);
  });

  afterEach(() => {
    sandbox.restore();
  });

  function waitForJsInIframe() {
    return poll('waiting for JS to run', () => {
      return ranJs > 0;
    }, undefined, 300);
  }
  function getAmpIframe(attributes, opt_top, opt_height, opt_translateY,
      opt_onAppend) {
    return createIframePromise().then(function(iframe) {
      const i = iframe.doc.createElement('amp-iframe');
      for (const key in attributes) {
        i.setAttribute(key, attributes[key]);
      }
      if (opt_height) {
        iframe.iframe.style.height = opt_height;
      }
      const top = opt_top || '600px';
      const viewport = viewportForDoc(iframe.win.document);
      viewport.resize_();
      i.style.position = 'absolute';
      if (attributes.position) {
        i.style.position = attributes.position;
      }
      i.style.top = top;
      if (opt_translateY) {
        i.style.transform = 'translateY(' + opt_translateY + ')';
      }
      if (attributes.resizable !== undefined) {
        const overflowEl = iframe.doc.createElement('div');
        overflowEl.setAttribute('overflow', '');
        i.appendChild(overflowEl);
      }
      if (attributes.poster) {
        const img = iframe.doc.createElement('amp-img');
        img.setAttribute('layout', 'fill');
        img.setAttribute('src', attributes.poster);
        img.setAttribute('placeholder', '');
        i.appendChild(img);
      }

      viewport.setScrollTop(parseInt(top, 10));

      if (opt_onAppend) {
        opt_onAppend(iframe);
      }

      return iframe.addElement(i).then(ampIframe => {
        const created = ampIframe.querySelector('iframe');
        if (created) {
          // Wait a bit more for postMessage to get through.
          return timer.promise(0).then(() => {
            return {
              container: ampIframe,
              iframe: created,
              scrollWrapper: ampIframe.querySelector('i-amp-scroll-container'),
            };
          });
        }
        // No iframe was created.
        return {
          container: ampIframe,
          iframe: null,
          error: ampIframe.textContent,
        };
      });
    });
  }

  function getAmpIframeObject(opt_args) {
    const args = opt_args || {
      src: iframeSrc,
      width: 100,
      height: 100,
    };
    return getAmpIframe(args).then(amp => {
      return amp.container.implementation_;
    });
  }

  it('should render iframe', () => {
    return getAmpIframe({
      src: iframeSrc,
      width: 100,
      height: 100,
    }).then(amp => {
      const impl = amp.container.implementation_;
      expect(amp.iframe.src).to.equal(iframeSrc + '#amp=1');
      expect(amp.iframe.getAttribute('sandbox')).to.equal('');
      expect(amp.iframe.parentNode).to.equal(amp.scrollWrapper);
      expect(impl.looksLikeTrackingIframe_()).to.be.false;
      expect(impl.getPriority()).to.equal(0);
      return timer.promise(50).then(() => {
        expect(ranJs).to.equal(0);
      });
    });
  });

  it('should only propagate supported attributes', () => {
    return getAmpIframe({
      src: iframeSrc,
      width: 100,
      height: 100,
      allowfullscreen: '',
      allowtransparency: '',
      referrerpolicy: 'no-referrer',
      frameborder: 3,
      longdesc: 'foo',
      marginwidth: 5,
    }).then(amp => {
      expect(amp.iframe.getAttribute('allowfullscreen')).to.equal('');
      expect(amp.iframe.getAttribute('allowtransparency')).to.equal('');
      expect(amp.iframe.getAttribute('referrerpolicy')).to.equal('no-referrer');
      expect(amp.iframe.getAttribute('frameborder')).to.equal('3');
      // unsupproted attributes
      expect(amp.iframe.getAttribute('longdesc')).to.be.null;
      expect(amp.iframe.getAttribute('marginwidth')).to.be.null;
    });
  });

  it('should default frameborder to 0 if not set', () => {
    return getAmpIframe({
      src: iframeSrc,
      width: 100,
      height: 100,
    }).then(amp => {
      expect(amp.iframe.getAttribute('frameborder')).to.equal('0');
    });
  });

  it('should allow JS and propagate scrolling and have lower priority', () => {
    return getAmpIframe({
      src: iframeSrc,
      sandbox: 'allow-scripts',
      width: 320,
      height: 250,
      scrolling: 'no',
    }).then(amp => {
      const impl = amp.container.implementation_;
      expect(impl.getPriority()).to.equal(2);
      expect(amp.iframe.getAttribute('sandbox')).to.equal('allow-scripts');
      return waitForJsInIframe().then(() => {
        expect(ranJs).to.equal(1);
        expect(amp.scrollWrapper).to.be.null;
      });
    });
  });

  it('should not render at the top', () => {
    return getAmpIframe({
      src: iframeSrc,
      sandbox: 'allow-scripts',
      width: 100,
      height: 100,
    }, '599px', '1000px').then(() => {
      throw new Error('must never happen');
    }, error => {
      expect(error.message).to.match(/position/);
    });
  });

  it('should respect translations', () => {
    return getAmpIframe({
      src: iframeSrc,
      sandbox: 'allow-scripts',
      width: 100,
      height: 100,
    }, '650px', '1000px', '-100px').then(() => {
      throw new Error('must never happen');
    }, error => {
      expect(error.message).to.match(/position/);
    });
  });

  it('should render if further than 75% viewport away from top', () => {
    return getAmpIframe({
      src: iframeSrc,
      sandbox: 'allow-scripts',
      width: 100,
      height: 100,
    }, '75px', '100px').then(amp => {
      expect(amp.iframe).to.be.not.null;
    });
  });

  it('should deny http', () => {
    return getAmpIframe({
      // ads. is not whitelisted for http iframes.
      src: 'http://ads.localhost:' + location.port +
          '/test/fixtures/served/iframe.html',
      sandbox: 'allow-scripts',
      width: 100,
      height: 100,
    }).then(amp => {
      expect(amp.iframe).to.be.null;
    });
  });

  it('should allow data-uri', () => {
    const dataUri = 'data:text/html;charset=utf-8;base64,' +
        'PHNjcmlwdD5kb2N1bWVudC53cml0ZSgnUiAnICsgZG9jdW1lbnQucmVmZXJyZXIgK' +
        'yAnLCAnICsgbG9jYXRpb24uaHJlZik8L3NjcmlwdD4=';
    return getAmpIframe({
      src: dataUri,
      width: 100,
      height: 100,
    }).then(amp => {
      expect(amp.iframe.src).to.equal(dataUri);
      expect(amp.iframe.getAttribute('sandbox')).to.equal('');
      expect(amp.iframe.parentNode).to.equal(amp.scrollWrapper);
      return timer.promise(50).then(() => {
        expect(ranJs).to.equal(0);
      });
    });
  });

  it('should support srcdoc', () => {
    return getAmpIframe({
      width: 100,
      height: 100,
      sandbox: 'allow-scripts',
      srcdoc: '<div id="content"><p>௵Z加䅌ਇ☎Èʘغޝ</p></div>' +
        '<script>try{parent.location.href}catch(e){' +
        'parent.parent./*OK*/postMessage(\'loaded-iframe\', \'*\');' +
        'var c = document.querySelector(\'#content\').innerHTML;' +
        'parent.parent./*OK*/postMessage(\'content-iframe:\' + c, \'*\');' +
        '}</script>',
    }).then(amp => {
      expect(amp.iframe.src).to.match(
          /^data\:text\/html;charset=utf-8;base64,/);
      expect(amp.iframe.getAttribute('srcdoc')).to.be.null;
      expect(amp.iframe.getAttribute('sandbox')).to.equal(
          'allow-scripts');
      expect(amp.iframe.parentNode).to.equal(amp.scrollWrapper);
      return waitForJsInIframe().then(() => {
        expect(ranJs).to.equal(1);
        expect(content).to.equal('<p>௵Z加䅌ਇ☎Èʘغޝ</p>');
      });
    });
  });

  it('should deny srcdoc with allow-same-origin', () => {
    return getAmpIframe({
      width: 100,
      height: 100,
      sandbox: 'allow-same-origin',
      srcdoc: '',
    }).then(amp => {
      expect(amp.iframe).to.be.null;
    });
  });

  it('should deny data uri with allow-same-origin', () => {
    return getAmpIframe({
      width: 100,
      height: 100,
      sandbox: 'allow-same-origin',
      src: 'data:text/html;charset=utf-8;base64,' +
        'PHNjcmlwdD5kb2N1bWVudC53cml0ZSgnUiAnICsgZG9jdW1lbnQucmVmZXJyZXIgK' +
        'yAnLCAnICsgbG9jYXRpb24uaHJlZik8L3NjcmlwdD4=',
    }).then(amp => {
      expect(amp.iframe).to.be.null;
    });
  });

  it('should deny DATA uri with allow-same-origin', () => {
    return getAmpIframe({
      width: 100,
      height: 100,
      sandbox: 'allow-same-origin',
      src: 'DATA:text/html;charset=utf-8;base64,' +
        'PHNjcmlwdD5kb2N1bWVudC53cml0ZSgnUiAnICsgZG9jdW1lbnQucmVmZXJyZXIgK' +
        'yAnLCAnICsgbG9jYXRpb24uaHJlZik8L3NjcmlwdD4=',
    }).then(amp => {
      expect(amp.iframe).to.be.null;
    });
  });

  it('should deny same origin', () => {
    return getAmpIframeObject().then(amp => {
      expect(() => {
        amp.assertSource('https://google.com/fpp', 'https://google.com/abc',
            'allow-same-origin');
      }).to.throw(/must not be equal to container/);

      expect(() => {
        amp.assertSource('https://google.com/fpp', 'https://google.com/abc',
            'Allow-same-origin');
      }).to.throw(/must not be equal to container/);

      expect(() => {
        amp.assertSource('https://google.com/fpp', 'https://google.com/abc',
            'allow-same-origin allow-scripts');
      }).to.throw(/must not be equal to container/);
      // Same origin, but sandboxed.
      amp.assertSource('https://google.com/fpp', 'https://google.com/abc', '');

      expect(() => {
        amp.assertSource('http://google.com/', 'https://foo.com', '');
      }).to.throw(/Must start with https/);

      expect(() => {
        amp.assertSource('./foo', 'https://foo.com', '');
      }).to.throw(/Must start with https/);

      amp.assertSource('http://iframe.localhost:123/foo',
          'https://foo.com', '');
      amp.assertSource('https://container.com', 'https://foo.com', '');
      amp.element.setAttribute('srcdoc', 'abc');
      amp.element.setAttribute('sandbox', 'allow-same-origin');

      expect(() => {
        amp.transformSrcDoc_('<script>try{parent.location.href}catch(e){' +
          'parent.parent./*OK*/postMessage(\'loaded-iframe\', \'*\');}' +
          '</script>', 'Allow-Same-Origin');
      }).to.throw(/allow-same-origin is not allowed with the srcdoc attribute/);

      expect(() => {
        amp.assertSource('https://3p.ampproject.net:999/t',
            'https://google.com/abc');
      }).to.throw(/not allow embedding of frames from ampproject\.\*/);
      expect(() => {
        amp.assertSource('https://3p.ampproject.net:999/t',
            'https://google.com/abc');
      }).to.throw(/not allow embedding of frames from ampproject\.\*/);
    });
  });

  it('should transform source', () => {
    return getAmpIframeObject().then(amp => {
      // null -> undefined
      expect(amp.transformSrc_(null)).to.be.undefined;

      // data: is unchanged
      expect(amp.transformSrc_('data:abc')).to.equal('data:abc');

      // URL with fragment is unchanged.
      expect(amp.transformSrc_('https://example.com/#1'))
          .to.equal('https://example.com/#1');

      // URL w/o fragment is modified.
      expect(amp.transformSrc_('https://example.com/'))
          .to.equal('https://example.com/#amp=1');

      // URL with empty fragment is modified.
      expect(amp.transformSrc_('https://example.com/#'))
          .to.equal('https://example.com/#amp=1');
    });
  });

  it('should listen for resize events', () => {
    return getAmpIframe({
      src: iframeSrc,
      sandbox: 'allow-scripts allow-same-origin',
      width: 100,
      height: 100,
      resizable: '',
    }).then(amp => {
      const impl = amp.container.implementation_;
      const p = new Promise((resolve, unusedReject) => {
        impl.updateSize_ = (height, width) => {
          resolve({amp, height, width});
        };
      });
      amp.iframe.contentWindow.postMessage({
        sentinel: 'amp-test',
        type: 'requestHeight',
        height: 217,
        width: 113,
      }, '*');
      return p;
    }).then(res => {
      expect(res.height).to.equal(217);
      expect(res.width).to.equal(113);
    });
  });

  it('should resize amp-iframe', () => {
    return getAmpIframe({
      src: iframeSrc,
      sandbox: 'allow-scripts',
      width: 100,
      height: 100,
      resizable: '',
    }).then(amp => {
      const impl = amp.container.implementation_;
      const attemptChangeSize = sandbox.spy(impl, 'attemptChangeSize');
      impl.updateSize_(217, '114' /* be tolerant to string number */);
      expect(attemptChangeSize).to.be.calledWith(217, 114);
    });
  });

  it('should resize amp-iframe when only height is provided', () => {
    return getAmpIframe({
      src: iframeSrc,
      sandbox: 'allow-scripts',
      width: 100,
      height: 100,
      resizable: '',
    }).then(amp => {
      const impl = amp.container.implementation_;
      const attemptChangeSize = sandbox.spy(impl, 'attemptChangeSize');
      impl.updateSize_(217);
      expect(attemptChangeSize.callCount).to.equal(1);
      expect(attemptChangeSize.firstCall.args[0]).to.equal(217);
      expect(attemptChangeSize.firstCall.args[1]).to.be.undefined;
    });
  });

  it('should not resize amp-iframe if request height is small', () => {
    return getAmpIframe({
      src: iframeSrc,
      sandbox: 'allow-scripts',
      width: 100,
      height: 100,
      resizable: '',
    }).then(amp => {
      const impl = amp.container.implementation_;
      const attemptChangeSize = sandbox.spy(impl, 'attemptChangeSize');
      impl.updateSize_(50, 114);
      expect(attemptChangeSize.callCount).to.equal(0);
    });
  });

  it('should not resize amp-iframe if it is non-resizable', () => {
    return getAmpIframe({
      src: iframeSrc,
      sandbox: 'allow-scripts',
      width: 100,
      height: 100,
    }).then(amp => {
      const impl = amp.container.implementation_;
      const attemptChangeSize = sandbox.spy(impl, 'attemptChangeSize');
      impl.updateSize_(217, 114);
      expect(attemptChangeSize.callCount).to.equal(0);
    });
  });

  it('should listen for embed-ready event', () => {
    const activateIframeSpy_ =
        sandbox./*OK*/spy(AmpIframe.prototype, 'activateIframe_');
    return getAmpIframe({
      src: clickableIframeSrc,
      sandbox: 'allow-scripts allow-same-origin',
      width: 480,
      height: 360,
      poster: 'https://i.ytimg.com/vi/cMcCTVAFBWM/hqdefault.jpg',
    }).then(amp => {
      const impl = amp.container.implementation_;
      return timer.promise(100).then(() => {
        expect(impl.iframe_.style.zIndex).to.equal('0');
        expect(activateIframeSpy_.callCount).to.equal(2);
      });
    });
  });

  it('should detect tracking iframes', () => {
    const attributes = {
      src: clickableIframeSrc,
      sandbox: 'allow-scripts allow-same-origin',
      width: 5,
      height: 5,
      poster: 'https://i.ytimg.com/vi/cMcCTVAFBWM/hqdefault.jpg',
    };
    let nonTracking;
    return getAmpIframe(attributes, null, null, null, iframe => {
      function addFrame(testIframe, width, height) {
        const i = testIframe.doc.createElement('amp-iframe');
        i.setAttribute('src', clickableIframeSrc);
        i.setAttribute('sandbox', 'allow-scripts allow-same-origin');
        i.setAttribute('width', width);
        i.setAttribute('height', height);
        i.style.position = 'absolute';
        i.style.top = '600px';
        return testIframe.addElement(i);
      }
      addFrame(iframe, 10, 10);
      nonTracking = addFrame(iframe, 100, 100);
    }).then(iframe => {
      const impl = iframe.container.implementation_;
      const doc = impl.element.ownerDocument;
      expect(impl.looksLikeTrackingIframe_()).to.be.true;
      const iframes = doc.querySelectorAll('amp-iframe');
      // appended amp-iframe 10x10
      expect(iframes[0].implementation_
          .looksLikeTrackingIframe_()).to.be.true;
      expect(iframes[0].implementation_
          .getPriority()).to.equal(1);
      // appended amp-iframe 100x100
      expect(iframes[1].implementation_
          .looksLikeTrackingIframe_()).to.be.false;
      expect(iframes[1].implementation_
          .getPriority()).to.equal(0);
      // amp-iframe 5x5
      expect(iframes[2].implementation_
          .looksLikeTrackingIframe_()).to.be.true;
      expect(doc.querySelectorAll('iframe,[amp-removed]')).to.have.length(2);
      return poll('iframe removal', () => {
        return doc.querySelectorAll('[amp-removed]').length == 1;
      }).then(() => {
        expect(doc.querySelectorAll('iframe')).to.have.length(1);
        nonTracking.then(ampIframe => {
          expect(ampIframe.implementation_.iframe_)
              .to.equal(doc.querySelector('iframe'));
        });
      });
    });
  });

  it('should detect non tracking frames', () => {
    return getAmpIframeObject({
      src: clickableIframeSrc,
      sandbox: 'allow-scripts allow-same-origin',
      width: 11,
      height: 11,
      poster: 'https://i.ytimg.com/vi/cMcCTVAFBWM/hqdefault.jpg',
    }).then(impl => {
      expect(impl.looksLikeTrackingIframe_()).to.be.false;
    });
  });

  it('should correctly classify ads', () => {
    function e(width, height) {
      return {
        getLayoutBox() {
          return {width, height};
        },
      };
    }
    expect(isAdLike(e(300, 250))).to.be.true;
    expect(isAdLike(e(320, 270))).to.be.true;
    expect(isAdLike(e(299, 249))).to.be.false;
    expect(isAdLike(e(320, 100))).to.be.true;
    expect(isAdLike(e(335, 100))).to.be.true;
    expect(isAdLike(e(341, 100))).to.be.false;
  });

  it('should not render fixed ad', () => {
    return getAmpIframe({
      src: iframeSrc,
      sandbox: 'allow-scripts allow-same-origin',
      width: 300,
      height: 250,
      position: 'fixed',
    }).then(() => {
      throw new Error('must never happen');
    }, error => {
      expect(error.message).to.match(/not used for displaying fixed ad/);
    });
  });

  it('should not cache intersection box', () => {
    return getAmpIframeObject({
      src: iframeSrc,
      sandbox: 'allow-scripts allow-same-origin',
      width: 300,
      height: 250,
    }).then(impl => {
      const stub = sandbox.stub(impl, 'getLayoutBox');
      const box = {
        top: 100,
        bottom: 200,
        left: 0,
        right: 100,
        width: 100,
        height: 100,
      };
      stub.returns(box);

      impl.onLayoutMeasure();
      const intersection = impl.getIntersectionElementLayoutBox();

      // Simulate a fixed position element "moving" 100px by scrolling down
      // the page.
      box.top += 100;
      box.bottom += 100;
      const newIntersection = impl.getIntersectionElementLayoutBox();
      expect(newIntersection).not.to.deep.equal(intersection);
      expect(newIntersection.top).to.equal(intersection.top + 100);
      expect(newIntersection.width).to.equal(300);
      expect(newIntersection.height).to.equal(250);
    });
  });
});
