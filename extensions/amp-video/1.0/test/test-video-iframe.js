import {mount} from 'enzyme';

import {VideoIframeInternal} from '#bento/components/bento-video/1.0/video-iframe';

import * as Preact from '#preact';
import {createRef} from '#preact';

function dispatchMessage(window, opt_event) {
  const event = window.document.createEvent('Event');
  event.initEvent('message', /* bubbles */ true, /* cancelable */ true);
  window.dispatchEvent(Object.assign(event, opt_event));
}

describes.realWin('VideoIframeInternal Preact component', {}, (env) => {
  let window;
  let document;

  beforeEach(() => {
    window = env.win;
    document = window.document;
  });

  it('calls `onIframeLoad` once loaded', async () => {
    const onIframeLoad = env.sandbox.spy();
    const onCanPlay = env.sandbox.spy();
    const makeMethodMessage = env.sandbox.spy();
    const videoIframe = mount(
      <VideoIframeInternal
        src="about:blank"
        makeMethodMessage={makeMethodMessage}
        onIframeLoad={onIframeLoad}
        onCanPlay={onCanPlay}
      />,
      {attachTo: document.body}
    );

    await videoIframe.find('iframe').invoke('onCanPlay')();

    expect(onCanPlay).to.be.calledOnce;
    expect(onIframeLoad).to.be.calledOnce;
  });

  it('unmutes per lack of `muted` prop', async () => {
    const makeMethodMessage = env.sandbox.spy();
    const videoIframe = mount(
      <VideoIframeInternal
        src="about:blank"
        makeMethodMessage={makeMethodMessage}
      />,
      {attachTo: document.body}
    );

    await videoIframe.find('iframe').invoke('onCanPlay')();

    expect(makeMethodMessage.withArgs('unmute')).to.have.been.calledOnce;
  });

  it('mutes per `muted` prop', async () => {
    const makeMethodMessage = env.sandbox.spy();
    const videoIframe = mount(
      <VideoIframeInternal
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
      <VideoIframeInternal
        src="about:blank"
        makeMethodMessage={makeMethodMessage}
      />,
      {attachTo: document.body}
    );

    await videoIframe.find('iframe').invoke('onCanPlay')();

    expect(makeMethodMessage.withArgs('hideControls')).to.have.been.calledOnce;
  });

  it('shows controls per `controls` prop', async () => {
    const makeMethodMessage = env.sandbox.spy();
    const videoIframe = mount(
      <VideoIframeInternal
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
      <VideoIframeInternal src="about:blank" onMessage={onMessage} controls />,
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
    mount(
      <VideoIframeInternal src="about:blank" onMessage={onMessage} controls />,
      {
        attachTo: document.body,
      }
    );
    dispatchMessage(window, {source: null, data: 'whatever'});
    expect(onMessage).to.not.have.been.called;
  });

  it('stops listening to messages on unmount', async () => {
    const onMessage = env.sandbox.spy();
    const videoIframe = mount(
      <VideoIframeInternal src="about:blank" onMessage={onMessage} />,
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
      <VideoIframeInternal src="about:blank" onMessage={() => {}} />,
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

  it('should reset an unloadOnPause-iframe on pause', () => {
    const ref = createRef();

    const makeMethodMessageStub = env.sandbox.stub();

    const videoIframe = mount(
      <VideoIframeInternal
        ref={ref}
        src="about:blank"
        makeMethodMessage={makeMethodMessageStub}
        unloadOnPause={true}
      />
    );

    const iframe = videoIframe.getDOMNode();
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

    ref.current.pause();
    expect(iframeSrcSetterSpy).to.be.calledOnce;
    expect(makeMethodMessageStub).to.not.be.calledWith('pause');
  });

  describe('uses playerStateRef to read the imperative state', () => {
    const makeMethodMessage = (method) => ({makeMethodMessageFor: method});

    it('should NOT fail when player state is not available', () => {
      const ref = createRef();

      // no value.
      mount(
        <VideoIframeInternal
          ref={ref}
          src="about:blank"
          makeMethodMessage={makeMethodMessage}
        />
      );
      expect(ref.current.currentTime).to.be.NaN;
      expect(ref.current.duration).to.be.NaN;

      // null value.
      const playerStateRef = createRef();
      mount(
        <VideoIframeInternal
          ref={ref}
          src="about:blank"
          makeMethodMessage={makeMethodMessage}
          playerStateRef={playerStateRef}
        />
      );
      expect(ref.current.currentTime).to.be.NaN;
      expect(ref.current.duration).to.be.NaN;

      // empty value.
      playerStateRef.current = {};
      mount(
        <VideoIframeInternal
          ref={ref}
          src="about:blank"
          makeMethodMessage={makeMethodMessage}
          playerStateRef={playerStateRef}
        />
      );
      expect(ref.current.currentTime).to.be.NaN;
      expect(ref.current.duration).to.be.NaN;
    });

    it('should return the provided player state', () => {
      const ref = createRef();
      const playerStateRef = createRef();
      playerStateRef.current = {duration: 111, currentTime: 11};
      mount(
        <VideoIframeInternal
          ref={ref}
          src="about:blank"
          makeMethodMessage={makeMethodMessage}
          playerStateRef={playerStateRef}
        />
      );
      expect(ref.current.currentTime).to.equal(11);
      expect(ref.current.duration).to.equal(111);

      // 0-values are ok.
      playerStateRef.current = {duration: 0, currentTime: 0};
      expect(ref.current.currentTime).to.equal(0);
      expect(ref.current.duration).to.equal(0);
    });
  });

  describe('uses makeMethodMessage to post imperative handle methods', () => {
    ['play', 'pause'].forEach((method) => {
      it(`with \`${method}\``, async () => {
        let videoIframeRef;

        const makeMethodMessage = (method) => ({makeMethodMessageFor: method});

        const makeMethodMessageSpy = env.sandbox.spy(makeMethodMessage);

        const videoIframe = mount(
          <VideoIframeInternal
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
