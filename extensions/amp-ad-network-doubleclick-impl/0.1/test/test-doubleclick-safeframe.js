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
import {createElementWithAttributes} from '../../../../src/dom';
import {
  SafeframeHostApi,
  SAFEFRAME_ORIGIN,
  safeframeListener,
  MESSAGE_FIELDS,
} from '../safeframe-host';
import {Services} from '../../../../src/services';

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

  beforeEach(() => {
    sandbox = env.sandbox;
    env.win.AMP_MODE.test = true;
    doc = env.win.document;
    ampAd = createElementWithAttributes(env.win.document, 'amp-ad', {
      'height': '250',
      'width': '300',
      'type': 'doubleclick',
    });
    doc.body.appendChild(ampAd);
    doubleclickImpl = new AmpAdNetworkDoubleclickImpl(ampAd, doc, env.win);
    const initialSize = {
      width: 300,
      height: 250,
    };
    const creativeSize = initialSize;
    safeframeHost = new SafeframeHostApi(doubleclickImpl, false, initialSize, creativeSize);
    doubleclickImpl.upgradeCallback();
    doubleclickImpl.layoutCallback();
  });

  // Simulates receiving a post message from the safeframe.
  function receiveMessage(messageData) {
    const messageEvent = {
      data: JSON.stringify(messageData),
      origin: SAFEFRAME_ORIGIN
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
      const postMessageMock = sandbox.stub(safeframeMock.contentWindow,
                                           'postMessage');
      const messageData = {};
      messageData[MESSAGE_FIELDS.SENTINEL] = doubleclickImpl.sentinel;
      messageData[MESSAGE_FIELDS.CHANNEL] = safeframeChannel;

      receiveMessage(messageData);

      // Verify that the channel was set up
      expect(connectMessagingChannelSpy).to.be.calledOnce;
      expect(safeframeHost.channel).to.equal(safeframeChannel);

      // Verify that first response message was sent properly
      const firstPostMessageArgs = postMessageMock.firstCall.args;
      let connectMessage = JSON.parse(firstPostMessageArgs[0]);
      let payload = JSON.parse(connectMessage[MESSAGE_FIELDS.PAYLOAD]);
      expect(payload).to.deep.equal({'c':safeframeChannel, 'message':'connect'});
      expect(connectMessage[MESSAGE_FIELDS.CHANNEL]).to.equal(safeframeChannel);
      expect(connectMessage[MESSAGE_FIELDS.SENTINEL]).to.equal(doubleclickImpl.sentinel);
      expect(connectMessage[MESSAGE_FIELDS.ENDPOINT_IDENTITY]).to.equal(
          safeframeHost.endpointIdentity_);

      // Verify that the initial geometry update was sent
      return Services.timerFor(env.win).promise(500).then(() => {
        const secondPostMessageArgs = postMessageMock.secondCall.args;
        connectMessage = JSON.parse(secondPostMessageArgs[0]);
        expect(connectMessage[MESSAGE_FIELDS.CHANNEL]).to.equal(safeframeChannel);
        expect(connectMessage[MESSAGE_FIELDS.SENTINEL]).to.equal(doubleclickImpl.sentinel);
        expect(connectMessage[MESSAGE_FIELDS.ENDPOINT_IDENTITY]).to.equal(
          safeframeHost.endpointIdentity_);
        payload = JSON.parse(connectMessage[MESSAGE_FIELDS.PAYLOAD]);
        expect(Object.keys(payload)).to.deep.equal(['newGeometry', 'uid']);
        expect(Object.keys(JSON.parse(payload['newGeometry']))).to.deep.equal([
          'windowCoords_t', 'windowCoords_r', 'windowCoords_b',
          'windowCoords_l', 'frameCoords_t', 'frameCoords_r',
          'frameCoords_b', 'frameCoords_l', 'styleZIndex',
          'allowedExpansion_r', 'allowedExpansion_b', 'allowedExpansion_t',
          'allowedExpansion_l',  'yInView', 'xInView'
        ]);
      });
    });
  });

  it('should register Safeframe listener on creation', () => {});

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
           'allowedExpansion_l',  'yInView', 'xInView']);
      Object.keys(initialGeometry).forEach(key => {
        if (key != 'styleZIndex') {
          expect(typeof initialGeometry[key]).to.equal('number');
        } else {
          expect(typeof initialGeometry[key]).to.equal('string');
        }
      });

      // check the permissions
      expect(JSON.parse(attrs['permissions'])).to.deep.equal({
        'expandByOverlay': false,
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
        }
      });
    });
  });

  describe('getCurrentGeometry', () => {
    beforeEach(() => {
      const changes = {
        "time":16328.300000168383,
        "rootBounds":{
          "left":0, "top":0, "width":500, "height":1000, "bottom":1000,
          "right":500, "x":0, "y":0},
        "boundingClientRect":{
          "left":0,"top":0,"width":300,"height":250,"bottom":250,"right":300,
          "x":0,"y":0},
        "intersectionRect":{"left":0,"top":0,"width":300,"height":250,"bottom":250,
                            "right":300,"x":0,"y":0},
        "intersectionRatio":1};
      sandbox.stub(ampAd, 'getIntersectionChangeEntry').returns(changes);
    });

    it('should get current geometry when safeframe fills amp-ad', () => {
      const safeframeMock = createElementWithAttributes(doc, 'iframe', {
        'class': 'safeframe',
      });
      const css = createElementWithAttributes(doc, 'style');
      css.innerHTML = '.safeframe' +
          '{height:250px!important;'+
          'width:300px!important;'+
          'background-color:blue!important;'+
          'display:block!important;}';
      doc.head.appendChild(css);
      ampAd.appendChild(safeframeMock);
      doubleclickImpl.iframe_ = safeframeMock;
      safeframeHost.iframe_ = safeframeMock;

      const geom = safeframeHost.getCurrentGeometry();

      expect(safeframeHost.iframeOffsets_).to.deep.equal({
        'dT': 0,
        'dL': 0,
        'dB': 0,
        'dR': 0,
        'height': 250,
        'width': 300,
      });
      expect(geom).to.equal(
          '{"windowCoords_t":0,"windowCoords_r":500,"windowCoords_b":1000,' +
            '"windowCoords_l":0,"frameCoords_t":0,"frameCoords_r":300,' +
            '"frameCoords_b":250,"frameCoords_l":0,"styleZIndex":"",' +
            '"allowedExpansion_r":200,"allowedExpansion_b":750,' +
            '"allowedExpansion_t":0,"allowedExpansion_l":0,"yInView":1,"xInView":1}')
    });

    it('should get current geometry when safeframe does not fill amp-ad', () => {
      const safeframeMock = createElementWithAttributes(doc, 'iframe', {
        'class': 'safeframe',
      });
      const css = createElementWithAttributes(doc, 'style');
      css.innerHTML = '.safeframe' +
          '{height:50px!important;'+
          'width:50px!important;'+
          'background-color:blue!important;'+
          'display:block!important;}';
      doc.head.appendChild(css);
      ampAd.appendChild(safeframeMock);
      doubleclickImpl.iframe_ = safeframeMock;
      safeframeHost.iframe_ = safeframeMock;

      const geom = safeframeHost.getCurrentGeometry();

      expect(safeframeHost.iframeOffsets_).to.deep.equal({
        'dT': 0,
        'dL': 0,
        'dB': -200,
        'dR': -250,
        'height': 50,
        'width': 50,
      });
      expect(geom).to.equal(
          '{"windowCoords_t":0,"windowCoords_r":500,"windowCoords_b":1000,' +
            '"windowCoords_l":0,"frameCoords_t":0,"frameCoords_r":50,' +
            '"frameCoords_b":50,"frameCoords_l":0,"styleZIndex":"",' +
            '"allowedExpansion_r":450,"allowedExpansion_b":950,' +
            '"allowedExpansion_t":0,"allowedExpansion_l":0,"yInView":1,"xInView":1}')
    });
  });

  describe('registerSafeframeHost', () => {
    it('should create listener if needed', () => {});
  });

  describe('geometry updates', () => {
    it('should be sent when geometry changes occur', () => {});
  });

  describe('formatGeom', () => {
    it('should convert an intersection change entry to SF format', () => {});
  });

  describe('expand_request', () => {
    it('should succeed if expanding within amp-ad bounds', () => {});
    it('should succeed if expanding past amp-ad bounds and does not create reflow', () => {});
    it('should fail if expanding past amp-ad bounds and would create reflow', () => {});
  });

  describe('collapse_request', () => {
    it('should collapse just safeframe', () => {});
    it('should collapse safeframe and amp-ad', () => {});
  });
});
