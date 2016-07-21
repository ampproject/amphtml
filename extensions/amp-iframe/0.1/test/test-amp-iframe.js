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

import {Timer} from '../../../../src/timer';
import {
  AmpIframe,
  isAdLike,
  setTrackingIframeTimeoutForTesting,
} from '../amp-iframe';
import {adopt} from '../../../../src/runtime';
import {
  createIframePromise,
  pollForLayout,
  poll,
} from '../../../../testing/iframe';
import {loadPromise} from '../../../../src/event-helper';
import {viewportFor} from '../../../../src/viewport';
import * as sinon from 'sinon';

adopt(window);

describe('amp-iframe', () => {

  const iframeSrc = 'http://iframe.localhost:' + location.port +
      '/base/test/fixtures/served/iframe.html';
  const clickableIframeSrc = 'http://iframe.localhost:' + location.port +
      '/base/test/fixtures/served/iframe-clicktoplay.html';

  const timer = new Timer(window);
  let ranJs = 0;
  let sandbox;

  beforeEach(() => {
    ranJs = 0;
    sandbox = sinon.sandbox.create();
    window.onmessage = function(message) {
      if (message.data == 'loaded-iframe') {
        ranJs++;
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
      const viewport = viewportFor(iframe.win);
      viewport.resize_();
      i.style.position = 'absolute';
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
      iframe.doc.body.appendChild(i);
      viewport.setScrollTop(parseInt(top, 10));
      if (opt_onAppend) {
        opt_onAppend(iframe.doc);
      }
      // Wait an event loop for the iframe to be created.
      return pollForLayout(iframe.win, 1).then(() => {
        const created = i.querySelector('iframe');
        if (created) {
          // Wait for the iframe to load
          return loadPromise(created).then(() => {
            // Wait a bit more for postMessage to get through.
            return timer.promise(0).then(() => {
              return {
                container: i,
                iframe: created,
                scrollWrapper: i.querySelector('i-amp-scroll-container'),
              };
            });
          });
        }
        // No iframe was created.
        return {
          container: i,
          iframe: null,
          error: i.textContent,
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
      expect(amp.iframe.src).to.equal(iframeSrc);
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
    }, '599px', '1000px').then(amp => {
      expect(amp.iframe).to.be.null;
    }).catch(() => {});
  });

  it('should respect translations', () => {
    return getAmpIframe({
      src: iframeSrc,
      sandbox: 'allow-scripts',
      width: 100,
      height: 100,
    }, '650px', '1000px', '-100px').then(amp => {
      expect(amp.iframe).to.be.null;
    }).catch(() => {});
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
          '/base/test/fixtures/served/iframe.html',
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
      srcdoc: '<script>try{parent.location.href}catch(e){' +
          'parent.parent./*OK*/postMessage(\'loaded-iframe\', \'*\');}' +
          '</script>',
    }).then(amp => {
      expect(amp.iframe.src).to.match(
          /^data\:text\/html;charset=utf-8;base64,/);
      expect(amp.iframe.getAttribute('srcdoc')).to.be.null;
      expect(amp.iframe.getAttribute('sandbox')).to.equal(
          'allow-scripts');
      expect(amp.iframe.parentNode).to.equal(amp.scrollWrapper);
      return waitForJsInIframe().then(() => {
        expect(ranJs).to.equal(1);
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
        amp.transformSrcDoc('<script>try{parent.location.href}catch(e){' +
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

  it('should listen for resize events', () => {
    return getAmpIframe({
      src: iframeSrc,
      sandbox: 'allow-scripts allow-same-origin',
      width: 100,
      height: 100,
      resizable: '',
    }).then(amp => {
      const impl = amp.container.implementation_;
      impl.layoutCallback();
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
      impl.attemptChangeSize = sandbox.spy();
      impl.updateSize_(217, 114);
      expect(impl.attemptChangeSize.callCount).to.equal(1);
      expect(impl.attemptChangeSize.firstCall.args[0]).to.equal(217);
      expect(impl.attemptChangeSize.firstCall.args[1]).to.equal(114);
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
      impl.attemptChangeSize = sandbox.spy();
      impl.updateSize_(217);
      expect(impl.attemptChangeSize.callCount).to.equal(1);
      expect(impl.attemptChangeSize.firstCall.args[0]).to.equal(217);
      expect(impl.attemptChangeSize.firstCall.args[1]).to.be.undefined;
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
      impl.attemptChangeSize = sandbox.spy();
      impl.updateSize_(50, 114);
      expect(impl.attemptChangeSize.callCount).to.equal(0);
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
      impl.attemptChangeSize = sandbox.spy();
      impl.updateSize_(217, 114);
      expect(impl.attemptChangeSize.callCount).to.equal(0);
    });
  });

  it('should listen for embed-ready event', () => {
    const activateIframeSpy_ =
        sandbox.spy(AmpIframe.prototype, 'activateIframe_');
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
      width: 10,
      height: 10,
      poster: 'https://i.ytimg.com/vi/cMcCTVAFBWM/hqdefault.jpg',
    };
    let nonTracking;
    return getAmpIframe(attributes, null, null, null, doc => {
      function addFrame() {
        const i = doc.createElement('amp-iframe');
        for (const key in attributes) {
          i.setAttribute(key, attributes[key]);
        }
        i.style.height = '10px';
        i.style.width = '10px';
        i.style.display = 'block';
        i.style.position = 'absolute';
        i.style.top = '600px';
        doc.body.appendChild(i);
        return i;
      }

      addFrame();
      nonTracking = addFrame();
      nonTracking.style.width = '100px';
      nonTracking.style.height = '100px';
    }).then(iframe => {
      const impl = iframe.container.implementation_;
      const doc = impl.element.ownerDocument;
      expect(impl.looksLikeTrackingIframe_()).to.be.true;
      const iframes = doc.querySelectorAll('amp-iframe');
      expect(iframes[0].implementation_
          .looksLikeTrackingIframe_()).to.be.true;
      expect(iframes[1].implementation_
          .looksLikeTrackingIframe_()).to.be.true;
      expect(iframes[2].implementation_
          .looksLikeTrackingIframe_()).to.be.false;
      expect(doc.querySelectorAll('iframe,[amp-removed]')).to.have.length(2);
      return poll('iframe removal', () => {
        return doc.querySelectorAll('[amp-removed]').length == 1;
      }).then(() => {
        expect(doc.querySelectorAll('iframe')).to.have.length(1);
        expect(nonTracking.implementation_.iframe_)
            .to.equal(doc.querySelector('iframe'));
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
      const element = document.createElement('test');
      element.setAttribute('width', width);
      element.setAttribute('height', height);
      return element;
    }
    expect(isAdLike(e(300, 250))).to.be.true;
    expect(isAdLike(e(320, 270))).to.be.true;
    expect(isAdLike(e(299, 249))).to.be.false;
    expect(isAdLike(e(320, 100))).to.be.true;
    expect(isAdLike(e(335, 100))).to.be.true;
    expect(isAdLike(e(341, 100))).to.be.false;
  });
});
