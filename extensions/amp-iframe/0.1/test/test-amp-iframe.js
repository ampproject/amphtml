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
import {adopt} from '../../../../src/runtime';
import {createIframePromise, pollForLayout} from '../../../../testing/iframe';
import {loadPromise} from '../../../../src/event-helper';
import {resourcesFor} from '../../../../src/resources';
require('../amp-iframe');

adopt(window);

describe('amp-iframe', () => {

  const iframeSrc = 'http://iframe.localhost:' + location.port +
      '/base/test/fixtures/served/iframe.html';

  const timer = new Timer(window);
  let ranJs = 0;
  beforeEach(() => {
    ranJs = 0;
  });

  window.onmessage = function(message) {
    if (message.data == 'loaded-iframe') {
      ranJs++;
    }
  };

  function getAmpIframe(attributes, opt_top, opt_height, opt_translateY) {
    return createIframePromise().then(function(iframe) {
      const i = iframe.doc.createElement('amp-iframe');
      for (const key in attributes) {
        i.setAttribute(key, attributes[key]);
      }
      if (opt_height) {
        iframe.iframe.style.height = opt_height;
      }
      const top = opt_top || '600px';
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
      iframe.doc.body.appendChild(i);
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
                scrollWrapper: i.querySelector('i-amp-scroll-container')
              };
            });
          });
        }
        // No iframe was created.
        return {
          container: i,
          iframe: null,
          error: i.textContent
        };
      });
    });
  }

  function getAmpIframeObject() {
    return getAmpIframe({
      src: iframeSrc,
      width: 100,
      height: 100
    }).then(amp => {
      return amp.container.implementation_;
    });
  }

  it('should render iframe', () => {
    return getAmpIframe({
      src: iframeSrc,
      width: 100,
      height: 100
    }).then(amp => {
      expect(amp.iframe).to.be.instanceof(Element);
      expect(amp.iframe.src).to.equal(iframeSrc);
      expect(amp.iframe.getAttribute('sandbox')).to.equal('');
      expect(amp.iframe.parentNode).to.equal(amp.scrollWrapper);
      return timer.promise(0).then(() => {
        expect(ranJs).to.equal(0);
      });
    });
  });

  it('should allow JS and propagate scrolling', () => {
    return getAmpIframe({
      src: iframeSrc,
      sandbox: 'allow-scripts',
      width: 100,
      height: 100,
      scrolling: 'no'
    }).then(amp => {
      expect(amp.iframe.getAttribute('sandbox')).to.equal('allow-scripts');
      return timer.promise(100).then(() => {
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
      height: 100
    }, '599px', '1000px').then(amp => {
      expect(amp.iframe).to.be.null;
    }).catch(() => {});
  });

  it('should respect translations', () => {
    return getAmpIframe({
      src: iframeSrc,
      sandbox: 'allow-scripts',
      width: 100,
      height: 100
    }, '650px', '1000px', '-100px').then(amp => {
      expect(amp.iframe).to.be.null;
    }).catch(() => {});
  });

  it('should render if further than 75% viewport away from top', () => {
    return getAmpIframe({
      src: iframeSrc,
      sandbox: 'allow-scripts',
      width: 100,
      height: 100
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
      height: 100
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
      height: 100
    }).then(amp => {
      expect(amp.iframe).to.be.instanceof(Element);
      expect(amp.iframe.src).to.equal(dataUri);
      expect(amp.iframe.getAttribute('sandbox')).to.equal('');
      expect(amp.iframe.parentNode).to.equal(amp.scrollWrapper);
      return timer.promise(0).then(() => {
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
      expect(amp.iframe).to.be.instanceof(Element);
      expect(amp.iframe.src).to.match(
          /^data\:text\/html;charset=utf-8;base64,/);
      expect(amp.iframe.getAttribute('srcdoc')).to.be.null;
      expect(amp.iframe.getAttribute('sandbox')).to.equal(
          'allow-scripts');
      expect(amp.iframe.parentNode).to.equal(amp.scrollWrapper);
      return timer.promise(0).then(() => {
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

  it('should deny same origin', () => {
    return getAmpIframeObject().then(amp => {
      expect(() => {
        amp.assertSource('https://google.com/fpp', 'https://google.com/abc',
            'allow-same-origin');
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
        amp.transformSrcDoc();
      }).to.throw(/allow-same-origin is not allowed with the srcdoc attribute/);
    });
  });

  it('should listen for resize events', () => {
    return getAmpIframe({
      src: iframeSrc,
      sandbox: 'allow-scripts allow-same-origin',
      width: 100,
      height: 100,
      resizable: ''
    }).then(amp => {
      const impl = amp.container.implementation_;
      impl.layoutCallback();
      const p = new Promise((resolve, reject) => {
        impl.updateHeight_ = newHeight => {
          resolve({amp: amp, newHeight: newHeight});
        };
      });
      amp.iframe.contentWindow.postMessage({
        sentinel: 'amp-test',
        type: 'requestHeight',
        height: 217
      }, '*');
      return p;
    }).then(res => {
      expect(res.newHeight).to.equal(217);
      expect(res.amp.iframe.height).to.equal('217');
    });
  });

  it('should fallback for resize with overflow element', () => {
    return getAmpIframe({
      src: iframeSrc,
      sandbox: 'allow-scripts',
      width: 100,
      height: 100,
      resizable: ''
    }).then(amp => {
      const impl = amp.container.implementation_;
      impl.requestChangeHeight = sinon.spy();
      impl.changeHeight = sinon.spy();
      impl.updateHeight_(217);
      expect(impl.changeHeight.callCount).to.equal(0);
      expect(impl.requestChangeHeight.callCount).to.equal(1);
      expect(impl.requestChangeHeight.firstCall.args[0]).to.equal(217);

      const fallback = impl.requestChangeHeight.firstCall.args[1];
      fallback(219);
      expect(impl.overflowElement_).to.not.be.null;
      expect(impl.overflowElement_).to.have.class('-amp-overflow');
      expect(impl.overflowElement_).to.not.have.class('amp-hidden');
      impl.overflowElement_.onclick();
      expect(impl.overflowElement_).to.have.class('amp-hidden');
      expect(impl.changeHeight.callCount).to.equal(1);
      expect(impl.changeHeight.firstCall.args[0]).to.equal(219);
    });
  });

  it('should not resize a non-resizable frame', () => {
    return getAmpIframe({
      src: iframeSrc,
      sandbox: 'allow-scripts',
      width: 100,
      height: 100
    }).then(amp => {
      const impl = amp.container.implementation_;
      impl.requestChangeHeight = sinon.spy();
      impl.changeHeight = sinon.spy();
      impl.updateHeight_(217);
      expect(impl.changeHeight.callCount).to.equal(0);
      expect(impl.requestChangeHeight.callCount).to.equal(0);
    });
  });
});
