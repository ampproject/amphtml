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

describes.realWin('3P Ad', {
  amp: {
    runtimeOn: false,
  },
}, () => {
  describe.configure().retryOnSaucelabs().run('Rendering of one ad', () => {
    let fixture;

    beforeEach(() => {
      return createFixtureIframe('test/fixtures/3p-ad.html', 3000, () => {
      }).then(f => {
        fixture = f;
      });
    });

    // TODO(#3561): unmute the test.
    //it.configure().skipEdge().run('should create an iframe loaded', function() {
    it('should create an iframe with APIs to render ad', function() {
      this.timeout(20000);
      let iframe;
      let ampAd;
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
        if (context.referrer !== '' ||
            (navigator.userAgent.match(/Chrome/))) {
          expect(context.referrer).to.contain('http://localhost:' + location.port);
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
        expect(iframe.style.visibility).to.equal('');
        return ampAd.layoutCallback();
      }).then(() => {
        expect(iframe.contentWindow.ping.lastIO.intersectionRatio).to.equal(1);
        expect(iframe.contentWindow.ping.lastIO.rootBounds).to.not.be.null;
        fixture.win.scrollTo(0, 5000);
        return poll('wait for new IO entry with ratio equal 0', () => {
          return iframe.contentWindow.ping.lastIO.intersectionRatio == 0;
        });
      }).then(() => {
        // Test reszie API when ad is NOT in viewport.
        expect(iframe.offsetHeight).to.equal(250);
        expect(iframe.offsetWidth).to.equal(300);
        iframe.contentWindow.ping.resetResizeResult();
        iframe.contentWindow.context.requestResize(200, 50);
        return poll('wait for attemptChangeSize', () => {
          return iframe.contentWindow.ping.resizeSuccess == true;
        });
      }).then(() => {
        fixture.win.scrollTo(0, -5000);
        // iframe size is changed after resize success.
        expect(iframe.offsetHeight).to.equal(50);
        expect(iframe.offsetWidth).to.equal(200);
      });
    });
  });
});


