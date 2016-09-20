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
import {platformFor} from '../../../../src/platform';
import * as sinon from 'sinon';
import {toggleExperiment} from '../../../../src/experiments';
import {vsyncFor} from '../../../../src/vsync';
import {
    AmpAppBanner,
    AbstractAppBanner,
    AmpIosAppBanner,
    AmpAndroidAppBanner,
} from '../amp-app-banner';

import {xhrFor} from '../../../../src/xhr';
import {installStorageService} from '../../../../src/service/storage-impl';
import '../../../amp-analytics/0.1/amp-analytics';
import {timerFor} from '../../../../src/timer';

describe('amp-app-banner', () => {

  let sandbox;
  let vsync;
  let platform;
  let isAndroid = false;
  let isIos = false;
  let isChrome = false;
  let isSafari = false;

  const meta = {
    content: 'app-id=828256236, app-argument=medium://p/cb7f223fad86',
  };
  const manifest = {
    href: 'https://example.com/manifest.json',
    content: {
      'prefer_related_applications': true,
      'related_applications': [
        {
          'platform': 'play',
          'id': 'com.medium.reader',
          'url': 'https://play.google.com/com.medium.reader',
        },
      ],
    },
  };
  toggleExperiment(window, 'amp-app-banner', true);

  function runTask(task, state) {
    if (task.measure) {
      task.measure(state);
    }
    if (task.mutate) {
      task.mutate(state);
    }
  }

  function getTestFrame() {
    return createIframePromise(true).then(iframe => {
      installStorageService(iframe.win);
      platform = platformFor(iframe.win);
      sandbox.stub(platform, 'isIos', () => isIos);
      sandbox.stub(platform, 'isAndroid', () => isAndroid);
      sandbox.stub(platform, 'isChrome', () => isChrome);
      sandbox.stub(platform, 'isSafari', () => isSafari);

      vsync = vsyncFor(iframe.win);
      sandbox.stub(vsync, 'runPromise', (task, state) => {
        runTask(task, state);
        return Promise.resolve();
      });
      sandbox.stub(vsync, 'run', runTask);
      toggleExperiment(iframe.win, 'amp-app-banner', true);
      return iframe;
    });
  }

  function getAppBanner(config = {}) {
    return getTestFrame().then(iframe => {
      const link = iframe.doc.createElement('link');
      link.setAttribute('rel', 'canonical');
      link.setAttribute('href', 'https://example.com/amps.html');
      iframe.doc.head.appendChild(link);

      if (config.meta) {
        const meta = iframe.doc.createElement('meta');
        meta.setAttribute('name', 'apple-itunes-app');
        meta.setAttribute('content', config.meta.content);
        iframe.doc.head.appendChild(meta);
      }

      if (config.manifest) {
        const manifest = iframe.doc.createElement('link');
        manifest.setAttribute('rel', 'amp-manifest');
        manifest.setAttribute('href', config.manifest.href);
        iframe.doc.head.appendChild(manifest);
        sandbox.mock(xhrFor(iframe.win)).expects('fetchJson')
            .returns(Promise.resolve(config.manifest.content));
      }

      const banner = iframe.doc.createElement('amp-app-banner');
      banner.setAttribute('layout', 'nodisplay');
      if (!config.noOpenLink) {
        const openLink = iframe.doc.createElement('a');
        openLink.setAttribute('open-link', '');
        banner.appendChild(openLink);
      }

      return iframe.addElement(banner);
    });
  }

  function testLinkMissing() {
    return getAppBanner({
      meta,
      manifest,
      noOpenLink: true,
    }).should.eventually.be.rejectedWith(/<a open-link> is required/);
  }

  function testAddDismissButton() {
    sandbox.stub(AbstractAppBanner.prototype, 'isDismissed', () => {
      return Promise.resolve(false);
    });
    sandbox.spy(AbstractAppBanner.prototype, 'addDismissButton_');
    sandbox.spy(AbstractAppBanner.prototype, 'updateViewportPadding_');
    return getAppBanner({meta, manifest}).then(banner => {
      expect(banner.parentElement).to.not.be.null;
      expect(AbstractAppBanner.prototype.addDismissButton_.called).to.be.true;
      expect(AbstractAppBanner.prototype.updateViewportPadding_.called)
          .to.be.true;
      expect(banner.style.display).to.be.equal('');
      expect(banner.style.visibility).to.be.equal('');
    });
  }

  function testRemoveIfDismissed() {
    sandbox.stub(AbstractAppBanner.prototype, 'isDismissed', () => {
      return Promise.resolve(true);
    });
    return getAppBanner().then(banner => {
      expect(banner.parentElement).to.be.null;
      expect(banner.style.display).to.be.equal('');
      expect(banner.style.visibility).to.be.equal('hidden');
    });
  }

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    platform = platformFor(window);
    sandbox.stub(platform, 'isIos', () => isIos);
    sandbox.stub(platform, 'isAndroid', () => isAndroid);
    sandbox.stub(platform, 'isChrome', () => isChrome);
    sandbox.stub(platform, 'isSafari', () => isSafari);
    isAndroid = false;
    isIos = false;
    isChrome = false;
    isSafari = false;
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('Choosing platform', () => {
    it('should upgrade to AmpIosAppBanner on iOS', () => {
      isIos = true;
      return getTestFrame().then(() => {
        const banner = new AmpAppBanner(document.createElement('div'));
        const newInstance = banner.upgradeCallback();
        expect(newInstance instanceof AmpIosAppBanner).to.be.true;
      });
    });

    it('should upgrade to AmpAndroidAppBanner on Android', () => {
      isAndroid = true;
      return getTestFrame().then(() => {
        const banner = new AmpAppBanner(document.createElement('div'));
        const newInstance = banner.upgradeCallback();
        expect(newInstance instanceof AmpAndroidAppBanner).to.be.true;
      });
    });

    it('should not upgrade if platform not supported', () => {
      return getTestFrame().then(() => {
        const banner = new AmpAppBanner(document.createElement('div'));
        expect(banner.upgradeCallback()).to.be.null;
      });
    });
  });

  describe('non-supported platform', () => {
    it('should remove the banner', () => {
      return getAppBanner().then(banner => {
        expect(banner.parentElement).to.be.null;
      });
    });
  });

  describe('iOS', () => {
    beforeEach(() => {
      isIos = true;
    });

    it('should preconnect to app store', () => {
      return getAppBanner().then(banner => {
        const impl = banner.implementation_;
        sandbox.stub(impl.preconnect, 'url');
        impl.preconnectCallback(true);
        expect(impl.preconnect.url.called).to.be.true;
        expect(impl.preconnect.url.callCount).to.equal(1);
        expect(impl.preconnect.url.calledWith('https://itunes.apple.com'))
            .to.be.true;
      });
    });

    it('should throw if open link is missing', testLinkMissing);

    it('should remove banner if meta is not provided', () => {
      return getAppBanner({meta: null}).then(banner => {
        expect(banner.parentElement).to.be.null;
      });
    });

    it('should remove banner if safari', () => {
      isSafari = true;
      return getAppBanner().then(banner => {
        expect(banner.parentElement).to.be.null;
      });
    });

    it('should add dismiss button and update padding', testAddDismissButton);

    it('should remove banner if already dismissed', testRemoveIfDismissed);

    it('should parse meta content and setup hrefs', () => {
      sandbox.spy(AbstractAppBanner.prototype, 'setupOpenLink_');
      return getAppBanner({meta}).then(el => {
        expect(AbstractAppBanner.prototype.setupOpenLink_.calledWith(
            el.querySelector('a[open-link]'),
            'medium://p/cb7f223fad86',
            'https://itunes.apple.com/us/app/id828256236'
        )).to.be.true;
      });
    });
  });

  describe('Android', () => {
    beforeEach(() => {
      isAndroid = true;
      isChrome = false;
    });

    it('should preconnect to play store and preload manifest', () => {
      return getAppBanner({manifest}).then(banner => {
        const impl = banner.implementation_;
        sandbox.stub(impl.preconnect, 'url');
        sandbox.stub(impl.preconnect, 'preload');
        impl.preconnectCallback(true);
        expect(impl.preconnect.url.called).to.be.true;
        expect(impl.preconnect.url.callCount).to.equal(1);
        expect(impl.preconnect.url.calledWith('https://play.google.com'))
            .to.be.true;
        expect(impl.preconnect.preload.called).to.be.true;
        expect(impl.preconnect.preload.callCount).to.equal(1);
        expect(impl.preconnect.preload.calledWith(
            'https://example.com/manifest.json')).to.be.true;
      });
    });

    it('should throw if open link is missing', testLinkMissing);
    it('should add dismiss button and update padding', testAddDismissButton);
    it('should remove banner if already dismissed', testRemoveIfDismissed);

    it('should remove banner if manifest is not provided', () => {
      return getAppBanner({manifest: null}).then(banner => {
        expect(banner.parentElement).to.be.null;
      });
    });

    it('should remove banner if chrome', () => {
      isChrome = true;
      return getAppBanner().then(banner => {
        expect(banner.parentElement).to.be.null;
      });
    });

    it('should parse manifest and set hrefs', () => {
      sandbox.spy(AbstractAppBanner.prototype, 'setupOpenLink_');
      return getAppBanner({manifest}).then(el => {
        expect(AbstractAppBanner.prototype.setupOpenLink_.calledWith(
            el.querySelector('a[open-link]'),
            'android-app://com.medium.reader/https/example.com/amps.html',
            'https://play.google.com/store/apps/details?id=com.medium.reader'
        )).to.be.true;
      });
    });
  });

  describe('Abstract App Banner', () => {
    it('should setup click listener', () => {
      return createIframePromise(true).then(iframe => {
        const win = iframe.win;
        const doc = iframe.doc;
        const element = doc.createElement('div');
        doc.body.appendChild(element);
        const openLink = doc.createElement('a');
        element.appendChild(openLink);
        openLink.setAttribute('open-link', '');
        openLink.addEventListener = sandbox.spy();
        const banner = new AbstractAppBanner(element);
        banner.setupOpenLink_(openLink, 'open-link', 'install-link');
        expect(openLink.addEventListener.calledWith('click')).to.be.true;
        win.open = sandbox.spy();
        sandbox.stub(banner, 'redirectTopLocation_', () => {});
        banner.openLinkClicked_('open-link', 'install-link');
        expect(win.open.calledWith('open-link', '_top')).to.be.true;
        return timerFor(iframe.win).delay(() => {
          expect(banner.redirectTopLocation_.called)
              .to.be.true;
          expect(banner.redirectTopLocation_.calledWith('install-link'))
              .to.be.true;
        }, 2000);
      });
    });

    it('should create dismiss button and setup click listener', () => {
      return createIframePromise(true).then(iframe => {
        const win = iframe.win;
        const doc = iframe.doc;
        installStorageService(win);
        vsync = vsyncFor(win);
        sandbox.stub(vsync, 'run', runTask);
        const element = doc.createElement('div');
        element.id = 'banner1';
        doc.body.appendChild(element);
        const banner = new AbstractAppBanner(element);
        banner.addDismissButton_();
        const dismissBtn = element.querySelector(
            '.amp-app-banner-dismiss-button');
        expect(dismissBtn).to.not.be.null;
        expect(dismissBtn.parentElement).to.be.equal(element);
        dismissBtn.dispatchEvent(new Event('click'));
        expect(element.parentElement).to.be.null;
        return banner.isDismissed().then(value => {
          expect(value).to.be.true;
        });
      });
    });
  });
});
