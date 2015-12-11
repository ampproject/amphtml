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

import {AnalyticsPlatformVars} from '../analytics-platform-vars.js';
import {urlReplacementsFor} from '../../../../src/url-replacements';
import {adopt} from '../../../../src/runtime';
import * as sinon from 'sinon';

adopt(window);

describe('analytics-platform-vars', function() {
  let sandbox;
  let fakeWin;
  let fakeViewport;
  let apv;

  const canonicalUrl = 'https://example.com/news?id=1234';
  const ampDocUrl = 'https://ampdoc.com/c/' + canonicalUrl;
  const referrer = 'https://www.google.com/';
  const title = 'Test Title';

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    fakeWin = {
      location: {href: ampDocUrl},
      document: {
        createElement: document.createElement,
        querySelector: () => {return {href: canonicalUrl};},
        title: title,
        referrer: referrer,
        documentElement: {style: {}}
      },
      screen: {width: 99, height: 49},
      Math: {random: () => {return 42;}},
      Object: window.Object,
      addEventListener: () => {}
    };
    fakeViewport = {
      getScrollTop: () => {return 0;},
      getScrollLeft: () => {return 10;},
      getScrollWidth: () => {return 20;},
      getScrollHeight: () => {return 30;}
    };
    apv = new AnalyticsPlatformVars(
        fakeWin, urlReplacementsFor(fakeWin), fakeViewport);
  });

  afterEach(() => {
    sinon.sandbox.restore();
    sandbox = null;
    fakeWin = null;
    fakeViewport = null;
    apv = null;
  });

  it('gets all expected vars', () => {
    expect(apv.get('random')).to.match(/\d\.\d+/);
    expect(apv.get('canonicalUrl')).to.equal(canonicalUrl);
    expect(apv.get('canonicalHost')).to.equal('example.com');
    expect(apv.get('canonicalPath')).to.equal('/news');
    expect(apv.get('referrer')).to.equal(referrer);
    expect(apv.get('title')).to.equal(title);
    expect(apv.get('ampUrl')).to.equal(ampDocUrl);
    expect(apv.get('ampHost')).to.equal('ampdoc.com');
    expect(apv.get('timestamp')).to.match(/\d+/);
    expect(apv.get('timezone')).to.match(/\d+/);
    expect(apv.get('scrollTop')).to.equal(0);
    expect(apv.get('scrollLeft')).to.equal(10);
    expect(apv.get('scrollWidth')).to.equal(20);
    expect(apv.get('scrollHeight')).to.equal(30);
    expect(apv.get('screenWidth')).to.equal(99);
    expect(apv.get('screenHeight')).to.equal(49);
    expect(apv.get('pageViewId')).to.match(/\d+/);
    expect(apv.get('random')).to.match(/\d\.\d+/);
  });

  it('returns null for unknown vars', () => {
    expect(apv.get(null)).to.equal(null);
    expect(apv.get('')).to.equal(null);
    expect(apv.get('unknown')).to.equal(null);
  });
});
