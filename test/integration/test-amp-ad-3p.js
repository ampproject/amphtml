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
  createFixtureIframe,
  poll,
} from '../../testing/iframe';
import {Services} from '../../src/services';
import {installPlatformService} from '../../src/service/platform-impl';
import {
  toggleExperiment,
  resetExperimentTogglesForTesting,
} from '../../src/experiments';

// TODO(@alanorozco): Inline this once 3p-use-ampcontext experiment is removed
function createIframeWithApis(fixture) {
  this.timeout(20000);
  let iframe;
  let lastIO = null;
  const platform = Services.platformFor(fixture.win);
  // test amp-ad will create an iframe
  return poll('frame to be in DOM', () => {
    return fixture.doc.querySelector('amp-ad > iframe');
  }).then(iframeElement => {
    // test the created iframe will have correct src.
    iframe = iframeElement;
    return new Promise(resolve => {
      if (iframe.contentWindow.context) {
        resolve(iframe.contentWindow.context);
      }
      iframe.onload = () => {
        expect(iframe.contentWindow.document.getElementById('c')).to.be.defined;
        resolve(iframe.contentWindow.context);
      };
    });
  }).then(context => {
    // test iframe is created with correct context info.
    expect(context.hidden).to.be.false;
    // In some browsers the referrer is empty. But in Chrome it works, so
    // we always check there.
    if (context.referrer !== '' || platform.isChrome()) {
      expect(context.referrer).to.contain(
          'http://localhost:' + location.port);
    }

    expect(context.canonicalUrl).to.equal(
        'https://www.example.com/doubleclick.html');
    expect(context.clientId).to.be.defined;
    expect(context.data).to.deep.equal({
      width: 300,
      height: 250,
      type: '_ping_',
      ampSlotIndex: '0',
      id: '0',
      url: 'https://example.com/a?b=c&d=e',
      valid: 'true',
      customValue: '123',
      'other_value': 'foo',
    });

    // make sure the context.data is the same instance as the data param passed
    // into the vendor function. see #10628
    expect(context.data).to.equal(
        iframe.contentWindow.networkIntegrationDataParamForTesting);

    expect(context.pageViewId).to.be.greaterThan(0);
    expect(context.startTime).to.be.a('number');
    expect(context.container).to.be.defined;
    expect(context.initialIntersection).to.be.defined;
    // check for rootBounds as native IO doesn't support it with CORS
    expect(context.initialLayoutRect).to.be.defined;
    expect(context.initialLayoutRect.top).to.be.defined;
    expect(context.initialIntersection.rootBounds).to.be.defined;
    expect(context.isMaster).to.be.defined;
    expect(context.computeInMasterFrame).to.be.defined;
    expect(context.location).to.deep.equal({
      hash: '',
      host: 'localhost:9876',
      hostname: 'localhost',
      href: 'http://localhost:9876/context.html',
      origin: 'http://localhost:9876',
      pathname: '/context.html',
      port: '9876',
      protocol: 'http:',
      search: '',
    });
    expect(context.sourceUrl).to.be.a('string');
  }).then(() => {
    // test iframe will send out render-start to amp-ad
    return poll('render-start message received', () => {
      return fixture.messages.filter(message => {
        return message.type == 'render-start';
      }).length;
    });
  }).then(() => {
    // test amp-ad will respond to render-start
    return poll('wait for visibility style to change', () => {
      return iframe.style.visibility == '';
    });
  }).then(() => {
    expect(iframe.offsetHeight).to.equal(250);
    expect(iframe.offsetWidth).to.equal(300);
    expect(iframe.contentWindow.ping.resizeSuccess).to.be.undefined;
    iframe.contentWindow.context.requestResize(200, 50);
    return poll('wait for embed-size to be received', () => {
      return fixture.messages.filter(message => {
        return message.type == 'embed-size';
      }).length;
    });
  }).then(() => {
    return poll('wait for attemptChangeSize', () => {
      return iframe.contentWindow.ping.resizeSuccess != undefined;
    });
  }).then(() => {
    lastIO = null;
    iframe.contentWindow.context.observeIntersection(changes => {
      lastIO = changes[changes.length - 1];
    });
    fixture.win.scrollTo(0, 1000);
    fixture.win.document.body.dispatchEvent(new Event('scroll'));
    return poll('wait for new IO entry', () => {
      return lastIO != null;
    });
  });
}


function createFixture() {
  return createFixtureIframe('test/fixtures/3p-ad.html', 3000, () => {});
}

describe.configure().retryOnSaucelabs().run('amp-ad 3P', () => {
  let fixture;

  beforeEach(() => {
    return createFixture().then(f => {
      fixture = f;
      installPlatformService(fixture.win);
    });
  });

  it('create an iframe with APIs', function() {
    return createIframeWithApis.call(this, fixture);
  });
});

describe.configure().retryOnSaucelabs().run('amp-ad 3P ' +
    '(with AmpContext experiment)', () => {
  let fixture;

  beforeEach(() => {
    toggleExperiment(window, '3p-use-ampcontext', /* opt_on */ true);
    return createFixture().then(f => {
      fixture = f;
      installPlatformService(fixture.win);
    });
  });

  afterEach(() => {
    resetExperimentTogglesForTesting(window);
  });

  it('create an iframe with APIs', function() {
    return createIframeWithApis.call(this, fixture);
  });
});
