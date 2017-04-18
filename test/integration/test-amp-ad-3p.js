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
  pollForLayout,
  poll,
} from '../../testing/iframe';
import {platformFor} from '../../src/services';
import {installPlatformService} from '../../src/service/platform-impl';
import {toggleExperiment} from '../../src/experiments';


// TODO(@alanorozco): Inline this once 3p-use-ampcontext experiment is removed
function createIframeWithApis(fixture) {
  this.timeout(20000);
  let iframe;
  let ampAd;
  let lastIO = null;
  const platform = platformFor(fixture.win);
  return pollForLayout(fixture.win, 1, 5500).then(() => {
    // test amp-ad will create an iframe
    return poll('frame to be in DOM', () => {
      return fixture.doc.querySelector('iframe');
    });
  }).then(iframeElement => {
    // test the created iframe will have correct src.
    iframe = iframeElement;
    expect(fixture.doc.querySelectorAll('iframe')).to.have.length(1);
    ampAd = iframe.parentElement;
    expect(iframe.src).to.match(/http\:\/\/localhost:9876\/dist\.3p\//);
  }).then(() => {
    // wait for iframe to load.
    return poll('frame to load', () => {
      return iframe.contentWindow && iframe.contentWindow.document &&
          iframe.contentWindow.document.getElementById('c');
    });
  }).then(() => {
    // wait for iframe to load.
    return poll('3p JS to load.', () => iframe.contentWindow.context);
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
    expect(context.pageViewId).to.be.greaterThan(0);
    expect(context.startTime).to.be.a('number');
    expect(context.container).to.be.defined;
    expect(context.initialIntersection).to.be.defined;
    // check for rootBounds as native IO doesn't support it with CORS
    expect(context.initialIntersection.rootBounds).to.be.defined;
    expect(context.isMaster).to.be.defined;
    expect(context.computeInMasterFrame).to.be.defined;
    expect(context.location).to.be.defined;
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
    return ampAd.layoutCallback();
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


describes.realWin('3P Ad', {
  amp: {
    runtimeOn: true,
  },
}, () => {
  describe.configure().retryOnSaucelabs().run('render an ad should', () => {
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
});


describes.realWin('3P Ad (with AmpContext experiment)', {
  amp: {
    runtimeOn: true,
  },
}, () => {
  describe.configure().retryOnSaucelabs().run('render an ad should', () => {
    let fixture;

    beforeEach(() => {
      return createFixture().then(f => {
        fixture = f;
        toggleExperiment(fixture.win, '3p-use-ampcontext', /* opt_on */ true,
            /* opt_transientExperiment */ true);
        installPlatformService(fixture.win);
      });
    });

    it('create an iframe with APIs', function() {
      return createIframeWithApis.call(this, fixture);
    });
  });
});


