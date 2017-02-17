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
import {toggleExperiment} from '../../../../src/experiments';
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

  function createItemSrc() {
    return {
      withUrl: function(itemUrl) {
        this.itemUrl = itemUrl;
        return this;
      },
      withItemId: function(itemId) {
        this.itemId = itemId;
        return this;
      },
    };
  }

  function getIns(itemSrc, params, opt_responsive, opt_beforeLayoutCallback) {
    return createIframePromise(true, opt_beforeLayoutCallback).then(iframe => {
      doNotLoadExternalResourcesInTest(iframe.win);
      const ins = iframe.doc.createElement('amp-playbuzz');
      if (itemSrc.itemUrl) {
        ins.setAttribute('src', itemSrc.itemUrl);
      }
      if (itemSrc.itemId) {
        ins.setAttribute('data-item', itemSrc.itemId);
      }
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

  function testIframe(iframe, itemSrcUrl) {
    expect(iframe).to.not.be.null;
    expect(startsWith(iframe.src, itemSrcUrl)).to.be.true;
    expect(iframe.className).to.match(/i-amphtml-fill-content/);
    // This is important to avoid sizing issues.
    expect(iframe.getAttribute('scrolling')).to.equal('no');
  }

  beforeEach(() => {
    toggleExperiment(window, 'amp-playbuzz', true);
  });

  it('renders', () => {
    const src = createItemSrc().withUrl('https://www.playbuzz.com/bob/bobs-life');
    return getIns(src).then(ins => {
      const iframe = ins.querySelector('iframe');
      testIframe(iframe, '//www.playbuzz.com/bob/bobs-life');
      // TODO: test playbuzz placeholder loader
    });
  });

  it('renders with false for each optional param', () => {
    const src = createItemSrc().withUrl('https://www.playbuzz.com/bob/bobs-life');
    return getIns(src).then(ins => {
      const iframe = ins.querySelector('iframe');
      testIframe(iframe, '//www.playbuzz.com/bob/bobs-life');
      expect(iframe.src)
        .to.contain('&useComments=false')
        .and.to.contain('&gameInfo=false')
        .and.to.contain('&useShares=false');
    });
  });

  it('renders with item id instead of src', () => {
    const src = createItemSrc().withItemId('some-item-id');
    return getIns(src).then(ins => {
      const iframe = ins.querySelector('iframe');
      testIframe(iframe, '//www.playbuzz.com/item/some-item-id');
    });
  });

  it('renders with item id when submitted both with item url & item id', () => {
    const src = createItemSrc()
      .withUrl('https://www.playbuzz.com/bob/bobs-life')
      .withItemId('some-item-id');

    return getIns(src).then(ins => {
      const iframe = ins.querySelector('iframe');
      testIframe(iframe, '//www.playbuzz.com/item/some-item-id');
    });
  });

  it('renders with true for each true optional param', () => {
    const src = createItemSrc().withUrl('https://www.playbuzz.com/bob/bobs-life');
    return getIns(src, createOptionalParams(true, true, true)).then(ins => {
      const iframe = ins.querySelector('iframe');
      testIframe(iframe, '//www.playbuzz.com/bob/bobs-life');
      expect(iframe.src)
        .to.contain('&useComments=true')
        .and.to.contain('&gameInfo=true')
        .and.to.contain('&useShares=true');
    });
  });

  it('builds a placeholder image without inserting iframe', () => {
    const src = createItemSrc().withUrl('https://www.playbuzz.com/bob/bobs-life');
    return getIns(src, createOptionalParams(), true, ins => {
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
      testIframe(iframe, '//www.playbuzz.com/bob/bobs-life');
      //Should test placeholder too
      ins.implementation_.iframePromise_.then(() => {
        expect(placeholder.style.display).to.be.equal('none');
      });
    });
  });

  it('requires item attribute', () => {
    const src = createItemSrc().withUrl('');
    expect(getIns(src)).to.be.rejectedWith(
      /The item attribute is required for/);
  });
});
