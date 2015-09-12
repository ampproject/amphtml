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
import {createIframePromise} from '../../../../testing/iframe';
import {loadPromise} from '../../../../src/event-helper';
import {resources} from '../../../../src/resources';
require('../amp-iframe');

adopt(window);

describe('amp-iframe', () => {

  var iframeSrc = 'http://iframe.localhost:' + location.port +
          '/base/fixtures/served/iframe.html';

  var timer = new Timer(window);
  var ranJs = 0;
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
      var i = iframe.doc.createElement('amp-iframe');
      for (var key in attributes) {
        i.setAttribute(key, attributes[key]);
      }
      if (opt_height) {
        iframe.iframe.style.height = opt_height;
      }
      var top = opt_top || '600px';
      i.style.position = 'absolute';
      i.style.top = top;
      if (opt_translateY) {
        i.style.transform = 'translateY(' + opt_translateY + ')';
      }
      iframe.doc.body.appendChild(i);
      // Wait an event loop for the iframe to be created.
      return timer.promise(0).then(() => {
        if (i.lastChild && i.lastChild.tagName == 'IFRAME') {
          // Wait for the iframe to load
          return loadPromise(i.lastChild).then(() => {
            // Wait a bit more for postMessage to get through.
            return timer.promise(0).then(() => {
              return {
                container: i,
                iframe: i.lastChild
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

  it.skipOnTravis('should render iframe', () => {
    return getAmpIframe({
      src: iframeSrc,
      width: 100,
      height: 100
    }).then((amp) => {
      expect(amp.iframe).to.be.instanceof(Element);
      expect(amp.iframe.src).to.equal(iframeSrc);
      expect(amp.iframe.getAttribute('sandbox')).to.equal('');
      return timer.promise(0).then(() => {
        expect(ranJs).to.equal(0);
      });
    });
  });

  it.skipOnTravis('should allow JS', () => {
    return getAmpIframe({
      src: iframeSrc,
      sandbox: 'allow-scripts',
      width: 100,
      height: 100
    }).then((amp) => {
      expect(amp.iframe.getAttribute('sandbox')).to.equal('allow-scripts');
      return timer.promise(400).then(() => {
        expect(ranJs).to.equal(1);
      });
    });
  });

  it('should not render at the top', () => {
    return getAmpIframe({
      src: iframeSrc,
      sandbox: 'allow-scripts',
      width: 100,
      height: 100
    }, '599px', '1000px').then((amp) => {
      expect(amp.iframe).to.be.null;
    }).catch(() => {});
  });

  it('should respect translations', () => {
    return getAmpIframe({
      src: iframeSrc,
      sandbox: 'allow-scripts',
      width: 100,
      height: 100
    }, '650px', '1000px', '-100px').then((amp) => {
      expect(amp.iframe).to.be.null;
    }).catch(() => {});
  });

  it.skipOnTravis('should render if further than 75% viewport away from top', () => {
    return getAmpIframe({
      src: iframeSrc,
      sandbox: 'allow-scripts',
      width: 100,
      height: 100
    }, '75px', '100px').then((amp) => {
      expect(amp.iframe).to.be.not.null;
    });
  });

  it('should deny http', () => {
    return getAmpIframe({
      // ads. is not whitelisted for http iframes.
      src: 'http://ads.localhost:' + location.port +
          '/base/fixtures/served/iframe.html',
      sandbox: 'allow-scripts',
      width: 100,
      height: 100
    }).then((amp) => {
      expect(amp.iframe).to.be.null;
    });
  });

  it('should deny same origin', () => {
    return getAmpIframeObject().then((amp) => {
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

      amp.assertSource('http://iframe.localhost:123/foo', 'https://foo.com', '');
      amp.assertSource('https://container.com', 'https://foo.com', '');
    });
  });

  function getAmpIframeObject() {
    return getAmpIframe({
      src: iframeSrc,
      width: 100,
      height: 100
    }).then((amp) => {
      return amp.container.implementation_;
    });
  }
});
