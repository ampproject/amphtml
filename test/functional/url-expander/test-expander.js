/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

import {Expander} from '../../../src/service/url-expander/expander';
import {GlobalVariableSource} from '../../../src/service/url-replacements-impl';
import {Services} from '../../../src/services';
import {WindowInterface} from '../../../src/window-interface';
import {parseUrl} from '../../../src/url';
import {setCookie} from '../../../src/cookies';
import * as trackPromise from '../../../src/impression';

describes.realWin('Expander', {
  amp: {
    ampdoc: 'single',
  },
}, env => {

  let expander;
  let variableSource;
  let win;

  beforeEach(() => {
    win = env.win;
    variableSource = new GlobalVariableSource(env.ampdoc);
    expander = new Expander(variableSource);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('#eliminateOverlaps', () => {
    const url = 'http://www.google.com/?client=CLIENT_ID(__ga)&canon=CANONICAL_URL&random=RANDOM';

    it('should handle empty', () => {
      const array = [];
      const expected = null;
      expect(expander.eliminateOverlaps_(array, url)).to.deep.equal(expected);
    });

    it('should return single item', () => {
      const array = [
        {start: 58, stop: 64, length: 6, name: 'RANDOM'},
      ];
      const expected = [
        {start: 58, stop: 64, length: 6, name: 'RANDOM'},
      ];
      expect(expander.eliminateOverlaps_(array, url)).to.deep.equal(expected);
    });

    it('should sort basic case', () => {
      const array = [
        {start: 58, stop: 64, length: 6, name: 'RANDOM'},
        {start: 37, stop: 50, length: 13, name: 'CANONICAL_URL'},
      ];
      const expected = [
        {start: 37, stop: 50, length: 13, name: 'CANONICAL_URL'},
        {start: 58, stop: 64, length: 6, name: 'RANDOM'},
      ];
      expect(expander.eliminateOverlaps_(array, url)).to.deep.equal(expected);
    });

    it('should sort overlapping case', () => {
      const array = [
        {start: 58, stop: 64, length: 6, name: 'RANDOM'},
        {start: 37, stop: 50, length: 13, name: 'CANONICAL_URL'},
        {start: 45, stop: 70, length: 15, name: '123456789012345'},
      ];
      const expected = [
        {start: 45, stop: 70, length: 15, name: '123456789012345'},
      ];
      expect(expander.eliminateOverlaps_(array, url)).to.deep.equal(expected);
    });

    it('should handle same start', () => {
      const array = [
        {start: 58, stop: 90, length: 13, name: 'CANONICAL_URL'},
        {start: 58, stop: 64, length: 6, name: 'RANDOM'},
      ];
      const expected = [
        {start: 58, stop: 90, length: 13, name: 'CANONICAL_URL'},
      ];
      expect(expander.eliminateOverlaps_(array, url)).to.deep.equal(expected);
    });

    it('should handle keywords next to each other', () => {
      const array = [
        {start: 58, stop: 64, length: 13, name: 'CANONICAL_URL'},
        {start: 65, stop: 71, length: 6, name: 'RANDOM'},
      ];
      const expected = [
        {start: 58, stop: 64, length: 13, name: 'CANONICAL_URL'},
        {start: 65, stop: 71, length: 6, name: 'RANDOM'},
      ];
      expect(expander.eliminateOverlaps_(array, url)).to.deep.equal(expected);
    });
  });

  describe('#expand', () => {
    function mockClientIdFn(str) {
      if (str === '__ga') {
        return Promise.resolve('amp-GA12345');
      }
      return Promise.resolve('amp-987654321');
    }

    // making sure to include resolutions of different types
    const mockBindings = {
      CLIENT_ID: mockClientIdFn, // fn resolving to promise
      CANONICAL_URL: 'www.google.com', // string
      RANDOM: () => 123456, // number
      TRIM: str => str.trim(), // fn
      UPPERCASE: str => str.toUpperCase(),
      LOWERCASE: str => str.toLowerCase(),
      CONCAT: (a, b) => a + b,
      CAT_THREE: (a, b, c) => a + b + c,
    };

    it('should handle empty urls', () =>
      expect(expander.expand('', mockBindings)).to.eventually.equal('')
    );

    it('parses one function, one argument', () =>
      expect(expander.expand('TRIM(aaaaa    )', mockBindings))
          .to.eventually.equal('aaaaa')
    );

    it('parses nested function one level', () =>
      expect(expander.expand('UPPERCASE(TRIM(aaaaa    ))', mockBindings))
          .to.eventually.equal('AAAAA')
    );

    it('parses nested function two levels', () =>
      expect(
          expander.expand('LOWERCASE(UPPERCASE(TRIM(aAaA    )))', mockBindings))
          .to.eventually.equal('aaaa')
    );

    it('parses one function, two string arguments', () =>
      expect(expander.expand('CONCAT(aaa,bbb)', mockBindings))
          .to.eventually.equal('aaabbb')
    );

    it('parses one function, two string arguments with space', () =>
      expect(expander.expand('CONCAT(aaa , bbb)', mockBindings))
          .to.eventually.equal('aaabbb')
    );

    it('parses function with func then string as args', () =>
      expect(expander.expand('CONCAT(UPPERCASE(aaa),bbb)', mockBindings))
          .to.eventually.equal('AAAbbb')
    );

    it('parses function with macro then string as args', () =>
      expect(expander.expand('CONCAT(CANONICAL_URL,bbb)', mockBindings))
          .to.eventually.equal('www.google.combbb')
    );

    it('parses function with string then func as args', () =>
      expect(expander.expand('CONCAT(aaa,UPPERCASE(bbb))', mockBindings))
          .to.eventually.equal('aaaBBB')
    );

    it('parses function with two funcs as args', () => {
      const url = 'CONCAT(LOWERCASE(AAA),UPPERCASE(bbb)';
      return expect(expander.expand(url, mockBindings))
          .to.eventually.equal('aaaBBB');
    });

    it('parses function with three funcs as args', () => {
      const url = 'CAT_THREE(LOWERCASE(AAA),UPPERCASE(bbb),LOWERCASE(CCC))';
      return expect(expander.expand(url, mockBindings))
          .to.eventually.equal('aaaBBBccc');
    });

    it('should handle real urls', () => {
      const url = 'http://www.amp.google.com/?client=CLIENT_ID(__ga)&canon=CANONICAL_URL&random=RANDOM';
      const expected = 'http://www.amp.google.com/?client=amp-GA12345&canon=www.google.com&random=123456';
      return expect(expander.expand(url, mockBindings))
          .to.eventually.equal(expected);
    });

    it('should treat unrecognized keywords as normal strings', () => {
      return expect(expander.expand('TRIM(FAKE(aaaaa))', mockBindings))
          .to.eventually.equal('');
    });
  });

  describe('#expand url-replacements tests', () => {
    describe('canonicalUrl tests', () => {
      beforeEach(() => {
        const documentInfoStub = sandbox.stub(Services, 'documentInfoForDoc');
        const mockDocumentInfo = {
          canonicalUrl: 'https://pinterest.com:8080/pin1',
          pageViewId: '8359',
          sourceUrl: 'about:srcdoc',
        };
        documentInfoStub.returns(mockDocumentInfo);
      });

      it('should replace RANDOM', () => {
        return expander.expand('ord=RANDOM?').then(res => {
          expect(res).to.match(/ord=(\d+(\.\d+)?)\?$/);
        });
      });

      it('should replace COUNTER', () => {
        return expander.expand(
            'COUNTER(foo),COUNTER(bar),COUNTER(foo),COUNTER(bar),COUNTER(bar)')
            .then(res => {
              expect(res).to.equal('1,1,2,2,3');
            });
      });

      it('should replace CANONICAL_URL', () => {
        return expander.expand('?href=CANONICAL_URL').then(res => {
          expect(res).to
              .equal('?href=https%3A%2F%2Fpinterest.com%3A8080%2Fpin1');
        });
      });

      it('should replace CANONICAL_HOST', () => {
        return expander.expand('?host=CANONICAL_HOST').then(res => {
          expect(res).to.equal('?host=pinterest.com%3A8080');
        });
      });

      it('should replace CANONICAL_HOSTNAME', () => {
        return expander.expand('?host=CANONICAL_HOSTNAME').then(res => {
          expect(res).to.equal('?host=pinterest.com');
        });
      });

      it('should replace CANONICAL_PATH', () => {
        return expander.expand('?path=CANONICAL_PATH').then(res => {
          expect(res).to.equal('?path=%2Fpin1');
        });
      });

      it('should accept $expressions', () => {
        return expander.expand('?href=$CANONICAL_URL').then(res => {
          expect(res).to
              .equal('?href=https%3A%2F%2Fpinterest.com%3A8080%2Fpin1');
        });
      });
    });

    describe('referrer tests', () => {
      let viewer;

      beforeEach(() => {
        viewer = win.services.viewer.obj;
      });

      it('should replace DOCUMENT_REFERRER', () => {
        return expander.expand('?ref=DOCUMENT_REFERRER').then(res => {
          expect(res).to
              .equal('?ref=http%3A%2F%2Flocalhost%3A9876%2Fcontext.html');
        });
      });

      it('should replace EXTERNAL_REFERRER', () => {
        sandbox.stub(WindowInterface, 'getHostname').returns('different.com');
        sandbox.stub(viewer, 'getReferrerUrl').callsFake(() =>
          Promise.resolve('http://example.org/page.html'));
        const res = expander.expand('?ref=EXTERNAL_REFERRER');
        return expect(res).to.eventually
            .equal('?ref=http%3A%2F%2Fexample.org%2Fpage.html');
      });

      it('should replace EXTERNAL_REFERRER to empty string ' +
          'if referrer is of same domain', () => {
        sandbox.stub(WindowInterface, 'getHostname').returns('example.org');
        sandbox.stub(viewer, 'getReferrerUrl').callsFake(() =>
          Promise.resolve('http://example.org/page.html'));
        const res = expander.expand('?ref=EXTERNAL_REFERRER');
        return expect(res).to.eventually.equal('?ref=');
      });

      it('should replace EXTERNAL_REFERRER to empty string ' +
          'if referrer is CDN proxy of same domain', () => {
        sandbox.stub(WindowInterface, 'getHostname').returns('example.org');
        sandbox.stub(viewer, 'getReferrerUrl').callsFake(() =>
          Promise.resolve(
              'https://example-org.cdn.ampproject.org/v/example.org/page.html'
          ));
        const res = expander.expand('?ref=EXTERNAL_REFERRER');
        return expect(res).to.eventually.equal('?ref=');
      });

      it('should replace EXTERNAL_REFERRER to empty string ' +
          'if referrer is CDN proxy of same domain (before CURLS)', () => {
        sandbox.stub(WindowInterface, 'getHostname').returns('example.org');
        sandbox.stub(viewer, 'getReferrerUrl').callsFake(() =>
          Promise.resolve('https://cdn.ampproject.org/v/example.org/page.html'));
        const res = expander.expand('?ref=EXTERNAL_REFERRER');
        return expect(res).to.eventually.equal('?ref=');
      });
    });

    it('should replace TITLE', () => {
      win.document.title = 'Pixel Test';
      return expander.expand('?title=TITLE').then(res => {
        expect(res).to.equal('?title=Pixel%20Test');
      });
    });

    it('should replace AMPDOC_URL', () => {
      return expander.expand('?ref=AMPDOC_URL').then(res => {
        expect(res).to.not.match(/AMPDOC_URL/);
      });
    });

    it('should replace AMPDOC_HOST', () => {
      return expander.expand('?ref=AMPDOC_HOST').then(res => {
        expect(res).to.not.match(/AMPDOC_HOST/);
      });
    });

    it('should replace AMPDOC_HOSTNAME', () => {
      return expander.expand('?ref=AMPDOC_HOSTNAME').then(res => {
        expect(res).to.not.match(/AMPDOC_HOSTNAME/);
      });
    });

    it('should replace SOURCE_URL and _HOST', () => {
      sandbox.stub(trackPromise, 'getTrackImpressionPromise').callsFake(() => {
        return Promise.resolve();
      });
      return expander.expand('?url=SOURCE_URL&host=SOURCE_HOST').then(res => {
        expect(res).to.not.match(/SOURCE_URL/);
        expect(res).to.not.match(/SOURCE_HOST/);
      });
    });

    it('should replace SOURCE_URL and _HOSTNAME', () => {
      sandbox.stub(trackPromise, 'getTrackImpressionPromise').callsFake(() => {
        return Promise.resolve();
      });
      return expander.expand('?url=SOURCE_URL&host=SOURCE_HOSTNAME')
          .then(res => {
            expect(res).to.not.match(/SOURCE_URL/);
            expect(res).to.not.match(/SOURCE_HOSTNAME/);
          });
    });

    it('should update SOURCE_URL after track impression', () => {
      win.location = parseUrl('https://wrong.com');
      const documentInfoStub = sandbox.stub(Services, 'documentInfoForDoc');
      documentInfoStub.returns({sourceUrl: 'wrong.com'});
      sandbox.stub(trackPromise, 'getTrackImpressionPromise').callsFake(() => {
        return new Promise(resolve => {
          documentInfoStub.returns({sourceUrl: 'https://example.com?gclid=123456'});
          resolve();
        });
      });
      return expander.expand('?url=SOURCE_URL')
          .then(res => {
            expect(res).to.contain('example.com');
          });
    });

    it('should replace SOURCE_PATH', () => {
      return expander.expand('?path=SOURCE_PATH').then(res => {
        expect(res).to.not.match(/SOURCE_PATH/);
      });
    });

    it('should replace PAGE_VIEW_ID', () => {
      return expander.expand('?pid=PAGE_VIEW_ID').then(res => {
        expect(res).to.match(/pid=\d+/);
      });
    });

    it('should replace CLIENT_ID', () => {
      setCookie(window, 'url-abc', 'cid-for-abc');
      // Make sure cookie does not exist
      setCookie(window, 'url-xyz', '');
      const res = expander.expand('?a=CLIENT_ID(url-abc)&b=CLIENT_ID(url-xyz)');
      return expect(res).to.eventually
          .match(/^\?a=cid-for-abc\&b=amp-([a-zA-Z0-9_-]+){10,}/);
    });

    it('should allow empty CLIENT_ID', () => {
      sandbox.stub(Services, 'cidForDoc')
          .returns(Promise.resolve());
      const res = expander.expand('?a=CLIENT_ID(_ga)');
      return expect(res).to.eventually.equal('?a=');
    });

    it('should replace CLIENT_ID with opt_cookieName', () => {
      setCookie(window, 'url-abc', 'cid-for-abc');
      // Make sure cookie does not exist
      setCookie(window, 'url-xyz', '');
      const res = expander
          .expand('?a=CLIENT_ID(abc,,url-abc)&b=CLIENT_ID(xyz,,url-xyz)');
      return expect(res).to.eventually
          .match(/^\?a=cid-for-abc\&b=amp-([a-zA-Z0-9_-]+){10,}/);
    });

    it('should parse _ga cookie correctly', () => {
      setCookie(window, '_ga', 'GA1.2.12345.54321');
      const res = expander
          .expand('?a=CLIENT_ID(AMP_ECID_GOOGLE,,_ga)&b=CLIENT_ID(_ga)');
      return expect(res).to.eventually.match(/^\?a=12345.54321&b=12345.54321/);
    });

    it('should replace VARIANT', () => {
      sandbox.stub(Services, 'variantForOrNull')
          .returns(Promise.resolve({
            x1: 'v1',
            x2: 'none',
          }));
      const url = '?x1=VARIANT(x1)&x2=VARIANT(x2)&x3=VARIANT(x3)';
      return expect(expander.expand(url))
          .to.eventually.equal('?x1=v1&x2=none&x3=');
    });

    it('should replace VARIANT with empty string if ' +
        'amp-experiment is not configured ', () => {
      const url = '?x1=VARIANT(x1)&x2=VARIANT(x2)&x3=VARIANT(x3)';
      return expect(expander.expand(url))
          .to.eventually.equal('?x1=&x2=&x3=');
    });

    it('should replace VARIANTS', () => {
      sandbox.stub(Services, 'variantForOrNull')
          .returns(Promise.resolve({
            x1: 'v1',
            x2: 'none',
          }));
      return expect(expander.expand('?VARIANTS')).to
          .eventually.equal('?x1.v1!x2.none');
    });

    it('should replace VARIANTS with empty string if ' +
        'amp-experiment is not configured ', () => {
      return expect(expander.expand('?VARIANTS')).to.eventually.equal('?');
    });

    it('should replace SHARE_TRACKING_INCOMING and' +
        ' SHARE_TRACKING_OUTGOING', () => {
      const fragments = Promise.resolve({
        incomingFragment: '12345',
        outgoingFragment: '54321',
      });
      sandbox.stub(Services, 'shareTrackingForOrNull')
          .returns(fragments);
      const url = '?in=SHARE_TRACKING_INCOMING&out=SHARE_TRACKING_OUTGOING';
      const res = expander.expand(url);
      return expect(res).to.eventually.equal('?in=12345&out=54321');
    });

    it('should replace SHARE_TRACKING_INCOMING and SHARE_TRACKING_OUTGOING' +
        ' with empty string if amp-share-tracking is not configured', () => {
      const url = '?in=SHARE_TRACKING_INCOMING&out=SHARE_TRACKING_OUTGOING';
      return expect(expander.expand(url))
          .to.eventually.equal('?in=&out=');
    });

    it('should replace STORY_PAGE_INDEX and STORY_PAGE_ID', () => {
      const stories = Promise.resolve({
        pageIndex: 546,
        pageId: 'id-123',
      });
      sandbox.stub(Services, 'storyVariableServiceForOrNull')
          .returns(stories);
      const res = expander.expand('?index=STORY_PAGE_INDEX&id=STORY_PAGE_ID');
      return expect(res).to.eventually.equal('?index=546&id=id-123');
    });

    it('should replace STORY_PAGE_INDEX and STORY_PAGE_ID' +
        ' with empty string if amp-story is not configured', () => {
      return expect(
          expander.expand('?index=STORY_PAGE_INDEX&id=STORY_PAGE_ID'))
          .to.eventually.equal('?index=&id=');
    });

    it('should replace TIMESTAMP', () => {
      return expander.expand('?ts=TIMESTAMP').then(res => {
        expect(res).to.match(/ts=\d+/);
      });
    });

    it('should replace TIMESTAMP_ISO', () => {
      return expander.expand('?tsf=TIMESTAMP_ISO').then(res => {
        expect(res).to.match(/tsf=\d+/);
      });
    });

    it('should return correct ISO timestamp', () => {
      const fakeTime = 1499979336612;
      sandbox.useFakeTimers(fakeTime);
      return expect(expander.expand('?tsf=TIMESTAMP_ISO'))
          .to.eventually.equal('?tsf=2017-07-13T20%3A55%3A36.612Z');
    });

    it('should replace TIMEZONE', () => {
      return expander.expand('?tz=TIMEZONE').then(res => {
        expect(res).to.match(/tz=-?\d+/);
      });
    });

    it('should replace SCROLL_TOP', () => {
      return expander.expand('?scrollTop=SCROLL_TOP').then(res => {
        expect(res).to.match(/scrollTop=\d+/);
      });
    });

    it('should replace SCROLL_LEFT', () => {
      return expander.expand('?scrollLeft=SCROLL_LEFT').then(res => {
        expect(res).to.match(/scrollLeft=\d+/);
      });
    });

    it('should replace SCROLL_HEIGHT', () => {
      return expander.expand('?scrollHeight=SCROLL_HEIGHT').then(res => {
        expect(res).to.match(/scrollHeight=\d+/);
      });
    });

    it('should replace SCREEN_WIDTH', () => {
      return expander.expand('?sw=SCREEN_WIDTH').then(res => {
        expect(res).to.match(/sw=\d+/);
      });
    });

    it('should replace SCREEN_HEIGHT', () => {
      return expander.expand('?sh=SCREEN_HEIGHT').then(res => {
        expect(res).to.match(/sh=\d+/);
      });
    });

    it('should replace VIEWPORT_WIDTH', () => {
      return expander.expand('?vw=VIEWPORT_WIDTH').then(res => {
        expect(res).to.match(/vw=\d+/);
      });
    });

    it('should replace VIEWPORT_HEIGHT', () => {
      return expander.expand('?vh=VIEWPORT_HEIGHT').then(res => {
        expect(res).to.match(/vh=\d+/);
      });
    });

    it('should replace PAGE_LOAD_TIME', () => {
      return expander.expand('?sh=PAGE_LOAD_TIME').then(res => {
        expect(res).to.match(/sh=\d+/);
      });
    });

    it('Should replace BACKGROUND_STATE with 0', () => {
      win.services.viewer = {
        obj: {isVisible: () => true},
      };
      const res = expander.expand('?sh=BACKGROUND_STATE');
      return expect(res).to.eventually.equal('?sh=0');
    });

    it('Should replace BACKGROUND_STATE with 1', () => {
      win.services.viewer = {
        obj: {isVisible: () => false},
      };
      const res = expander.expand('?sh=BACKGROUND_STATE');
      return expect(res).to.eventually.equal('?sh=1');
    });

    it('Should replace VIDEO_STATE(video,parameter) with video data', () => {
      sandbox.stub(Services, 'videoManagerForDoc')
          .returns({
            getVideoAnalyticsDetails(unusedVideo) {
              return Promise.resolve({currentTime: 1.5});
            },
          });
      sandbox.stub(win.document, 'getElementById')
          .withArgs('video')
          .returns(document.createElement('video'));

      const res = expander.expand('?sh=VIDEO_STATE(video,currentTime)');
      return expect(res).to.eventually.equal('?sh=1.5');
    });

    it('should replace NAV_REDIRECT_COUNT', () => {
      return expander.expand('?sh=NAV_REDIRECT_COUNT').then(res => {
        expect(res).to.match(/sh=\d+/);
      });
    });

    // TODO(cvializ, #12336): unskip
    it.skip('should replace NAV_TIMING', () => {
      return expander.expand('?a=NAV_TIMING(navigationStart)' +
          '&b=NAV_TIMING(navigationStart,responseStart)').then(res => {
        expect(res).to.match(/a=\d+&b=\d+/);
      });
    });

    it('should replace NAV_TIMING when attribute names are invalid', () => {
      return expander
          .expand('?a=NAV_TIMING(invalid)&b=NAV_TIMING(invalid,invalid)' +
          '&c=NAV_TIMING(navigationStart,invalid)' +
          '&d=NAV_TIMING(invalid,responseStart)').then(res => {
            expect(res).to.match(/a=&b=&c=&d=/);
          });
    });

    it('should replace NAV_TYPE', () => {
      return expander.expand('?sh=NAV_TYPE').then(res => {
        expect(res).to.match(/sh=\d+/);
      });
    });

    it('should replace DOMAIN_LOOKUP_TIME', () => {
      return expander.expand('?sh=DOMAIN_LOOKUP_TIME').then(res => {
        expect(res).to.match(/sh=\d+/);
      });
    });

    it('should replace TCP_CONNECT_TIME', () => {
      return expander.expand('?sh=TCP_CONNECT_TIME').then(res => {
        expect(res).to.match(/sh=\d+/);
      });
    });

    it('should replace SERVER_RESPONSE_TIME', () => {
      return expander.expand('?sh=SERVER_RESPONSE_TIME').then(res => {
        expect(res).to.match(/sh=\d+/);
      });
    });

    it('should replace PAGE_DOWNLOAD_TIME', () => {
      return expander.expand('?sh=PAGE_DOWNLOAD_TIME').then(res => {
        expect(res).to.match(/sh=\d+/);
      });
    });

    // TODO(cvializ, #12336): unskip
    it.skip('should replace REDIRECT_TIME', () => {
      return expander.expand('?sh=REDIRECT_TIME').then(res => {
        expect(res).to.match(/sh=\d+/);
      });
    });

    it('should replace DOM_INTERACTIVE_TIME', () => {
      return expander.expand('?sh=DOM_INTERACTIVE_TIME').then(res => {
        expect(res).to.match(/sh=\d+/);
      });
    });

    it('should replace CONTENT_LOAD_TIME', () => {
      return expander.expand('?sh=CONTENT_LOAD_TIME').then(res => {
        expect(res).to.match(/sh=\d+/);
      });
    });

    it('should replace AVAILABLE_SCREEN_HEIGHT', () => {
      return expander.expand('?sh=AVAILABLE_SCREEN_HEIGHT').then(res => {
        expect(res).to.match(/sh=\d+/);
      });
    });

    it('should replace AVAILABLE_SCREEN_WIDTH', () => {
      return expander.expand('?sh=AVAILABLE_SCREEN_WIDTH').then(res => {
        expect(res).to.match(/sh=\d+/);
      });
    });

    it('should replace SCREEN_COLOR_DEPTH', () => {
      return expander.expand('?sh=SCREEN_COLOR_DEPTH').then(res => {
        expect(res).to.match(/sh=\d+/);
      });
    });

    it('should replace BROWSER_LANGUAGE', () => {
      return expander.expand('?sh=BROWSER_LANGUAGE').then(res => {
        expect(res).to.match(/sh=\w+/);
      });
    });

    it('should replace USER_AGENT', () => {
      return expander.expand('?sh=USER_AGENT').then(res => {
        expect(res).to.match(/sh=\w+/);
      });
    });

    describe('VIEWER', () => {
      let viewer;

      beforeEach(() => {
        viewer = win.services.viewer.obj;
      });

      it('should replace VIEWER with origin', () => {
        sandbox.stub(viewer, 'getViewerOrigin').returns(
            Promise.resolve('https://www.google.com'));
        const res = expander.expand('?sh=VIEWER');
        return expect(res).to.eventually
            .equal('?sh=https%3A%2F%2Fwww.google.com');
      });

      it('should replace VIEWER with empty string', () => {
        sandbox.stub(viewer, 'getViewerOrigin').returns(
            Promise.resolve(''));
        const res = expander.expand('?sh=VIEWER');
        return expect(res).to.eventually.equal('?sh=');
      });
    });

    it('should replace TOTAL_ENGAGED_TIME', () => {
      const fakeActivity = Promise.resolve({
        getTotalEngagedTime: () => 1234,
      });
      sandbox.stub(Services, 'activityForDoc')
          .returns(fakeActivity);
      const res = expander.expand('?sh=TOTAL_ENGAGED_TIME');
      return expect(res).to.eventually.match(/sh=\d+/);
    });

    it('should replace AMP_VERSION', () => {
      return expander.expand('?sh=AMP_VERSION').then(res => {
        expect(res).to.equal('?sh=%24internalRuntimeVersion%24');
      });
    });

    it('should ignore unknown substitutions', () => {
      return expander.expand('?a=UNKNOWN').then(res => {
        expect(res).to.equal('?a=UNKNOWN');
      });
    });

    it('should replace several substitutions', () => {
      const res = expander.expand('?a=UNKNOWN&href=CANONICAL_URL&title=TITLE');
      expect(res).to.eventually.equal('?a=UNKNOWN' +
                '&href=https%3A%2F%2Fpinterest.com%3A8080%2Fpin1' +
                '&title=Pixel%20Test');
    });

    it('should support positional arguments', () => {
      const bindings = {'FN': one => one};
      const res = expander.expand('?a=FN(xyz1)', bindings);
      return expect(res).to.eventually.equal('?a=xyz1');
    });

    it('should support multiple positional arguments', () => {
      const bindings = {
        'FN': (one, two) => one + '-' + two,
      };
      const res = expander.expand('?a=FN(xyz,abc)', bindings);
      return expect(res).to.eventually.equal('?a=xyz-abc');
    });

    it('should support multiple positional arguments with dots', () => {
      const bindings = {
        'FN': (one, two) => one + '-' + two,
      };
      const res = expander.expand('?a=FN(xy.z,ab.c)', bindings);
      return expect(res).to.eventually.equal('?a=xy.z-ab.c');
    });

    it('should support promises as replacements', () => {
      const bindings = {
        'P1': () => Promise.resolve('abc '),
        'P2': () => Promise.resolve('xyz'),
        'P3': () => Promise.resolve('123'),
        'OTHER': () => 'foo',
      };
      const res = expander.expand('?a=P1&b=P2&c=P3&d=OTHER', bindings);
      return expect(res).to.eventually.equal('?a=abc%20&b=xyz&c=123&d=foo');
    });

    it('should override an existing binding', () => {
      const res = expander.expand('ord=RANDOM?', {'RANDOM': 'abc'});
      return expect(res).to.eventually.match(/ord=abc\?$/);
    });

    it('should add an additional binding', () => {
      const res = expander.expand('rid=NONSTANDARD?', {'NONSTANDARD': 'abc'});
      return expect(res).to.eventually.match(/rid=abc\?$/);
    });

    it('should NOT overwrite the cached expression with new bindings', () => {
      return expander.expand('rid=NONSTANDARD?', {'NONSTANDARD': 'abc'})
          .then(res => {
            expect(res).to.match(/rid=abc\?$/);
            return expander.expand('rid=NONSTANDARD?').then(res => {
              expect(res).to.match(/rid=NONSTANDARD\?$/);
            });
          });
    });

    it('should expand bindings as functions', () => {
      return expander
          .expand('rid=FUNC(abc)?', {'FUNC': value => 'func_' + value})
          .then(
              res => {
                expect(res).to.match(/rid=func_abc\?$/);
              });
    });

    it('should expand bindings as functions with promise', () => {
      return expander.expand('rid=FUNC(abc)?', {
        'FUNC': value => Promise.resolve('func_' + value),
      }).then(res => {
        expect(res).to.match(/rid=func_abc\?$/);
      });
    });

    it('should expand null as empty string', () => {
      return expander.expand('v=VALUE', {'VALUE': null}).then(res => {
        expect(res).to.equal('v=');
      });
    });

    it('should expand undefined as empty string', () => {
      return expander.expand('v=VALUE', {'VALUE': undefined}).then(res => {
        expect(res).to.equal('v=');
      });
    });

    it('should expand empty string as empty string', () => {
      return expander.expand('v=VALUE', {'VALUE': ''}).then(res => {
        expect(res).to.equal('v=');
      });
    });

    it('should expand zero as zero', () => {
      return expander.expand('v=VALUE', {'VALUE': 0}).then(res => {
        expect(res).to.equal('v=0');
      });
    });

    it('should expand false as false', () => {
      return expander.expand('v=VALUE', {'VALUE': false}).then(res => {
        expect(res).to.equal('v=false');
      });
    });

    it('should resolve sub-included bindings', () => {
      // RANDOM is a standard property and we add RANDOM_OTHER.
      return expander
          .expand('r=RANDOM&ro=RANDOM_OTHER?', {'RANDOM_OTHER': 'ABC'})
          .then(
              res => {
                expect(res).to.match(/r=(\d+(\.\d+)?)&ro=ABC\?$/);
              });
    });

    it('should expand multiple vars', () => {
      return expander.expand('a=VALUEA&b=VALUEB?', {
        'VALUEA': 'aaa',
        'VALUEB': 'bbb',
      }).then(res => {
        expect(res).to.match(/a=aaa&b=bbb\?$/);
      });
    });
  });
});

