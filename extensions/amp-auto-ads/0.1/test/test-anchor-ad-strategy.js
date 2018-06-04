/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

import '../../../amp-ad/0.1/amp-ad';
import {AnchorAdStrategy} from '../anchor-ad-strategy';
import {Services} from '../../../../src/services';
import {waitForChild} from '../../../../src/dom';


describes.realWin('anchor-ad-strategy', {
  amp: {
    runtimeOn: true,
    ampdoc: 'single',
    extensions: ['amp-ad'],
  },
}, env => {
  let configObj;
  let attributes;

  beforeEach(() => {
    const viewportMock =
        sandbox.mock(Services.viewportForDoc(env.win.document));
    viewportMock.expects('getWidth').returns(360).atLeast(1);

    configObj = {
      optInStatus: [1],
    };

    attributes = {
      'data-ad-client': 'ca-pub-test',
      'type': 'adsense',
    };
  });

  describe('run', () => {
    it('should insert sticky ad if opted in', () => {
      configObj['optInStatus'].push(2);

      const anchorAdStrategy = new AnchorAdStrategy(
          env.ampdoc, attributes, configObj);

      const strategyPromise = anchorAdStrategy.run().then(placed => {
        expect(placed).to.equal(true);
      });

      const expectPromise = new Promise(resolve => {
        waitForChild(env.win.document.body, parent => {
          return parent.firstChild.tagName == 'AMP-STICKY-AD';
        }, () => {
          const stickyAd = env.win.document.body.firstChild;
          expect(stickyAd.getAttribute('layout')).to.equal('nodisplay');
          const ampAd = stickyAd.firstChild;
          expect(ampAd.getAttribute('type')).to.equal('adsense');
          expect(ampAd.getAttribute('width')).to.equal('360');
          expect(ampAd.getAttribute('height')).to.equal('100');
          expect(ampAd.getAttribute('data-ad-client')).to.equal('ca-pub-test');
          resolve();
        });
      });

      return Promise.all([strategyPromise, expectPromise]);
    });

    it('should not insert sticky ad if not opted in', () => {
      const anchorAdStrategy = new AnchorAdStrategy(
          env.ampdoc, attributes, configObj);

      const strategyPromise = anchorAdStrategy.run().then(placed => {
        expect(placed).to.equal(false);
      });

      const expectPromise = new Promise(resolve => {
        setTimeout(() => {
          expect(env.win.document.getElementsByTagName('AMP-STICKY-AD'))
              .to.have.lengthOf(0);
          resolve();
        }, 500);
      });

      return Promise.all([strategyPromise, expectPromise]);
    });

    it('should not insert sticky ad if exists one', () => {
      configObj['optInStatus'].push(2);

      const existingStickyAd = env.win.document.createElement('amp-sticky-ad');
      env.win.document.body.appendChild(existingStickyAd);

      const anchorAdStrategy = new AnchorAdStrategy(
          env.ampdoc, attributes, configObj);

      const strategyPromise = anchorAdStrategy.run().then(placed => {
        expect(placed).to.equal(false);
      });

      const expectPromise = new Promise(resolve => {
        setTimeout(() => {
          expect(env.win.document.getElementsByTagName('AMP-STICKY-AD'))
              .to.have.lengthOf(1);
          resolve();
        }, 500);
      });

      return Promise.all([strategyPromise, expectPromise]);
    });
  });
});
