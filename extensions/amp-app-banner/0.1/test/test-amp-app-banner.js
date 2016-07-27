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

import {createIframePromise} from '../../../../testing/iframe';
import {platform} from '../../../../src/platform';
import * as sinon from 'sinon';
import {toggleExperiment} from '../../../../src/experiments';
import {vsyncFor} from '../../../../src/vsync';
import '../amp-app-banner';

describe('amp-app-banner', () => {

  let sandbox;
  let mockXhr;
  let vsync;

  function runTask(task, state) {
    if (task.measure) {
      task.measure(state);
    }
    if (task.mutate) {
      task.mutate(state);
    }
  }

  function getAppBanner(config = {}) {
    return createIframePromise(true).then(iframe => {
      vsync = vsyncFor(iframe.win);
      sandbox.stub(vsync, 'runPromise', (task, state) => {
        runTask(task, state);
        return Promise.resolve();
      });
      sandbox.stub(vsync, 'run', runTask);

      toggleExperiment(iframe.win, 'amp-app-banner', true);
      if (config.meta) {
        const meta = iframe.doc.createElement('meta');
        meta.setAttribute('name', 'apple-itunes-app');
        meta.setAttribute('content', config.meta.content);
        iframe.doc.head.appendChild(meta);
      }

      if (config.manifest) {
        const meta = iframe.doc.createElement('link');
        meta.setAttribute('rel', 'amp-manifest');
        meta.setAttribute('href', config.manifest.href);
        sandbox.mock(mockXhr(iframe.win)).expects('fetchJson')
            .returns(config.manifest.content);
      }

      const banner = iframe.doc.createElement('amp-app-banner');
      if (!config.noOpenLink) {
        const openLink = iframe.doc.createElement('a');
        openLink.setAttribute('open-link', '');
        banner.appendChild(openLink);
      }

      return iframe.addElement(banner);
    });
  }

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should preconnect to correct platform store', () => {
    return getAppBanner().then(banner => {
      const impl = banner.implementation_;
      sandbox.stub(platform, 'isIos').returns(true);
      sandbox.stub(impl.preconnect, 'url');
      impl.preconnectCallback(true);
      expect(impl.preconnect.url.called).to.be.true;
      expect(impl.preconnect.url.callCount).to.equal(1);
      expect(impl.preconnect.url.calledWith('https://itunes.apple.com')).to.be.true;

      sandbox.restore();
      sandbox.stub(platform, 'isAndroid').returns(true);
      sandbox.stub(impl.preconnect, 'url');
      impl.preconnectCallback(true);
      expect(impl.preconnect.url.called).to.be.true;
      expect(impl.preconnect.url.callCount).to.equal(1);
      expect(impl.preconnect.url.calledWith('https://play.google.com')).to.be.true;
    });
  });

  it('should remove element if not on ios or android', () => {
    sandbox.stub(platform, 'isIos').returns(false);
    sandbox.stub(platform, 'isAndroid').returns(false);
    return getAppBanner().then(banner => {
      expect(banner.parentElement).to.be.null;
    });
  });

  it.only('should throw if open link is missing', () => {
    sandbox.stub(platform, 'isIos').returns(true);
    return getAppBanner({
      noOpenLink: true,
      meta: {
        content: '',
      },
    }).should.eventually.be.rejectedWith(/<a open-link> is required/);
  });

  describe('hiding on iOS', () => {
    beforeEach(() => {
      sandbox.stub(platform, 'isIos').returns(true);
    });

    //it('should hide if no meta', () => {
    //  return getAppBanner().then(banner => {
    //    expect(banner.style.display).to.equal('none');
    //  });
    //});
    //it('should hide if no meta', () => {
    //  sandbox.stub(viewer, 'isEmbedded').returns(false);
    //  return getAppBanner().then(banner => {
    //    expect(banner.style.display).to.equal('none');
    //  });
    //});

  });


  it('should parse meta content and set hrefs on ios', () => {

  });

  it('should hide if Android and no manifest or not embedded Chrome', () => {

  });

  it('should fetch & parse manifest and set hrefs on android', () => {

  });

});
