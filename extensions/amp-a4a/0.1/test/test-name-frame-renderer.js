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

import {NameFrameRenderer} from '../name-frame-renderer';
import {parseJson} from '../../../../src/core/types/object/json';
import {utf8Encode} from '../../../../src/core/types/string/bytes';

const realWinConfig = {
  amp: {},
  ampAdCss: true,
  allowExternalResources: true,
};

describes.realWin('NameFrameRenderer', realWinConfig, (env) => {
  const minifiedCreative = '<p>Hello, World!</p>';

  let containerElement;
  let context;
  let creativeData;

  beforeEach(async () => {
    context = {
      size: {width: '320', height: '50'},
      requestUrl: 'http://www.google.com',
      win: env.win,
      applyFillContent: () => {},
      sentinel: 's-1234',
    };

    creativeData = {
      rawCreativeBytes: utf8Encode(minifiedCreative),
      additionalContextMetadata: {},
    };

    containerElement = env.win.document.createElement('div');
    containerElement.setAttribute('height', 50);
    containerElement.setAttribute('width', 320);
    containerElement.getIntersectionChangeEntry = () => ({
      time: null,
      boundingClientRect: {},
      rootBounds: {},
      intersectionRect: {},
    });
    env.win.document.body.appendChild(containerElement);

    await new NameFrameRenderer().render(
      context,
      containerElement,
      creativeData
    );
  });

  it('should append iframe child', () => {
    const iframe = containerElement.querySelector('iframe');
    expect(iframe).to.be.ok;
    const parsedName = parseJson(iframe.getAttribute('name'));
    expect(parsedName).to.be.ok;
    expect(parsedName.width).to.equal(320);
    expect(parsedName.height).to.equal(50);
    expect(parsedName._context).to.be.ok;
    expect(parsedName._context.sentinel).to.equal('s-1234');
    expect(parsedName.creative).to.equal(minifiedCreative);
  });

  it('should have src pointing to nameframe', () => {
    const iframe = containerElement.querySelector('iframe');
    expect(iframe).to.be.ok;
    expect(iframe.getAttribute('src')).to.match(/nameframe\.max\.html$/);
  });

  it('should set correct attributes on the iframe', () => {
    const iframe = containerElement.querySelector('iframe');
    expect(iframe).to.be.ok;
    expect(iframe.getAttribute('width')).to.equal('320');
    expect(iframe.getAttribute('height')).to.equal('50');
    expect(iframe.getAttribute('frameborder')).to.equal('0');
    expect(iframe.getAttribute('allowfullscreen')).to.equal('');
    expect(iframe.getAttribute('allowtransparency')).to.equal('');
    expect(iframe.getAttribute('scrolling')).to.equal('no');
  });
});
