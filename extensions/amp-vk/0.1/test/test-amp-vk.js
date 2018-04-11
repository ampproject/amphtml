/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

const POST_PARAMS = {
  'embedtype': 'post',
  'hash': 'Yc8_Z9pnpg8aKMZbVcD-jK45eAk',
  'owner-id': '1',
  'post-id': '45616',
};

const POLL_PARAMS = {
  'embedtype': 'poll',
  'api-id': '6183531',
  'poll-id': '274086843_1a2a465f60fff4699f',
};

import '../amp-vk';
import {Layout} from '../../../../src/layout';
import {Resource} from '../../../../src/service/resource';

describes.realWin('amp-vk', {
  amp: {
    extensions: ['amp-vk'],
  },
}, env => {

  let win, doc;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
  });

  function createAmpVkElement(dataParams, layout) {
    const element = doc.createElement('amp-vk');

    for (const param in dataParams) {
      element.setAttribute(`data-${param}`, dataParams[param]);
    }

    element.setAttribute('width', 500);
    element.setAttribute('height', 300);

    if (layout) {
      element.setAttribute('layout', layout);
    }

    doc.body.appendChild(element);

    return element.build().then(() => {
      const resource = Resource.forElement(element);
      resource.measure();
      return element.layoutCallback();
    }).then(() => element);
  }

  it('requires data-embedtype', () => {
    const params = Object.assign({}, POST_PARAMS);
    delete params['embedtype'];
    allowConsoleError(() => {
      return createAmpVkElement(params).should.eventually.be.rejectedWith(
          /The data-embedtype attribute is required for/);
    });
  });

  it('removes iframe after unlayoutCallback', () => {
    return createAmpVkElement(POST_PARAMS).then(vkPost => {
      const iframe = vkPost.querySelector('iframe');
      expect(iframe).to.not.be.null;
      const obj = vkPost.implementation_;
      obj.unlayoutCallback();
      expect(vkPost.querySelector('iframe')).to.be.null;
      expect(obj.iframe_).to.be.null;
      expect(obj.unlayoutOnPause()).to.be.true;
    });
  });

  // Post tests

  it('post::requires data-hash', () => {
    const params = Object.assign({}, POST_PARAMS);
    delete params['hash'];
    allowConsoleError(() => {
      return createAmpVkElement(params).should.eventually.be.rejectedWith(
          /The data-hash attribute is required for/);
    });
  });

  it('post::requires data-owner-id', () => {
    const params = Object.assign({}, POST_PARAMS);
    delete params['owner-id'];
    allowConsoleError(() => {
      return createAmpVkElement(params).should.eventually.be.rejectedWith(
          /The data-owner-id attribute is required for/);
    });
  });

  it('post::requires data-post-id', () => {
    const params = Object.assign({}, POST_PARAMS);
    delete params['post-id'];
    allowConsoleError(() => {
      return createAmpVkElement(params).should.eventually.be.rejectedWith(
          /The data-post-id attribute is required for/);
    });
  });

  it('post::renders iframe in amp-vk', () => {
    return createAmpVkElement(POST_PARAMS).then(vkPost => {
      const iframe = vkPost.querySelector('iframe');
      expect(iframe).to.not.be.null;
    });
  });

  it('post::renders responsively', () => {
    return createAmpVkElement(POST_PARAMS, Layout.RESPONSIVE).then(vkPost => {
      const iframe = vkPost.querySelector('iframe');
      expect(iframe).to.not.be.null;
      expect(iframe.className).to.match(/i-amphtml-fill-content/);
    });
  });

  it('post::sets correct src url to the vk iFrame', () => {
    return createAmpVkElement(POST_PARAMS, Layout.RESPONSIVE).then(vkPost => {
      const impl = vkPost.implementation_;
      const iframe = vkPost.querySelector('iframe');
      const referrer = encodeURIComponent(vkPost.ownerDocument.referrer);
      const url = encodeURIComponent(
          vkPost.ownerDocument.location.href.replace(/#.*$/, '')
      );
      impl.onLayoutMeasure();
      const startWidth = impl.getLayoutWidth();
      const correctIFrameSrc = `https://vk.com/widget_post.php?app=0&width=100%25\
&_ver=1&owner_id=1&post_id=45616&hash=Yc8_Z9pnpg8aKMZbVcD-jK45eAk&amp=1\
&startWidth=${startWidth}&url=${url}&referrer=${referrer}&title=AMP%20Post`;
      expect(iframe).to.not.be.null;
      const timeArgPosition = iframe.src.lastIndexOf('&');
      const iframeSrcWithoutTime = iframe.src.substr(0, timeArgPosition);
      expect(iframeSrcWithoutTime).to.equal(correctIFrameSrc);
    });
  });

  // Poll tests

  it('poll::requires data-api-id', () => {
    const params = Object.assign({}, POLL_PARAMS);
    delete params['api-id'];
    allowConsoleError(() => {
      return createAmpVkElement(params).should.eventually.be.rejectedWith(
          /The data-api-id attribute is required for/);
    });
  });

  it('poll::requires data-poll-id', () => {
    const params = Object.assign({}, POLL_PARAMS);
    delete params['poll-id'];
    allowConsoleError(() => {
      return createAmpVkElement(params).should.eventually.be.rejectedWith(
          /The data-poll-id attribute is required for/);
    });
  });

  it('poll::renders iframe in amp-vk', () => {
    return createAmpVkElement(POLL_PARAMS).then(vkPoll => {
      const iframe = vkPoll.querySelector('iframe');
      expect(iframe).to.not.be.null;
    });
  });

  it('poll::renders responsively', () => {
    return createAmpVkElement(POLL_PARAMS, Layout.RESPONSIVE).then(vkPoll => {
      const iframe = vkPoll.querySelector('iframe');
      expect(iframe).to.not.be.null;
      expect(iframe.className).to.match(/i-amphtml-fill-content/);
    });
  });

  it('poll::sets correct src url to the vk iFrame', () => {
    return createAmpVkElement(POLL_PARAMS, Layout.RESPONSIVE).then(vkPoll => {
      const iframe = vkPoll.querySelector('iframe');
      const referrer = encodeURIComponent(vkPoll.ownerDocument.referrer);
      const url = encodeURIComponent(
          vkPoll.ownerDocument.location.href.replace(/#.*$/, '')
      );
      const correctIFrameSrc = `https://vk.com/al_widget_poll.php?\
app=6183531&width=100%25&_ver=1&poll_id=274086843_1a2a465f60fff4699f&amp=1\
&url=${url}&title=AMP%20Poll&description=&referrer=${referrer}`;

      expect(iframe).to.not.be.null;
      const timeArgPosition = iframe.src.lastIndexOf('&');
      const iframeSrcWithoutTime = iframe.src.substr(0, timeArgPosition);
      expect(iframeSrcWithoutTime).to.equal(correctIFrameSrc);
    });
  });

  it('both::resizes amp-vk element in response to postmessages', () => {
    return createAmpVkElement(POLL_PARAMS).then(vkPoll => {
      const impl = vkPoll.implementation_;
      const iframe = vkPoll.querySelector('iframe');
      const changeHeight = sandbox.spy(impl, 'changeHeight');
      const fakeHeight = 555;

      expect(iframe).to.not.be.null;

      generatePostMessage(vkPoll, iframe, fakeHeight);

      expect(changeHeight).to.be.calledOnce;
      expect(changeHeight.firstCall.args[0]).to.equal(fakeHeight);
    });
  });

  function generatePostMessage(ins, iframe, height) {
    ins.implementation_.handleVkIframeMessage_({
      origin: 'https://vk.com',
      source: iframe.contentWindow,
      data: JSON.stringify([
        'resize',
        [height],
      ]),
    });
  }
});
