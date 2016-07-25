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

import '../amp-install-serviceworker';
import {adopt} from '../../../../src/runtime';
import {getService} from '../../../../src/service';
import * as sinon from 'sinon';

adopt(window);

describe('amp-install-serviceworker', () => {

  let clock;
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    clock = sandbox.useFakeTimers();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should install for same origin', () => {
    const install = document.createElement('amp-install-serviceworker');
    const implementation = install.implementation_;
    expect(implementation).to.be.defined;
    install.setAttribute('src', 'https://example.com/sw.js');
    let calledSrc;
    const p = new Promise(() => {});
    implementation.win = {
      location: {
        href: 'https://example.com/some/path',
      },
      navigator: {
        serviceWorker: {
          register: src => {
            expect(calledSrc).to.be.undefined;
            calledSrc = src;
            return p;
          },
        },
      },
    };
    implementation.buildCallback();
    expect(calledSrc).to.equal('https://example.com/sw.js');
  });

  it('should be ok without service worker.', () => {
    const install = document.createElement('amp-install-serviceworker');
    const implementation = install.implementation_;
    expect(implementation).to.be.defined;
    install.setAttribute('src', 'https://example.com/sw.js');
    implementation.win = {
      location: {
        href: 'https://example.com/some/path',
      },
      navigator: {
      },
    };
    implementation.buildCallback();
  });

  it('should do nothing with non-matching origins', () => {
    const install = document.createElement('amp-install-serviceworker');
    const implementation = install.implementation_;
    expect(implementation).to.be.defined;
    install.setAttribute('src', 'https://other-origin.com/sw.js');
    const p = new Promise(() => {});
    implementation.win = {
      location: {
        href: 'https://example.com/some/path',
      },
      navigator: {
        serviceWorker: {
          register: () => {
            return p;
          },
        },
      },
    };
    implementation.buildCallback();
    expect(install.children).to.have.length(0);
  });

  it('should do nothing on proxy without iframe URL', () => {
    const install = document.createElement('amp-install-serviceworker');
    const implementation = install.implementation_;
    expect(implementation).to.be.defined;
    install.setAttribute('src', 'https://cdn.ampproject.org/sw.js');
    let calledSrc;
    const p = new Promise(() => {});
    implementation.win = {
      location: {
        href: 'https://cdn.ampproject.org/some/path',
      },
      navigator: {
        serviceWorker: {
          register: src => {
            calledSrc = src;
            return p;
          },
        },
      },
    };
    implementation.buildCallback();
    expect(calledSrc).to.undefined;
    expect(install.children).to.have.length(0);
  });

  describe('proxy iframe injection', () => {

    let documentInfo;
    let install;
    let implementation;
    let whenVisible;
    let calledSrc;

    beforeEach(() => {
      install = document.createElement('amp-install-serviceworker');
      implementation = install.implementation_;
      expect(implementation).to.be.defined;
      install.setAttribute('src', 'https://www.example.com/sw.js');
      calledSrc = undefined;
      const p = new Promise(() => {});
      const win = {
        location: {
          href: 'https://cdn.ampproject.org/c/s/www.example.com/path',
        },
        navigator: {
          serviceWorker: {
            register: src => {
              calledSrc = src;
              return p;
            },
          },
        },
      };
      implementation.win = win;
      documentInfo = {
        canonicalUrl: 'https://www.example.com/path',
        sourceUrl: 'https://source.example.com/path',
      };
      getService(win, 'documentInfo', () => {
        return documentInfo;
      });
      whenVisible = Promise.resolve();
      getService(win, 'viewer', () => {
        return {
          whenFirstVisible: () => whenVisible,
          isVisible: () => true,
        };
      });
    });

    function testIframe() {
      const iframeSrc = 'https://www.example.com/install-sw.html';
      install.setAttribute('data-iframe-src', iframeSrc);
      implementation.buildCallback();
      let iframe;
      const appendChild = install.appendChild;
      install.appendChild = child => {
        iframe = child;
        iframe.complete = true;  // Mark as loaded.
        expect(iframe.src).to.equal(iframeSrc);
        iframe.src = 'about:blank';
        appendChild.call(install, iframe);
      };
      let deferredMutate;
      implementation.deferMutate = fn => {
        expect(deferredMutate).to.be.undefined;
        deferredMutate = fn;
      };
      return whenVisible.then(() => {
        clock.tick(19999);
        expect(deferredMutate).to.be.undefined;
        expect(iframe).to.be.undefined;
        clock.tick(1);
        expect(deferredMutate).to.not.be.undefined;
        expect(iframe).to.be.undefined;
        deferredMutate();
        expect(iframe).to.not.be.undefined;
        expect(calledSrc).to.undefined;
        expect(install.style.display).to.equal('none');
        expect(iframe.tagName).to.equal('IFRAME');
        expect(iframe.getAttribute('sandbox')).to.equal(
            'allow-same-origin allow-scripts');
      });
    }

    it('should inject iframe on proxy if provided (valid canonical)',
        testIframe);

    it('should inject iframe on proxy if provided (valid source)', () => {
      documentInfo = {
        canonicalUrl: 'https://canonical.example.com/path',
        sourceUrl: 'https://www.example.com/path',
      };
      testIframe();
    });

    it('should reject bad iframe URLs', () => {
      const iframeSrc = 'https://www2.example.com/install-sw.html';
      install.setAttribute('data-iframe-src', iframeSrc);
      expect(() => {
        implementation.buildCallback();
      }).to.throw(/should be a URL on the same origin as the source/);
      install.setAttribute('data-iframe-src',
          'http://www.example.com/install-sw.html');
      expect(() => {
        implementation.buildCallback();
      }).to.throw(/https/);
    });
  });
});
