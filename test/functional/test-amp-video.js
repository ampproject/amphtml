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

import {createIframe} from '../../testing/iframe';
import {installVideo} from '../../src/amp-video';

describe('amp-video', () => {


  function getVideo(attributes) {
    var iframe = createIframe();
    installVideo(iframe.win);
    var v = iframe.doc.createElement('amp-video');
    for (var key in attributes) {
      v.setAttribute(key, attributes[key]);
    }
    iframe.doc.body.appendChild(v);
    v.implementation_.layoutCallback();
    return v;
  }

  it('should load a video', () => {
    var v = getVideo({
      src: 'video.mp4',
      width: 160,
      height: 90
    });
    var video = v.querySelector('video');
    expect(video).to.be.an.instanceof(Element);
    expect(video.tagName).to.equal('VIDEO');
    expect(video.getAttribute('src')).to.equal('video.mp4');
    expect(video.hasAttribute('controls')).to.be.false;
  });

  it('should load a video', () => {
    var v = getVideo({
      src: 'video.mp4',
      width: 160,
      height: 90,
      'controls': '',
      'autoplay': '',
      'muted': '',
      'loop': ''
    });
    var video = v.querySelector('video');
    expect(video).to.be.an.instanceof(Element);
    expect(video.tagName).to.equal('VIDEO');
    expect(video.hasAttribute('controls')).to.be.true;
    expect(video.hasAttribute('autoplay')).to.be.true;
    expect(video.hasAttribute('muted')).to.be.true;
    expect(video.hasAttribute('loop')).to.be.true;
  });
});
