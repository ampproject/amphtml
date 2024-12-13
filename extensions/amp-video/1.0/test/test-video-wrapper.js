import {mount} from 'enzyme';

import {useStyles as useAutoplayStyles} from '#bento/components/bento-video/1.0/autoplay.jss';
import {VideoWrapper} from '#bento/components/bento-video/1.0/component';

import {omit} from '#core/types/object';

import {createRef} from '#preact';
import * as Preact from '#preact';
import {forwardRef} from '#preact/compat';
import {WithAmpContext} from '#preact/context';

describes.sandboxed('VideoWrapper Preact component', {}, (env) => {
  let intersectionObserverObserved;
  let intersectionObserverCallback;

  let playerReadyState;
  let play;
  let pause;

  let metadata;

  const TestPlayer = forwardRef(({}, ref) => {
    Preact.useImperativeHandle(ref, () => ({
      get readyState() {
        return playerReadyState;
      },
      play,
      pause,
      getMetadata: () => metadata,
    }));
    return <></>;
  });

  beforeEach(() => {
    playerReadyState = undefined;
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

  it('should render only shell and resolve API as unloaded', () => {
    const ref = createRef();
    const wrapper = mount(
      <VideoWrapper
        ref={ref}
        loading="unload"
        component={TestPlayer}
        sources={<div></div>}
      />
    );
    const player = wrapper.find(TestPlayer);
    expect(player).to.have.lengthOf(0);

    // API is functional but returns 0/NaN values.
    const api = ref.current;
    expect(api.readyState).to.equal('loading');
    expect(api.currentTime).to.equal(0);
    expect(api.duration).to.be.NaN;
  });

  it('should initialize in a readyState=complete', () => {
    playerReadyState = 1;
    const ref = createRef();
    mount(
      <VideoWrapper ref={ref} component={TestPlayer} sources={<div></div>} />
    );
    const api = ref.current;
    expect(api.readyState).to.equal('complete');
  });

  it('should set readyState=complete on canplay', async () => {
    const ref = createRef();
    const onReadyState = env.sandbox.spy();
    const wrapper = mount(
      <VideoWrapper
        ref={ref}
        component={TestPlayer}
        sources={<div></div>}
        onReadyState={onReadyState}
      />
    );
    let api = ref.current;
    expect(api.readyState).to.equal('loading');
    expect(onReadyState).to.not.be.called;

    await wrapper.find(TestPlayer).invoke('onCanPlay')();
    api = ref.current;
    expect(api.readyState).to.equal('complete');
    expect(onReadyState).to.be.calledOnce.calledWith('complete');
  });

  it('should set readyState=complete on metadata', async () => {
    const ref = createRef();
    const onReadyState = env.sandbox.spy();
    const wrapper = mount(
      <VideoWrapper
        ref={ref}
        component={TestPlayer}
        sources={<div></div>}
        onReadyState={onReadyState}
      />
    );
    let api = ref.current;
    expect(api.readyState).to.equal('loading');
    expect(onReadyState).to.not.be.called;

    await wrapper.find(TestPlayer).invoke('onLoadedMetadata')();
    api = ref.current;
    expect(api.readyState).to.equal('complete');
    expect(onReadyState).to.be.calledOnce.calledWith('complete');
  });

  it('should set readyState=error on error event', async () => {
    const ref = createRef();
    const onReadyState = env.sandbox.spy();
    const wrapper = mount(
      <VideoWrapper
        ref={ref}
        component={TestPlayer}
        sources={<div></div>}
        onReadyState={onReadyState}
      />
    );
    let api = ref.current;
    expect(api.readyState).to.equal('loading');
    expect(onReadyState).to.not.be.called;

    await wrapper.find(TestPlayer).invoke('onError')();
    api = ref.current;
    expect(api.readyState).to.equal('error');
    expect(onReadyState).to.be.calledOnce.calledWith('error');
  });

  it('should send playing state on events', async () => {
    const onPlayingState = env.sandbox.spy();
    const wrapper = mount(
      <VideoWrapper
        component={TestPlayer}
        sources={<div></div>}
        onPlayingState={onPlayingState}
      />
    );
    expect(onPlayingState).to.not.be.called;

    // onPlaying
    await wrapper.find(TestPlayer).invoke('onPlaying')();
    expect(onPlayingState).to.be.calledOnce.calledWith(true);

    // onPause
    onPlayingState.resetHistory();
    await wrapper.find(TestPlayer).invoke('onPause')();
    expect(onPlayingState).to.be.calledOnce.calledWith(false);

    // onPlaying again
    onPlayingState.resetHistory();
    await wrapper.find(TestPlayer).invoke('onPlaying')();
    expect(onPlayingState).to.be.calledOnce.calledWith(true);

    // onEnded
    onPlayingState.resetHistory();
    await wrapper.find(TestPlayer).invoke('onEnded')();
    expect(onPlayingState).to.be.calledOnce.calledWith(false);
  });

  it('should reset playing state when component is not mounted', async () => {
    const onPlayingState = env.sandbox.spy();
    const wrapper = mount(
      <WithAmpContext playable={true}>
        <VideoWrapper
          component={TestPlayer}
          sources={<div></div>}
          onPlayingState={onPlayingState}
        />
      </WithAmpContext>
    );
    await wrapper.find(TestPlayer).invoke('onPlaying')();
    expect(onPlayingState).to.be.calledOnce.calledWith(true);
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
      wrapper.find('button').simulate('click');
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
      expect(wrapper.exists('button')).to.be.false;
    });

    it('should render mask with controls', () => {
      const wrapper = mount(
        <VideoWrapper component={TestPlayer} controls autoplay />
      );
      expect(wrapper.exists('button')).to.be.true;
    });

    it('should enable native controls on mask interaction', () => {
      const wrapper = mount(
        <VideoWrapper component={TestPlayer} controls autoplay />
      );
      expect(wrapper.find(TestPlayer).props().controls).to.be.false;
      wrapper.find('button').simulate('click');
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
      wrapper.find('button').simulate('click');
      expect(wrapper.find(TestPlayer).props().muted).to.be.false;
    });

    it('should remove Autoplay on mask interaction', () => {
      const wrapper = mount(
        <VideoWrapper component={TestPlayer} controls autoplay />
      );
      expect(wrapper.exists('Autoplay')).to.be.true;
      wrapper.find('button').simulate('click');
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
      wrapper.find('button').simulate('click');
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

    it('should not play when not playable', async () => {
      const wrapper = mount(
        <WithAmpContext playable={false}>
          <VideoWrapper component={TestPlayer} controls autoplay />
        </WithAmpContext>
      );
      intersectionObserverCallback([{isIntersecting: true}]);
      await wrapper.find(TestPlayer).invoke('onCanPlay')();
      expect(play).to.not.have.been.called;
    });
  });
});
