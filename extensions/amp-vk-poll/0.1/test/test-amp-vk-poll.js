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

const POLL_PARAMS = {
  api_id: '6183531',
  poll_id: '274032322_b0edc316c28c89d03a',
};

import '../amp-vk-poll';
import {Layout} from '../../../../src/layout';

describes.realWin('amp-vk-poll', {
  amp: {
    extensions: ['amp-vk-poll'],
  },
}, env => {

  let win, doc;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
  });

  function createAmpVkElement(dataParams, layout) {
    const ele = doc.createElement('amp-vk-poll');

    for (const param in dataParams) {
      ele.setAttribute(`data-${param}`, dataParams[param]);
    }

    ele.setAttribute('width', 500);
    ele.setAttribute('height', 300);

    if (layout) {
      ele.setAttribute('layout', layout);
    }

    doc.body.appendChild(ele);

    return ele.build().then(() => {
      return ele.layoutCallback();
    }).then(() => ele);
  }

  it('requires data-api_id', () => {
    const params = Object.assign({}, POLL_PARAMS);
    delete params['api_id'];
    return createAmpVkElement(params).should.eventually.be.rejectedWith(
        /The data-api_id attribute is required for/);
  });

  it('requires data-poll_id', () => {
    const params = Object.assign({}, POLL_PARAMS);
    delete params['poll_id'];
    return createAmpVkElement(params).should.eventually.be.rejectedWith(
        /The data-poll_id attribute is required for/);
  });

  it('renders iframe in amp-vk-poll', () => {
    return createAmpVkElement(POLL_PARAMS).then(vkPoll => {
      const iframe = vkPoll.querySelector('iframe');
      expect(iframe).to.not.be.null;
    });
  });

  it('renders responsively', () => {
    return createAmpVkElement(POLL_PARAMS, Layout.RESPONSIVE).then(vkPoll => {
      const iframe = vkPoll.querySelector('iframe');
      expect(iframe).to.not.be.null;
      expect(iframe.className).to.match(/i-amphtml-fill-content/);
    });
  });

  it('sets correct src url to the vk iFrame', () => {
    return createAmpVkElement(POLL_PARAMS, Layout.RESPONSIVE).then(vkPoll => {
      const iframe = vkPoll.querySelector('iframe');
      const referrer = encodeURIComponent(vkPoll.ownerDocument.referrer);
      const url = encodeURIComponent(
          vkPoll.ownerDocument.location.href.replace(/#.*$/, '')
      );
      const correctIFrameSrc = `https://vk.com/al_widget_poll.php?\
app=6183531&width=100%25\
&_ver=1&poll_id=274032322_b0edc316c28c89d03a\
&url=${url}&referrer=${referrer}&title=`;
      expect(iframe).to.not.be.null;
      expect(iframe.src).to.equal(correctIFrameSrc);
    });
  });

  it('resizes amp-vk element in response to messages from VK iframe', () => {
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

  it('removes iframe after unlayoutCallback', () => {
    return createAmpVkElement(POLL_PARAMS).then(vkPost => {
      const iframe = vkPost.querySelector('iframe');
      expect(iframe).to.not.be.null;
      const obj = vkPost.implementation_;
      obj.unlayoutCallback();
      expect(vkPost.querySelector('iframe')).to.be.null;
      expect(obj.iframe_).to.be.null;
      expect(obj.unlayoutOnPause()).to.be.true;
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
