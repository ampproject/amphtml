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

import {Viewer} from '../../src/viewer';
import {platform} from '../../src/platform';


describe('Viewer', () => {

  let sandbox;
  let windowMock;
  let viewer;
  let windowApi;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    var WindowApi = function() {};
    WindowApi.prototype.setTimeout = function(callback, delay) {};
    windowApi = new WindowApi();
    windowApi.location = {hash: '', href: '/test/viewer'};
    windowMock = sandbox.mock(windowApi);
    viewer = new Viewer(windowApi);
  });

  afterEach(() => {
    viewer = null;
    windowMock.verify();
    windowMock = null;
    sandbox.restore();
    sandbox = null;
  });

  it('should configure as natural viewport by default', () => {
    expect(viewer.getViewportType()).to.equal('natural');
    expect(viewer.getViewportWidth()).to.equal(0);
    expect(viewer.getViewportHeight()).to.equal(0);
    expect(viewer.getScrollTop()).to.equal(0);
    expect(viewer.getPaddingTop()).to.equal(0);
  });

  it('should configure correctly based on window name and hash', () => {
    windowApi.name = '__AMP__viewportType=virtual&width=222&height=333' +
        '&scrollTop=15';
    windowApi.location.hash = '#width=111&paddingTop=17&other=something';
    windowApi.document = {body: {style: {}}};
    let viewer = new Viewer(windowApi);
    expect(viewer.getViewportType()).to.equal('virtual');
    expect(viewer.getViewportWidth()).to.equal(111);
    expect(viewer.getViewportHeight()).to.equal(333);
    expect(viewer.getScrollTop()).to.equal(15);
    expect(viewer.getPaddingTop()).to.equal(17);

    // All of the startup params are also available via getParam.
    expect(viewer.getParam('paddingTop')).to.equal('17');
    expect(viewer.getParam('width')).to.equal('111');
    expect(viewer.getParam('other')).to.equal('something');
  });

  it('should configure correctly for iOS embedding', () => {
    windowApi.name = '__AMP__viewportType=natural';
    windowApi.parent = {};
    let body = {style: {}};
    let documentElement = {style: {}};
    windowApi.document = {body: body, documentElement: documentElement};
    sandbox.mock(platform).expects('isIos').returns(true).once();
    let viewer = new Viewer(windowApi);

    expect(viewer.getViewportType()).to.equal('natural-ios-embed');
  });

  it('should receive viewport event', () => {
    let viewportEvent = null;
    viewer.onViewportEvent((event) => {
      viewportEvent = event;
    });
    viewer.receiveMessage('viewport', {
      scrollTop: 11,
      scrollLeft: 12,
      width: 13,
      height: 14,
      paddingTop: 19
    });
    expect(viewportEvent).to.not.equal(null);
    expect(viewer.getScrollTop()).to.equal(11);
    expect(viewer.getViewportWidth()).to.equal(13);
    expect(viewer.getViewportHeight()).to.equal(14);
    expect(viewer.getPaddingTop()).to.equal(19);
  });

  it('should post documentLoaded event', () => {
    viewer.postDocumentReady(11, 12);
    let m = viewer.messageQueue_[0];
    expect(m.eventType).to.equal('documentLoaded');
    expect(m.data.width).to.equal(11);
    expect(m.data.height).to.equal(12);
  });

  it('should post documentResized event', () => {
    viewer.postDocumentResized(13, 14);
    let m = viewer.messageQueue_[0];
    expect(m.eventType).to.equal('documentResized');
    expect(m.data.width).to.equal(13);
    expect(m.data.height).to.equal(14);
  });

  it('should post request/cancelFullOverlay event', () => {
    viewer.requestFullOverlay();
    viewer.cancelFullOverlay();
    expect(viewer.messageQueue_[0].eventType).to.equal('requestFullOverlay');
    expect(viewer.messageQueue_[1].eventType).to.equal('cancelFullOverlay');
  });

  it('should queue non-dupe events', () => {
    viewer.postDocumentReady(11, 12);
    viewer.postDocumentResized(13, 14);
    viewer.postDocumentResized(15, 16);
    expect(viewer.messageQueue_.length).to.equal(2);
    expect(viewer.messageQueue_[0].eventType).to.equal('documentLoaded');
    let m = viewer.messageQueue_[1];
    expect(m.eventType).to.equal('documentResized');
    expect(m.data.width).to.equal(15);
    expect(m.data.height).to.equal(16);
  });

  it('should dequeue events when deliverer set', () => {
    viewer.postDocumentReady(11, 12);
    viewer.postDocumentResized(13, 14);
    expect(viewer.messageQueue_.length).to.equal(2);

    let delivered = [];
    viewer.setMessageDeliverer((eventType, data) => {
      delivered.push({eventType: eventType, data: data});
    });

    expect(viewer.messageQueue_.length).to.equal(0);
    expect(delivered.length).to.equal(2);
    expect(delivered[0].eventType).to.equal('documentLoaded');
    expect(delivered[0].data.width).to.equal(11);
    expect(delivered[1].eventType).to.equal('documentResized');
    expect(delivered[1].data.width).to.equal(13);
  });
});
