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

import {ampdocServiceFor} from '../../../../src/ampdoc';
import {installDocService} from '../../../../src/service/ampdoc-impl';
import {installPlatformService} from '../../../../src/service/platform-impl';
import {installViewerServiceForDoc} from '../../../../src/service/viewer-impl';
import {vsyncForTesting} from '../../../../src/service/vsync-impl';
import {installDynamicClassesForTesting} from '../amp-dynamic-css-classes';

const tcoReferrer = 'http://t.co/xyzabc123';
const PinterestUA = 'Mozilla/5.0 (Linux; Android 5.1.1; SM-G920F' +
  ' Build/LMY47X; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0' +
  ' Chrome/47.0.2526.100 Mobile Safari/537.36 [Pinterest/Android]';

describe('dynamic classes are inserted at runtime', () => {
  let body;
  let mockWin;
  let viewer;

  beforeEach(() => {
    const classList = [];
    classList.add = classList.push;
    classList.contains = function(c) {
      return this.indexOf(c) > -1;
    };
    body = {
      nodeType: /* ELEMENT */ 1,
      tagName: 'BODY',
      classList,
    };
    mockWin = {
      document: {
        nodeType: /* DOCUMENT */ 9,
        referrer: 'http://localhost/',
        body,
      },
      navigator: {
        userAgent: '',
      },
      setTimeout: window.setTimeout,
      clearTimeout: window.clearTimeout,
      location: {
        href: 'https://cdn.ampproject.org/v/www.origin.com/foo/?f=0',
      },
    };
    mockWin.document.defaultView = mockWin;
  });

  function setup(embeded, userAgent, referrer) {
    installDocService(mockWin, /* isSingleDoc */ true);
    const ampdocService = ampdocServiceFor(mockWin);
    const ampdoc = ampdocService.getAmpDoc();
    installPlatformService(mockWin);

    const vsync = vsyncForTesting(mockWin);
    vsync.schedule_ = () => {
      vsync.runScheduledTasks_();
    };

    viewer = installViewerServiceForDoc(ampdoc);
    viewer.isEmbedded = () => !!embeded;

    if (userAgent !== undefined) {
      mockWin.navigator.userAgent = userAgent;
    }
    if (referrer !== undefined) {
      viewer.getUnconfirmedReferrerUrl = () => referrer;
    }
    installDynamicClassesForTesting(ampdoc);
  }

  describe('when embedded', () => {
    beforeEach(() => {
      setup(true);
    });

    it('should include viewer class', () => {
      expect(body).to.have.class('amp-viewer');
    });
  });

  describe('Normalizing Referrers', () => {
    it('should normalize twitter shortlinks to twitter', () => {
      setup(false, '', tcoReferrer);
      expect(body).to.have.class('amp-referrer-com');
      expect(body).to.have.class('amp-referrer-twitter-com');
    });

    it('should normalize pinterest on android', () => {
      setup(false, PinterestUA, '');
      expect(body).to.have.class('amp-referrer-com');
      expect(body).to.have.class('amp-referrer-pinterest-com');
      expect(body).to.have.class('amp-referrer-www-pinterest-com');
    });
  });
});
