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
import {VideoIframe} from '../video-iframe';
import {mount} from 'enzyme';

function dispatchMessage(window, opt_event) {
  const event = window.document.createEvent('Event');
  event.initEvent('message', /* bubbles */ true, /* cancelable */ true);
  window.dispatchEvent(Object.assign(event, opt_event));
}

describes.sandboxed('VideoIframe Preact component', {}, (env) => {
  beforeEach(() => {});

  it('unmutes per lack of `muted` prop', async () => {
    const makeMethodMessage = env.sandbox.spy();
    const videoIframe = mount(
      <VideoIframe src="about:blank" makeMethodMessage={makeMethodMessage} />,
      {attachTo: document.body}
    );

    await videoIframe.find('iframe').invoke('onCanPlay')();

    expect(makeMethodMessage.withArgs('unmute')).to.have.been.calledOnce;
  });

  it('mutes per `muted` prop', async () => {
    const makeMethodMessage = env.sandbox.spy();
    const videoIframe = mount(
      <VideoIframe
        src="about:blank"
        makeMethodMessage={makeMethodMessage}
        muted
      />,
      {attachTo: document.body}
    );

    await videoIframe.find('iframe').invoke('onCanPlay')();

    expect(makeMethodMessage.withArgs('mute')).to.have.been.calledOnce;
  });

  it('hides controls per lack of `controls` prop', async () => {
    const makeMethodMessage = env.sandbox.spy();
    const videoIframe = mount(
      <VideoIframe src="about:blank" makeMethodMessage={makeMethodMessage} />,
      {attachTo: document.body}
    );

    await videoIframe.find('iframe').invoke('onCanPlay')();

    expect(makeMethodMessage.withArgs('hideControls')).to.have.been.calledOnce;
  });

  it('shows controls per `controls` prop', async () => {
    const makeMethodMessage = env.sandbox.spy();
    const videoIframe = mount(
      <VideoIframe
        src="about:blank"
        makeMethodMessage={makeMethodMessage}
        controls
      />,
      {attachTo: document.body}
    );

    await videoIframe.find('iframe').invoke('onCanPlay')();

    expect(makeMethodMessage.withArgs('showControls')).to.have.been.calledOnce;
  });

  it('passes messages to onMessage', async () => {
    const onMessage = env.sandbox.spy();
    const videoIframe = mount(
      <VideoIframe src="about:blank" onMessage={onMessage} controls />,
      {attachTo: document.body}
    );

    const iframe = videoIframe.getDOMNode();

    const data = {foo: 'bar'};
    dispatchMessage(window, {source: iframe.contentWindow, data});

    expect(
      onMessage.withArgs(
        env.sandbox.match({
          currentTarget: iframe,
          target: iframe,
          data,
        })
      )
    ).to.have.been.calledOnce;
  });

  it("ignores messages if source doesn't match iframe", async () => {
    const onMessage = env.sandbox.spy();
    mount(<VideoIframe src="about:blank" onMessage={onMessage} controls />, {
      attachTo: document.body,
    });
    dispatchMessage(window, {source: null, data: 'whatever'});
    expect(onMessage).to.not.have.been.called;
  });

  it('stops listening to messages on unmount', async () => {
    const onMessage = env.sandbox.spy();
    const videoIframe = mount(
      <VideoIframe src="about:blank" onMessage={onMessage} />,
      {attachTo: document.body}
    );
    const iframe = videoIframe.getDOMNode();
    videoIframe.unmount();
    dispatchMessage(window, {source: iframe.contentWindow, data: 'whatever'});
    expect(onMessage).to.not.have.been.called;
  });

  it('unlistens only when unmounted', async () => {
    const addEventListener = env.sandbox.stub(window, 'addEventListener');
    const removeEventListener = env.sandbox.stub(window, 'removeEventListener');

    const videoIframe = mount(
      <VideoIframe src="about:blank" onMessage={() => {}} />,
      {attachTo: document.body}
    );

    expect(addEventListener.withArgs('message')).to.have.been.calledOnce;
    expect(removeEventListener.withArgs('message')).to.not.have.been.called;

    videoIframe.setProps({
      onMessage: () => {
        // An unstable onMessage prop should not cause unlisten
      },
    });
    videoIframe.update();
    expect(removeEventListener.withArgs('message')).to.not.have.been.called;

    videoIframe.unmount();
    expect(removeEventListener.withArgs('message')).to.have.been.calledOnce;
  });

  describe('uses makeMethodMessage to posts imperative handle methods', () => {
    ['play', 'pause'].forEach((method) => {
      it(`with \`${method}\``, async () => {
        let videoIframeRef;

        const makeMethodMessage = (method) => ({makeMethodMessageFor: method});

        const makeMethodMessageSpy = env.sandbox.spy(makeMethodMessage);

        const videoIframe = mount(
          <VideoIframe
            ref={(ref) => (videoIframeRef = ref)}
            src="about:blank"
            makeMethodMessage={makeMethodMessageSpy}
          />,
          {attachTo: document.body}
        );

        const postMessage = env.sandbox.stub(
          videoIframe.getDOMNode().contentWindow,
          'postMessage'
        );

        videoIframeRef[method]();
        await videoIframe.find('iframe').invoke('onCanPlay')();

        expect(makeMethodMessageSpy.withArgs(method)).to.have.been.calledOnce;
        expect(
          postMessage.withArgs(
            env.sandbox.match(makeMethodMessage(method)),
            '*'
          )
        ).to.have.been.calledOnce;
      });
    });
  });
});
