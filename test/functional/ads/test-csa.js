/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import {createIframePromise} from '../../../testing/iframe';
import {csa, resizeIframe} from '../../../ads/google/csa';
import * as sinon from 'sinon';
import * as p3p from '../../../3p/3p';


describe('amp-ad-csa-impl', () => {
  let sandbox;
  let win;

  function getAds(type) {
    if (type == 'afs') {
      return {
        afsPageOptions: '{"pubId": "gtech-codegen", "query": "flowers"}',
        afsAdblockOptions: '{"width": "auto", "maxTop": 1}',
        ampSlotIndex: '0',
        height: 300,
        type: 'csa',
      };
    } else if (type == 'afsh') {
      return {
        afshPageOptions: '{"pubId": "vert-pla-test1-srp", "query": "flowers"}',
        afshAdblockOptions: '{"width": "auto", "height": 300}',
        ampSlotIndex: '0',
        height: 300,
        type: 'csa',
      };
    } else if (type == 'both') {
      return {
        afsPageOptions: '{"pubId": "gtech-codegen", "query": "flowers"}',
        afsAdblockOptions: '{"width": "auto", "maxTop": 1}',
        afshPageOptions: '{"pubId": "vert-pla-test1-srp", "query": "flowers"}',
        afshAdblockOptions: '{"width": "auto", "height": 300}',
        ampSlotIndex: '0',
        height: 300,
        type: 'csa',
      };
    } else {
      return {};
    }
  }

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    return createIframePromise(true).then(iframe => {
      win = iframe.win;
      win.context = {
        initialIntersection: {
          boundingClientRect: {
            height: 0,
          },
        },
        requestResize: function() {},
        onResizeSuccess: function() {},
        onResizeDenied: function() {},
        noContentAvailable: function() {},
        referrer: null,
      };
    });
  });

  afterEach(() => {
    win.context = {};
    sandbox.restore();
  });

  describe('inputs', () => {

    it('should create a csa container', () => {
      csa(win, getAds('afs'));
      const container = win.document.getElementById('csacontainer');
      expect(container).not.to.equal(null);
    });
  });

  describe('ad request', () => {

    let googCsaSpy;

    beforeEach(() => {
      // Stub everything out

      sandbox.stub(p3p, 'loadScript', (global, url, callback) => {
        callback();
      });

      win._googCsa = function() {};
      googCsaSpy = sandbox.stub(win, '_googCsa');
    });

    it('should request AFS', () => {
      csa(win, getAds('afs'));
      expect(googCsaSpy.args[0][0]).to.equal('ads');
    });

    it('should request AFSh', () => {
      csa(win, getAds('afsh'));
      expect(googCsaSpy.args[0][0]).to.equal('plas');
    });

    it('should request AFSh', () => {
      csa(win, getAds('both'));
      expect(googCsaSpy.args[0][0]).to.equal('plas');
    });
  });

  describe('callback', () => {

    let successCallback = function() {};
    let deniedCallback = function() {};

    beforeEach(() => {
      const div = win.document.createElement('div');
      div.id = 'csacontainer';
      const iframe = win.document.createElement('iframe');
      iframe.id = 'csaiframe';
      div.appendChild(iframe);
      win.document.body.appendChild(div);

      win.context = {};
    });

    afterEach(() => {
      const div = win.document.getElementById('csacontainer');
      if (div) {
        div.parentNode.removeChild(div);
      }

      win.context = {};

      const overflow = win.document.getElementById('overflow');
      if (overflow) {
        overflow.parentNode.removeChild(overflow);
      }
    });

    function setContainerHeight(height) {
      const div = win.document.getElementById('csacontainer');
      div.style.height = height;
      const iframe = win.document.getElementById('csaiframe');
      iframe.style.height = height;
    }

    function setContextHeight(h) {
      win.context = {
        initialIntersection: {
          boundingClientRect: {
            height: h,
          },
        },
        requestResize: function() {},
        onResizeSuccess: function() {},
        onResizeDenied: function() {},
        noContentAvailable: function() {},
        referrer: null,
      };
    }

    function registerCallbacks() {
      sandbox.stub(win.context, 'onResizeSuccess', callback => {
        successCallback = callback;
      });
      sandbox.stub(win.context, 'onResizeDenied', callback => {
        deniedCallback = callback;
      });
    }

    it('when ads are ATF and CSA container > AMP container', () => {

      // Fake CSA ads are 300px, AMP container is 100px
      setContainerHeight('300px');
      setContextHeight(100);

      // Set up
      registerCallbacks();
      const requestResizeSpy = sandbox.stub(win.context, 'requestResize');

      // Try to resize when ads are loaded
      resizeIframe(win, null, null, 'csacontainer', true);

      // Resize requests above the fold will be denied
      deniedCallback();

      const overflow = win.document.getElementById('overflow');
      const container = win.document.getElementById('csacontainer');
      const requestedHeight = requestResizeSpy.args[0][1];

      // Overflow should exist and be displayed
      expect(overflow).not.to.equal(null);
      expect(overflow.style.display).not.to.equal('none');

      // We should have tried to resize to 300 px
      expect(requestedHeight).to.equal(300);

      // Container should be set to AMP height (100) - overflow height (40)
      expect(container.style.height).to.equal('60px');

    });

    it('when ads are ATF and CSA container < AMP container', () => {

      // Fake CSA ads are 300px, AMP container is 400px
      setContainerHeight('300px');
      setContextHeight(400);

      // Set up
      registerCallbacks();
      const requestResizeSpy = sandbox.stub(win.context, 'requestResize');

      // Try to resize when ads are loaded
      resizeIframe(win, null, null, 'csacontainer', true);

      // Resize requests above the fold will be denied
      deniedCallback();

      const overflow = win.document.getElementById('overflow');
      const container = win.document.getElementById('csacontainer');
      const requestedHeight = requestResizeSpy.args[0][1];

      // Overflow should NOT be present
      expect(overflow).to.equal(null);

      // We should have tried to resize to 300 px
      expect(requestedHeight).to.equal(300);

      // Container should not have been changed
      expect(container.style.height).to.equal('300px');

    });

    it('when ads are BTF and CSA container > AMP container', () => {

      // Fake CSA ads are 300px, AMP container is 100px
      setContainerHeight('300px');
      setContextHeight(100);

      // Set up
      registerCallbacks();
      const requestResizeSpy = sandbox.stub(win.context, 'requestResize');

      // Try to resize when ads are loaded
      resizeIframe(win, null, null, 'csacontainer', true);

      // Resize requests below the fold succeeed
      const requestedHeight = requestResizeSpy.args[0][1];
      successCallback(requestedHeight);

      const overflow = win.document.getElementById('overflow');
      const container = win.document.getElementById('csacontainer');

      // Overflow should be present, but hidden
      expect(overflow.style.display).to.equal('none');

      // We should have tried to resize to 300 px
      expect(requestedHeight).to.equal(300);

      // Container should be set to full CSA height
      expect(container.style.height).to.equal('300px');

    });

    it('when ads are BTF and CSA container < AMP container', () => {

      // Fake CSA ads are 300px, AMP container is 400px
      setContainerHeight('300px');
      setContextHeight(400);

      // Set up
      registerCallbacks();
      const requestResizeSpy = sandbox.stub(win.context, 'requestResize');

      // Try to resize when ads are loaded
      resizeIframe(win, null, null, 'csacontainer', true);

      // Resize requests below the fold succeed
      const requestedHeight = requestResizeSpy.args[0][1];
      successCallback(requestedHeight);

      const overflow = win.document.getElementById('overflow');
      const container = win.document.getElementById('csacontainer');

      // Overflow should not exist
      expect(overflow).to.equal(null);

      // We should have tried to resize to 300 px
      expect(requestedHeight).to.equal(300);

      // Container should be set to full CSA height
      expect(container.style.height).to.equal('300px');

    });

    it('when ads do not load', () => {

      setContainerHeight('0px');
      setContextHeight(400);

      // Set up
      registerCallbacks();
      const noAdsSpy = sandbox.stub(win.context, 'noContentAvailable');

      // Try to resize when ads are loaded
      resizeIframe(win, null, null, 'csacontainer', false);

      expect(noAdsSpy.called).to.equal(true);

    });

    it('when ads do not load but there is backfill', () => {

      setContainerHeight('0px');
      setContextHeight(400);

      // Set up stubs and spys
      registerCallbacks();
      const noAdsSpy = sandbox.stub(win.context, 'noContentAvailable');
      win._googCsa = function() {};
      const _googCsaSpy = sandbox.stub(win, '_googCsa', () => {});

      // Try to resize when ads are loaded
      resizeIframe(win, {}, {}, 'csacontainer', false);

      // Should not tell AMP we have no ads
      expect(noAdsSpy.called).to.equal(false);

      // Should make a new request for ads
      expect(_googCsaSpy.args[0][0]).to.equal('ads');

    });

  });
});
