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
import {Instagram, handleMessage} from '../instagram';
import {mount} from 'enzyme';
import {useRef} from '../../../../src/preact';

describes.sandboxed('Instagram preact component v1.0', {}, (env) => {
  it('Normal render', () => {
    const el = document.createElement('div');
    document.body.appendChild(el);
    const wrapper = mount(
      <Instagram
        shortcode="B8QaZW4AQY_"
        style={{
          'width': 500,
          'height': 600,
        }}
      />,
      {attachTo: el}
    );

    const iframe = wrapper.find('iframe');

    expect(iframe.prop('src')).to.equal(
      'https://www.instagram.com/p/B8QaZW4AQY_/embed/?cr=1&v=12'
    );
    expect(wrapper.find('iframe').prop('style').width).to.equal('100%');
    expect(wrapper.find('iframe').prop('style').height).to.equal('100%');
    expect(wrapper.find('div')).to.have.lengthOf(2);
  });

  it('Render with caption', () => {
    const el = document.createElement('div');
    document.body.appendChild(el);
    const wrapper = mount(
      <Instagram
        shortcode="B8QaZW4AQY_"
        captioned
        style={{'width': 500, 'height': 705}}
      />,
      {attachTo: el}
    );
    expect(wrapper.find('iframe').prop('src')).to.equal(
      'https://www.instagram.com/p/B8QaZW4AQY_/embed/captioned/?cr=1&v=12'
    );
    expect(wrapper.find('iframe').prop('style').width).to.equal('100%');
    expect(wrapper.find('iframe').prop('style').height).to.equal('100%');
    expect(wrapper.find('div')).to.have.lengthOf(2);
  });

  it('Resize prop is called', () => {
    mount(
      <Instagram
        shortcode="B8QaZW4AQY_"
        style={{'width': 500, 'height': 600}}
        requestResize={env.sandbox.spy()}
      />,
      {attachTo: document.body}
    );

    const requestResizeSpy = env.sandbox.spy();
    const heightSpy = env.sandbox.spy();
    const opacitySpy = env.sandbox.spy();

    handleMessage(
      createMockEvent(),
      useRef({'contentWindow': 'source'}),
      requestResizeSpy,
      heightSpy,
      opacitySpy
    );

    expect(requestResizeSpy).to.have.been.calledOnce;
    expect(heightSpy).to.have.not.been.called;
    expect(opacitySpy).to.have.been.calledOnce;
  });

  it('Height is changed', () => {
    mount(
      <Instagram
        shortcode="B8QaZW4AQY_"
        style={{'width': 500, 'height': 600}}
        requestResize={env.sandbox.spy()}
      />,
      {attachTo: document.body}
    );

    const heightSpy = env.sandbox.spy();
    const opacitySpy = env.sandbox.spy();

    handleMessage(
      createMockEvent(),
      useRef({'contentWindow': 'source'}),
      null,
      heightSpy,
      opacitySpy
    );

    expect(heightSpy).to.have.been.calledOnce;
    expect(opacitySpy).to.have.been.calledOnce;
  });
});

function createMockEvent() {
  const mockEvent = new CustomEvent('message');
  mockEvent.origin = 'https://www.instagram.com';
  mockEvent.source = 'source';
  mockEvent.data = JSON.stringify({
    'type': 'MEASURE',
    'details': {
      'height': 705,
    },
  });
  return mockEvent;
}
