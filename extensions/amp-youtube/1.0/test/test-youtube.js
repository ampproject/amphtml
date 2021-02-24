/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

import * as Preact from '../../../../src/preact';
import {Youtube} from '../component';
import {createRef} from '../../../../src/preact';

import {dispatchCustomEvent} from '../../../../src/dom';
import {mount} from 'enzyme';

describes.realWin('YouTube preact component v1.0', {}, (env) => {
  let window, document;
  let container;

  beforeEach(() => {
    window = env.win;
    document = window.document;

    container = document.createElement('div');
    document.body.appendChild(container);
  });

  it('Normal render', () => {
    const wrapper = mount(
      <Youtube
        videoid="IAvf-rkzNck"
        style={{
          'width': 600,
          'height': 500,
        }}
      />,
      {attachTo: container}
    );

    const iframe = wrapper.find('iframe');

    expect(iframe.prop('src')).to.equal(
      'https://www.youtube.com/embed/IAvf-rkzNck?enablejsapi=1&amp=1&playsinline=1'
    );

    // Style propagated to container, but not iframe.
    expect(wrapper.prop('style').width).to.equal(600);
    expect(wrapper.prop('style').height).to.equal(500);
    expect(wrapper.find('iframe').prop('style').width).to.equal('100%');
    expect(wrapper.find('iframe').prop('style').height).to.equal('100%');
  });

  it('Pass correct param attributes to the iframe src', () => {
    const wrapper = mount(
      <Youtube
        videoid="IAvf-rkzNck"
        autoplay
        loop
        style={{
          'width': 600,
          'height': 500,
        }}
        params={{'myparam': 'hello world', 'loop': '1'}}
      />,
      {attachTo: container}
    );

    const iframe = wrapper.find('iframe');

    expect(iframe.prop('src')).to.contain('&myparam=hello%20world');
    expect(iframe.prop('src')).to.not.contain('autoplay=1');
    // data-param-loop is black listed in favor of just loop for single videos
    expect(iframe.prop('src')).to.not.contain('loop=1');
    // playsinline should default to 1 if not provided.
    expect(iframe.prop('src')).to.contain('playsinline=1');
    expect(iframe.prop('src')).to.contain('iv_load_policy=3');
  });

  it('Keep data param: loop in iframe src for playlists', () => {
    const wrapper = mount(
      <Youtube
        videoid="IAvf-rkzNck"
        autoplay
        loop
        style={{
          'width': 600,
          'height': 500,
        }}
        params={{'playlist': 'IAvf-rkzNck', 'loop': '1'}}
      />,
      {attachTo: container}
    );

    const iframe = wrapper.find('iframe');

    expect(iframe.prop('src')).to.contain('loop=1');
  });

  it('Uses privacy-enhanced mode', () => {
    const wrapper = mount(
      <Youtube
        videoid="IAvf-rkzNck"
        autoplay
        loop
        style={{
          'width': 600,
          'height': 500,
        }}
        credentials="omit"
      />,
      {attachTo: container}
    );

    const iframe = wrapper.find('iframe');

    expect(iframe.prop('src')).to.equal(
      'https://www.youtube-nocookie.com/embed/IAvf-rkzNck?enablejsapi=1&amp=1&playsinline=1&iv_load_policy=3'
    );
  });

  it('should trigger onCanPlay when youtube iframe is loaded', () => {
    const wrapper = mount(
      <Youtube
        videoid="IAvf-rkzNck"
        autoplay
        loop
        style={{
          'width': 600,
          'height': 500,
        }}
        credentials="omit"
      />,
      {attachTo: container}
    );

    const iframe = wrapper.find('iframe').getDOMNode();
    const onCanPlaySpy = env.sandbox.spy();
    iframe.addEventListener('canplay', onCanPlaySpy);
    const postMessageSpy = env.sandbox.stub(
      iframe.contentWindow,
      'postMessage'
    );

    dispatchCustomEvent(iframe, 'load', {bubbles: false});
    expect(onCanPlaySpy).to.be.calledOnce;
    expect(onCanPlaySpy.firstCall.firstArg).to.contain({bubbles: false});
    expect(postMessageSpy).to.be.calledOnce;
    expect(JSON.parse(postMessageSpy.firstCall.firstArg)).to.deep.equal({
      event: 'listening',
    });
  });

  it('exposes properties from info messages', () => {
    const ref = createRef();

    const wrapper = mount(
      <Youtube
        ref={ref}
        videoid="IAvf-rkzNck"
        shortcode="B8QaZW4AQY_"
        style={{width: 500, height: 600}}
      />,
      {attachTo: document.body}
    );

    const {contentWindow} = wrapper.getDOMNode().querySelector('iframe');

    expect(ref.current.currentTime).to.equal(0);
    expect(ref.current.duration).to.be.NaN;

    mockMessage(window, contentWindow, {info: {duration: 420}});

    expect(ref.current.currentTime).to.equal(0);
    expect(ref.current.duration).to.equal(420);

    mockMessage(window, contentWindow, {info: {currentTime: 12.3}});

    expect(ref.current.currentTime).to.equal(12.3);
    expect(ref.current.duration).to.equal(420);
  });
});

function mockMessage(win, source, data) {
  const mockEvent = new CustomEvent('message');
  mockEvent.data = JSON.stringify(data);
  mockEvent.source = source;
  win.dispatchEvent(mockEvent);
  return mockEvent;
}
