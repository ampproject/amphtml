/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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
  RequestBank,
  writeFriendlyFrame,
  writeSafeFrame,
} from '../../testing/test-helper';

// The image ad as seen in examples/inabox.gpt.html,
// with visibility pings being placeholders that's substituted with calls to the
// request bank.
const adBody = __html__['test/fixtures/amp-cupcake-ad.html'] // eslint-disable-line no-undef
    .replace(/__VIEW_URL__/g, RequestBank.getUrl('view')) // get all instances
    .replace('__VISIBLE_URL__', RequestBank.getUrl('visible'))
    .replace('__ACTIVE_VIEW_URL__', RequestBank.getUrl('activeview'));

function testVisibilityPings(visibleDelay, activeViewDelay) {
  let viewTime = 0;
  let visibleTime = 0;
  let activeViewTime = 0;
  const viewPromise = RequestBank.withdraw('view')
      .then(() => viewTime = Date.now());
  const visiblePromise = RequestBank.withdraw('visible')
      .then(() => visibleTime = Date.now());
  const activeViewPromise = RequestBank.withdraw('activeview')
      .then(() => activeViewTime = Date.now());
  return Promise.all([viewPromise, visiblePromise, activeViewPromise])
      .then(() => {
        // Add about a 200ms "buffer" to account for possible browser jankiness
        expect(visibleTime - viewTime).to.be.above(visibleDelay - 200);
        expect(activeViewTime - viewTime).to.be.above(activeViewDelay - 200);
      });
}

describes.integration('AMP Inabox Rendering', {
  amp: false,
  body: `
    <script src="/examples/inabox-tag-integration.js"></script>
    `,
}, env => {
  let iframe;
  let doc;
  beforeEach(() => {
    doc = env.win.document;
    iframe = document.createElement('iframe');
    // we add the iframe here because it's dynamically created, so the bootstrap
    // script would have missed it.
    env.win.top.ampInaboxIframes = [iframe];
  });

  it('should properly render ad in a friendly iframe with viewability pings',
      () => {
        writeFriendlyFrame(doc, iframe, adBody);
        return testVisibilityPings(0, 1000);
      });

  it('should properly render ad in a safe frame with viewability pings', () => {
    writeSafeFrame(doc, iframe, adBody);
    return testVisibilityPings(0, 1000);
  });

  afterEach(() => {
    doc.body.removeChild(iframe);
  });
});

// Testing that analytics components use IntersectionObserver properly.
describes.realWin('AMP Inabox Rendering - No Host Script', {
  amp: false,
}, env => {
  let iframe;
  let doc;
  beforeEach(() => {
    doc = env.win.document;
    iframe = document.createElement('iframe');
  });

  it.configure().skipSafari().run(
      'should properly render ad in a friendly iframe with viewability pings',
      () => {
        writeFriendlyFrame(doc, iframe, adBody);
        return testVisibilityPings(0, 1000);
      });

  it.configure().skipSafari().run(
      'should properly render ad in a safe frame with viewability pings',
      () => {
        writeSafeFrame(doc, iframe, adBody);
        return testVisibilityPings(0, 1000);
      });

  afterEach(() => {
    doc.body.removeChild(iframe);
  });
});

// TODO: Like the BTF test in test-amp-inabox.js, this doesn't quite work
// properly due to #14010.
describes.integration('AMP Inabox Rendering BTF', {
  amp: false,
  body: `
    <div style="height: 100vh"></div>
    <script src="/examples/inabox-tag-integration.js"></script>
    `,
}, env => {
  let iframe;
  let doc;
  beforeEach(() => {
    doc = env.win.document;
    iframe = document.createElement('iframe');
    env.win.top.ampInaboxIframes = [iframe];
    setTimeout(() => {
      env.win.scrollTo(0, 1000);
    }, 2000);
  });

  it.configure().skipSafari().run(
      'should properly render ad in a friendly iframe with viewability pings',
      () => {
        writeFriendlyFrame(doc, iframe, adBody);
        return testVisibilityPings(2000, 3000);
      });

  it.configure().skipSafari().run(
      'should properly render ad in a safe frame with viewability pings',
      () => {
        writeSafeFrame(doc, iframe, adBody);
        return testVisibilityPings(2000, 3000);
      });

  afterEach(() => {
    doc.body.removeChild(iframe);
  });
});
