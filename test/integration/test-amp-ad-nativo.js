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

describe('Rendering of nativo ad', () => {
  let fixture;

  beforeEach(() => {
    replaceParentHref = false;
    return createFixtureIframe('test/fixtures/nativo.html', 3000).then(f => {
      fixture = f;
    });
  });

  it('should create an iframe loaded', function() {
    this.timeout(50000);
    let iframe;
    const isEdge = navigator.userAgent.match(/Edge/);
    return pollForLayout(fixture.win, 1, 5500).then(() => {
      return poll('frame to be in DOM', () => {
        return fixture.doc.querySelector('iframe');
      });
    }).then(iframeElement => {
      iframe = iframeElement;
      expect(fixture.doc.querySelectorAll('iframe')).to.have.length(1);
      ampAd = iframe.parentElement;
      expect(iframe.src).to.match(/http\:\/\/localhost:9876\/base\/dist\.3p\//);
    }).then(() => {
      return poll('frame to load', () => {
        return iframe.contentWindow && iframe.contentWindow.document &&
          iframe.contentWindow.document.getElementById('c');
      });
    }).then(unusedCanvas => {
      return poll('3p JS to load.', () => iframe.contentWindow.context);
    }).then(context => {
      expect(context.hidden).to.be.false;
      // In some browsers the referrer is empty. But in Chrome it works, so
      // we always check there.
      if (context.referrer !== '' ||
        (navigator.userAgent.match(/Chrome/) && !isEdge)) {
        expect(context.referrer).to.contain('http://localhost:' + location.port);
      }
      expect(context.pageViewId).to.be.greaterThan(0);
      expect(context.initialIntersection).to.be.defined;
      expect(context.initialIntersection.rootBounds).to.be.defined;
    }).then(() => {
      expect(iframe.contentWindow.context.hidden).to.be.false;
    }).then(() => {
      expect(iframe.getAttribute('width')).to.equal('350');
      expect(iframe.getAttribute('height')).to.equal('150');
    });
  });
});
