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
  'hash': 'Yc8_Z9pnpg8aKMZbVcD-jK45eAk',
  'owner_id': '1',
  'post_id': '45616',
};

import '../amp-vk';
import {Layout} from '../../../../src/layout';

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
    const ele = doc.createElement('amp-vk');

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

  it('requires data-hash', () => {
    const params = Object.assign({}, POST_PARAMS);
    delete params['hash'];
    return createAmpVkElement(params).should.eventually.be.rejectedWith(
        /The data-hash attribute is required for/);
  });

  it('requires data-owner_id', () => {
    const params = Object.assign({}, POST_PARAMS);
    delete params['owner_id'];
    return createAmpVkElement(params).should.eventually.be.rejectedWith(
        /The data-owner_id attribute is required for/);
  });

  it('requires data-post_id', () => {
    const params = Object.assign({}, POST_PARAMS);
    delete params['post_id'];
    return createAmpVkElement(params).should.eventually.be.rejectedWith(
        /The data-post_id attribute is required for/);
  });

  it('renders iframe in amp-vk', () => {
    return createAmpVkElement(POST_PARAMS).then(vkPost => {
      const iframe = vkPost.querySelector('iframe');
      expect(iframe).to.not.be.null;
    });
  });

  it('renders responsively', () => {
    return createAmpVkElement(POST_PARAMS, Layout.RESPONSIVE).then(vkPost => {
      const iframe = vkPost.querySelector('iframe');
      expect(iframe).to.not.be.null;
      expect(iframe.className).to.match(/i-amphtml-fill-content/);
    });
  });

  it('sets correct src url to the vk iFrame', () => {
    return createAmpVkElement(POST_PARAMS, Layout.RESPONSIVE).then(vkPost => {
      const iframe = vkPost.querySelector('iframe');
      const referrer = encodeURIComponent(vkPost.ownerDocument.referrer);
      const url = encodeURIComponent(
          vkPost.ownerDocument.location.href.replace(/#.*$/, '')
      );
      const startWidth = iframe.offsetWidth;
      const correctIFrameSrc = `https://vk.com/widget_post.php?\
app=0&width=100%25&startWidth=${startWidth}\
&_ver=1&owner_id=1&post_id=45616&hash=Yc8_Z9pnpg8aKMZbVcD-jK45eAk&\
url=${url}&referrer=${referrer}&title=`;
      expect(iframe).to.not.be.null;
      expect(iframe.src).to.equal(correctIFrameSrc);
    });
  });

  it('resizes amp-vk element in response to messages from VK iframe', () => {
    return createAmpVkElement(POST_PARAMS).then(vkPost => {
      const impl = vkPost.implementation_;
      const iframe = vkPost.querySelector('iframe');
      const changeHeight = sandbox.spy(impl, 'changeHeight');
      const fakeHeight = 555;

      expect(iframe).to.not.be.null;

      generatePostMessage(vkPost, iframe, fakeHeight);

      expect(changeHeight).to.be.calledOnce;
      expect(changeHeight.firstCall.args[0]).to.equal(fakeHeight);
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
