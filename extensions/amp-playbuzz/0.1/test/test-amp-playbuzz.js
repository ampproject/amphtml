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

import {
  createIframePromise,
  doNotLoadExternalResourcesInTest,
} from '../../../../testing/iframe';
import '../amp-playbuzz';
import {adopt} from '../../../../src/runtime';

adopt(window);

function startsWith(string, searchString) {
  return string.substr(0, searchString.length) === searchString;
};

describe('amp-playbuzz', () => {

  function createOptionalParams(displayInfo, displayShareBar, displayComments) {
    return {
      displayItemInfo: displayInfo,
      displayShareBar,
      displayComments,
    };
  }

  function getIns(itemUrl, params, opt_responsive, opt_beforeLayoutCallback) {
    return createIframePromise(true, opt_beforeLayoutCallback).then(iframe => {
      doNotLoadExternalResourcesInTest(iframe.win);
      const ins = iframe.doc.createElement('amp-playbuzz');
      ins.setAttribute('src', itemUrl);
      ins.setAttribute('width', '111');
      ins.setAttribute('height', '222');
      ins.setAttribute('alt', 'Testing');
      if (opt_responsive) {
        ins.setAttribute('layout', 'responsive');
      }
      if (params && typeof params.displayItemInfo === 'boolean') {
        ins.setAttribute('data-item-info', params.displayItemInfo);
      }
      if (params && typeof params.displayShareBar === 'boolean') {
        ins.setAttribute('data-share-buttons', params.displayShareBar);
      }
      if (params && typeof params.displayComments === 'boolean') {
        ins.setAttribute('data-comments', params.displayComments);
      }
      return iframe.addElement(ins);
    });
  }

  function testIframe(iframe) {
    const itemSrcUrl = '//www.playbuzz.com/bob/bobs-life';
    expect(iframe).to.not.be.null;
    expect(startsWith(iframe.src, itemSrcUrl)).to.be.true;
    expect(iframe.className).to.match(/-amp-fill-content/);
  }

  before(() => {
    AMP.toggleExperiment('amp-playbuzz', true);
  });

  it('renders', () => {
    return getIns('https://www.playbuzz.com/bob/bobs-life').then(ins => {
      const iframe = ins.querySelector('iframe');
      testIframe(iframe);
      // TODO: test playbuzz placeholder loader
    });
  });

  it('renders with false for each optional param', () => {
    return getIns('https://www.playbuzz.com/bob/bobs-life').then(ins => {
      const iframe = ins.querySelector('iframe');
      testIframe(iframe);
      expect(iframe.src)
        .to.contain('&useComments=false')
        .and.to.contain('&gameInfo=false')
        .and.to.contain('&useShares=false');
    });
  });

  it('renders with true for each true optional param', () => {
    return getIns('https://www.playbuzz.com/bob/bobs-life', createOptionalParams(true, true, true)).then(ins => {
      const iframe = ins.querySelector('iframe');
      testIframe(iframe);
      expect(iframe.src)
        .to.contain('&useComments=true')
        .and.to.contain('&gameInfo=true')
        .and.to.contain('&useShares=true');
    });
  });

  it('builds a placeholder image without inserting iframe', () => {
    return getIns('https://www.playbuzz.com/bob/bobs-life', createOptionalParams(), true, ins => {
      // console.log(ins);
      const placeholder = ins.querySelector('[placeholder]');
      const iframe = ins.querySelector('iframe');
      expect(iframe).to.be.null;
      expect(placeholder.style.display).to.be.equal('');
    }).then(ins => {
      const placeholder = ins.querySelector('[placeholder]');
      const iframe = ins.querySelector('iframe');
      ins.getVsync = () => {
        return {
          mutate: fn => fn(),
        };
      };
      testIframe(iframe);
      //Should test placeholder too
      ins.implementation_.iframePromise_.then(() => {
        expect(placeholder.style.display).to.be.equal('none');
      });
    });
  });

  it('requires item attribute', () => {
    expect(getIns('')).to.be.rejectedWith(
      /The item attribute is required for/);
  });
});
