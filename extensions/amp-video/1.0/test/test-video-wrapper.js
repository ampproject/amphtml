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
import {VideoWrapper} from '../video-wrapper';
import {forwardRef} from '../../../../src/preact/compat';
import {mount} from 'enzyme';
import {omit} from '../../../../src/utils/object';

import {useStyles as useAutoplayStyles} from '../autoplay.jss';

describes.sandboxed('VideoWrapper Preact component', {}, (env) => {
  let intersectionObserverObserved;
  let intersectionObserverCallback;

  let play;
  let pause;

  let metadata;

  const TestPlayer = forwardRef(({}, ref) => {
    Preact.useImperativeHandle(ref, () => ({
      play,
      pause,
      getMetadata: () => metadata,
    }));
    return <></>;
  });

  beforeEach(() => {
    pause = env.sandbox.spy();
    play = env.sandbox.spy();

    metadata = {
      'title': 'Test player title',
      'artist': 'Test player artist',
      'album': 'Test player album',
      'artwork': [{'src': 'http://test/image.jpg'}],
    };

    env.sandbox.stub(window, 'IntersectionObserver').callsFake((callback) => {
      intersectionObserverObserved = [];
      intersectionObserverCallback = callback;
      return {
        observe(element) {
          intersectionObserverObserved.push(element);
        },
        disconnect() {
          intersectionObserverObserved = null;
        },
      };
    });
  });

  it('should pass props to inner instance, sources as children', () => {
    const expectedPassthroughProps = {foo: 1, bar: 2};
    const wrapper = mount(
      <VideoWrapper
        component={TestPlayer}
        autoplay
        controls
        noaudio
        sources={<div></div>}
        {...expectedPassthroughProps}
      />
    );
    const player = wrapper.find(TestPlayer);
    expect(player).to.have.lengthOf(1);
    expect(player.props()).to.include(expectedPassthroughProps);
    expect(player.props().children).to.equal(wrapper.props().sources);
  });

  describe('MediaSession', () => {
    let navigator;

    beforeEach(() => {
      navigator = {mediaSession: {setActionHandler: env.sandbox.spy()}};
      env.sandbox.stub(window, 'navigator').value(navigator);
      env.sandbox.stub(window, 'MediaMetadata').value(Object);
    });

    it('should not set mediasession when disabled', async () => {
      const wrapper = mount(
        <VideoWrapper component={TestPlayer} mediasession={false} />
      );

      await wrapper.find(TestPlayer).invoke('onLoadedMetadata')();
      await wrapper.find(TestPlayer).invoke('onCanPlay')();
      await wrapper.find(TestPlayer).invoke('onPlaying')();

      expect(navigator.mediaSession.metadata).to.be.undefined;
      expect(navigator.mediaSession.setActionHandler).to.not.have.been.called;
    });

    it('should set mediasession when playing', async () => {
      const wrapper = mount(<VideoWrapper component={TestPlayer} />);

      await wrapper.find(TestPlayer).invoke('onLoadedMetadata')();
      await wrapper.find(TestPlayer).invoke('onCanPlay')();
      await wrapper.find(TestPlayer).invoke('onPlaying')();

      expect(navigator.mediaSession.metadata).to.eql(metadata);
      expect(
        navigator.mediaSession.setActionHandler.withArgs(
          'play',
          env.sandbox.match.typeOf('function')
        )
      ).to.have.been.calledOnce;
      expect(
        navigator.mediaSession.setActionHandler.withArgs(
          'pause',
          env.sandbox.match.typeOf('function')
        )
      ).to.have.been.calledOnce;
    });

    ['title', 'aria-label'].forEach((prop) => {
      it(`should use ${prop} prop as fallback for title`, async () => {
        const title = `Title through ${prop} prop`;

        metadata = omit(metadata, ['title']);

        const wrapper = mount(
          <VideoWrapper component={TestPlayer} {...{[prop]: title}} />
        );

        await wrapper.find(TestPlayer).invoke('onLoadedMetadata')();
        await wrapper.find(TestPlayer).invoke('onCanPlay')();
        await wrapper.find(TestPlayer).invoke('onPlaying')();

        expect(navigator.mediaSession.metadata.title).to.eql(title);
      });
    });

    it('should use document.title as fallback', async () => {
      document.title = 'Document title';

      metadata = omit(metadata, ['title']);

      const wrapper = mount(<VideoWrapper component={TestPlayer} />);

      await wrapper.find(TestPlayer).invoke('onLoadedMetadata')();
      await wrapper.find(TestPlayer).invoke('onCanPlay')();
      await wrapper.find(TestPlayer).invoke('onPlaying')();

      expect(navigator.mediaSession.metadata.title).to.eql(document.title);
    });
  });

  describe('Autoplay', () => {
    const classes = useAutoplayStyles();

    it('should render icon', () => {
      const wrapper = mount(
        <VideoWrapper component={TestPlayer} controls autoplay />
      );
      expect(wrapper.exists(`.${classes.eq}`)).to.be.true;
    });

    it('should remove icon when clicking autoplay mask', () => {
      const wrapper = mount(
        <VideoWrapper component={TestPlayer} controls autoplay />
      );
      expect(wrapper.exists(`.${classes.eq}`)).to.be.true;
      wrapper.find('[role="button"]').simulate('click');
      expect(wrapper.exists(`.${classes.eq}`)).to.be.false;
    });

    it('should not render icon when setting "noaudio"', () => {
      const wrapper = mount(
        <VideoWrapper component={TestPlayer} controls noaudio autoplay />
      );
      expect(wrapper.exists(`.${classes.eq}`)).to.be.false;
    });

    it('should not render mask without controls', () => {
      const wrapper = mount(<VideoWrapper component={TestPlayer} autoplay />);
      expect(wrapper.exists('[role="button"]')).to.be.false;
    });

    it('should render mask with controls', () => {
      const wrapper = mount(
        <VideoWrapper component={TestPlayer} controls autoplay />
      );
      expect(wrapper.exists('[role="button"]')).to.be.true;
    });

    it('should enable native controls on mask interaction', () => {
      const wrapper = mount(
        <VideoWrapper component={TestPlayer} controls autoplay />
      );
      expect(wrapper.find(TestPlayer).props().controls).to.be.false;
      wrapper.find('[role="button"]').simulate('click');
      expect(wrapper.find(TestPlayer).props().controls).to.be.true;
    });

    it('should mute with autoplay', () => {
      const wrapper = mount(<VideoWrapper component={TestPlayer} autoplay />);
      expect(wrapper.find(TestPlayer).props().muted).to.be.true;
    });

    it('should unmute on mask interaction', () => {
      const wrapper = mount(
        <VideoWrapper component={TestPlayer} controls autoplay />
      );
      expect(wrapper.find(TestPlayer).props().muted).to.be.true;
      wrapper.find('[role="button"]').simulate('click');
      expect(wrapper.find(TestPlayer).props().muted).to.be.false;
    });

    it('should remove Autoplay on mask interaction', () => {
      const wrapper = mount(
        <VideoWrapper component={TestPlayer} controls autoplay />
      );
      expect(wrapper.exists('Autoplay')).to.be.true;
      wrapper.find('[role="button"]').simulate('click');
      expect(wrapper.exists('Autoplay')).to.be.false;
    });

    it('should observe/disconnect intersection on mount/unmount', () => {
      const wrapper = mount(
        <VideoWrapper component={TestPlayer} controls autoplay />
      );
      expect(intersectionObserverObserved).to.have.lengthOf(1);
      wrapper.unmount();
      expect(intersectionObserverObserved).to.be.null;
    });

    it('should observe/disconnect intersection on mask interaction', () => {
      const wrapper = mount(
        <VideoWrapper component={TestPlayer} controls autoplay />
      );
      expect(intersectionObserverObserved).to.have.lengthOf(1);
      wrapper.find('[role="button"]').simulate('click');
      expect(intersectionObserverObserved).to.be.null;
    });

    it('should play when intersecting', async () => {
      const wrapper = mount(
        <VideoWrapper component={TestPlayer} controls autoplay />
      );
      intersectionObserverCallback([{isIntersecting: true}]);
      await wrapper.find(TestPlayer).invoke('onCanPlay')();
      expect(play).to.have.been.calledOnce;
      expect(pause).to.not.have.been.called;
    });

    it('should pause when not intersecting', async () => {
      const wrapper = mount(
        <VideoWrapper component={TestPlayer} controls autoplay />
      );
      intersectionObserverCallback([{isIntersecting: false}]);
      await wrapper.find(TestPlayer).invoke('onCanPlay')();
      expect(play).to.not.have.been.called;
      expect(pause).to.have.been.calledOnce;
    });
  });
});
