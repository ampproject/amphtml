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
import {Instagram} from '../component';
import {WithAmpContext} from '../../../../src/preact/context';
import {createRef} from '../../../../src/preact';
import {mount} from 'enzyme';
import {waitFor} from '../../../../testing/test-helper';

describes.sandboxed('Instagram preact component v1.0', {}, (env) => {
  it('Normal render', () => {
    const wrapper = mount(
      <Instagram
        shortcode="B8QaZW4AQY_"
        style={{
          'width': 500,
          'height': 600,
        }}
      />
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
    const wrapper = mount(
      <Instagram
        shortcode="B8QaZW4AQY_"
        captioned
        style={{'width': 500, 'height': 705}}
      />
    );
    expect(wrapper.find('iframe').prop('src')).to.equal(
      'https://www.instagram.com/p/B8QaZW4AQY_/embed/captioned/?cr=1&v=12'
    );
    expect(wrapper.find('iframe').prop('style').width).to.equal('100%');
    expect(wrapper.find('iframe').prop('style').height).to.equal('100%');
    expect(wrapper.find('div')).to.have.lengthOf(2);
  });

  it('Resize prop is called', () => {
    const requestResizeSpy = env.sandbox.spy();
    const wrapper = mount(
      <Instagram
        shortcode="B8QaZW4AQY_"
        captioned
        style={{'width': 500, 'height': 705}}
        requestResize={requestResizeSpy}
      />
    );

    const mockEvent = createMockEvent();
    mockEvent.source = wrapper
      .getDOMNode()
      .querySelector('iframe').contentWindow;
    window.dispatchEvent(mockEvent);

    expect(requestResizeSpy).to.have.been.calledOnce;
  });

  it('Height is changed', async () => {
    const wrapper = mount(
      <Instagram
        shortcode="B8QaZW4AQY_"
        style={{'width': 500, 'height': 600}}
      />
    );

    const mockEvent = createMockEvent();
    mockEvent.source = wrapper
      .getDOMNode()
      .querySelector('iframe').contentWindow;
    window.dispatchEvent(mockEvent);

    wrapper.update();

    await waitFor(
      () => wrapper.find('div').at(0).prop('style').height == 1000,
      'Height is not changed'
    );

    expect(wrapper.find('div').at(0).prop('style').height).to.equal(1000);
  });

  it('load event is dispatched', async () => {
    const ref = createRef();
    const onReadyState = env.sandbox.spy();
    const wrapper = mount(
      <Instagram
        ref={ref}
        shortcode="B8QaZW4AQY_"
        style={{'width': 500, 'height': 600}}
        onReadyState={onReadyState}
      />
    );

    let api = ref.current;
    expect(api.readyState).to.equal('loading');
    expect(onReadyState).to.not.be.called;

    await wrapper.find('iframe').invoke('onLoad')();
    api = ref.current;
    expect(api.readyState).to.equal('complete');
    expect(onReadyState).to.be.calledOnce.calledWith('complete');
  });

  it('should reset iframe on pause', () => {
    const ref = createRef();
    const wrapper = mount(
      <WithAmpContext playable={true}>
        <Instagram
          ref={ref}
          shortcode="B8QaZW4AQY_"
          style={{'width': 500, 'height': 600}}
        />
      </WithAmpContext>
    );
    expect(wrapper.find('iframe')).to.have.lengthOf(1);

    const iframe = wrapper.find('iframe').getDOMNode();
    let iframeSrc = iframe.src;
    const iframeSrcSetterSpy = env.sandbox.spy();
    Object.defineProperty(iframe, 'src', {
      get() {
        return iframeSrc;
      },
      set(value) {
        iframeSrc = value;
        iframeSrcSetterSpy(value);
      },
    });

    wrapper.setProps({playable: false});
    expect(iframeSrcSetterSpy).to.be.calledOnce;
  });
});

function createMockEvent() {
  const mockEvent = new CustomEvent('message');
  mockEvent.origin = 'https://www.instagram.com';
  mockEvent.data = JSON.stringify({
    'type': 'MEASURE',
    'details': {
      'height': 1000,
    },
  });
  return mockEvent;
}
