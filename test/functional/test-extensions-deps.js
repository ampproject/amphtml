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

import {installDocService} from '../../src/service/ampdoc-impl';
import {iterateElementsForTesting} from '../../src/runtime';
import {resetServiceForTesting} from '../../src/service';
import * as sinon from 'sinon';

// Builtins.
import {AmpImg} from '../../builtins/amp-img';

// Extensions.
// TODO(erwinm): Generate and import this imports.
import '../../extensions/amp-accordion/0.1/amp-accordion';
import '../../extensions/amp-ad/0.1/amp-ad';
import '../../extensions/amp-ad-network-adsense-impl/0.1/amp-ad-network-adsense-impl';
import '../../extensions/amp-ad-network-doubleclick-impl/0.1/amp-ad-network-doubleclick-impl';
//QQQ: doesn't work: import '../../extensions/amp-ad-network-fake-impl/0.1/amp-ad-network-fake-impl';
import '../../extensions/amp-analytics/0.1/amp-analytics';
import '../../extensions/amp-anim/0.1/amp-anim';
import '../../extensions/amp-apester-media/0.1/amp-apester-media';
import '../../extensions/amp-app-banner/0.1/amp-app-banner';
import '../../extensions/amp-audio/0.1/amp-audio';
import '../../extensions/amp-brid-player/0.1/amp-brid-player';
import '../../extensions/amp-brightcove/0.1/amp-brightcove';
import '../../extensions/amp-kaltura-player/0.1/amp-kaltura-player';
import '../../extensions/amp-carousel/0.1/amp-carousel';
import '../../extensions/amp-dailymotion/0.1/amp-dailymotion';
import '../../extensions/amp-dynamic-css-classes/0.1/amp-dynamic-css-classes';
import '../../extensions/amp-experiment/0.1/amp-experiment';
import '../../extensions/amp-facebook/0.1/amp-facebook';
import '../../extensions/amp-fit-text/0.1/amp-fit-text';
import '../../extensions/amp-font/0.1/amp-font';
import '../../extensions/amp-form/0.1/amp-form';
import '../../extensions/amp-fresh/0.1/amp-fresh';
import '../../extensions/amp-fx-flying-carpet/0.1/amp-fx-flying-carpet';
import '../../extensions/amp-gfycat/0.1/amp-gfycat';
import '../../extensions/amp-iframe/0.1/amp-iframe';
import '../../extensions/amp-image-lightbox/0.1/amp-image-lightbox';
import '../../extensions/amp-instagram/0.1/amp-instagram';
import '../../extensions/amp-install-serviceworker/0.1/amp-install-serviceworker';
import '../../extensions/amp-jwplayer/0.1/amp-jwplayer';
import '../../extensions/amp-lightbox/0.1/amp-lightbox';
import '../../extensions/amp-lightbox-viewer/0.1/amp-lightbox-viewer';
import '../../extensions/amp-list/0.1/amp-list';
import '../../extensions/amp-live-list/0.1/amp-live-list';
import '../../extensions/amp-mustache/0.1/amp-mustache';
import '../../extensions/amp-o2-player/0.1/amp-o2-player';
import '../../extensions/amp-pinterest/0.1/amp-pinterest';
import '../../extensions/amp-reach-player/0.1/amp-reach-player';
import '../../extensions/amp-share-tracking/0.1/amp-share-tracking';
import '../../extensions/amp-sidebar/0.1/amp-sidebar';
import '../../extensions/amp-soundcloud/0.1/amp-soundcloud';
import '../../extensions/amp-springboard-player/0.1/amp-springboard-player';
import '../../extensions/amp-sticky-ad/0.1/amp-sticky-ad';
import '../../extensions/amp-slides/0.1/amp-slides';
import '../../extensions/amp-social-share/0.1/amp-social-share';
import '../../extensions/amp-twitter/0.1/amp-twitter';
import '../../extensions/amp-user-notification/0.1/amp-user-notification';
import '../../extensions/amp-vimeo/0.1/amp-vimeo';
import '../../extensions/amp-vine/0.1/amp-vine';
import '../../extensions/amp-viz-vega/0.1/amp-viz-vega';
import '../../extensions/amp-google-vrview-image/0.1/amp-google-vrview-image';
import '../../extensions/amp-youtube/0.1/amp-youtube';


describe('extension deps', () => {

  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should not resolve ampdoc services in constructors', () => {
    resetServiceForTesting(window, 'ampdoc');
    installDocService(window, /* isSingleDoc */ false);
    function testConstructors(ext) {
      console.error('QQQ: element: ', ext.name);
      const element = window.document.createElement('div');
      const impl = new ext.implementationClass(element);
      impl.createdCallback();
    }
    testConstructors({name: 'amp-img', implementationClass: AmpImg});
    iterateElementsForTesting(testConstructors);
  });
});
