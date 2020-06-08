import {Deferred} from '../../src/utils/promise';
import {Services} from '../../src/services';
import {whenContentIniLoad} from '../../src/ini-load';

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

describes.realWin('friendly-iframe-embed', {amp: true}, (env) => {
  let win, doc;
  let ampdoc;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
    ampdoc = env.ampdoc;
  });

  it('should find and await all visible content elements in given rect', async () => {
    let content1;
    let content2;

    const context = doc.createElement('div');
    doc.body.appendChild(context);
    const resources = Services.resourcesForDoc(ampdoc);
    env.sandbox.stub(resources, 'get').returns([
      (content1 = resource(win, 'amp-img')),
      (content2 = resource(win, 'amp-video')),
      resource(win, 'amp-img', false), // resource outside rect
      resource(win, 'amp-img', true, false), // hidden resource
      resource(win, 'amp-ad'), // denylisted resource
    ]);

    let contentIniLoadComplete = false;
    whenContentIniLoad(ampdoc, win, {}).then(() => {
      contentIniLoadComplete = true;
    });

    ampdoc.signals().signal('ready-scan');
    await new Promise(setTimeout);

    content1.load();
    await new Promise(setTimeout);
    expect(contentIniLoadComplete).to.be.false;

    content2.load();
    await new Promise(setTimeout);
    expect(contentIniLoadComplete).to.be.true;
  });
});

function resource(win, tagName, overlaps = true, displayed = true) {
  const deferred = new Deferred();
  return {
    element: {
      tagName: tagName.toUpperCase(),
    },
    load: () => {
      deferred.resolve();
    },
    loadedOnce: () => {
      return deferred.promise;
    },
    isDisplayed: () => displayed,
    overlaps: () => overlaps,
    isFixed: () => false,
    prerenderAllowed: () => true,
    hasBeenMeasured: () => true,
    hasOwner: () => false,
    getPageLayoutBoxAsync: () => Promise.resolve(),
    hostWin: win,
  };
}
