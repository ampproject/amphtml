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

require('../../../../build/all/v0/amp-install-serviceworker-0.1.max');
import {adopt} from '../../../../src/runtime';

adopt(window);

describe('amp-install-serviceworker', () => {
  it('should install for same origin', () => {
    const install = document.createElement('amp-install-serviceworker');
    const implementation = install.implementation_;
    expect(implementation).to.be.defined;
    install.setAttribute('src', 'https://example.com/sw.js');
    let calledSrc;
    const p = new Promise(resolve => {});
    implementation.getWin = () => {
      return {
        location: {
          href: 'https://example.com/some/path'
        },
        navigator: {
          serviceWorker: {
            register: src => {
              expect(calledSrc).to.be.undefined;
              calledSrc = src;
              return p;
            }
          }
        }
      };
    };
    implementation.buildCallback();
    expect(calledSrc).to.equal('https://example.com/sw.js');
  });

  it('should be ok without service worker.', () => {
    const install = document.createElement('amp-install-serviceworker');
    const implementation = install.implementation_;
    expect(implementation).to.be.defined;
    install.setAttribute('src', 'https://example.com/sw.js');
    implementation.getWin = () => {
      return {
        location: {
          href: 'https://example.com/some/path'
        },
        navigator: {
        }
      };
    };
    implementation.buildCallback();
  });

  it('should do nothing with non-matching origins', () => {
    const install = document.createElement('amp-install-serviceworker');
    const implementation = install.implementation_;
    expect(implementation).to.be.defined;
    install.setAttribute('src', 'https://other-origin.com/sw.js');
    let calledSrc;
    const p = new Promise(resolve => {});
    implementation.getWin = () => {
      return {
        location: {
          href: 'https://example.com/some/path'
        },
        navigator: {
          serviceWorker: {
            register: src => {
              calledSrc = src;
              return p;
            }
          }
        }
      };
    };
    implementation.buildCallback();
    expect(calledSrc).to.undefined;
  });
});
