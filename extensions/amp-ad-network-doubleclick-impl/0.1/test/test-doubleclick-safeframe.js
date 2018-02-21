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

// Need the following side-effect import because in actual production code,
// Fast Fetch impls are always loaded via an AmpAd tag, which means AmpAd is
// always available for them. However, when we test an impl in isolation,
// AmpAd is not loaded already, so we need to load it separately.
import '../../../amp-ad/0.1/amp-ad';
import {AmpAdNetworkDoubleclickImpl} from '../amp-ad-network-doubleclick-impl';
import {
  MESSAGE_FIELDS,
  SAFEFRAME_ORIGIN,
  SERVICE,
  SafeframeHostApi,
  removeSafeframeListener,
  safeframeListener,
} from '../safeframe-host';
import {Services} from '../../../../src/services';
import {createElementWithAttributes} from '../../../../src/dom';

/**
 * We're allowing external resources because otherwise using realWin causes
 * strange behavior with iframes, as it doesn't load resources that we
 * normally load in prod.
 * We're turning on ampAdCss because using realWin means that we don't
 * inherit that CSS from the parent page anymore.
 */
const realWinConfig = {
  amp: {
    extensions: ['amp-ad-network-doubleclick-impl'],
  },
  ampAdCss: true,
  allowExternalResources: true,
};


describes.realWin('DoubleClick Fast Fetch - Safeframe', realWinConfig, env => {
  let doubleclickImpl;
  let ampAd;
  let sandbox;
  let safeframeHost;
  let doc;
  const safeframeChannel = '61393';
  const ampAdHeight = 250;
  const ampAdWidth = 300;

  beforeEach(() => {
    sandbox = env.sandbox;
    env.win.AMP_MODE.test = true;
    doc = env.win.document;
    ampAd = createElementWithAttributes(env.win.document, 'amp-ad', {
      'height': ampAdHeight,
      'width': ampAdWidth,
      'type': 'doubleclick',
    });
    doc.body.appendChild(ampAd);
    doubleclickImpl = new AmpAdNetworkDoubleclickImpl(ampAd, doc, env.win);
    const initialSize = {
      width: ampAdWidth,
      height: ampAdHeight,
    };
    const creativeSize = initialSize;
    safeframeHost = new SafeframeHostApi(
        doubleclickImpl, false, initialSize, creativeSize);
    doubleclickImpl.upgradeCallback();
    doubleclickImpl.layoutCallback();
  });

  afterEach(() => {
    removeSafeframeListener();
  });

  /**
   * Sends the intitial connection message that sets up the
   * safeframe channel.
   */
  function sendSetupMessage() {
    const messageData = {};
    messageData[MESSAGE_FIELDS.SENTINEL] = doubleclickImpl.sentinel;
    messageData[MESSAGE_FIELDS.CHANNEL] = safeframeChannel;
    receiveMessage(messageData);
  }

  function sendRegisterDoneMessage() {
    const message = {};
    message[MESSAGE_FIELDS.CHANNEL] = safeframeHost.channel;
    message[MESSAGE_FIELDS.ENDPOINT_IDENTITY] = 1;
    message[MESSAGE_FIELDS.SERVICE] = SERVICE.REGISTER_DONE;
    message[MESSAGE_FIELDS.PAYLOAD] = JSON.stringify({
      initialHeight: '100',
      initialWidth: '100',
      sentinel: safeframeHost.sentinel_,
    });
    receiveMessage(message);
  }

  // Simulates receiving a post message from the safeframe.
  function receiveMessage(messageData) {
    const messageEvent = {
      data: JSON.stringify(messageData),
      origin: SAFEFRAME_ORIGIN,
    };
    safeframeListener(messageEvent);
  }

  describe('connectMessagingChannel', () => {
    it('should handle setup message', () => {
      const safeframeMock = createElementWithAttributes(doc, 'iframe', {});
      ampAd.appendChild(safeframeMock);
      doubleclickImpl.iframe = safeframeMock;
      const connectMessagingChannelSpy = sandbox.spy(
          safeframeHost, 'connectMessagingChannel');
      const postMessageStub = sandbox./*OK*/stub(
          safeframeMock.contentWindow, 'postMessage');
      sendSetupMessage();

      // Verify that the channel was set up
      expect(connectMessagingChannelSpy).to.be.calledOnce;
      expect(safeframeHost.channel).to.equal(safeframeChannel);

      // Verify that first response message was sent properly
      const firstPostMessageArgs = postMessageStub.firstCall.args;
      let connectMessage = JSON.parse(firstPostMessageArgs[0]);
      let payload = JSON.parse(connectMessage[MESSAGE_FIELDS.PAYLOAD]);
      expect(payload).to.deep.equal({'c': safeframeChannel,
        'message': 'connect'});
      expect(connectMessage[MESSAGE_FIELDS.CHANNEL]).to.equal(safeframeChannel);
      expect(connectMessage[MESSAGE_FIELDS.SENTINEL]).to.equal(
          doubleclickImpl.sentinel);
      expect(connectMessage[MESSAGE_FIELDS.ENDPOINT_IDENTITY]).to.equal(
          safeframeHost.endpointIdentity_);

      // Verify that the initial geometry update was sent
      return Services.timerFor(env.win).promise(500).then(() => {
        const secondPostMessageArgs = postMessageStub.secondCall.args;
        connectMessage = JSON.parse(secondPostMessageArgs[0]);
        expect(connectMessage[MESSAGE_FIELDS.CHANNEL]).to.equal(
            safeframeChannel);
        expect(connectMessage[MESSAGE_FIELDS.SENTINEL]).to.equal(
            doubleclickImpl.sentinel);
        expect(connectMessage[MESSAGE_FIELDS.ENDPOINT_IDENTITY]).to.equal(
            safeframeHost.endpointIdentity_);
        payload = JSON.parse(connectMessage[MESSAGE_FIELDS.PAYLOAD]);
        expect(Object.keys(payload)).to.deep.equal(['newGeometry', 'uid']);
        expect(Object.keys(JSON.parse(payload['newGeometry']))).to.deep.equal([
          'windowCoords_t', 'windowCoords_r', 'windowCoords_b',
          'windowCoords_l', 'frameCoords_t', 'frameCoords_r',
          'frameCoords_b', 'frameCoords_l', 'styleZIndex',
          'allowedExpansion_r', 'allowedExpansion_b', 'allowedExpansion_t',
          'allowedExpansion_l', 'yInView', 'xInView',
        ]);
      });
    });
  });

  describe('getSafeframeNameAttr', () => {
    it('should return name attributes', () => {
      const attrs = safeframeHost.getSafeframeNameAttr();
      expect(Object.keys(attrs)).to.deep.equal(
          ['uid', 'hostPeerName', 'initialGeometry', 'permissions',
            'metadata', 'reportCreativeGeometry', 'isDifferentSourceWindow',
            'sentinel']);

      // Check the geometry
      const initialGeometry = JSON.parse(attrs['initialGeometry']);
      expect(Object.keys(initialGeometry)).to.deep.equal(
          ['windowCoords_t', 'windowCoords_r', 'windowCoords_b',
            'windowCoords_l', 'frameCoords_t', 'frameCoords_r',
            'frameCoords_b', 'frameCoords_l', 'styleZIndex',
            'allowedExpansion_r', 'allowedExpansion_b', 'allowedExpansion_t',
            'allowedExpansion_l', 'yInView', 'xInView']);
      Object.keys(initialGeometry).forEach(key => {
        if (key != 'styleZIndex') {
          expect(typeof initialGeometry[key]).to.equal('number');
        } else {
          expect(typeof initialGeometry[key]).to.equal('string');
        }
      });

      // check the permissions
      expect(JSON.parse(attrs['permissions'])).to.deep.equal({
        'expandByOverlay': true,
        'expandByPush': true,
        'readCookie': false,
        'writeCookie': false,
      });

      // Check the metadata
      expect(JSON.parse(attrs['metadata'])).to.deep.equal({
        'shared': {
          'sf_ver': doubleclickImpl.safeframeVersion,
          'ck_on': 1,
          'flash_ver': '26.0.0',
        },
      });
    });
  });

  describe('getCurrentGeometry', () => {
    beforeEach(() => {
      sandbox./*OK*/stub(safeframeHost.viewport_, 'getSize').returns({
        height: 1000,
        width: 500,
      });
    });

    it('should get current geometry when safeframe fills amp-ad', () => {
      const safeframeMock = createElementWithAttributes(doc, 'iframe', {
        'class': 'safeframe',
      });
      // Set the size of the safeframe to be the same as its containing
      // amp-ad element
      const css = createElementWithAttributes(doc, 'style');
      css.innerHTML = '.safeframe' +
          '{height:250px!important;' +
          'width:300px!important;' +
          'background-color:blue!important;' +
          'display:block!important;}';
      doc.head.appendChild(css);
      ampAd.appendChild(safeframeMock);
      doubleclickImpl.iframe_ = safeframeMock;
      safeframeHost.iframe_ = safeframeMock;

      const sendMessageStub = sandbox./*OK*/stub(safeframeHost,
          'sendMessage_');
      safeframeHost.updateGeometry_();

      return Services.timerFor(env.win).promise(1000).then(() => {
        const payload = sendMessageStub.firstCall.args[0];
        const messageType = sendMessageStub.firstCall.args[1];
        expect(payload['newGeometry']).to.equal(
            '{"windowCoords_t":0,"windowCoords_r":500,"windowCoords_b":1000,' +
              '"windowCoords_l":0,"frameCoords_t":0,"frameCoords_r":300,' +
              '"frameCoords_b":250,"frameCoords_l":0,"styleZIndex":"",' +
              '"allowedExpansion_r":200,"allowedExpansion_b":750,' +
              '"allowedExpansion_t":0,"allowedExpansion_l":0,"yInView":1,' +
              '"xInView":1}');
        expect(payload['uid']).to.equal(safeframeHost.uid_);
        expect(messageType).to.equal(SERVICE.GEOMETRY_UPDATE);
      });
    });

    it('should get geometry when safeframe does not fill amp-ad', () => {
      // In this case, the safeframe is smaller than its containing
      // amp-ad element.
      const safeframeMock = createElementWithAttributes(doc, 'iframe', {
        'class': 'safeframe',
      });
      const css = createElementWithAttributes(doc, 'style');
      css.innerHTML = '.safeframe' +
          '{height:50px!important;' +
          'width:50px!important;' +
          'background-color:blue!important;' +
          'display:block!important;}';
      doc.head.appendChild(css);
      ampAd.appendChild(safeframeMock);
      doubleclickImpl.iframe_ = safeframeMock;
      safeframeHost.iframe_ = safeframeMock;

      const sendMessageStub = sandbox./*OK*/stub(safeframeHost,
          'sendMessage_');
      safeframeHost.updateGeometry_();

      return Services.timerFor(env.win).promise(1000).then(() => {
        const payload = sendMessageStub.firstCall.args[0];
        const messageType = sendMessageStub.firstCall.args[1];
        expect(payload['newGeometry']).to.equal(
            '{"windowCoords_t":0,"windowCoords_r":500,"windowCoords_b":1000,' +
              '"windowCoords_l":0,"frameCoords_t":0,"frameCoords_r":50,' +
              '"frameCoords_b":50,"frameCoords_l":0,"styleZIndex":"",' +
              '"allowedExpansion_r":450,"allowedExpansion_b":950,' +
              '"allowedExpansion_t":0,"allowedExpansion_l":0,"yInView":1,' +
              '"xInView":1}');
        expect(payload['uid']).to.equal(safeframeHost.uid_);
        expect(messageType).to.equal(SERVICE.GEOMETRY_UPDATE);
      });
    });
  });

  describe('geometry updates', () => {
    it('should be sent when geometry changes occur', () => {
      const safeframeMock = createElementWithAttributes(doc, 'iframe', {});
      ampAd.appendChild(safeframeMock);
      doubleclickImpl.iframe = safeframeMock;

      const onScrollStub = sandbox./*OK*/stub(
          safeframeHost.viewport_, 'onScroll');
      const onChangedStub = sandbox./*OK*/stub(
          safeframeHost.viewport_, 'onChanged');

      safeframeMock.contentWindow.postMessage = () => {};
      sendSetupMessage();
      const maybeUpdateGeometry1 = onScrollStub.firstCall.args[0];
      const maybeUpdateGeometry2 = onChangedStub.firstCall.args[0];
      const sendMessageStub = sandbox./*OK*/spy(safeframeHost,
          'sendMessage_');
      maybeUpdateGeometry1();
      maybeUpdateGeometry2();

      return Services.timerFor(env.win).promise(500).then(() => {
        expect(sendMessageStub).to.be.calledTwice;
        const payload = sendMessageStub.secondCall.args[0];
        const messageType = sendMessageStub.secondCall.args[1];
        expect(JSON.parse(payload['newGeometry'])).to.deep.equal(
            safeframeHost.currentGeometry_);
        expect(payload['uid']).to.equal(safeframeHost.uid_);
        expect(messageType).to.equal(SERVICE.GEOMETRY_UPDATE);
        return Services.timerFor(env.win).promise(1000).then(() => {
          expect(sendMessageStub).to.be.calledThrice;
          const payload = sendMessageStub.thirdCall.args[0];
          const messageType = sendMessageStub.thirdCall.args[1];
          expect(JSON.parse(payload['newGeometry'])).to.deep.equal(
              safeframeHost.currentGeometry_);
          expect(payload['uid']).to.equal(safeframeHost.uid_);
          expect(messageType).to.equal(SERVICE.GEOMETRY_UPDATE);
        });
      });

    });
  });

  describe('formatGeom', () => {
    it('should build proper geometry update', () => {
      const iframeBox = {
        top: 200,
        left: 100,
        bottom: 800,
        right: 400,
        width: 300,
        height: 600,
      };
      sandbox./*OK*/stub(safeframeHost.viewport_, 'getSize').returns({
        width: 500,
        height: 1000,
      });
      const expectedParsedSfGU = {
        'windowCoords_t': 0, 'windowCoords_r': 500, 'windowCoords_b': 1000,
        'windowCoords_l': 0, 'frameCoords_t': 200, 'frameCoords_r': 400,
        'frameCoords_b': 800, 'frameCoords_l': 100, 'styleZIndex': '',
        'allowedExpansion_r': 200, 'allowedExpansion_b': 400,
        'allowedExpansion_t': 0, 'allowedExpansion_l': 0, 'yInView': 1,
        'xInView': 1,
      };
      const safeframeGeometryUpdate = safeframeHost.formatGeom_(
          iframeBox);
      const parsedSfGU = JSON.parse(safeframeGeometryUpdate);
      expect(parsedSfGU).to.deep.equal(expectedParsedSfGU);
      expect(safeframeHost.currentGeometry_).to.deep.equal(expectedParsedSfGU);

    });
  });

  describe('Resizing', () => {
    let safeframeMock;
    let resizeIframeSpy;
    let sendResizeResponseSpy;
    let resizeAmpAdAndSafeframeSpy;
    let attemptChangeSizeStub;
    beforeEach(() => {
      const css = createElementWithAttributes(doc, 'style');
      css.innerHTML = '.safeframe' +
          '{height:50px!important;' +
          'width:50px!important;' +
          'background-color:blue!important;' +
          'display:block!important;}';
      doc.head.appendChild(css);
      safeframeMock = createElementWithAttributes(doc, 'iframe', {
        height: 50,
        width: 50,
      });
      ampAd.appendChild(safeframeMock);
      doubleclickImpl.iframe = safeframeMock;
      resizeIframeSpy = sandbox.spy(
          safeframeHost, 'resizeIframe');
      sendResizeResponseSpy = sandbox.spy(
          safeframeHost, 'sendResizeResponse');
      resizeAmpAdAndSafeframeSpy = sandbox.spy(
          safeframeHost, 'resizeAmpAdAndSafeframe');
      safeframeHost.initialHeight_ = ampAdHeight;
      safeframeHost.initialWidth_ = ampAdWidth;
      sendSetupMessage();
      sendRegisterDoneMessage();
      attemptChangeSizeStub = sandbox.stub(
          doubleclickImpl, 'attemptChangeSize');
      sandbox./*OK*/stub(safeframeHost.viewport_, 'getSize').returns({
        height: 1000,
        width: 1000,
      });
      safeframeHost.isCollapsed_ = true;
    });

    /**
     * Send a message requesting an expand.
     */
    function sendExpandMessage(height, width) {
      const expandMessage = {};
      expandMessage[MESSAGE_FIELDS.CHANNEL] = safeframeHost.channel;
      expandMessage[MESSAGE_FIELDS.ENDPOINT_IDENTITY] = 1;
      expandMessage[MESSAGE_FIELDS.SERVICE] = SERVICE.EXPAND_REQUEST;
      expandMessage[MESSAGE_FIELDS.PAYLOAD] = JSON.stringify({
        'uid': 0.623462509818004,
        'expand_t': 0,
        'expand_r': width,
        'expand_b': height,
        'expand_l': 0,
        'push': true,
        'sentinel': safeframeHost.sentinel_,
      });
      receiveMessage(expandMessage);
    }

    /**
     * If the safeframed creative asks to resize within the bounds of
     * the amp-ad element, it succeeds immediately.
     */
    it('expand_request should succeed if within amp-ad bounds', () => {
      sendExpandMessage(50, 50);
      // Verify that we can immediately resize the safeframe, and don't
      // need to call any of the fancy AMP element resize things.
      expect(resizeIframeSpy).to.be.calledOnce;
      expect(resizeIframeSpy).to.be.calledWith(100, 100);
      expect(safeframeMock.style.height).to.equal('100px');
      expect(safeframeMock.style.width).to.equal('100px');
      expect(sendResizeResponseSpy).to.be.calledWith(
          true, SERVICE.EXPAND_RESPONSE);
      expect(resizeAmpAdAndSafeframeSpy).to.not.be.called;
    });

    /**
     * If the safeframed creative asks to resize within the bounds of
     * the amp-ad element, first we try to resize the amp-ad element by
     * using element.attemptChangeSize. If that succeeds, then we also
     * resize the safeframe.
     */
    it('expand_request should succeed if expanding past amp-ad bounds and' +
       ' does not create reflow', () => {
      // Sneaky hack to do a synchronous mock of attemptChangeSize
      // Resize the ampAd to simulate a success.
      const then = f => {
        ampAd.style.height = '600px';
        ampAd.style.width = '600px';
        f();
        return {'catch': f => f()};
      };
      attemptChangeSizeStub.returns({then});
      sendExpandMessage(550,550);

      expect(resizeIframeSpy).to.be.calledOnce;
      expect(resizeIframeSpy).to.be.calledWith(600, 600);
      expect(safeframeMock.style.height).to.equal('600px');
      expect(safeframeMock.style.width).to.equal('600px');
      expect(sendResizeResponseSpy).to.be.calledWith(
          true, SERVICE.EXPAND_RESPONSE);
      expect(resizeAmpAdAndSafeframeSpy).to.be.calledOnce;
    });

    /**
     * Request asks to expand past the bounds of the amp-ad element. First we
     * try to expand that element, and in this test it fails. Thus, we also
     * fail resizing the safeframe.
     */
    it('expand_request should fail if expanding past amp-ad bounds and would ' +
       'create reflow', () => {
      // Sneaky hack to do a synchronous mock of attemptChangeSize
      // In our mock, we don't do anything to the iframe that would be seen as a
      // success, thus we are failing the resizing.
      const then = f => {
        f();
        return {'catch': f => f()};
      };
      attemptChangeSizeStub.returns({then});

      sendExpandMessage(550, 550);

      expect(resizeIframeSpy).to.not.be.called;
      expect(safeframeMock.height).to.equal('50');
      expect(safeframeMock.width).to.equal('50');
      expect(sendResizeResponseSpy).to.be.calledWith(
          false, SERVICE.EXPAND_RESPONSE);
      expect(resizeAmpAdAndSafeframeSpy).to.be.calledOnce;
    });

    function sendCollapseMessage() {
      const collapseMessage = {};
      collapseMessage[MESSAGE_FIELDS.CHANNEL] = safeframeHost.channel;
      collapseMessage[MESSAGE_FIELDS.ENDPOINT_IDENTITY] = 1;
      collapseMessage[MESSAGE_FIELDS.SERVICE] = SERVICE.COLLAPSE_REQUEST;
      collapseMessage[MESSAGE_FIELDS.PAYLOAD] = JSON.stringify({
        'uid': 0.623462509818004,
        'push': false,
        'sentinel': safeframeHost.sentinel_,
      });
      receiveMessage(collapseMessage);
    }

    it('should collapse safeframe on amp-ad resize failure', () => {
      safeframeHost.isCollapsed_ = false;
      ampAd.style.height = '600px';
      ampAd.style.width = '600px';
      safeframeMock.style.height = 600;
      safeframeMock.style.width = 600;
      // Sneaky hack to do a synchronous mock of attemptChangeSize
      // Resize the ampAd to simulate a success.
      const then = f => {
        f();
        return {'catch': f => f()};
      };
      attemptChangeSizeStub.returns({then});
      sendCollapseMessage();

      expect(resizeIframeSpy).to.be.calledOnce;
      expect(resizeIframeSpy).to.be.calledWith(250, 300);
      expect(safeframeMock.style.height).to.equal('250px');
      expect(safeframeMock.style.width).to.equal('300px');
      expect(sendResizeResponseSpy).to.be.calledWith(
          true, SERVICE.COLLAPSE_RESPONSE);
      expect(resizeAmpAdAndSafeframeSpy).to.be.calledOnce;
    });

    it('should collapse safeframe on amp-ad resize success', () => {
      safeframeHost.isCollapsed_ = false;
      ampAd.style.height = '600px';
      ampAd.style.width = '600px';
      safeframeMock.style.height = 600;
      safeframeMock.style.width = 600;
      // Sneaky hack to do a synchronous mock of attemptChangeSize
      // Resize the ampAd to simulate a success.
      const then = f => {
        ampAd.style.height = '250px';
        ampAd.style.width = '300px';
        f();
        return {'catch': f => f()};
      };
      attemptChangeSizeStub.returns({then});
      sendCollapseMessage();

      expect(resizeIframeSpy).to.be.calledOnce;
      expect(resizeIframeSpy).to.be.calledWith(250, 300);
      expect(safeframeMock.style.height).to.equal('250px');
      expect(safeframeMock.style.width).to.equal('300px');
      expect(sendResizeResponseSpy).to.be.calledWith(
          true, SERVICE.COLLAPSE_RESPONSE);
      expect(resizeAmpAdAndSafeframeSpy).to.be.calledOnce;
    });
  });
});
