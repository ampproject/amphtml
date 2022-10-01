import '../amp-video-iframe';
import {createElementWithAttributes} from '#core/dom';
import {whenUpgradedToCustomElement} from '#core/dom/amp-element-helpers';

import {Services} from '#service';

import {listenOncePromise} from '#utils/event-helper';

import {macroTask} from '#testing/helpers';
import {installResizeObserverStub} from '#testing/resize-observer-stub';

import {VideoEvents_Enum} from '../../../../src/video-interface';

describes.realWin(
  'amp-video-iframe',
  {
    amp: {
      extensions: ['amp-video-iframe'],
    },
  },
  (env) => {
    const defaultFixture = 'video-iframe.html';

    let win;
    let doc;
    let videoManagerStub;
    let resizeObserverStub;

    beforeEach(() => {
      win = env.win;
      doc = win.document;

      videoManagerStub = {
        register: env.sandbox.spy(),
      };

      env.sandbox
        .stub(Services, 'videoManagerForDoc')
        .returns(videoManagerStub);
      resizeObserverStub = installResizeObserverStub(env.sandbox, win);
    });

    function getIframeSrc(fixture = null) {
      const {port} = location;
      return `http://iframe.localhost:${port}/test/fixtures/served/${
        fixture || defaultFixture
      }`;
    }

    const layoutConfigAttrs = (size) =>
      !size
        ? {layout: 'fill'}
        : {
            layout: 'fixed',
            width: size[0],
            height: size[1],
          };

    function createVideoIframe(attrs = {}, opt_size) {
      const {src = getIframeSrc(), ...rest} = attrs;
      const el = createElementWithAttributes(doc, 'amp-video-iframe', {
        src,
        ...rest,
        ...layoutConfigAttrs(opt_size),
      });
      doc.body.appendChild(el);
      return el;
    }

    async function acceptMockedMessages(videoIframe) {
      const impl = await videoIframe.getImpl(false);
      env.sandbox./*OK*/ stub(impl, 'originMatches_').returns(true);
    }

    async function layoutAndLoad(element) {
      await whenUpgradedToCustomElement(element);
      const impl = await element.getImpl(false);
      // getLayoutSize() affects looksLikeTrackingIframe().
      // Use default width/height of 100 since element is not sized
      // as expected in test fixture.
      env.sandbox.stub(element, 'getLayoutSize').returns({
        width: Number(element.getAttribute('width')) || 100,
        height: Number(element.getAttribute('height')) || 100,
      });
      impl.layoutCallback();
      return listenOncePromise(element, VideoEvents_Enum.LOAD);
    }

    async function stubPostMessage(videoIframe) {
      const impl = await videoIframe.getImpl(false);
      return env.sandbox./*OK*/ stub(impl, 'postMessage_');
    }

    function stubMeasureIntersection(target, time, intersectionRatio) {
      env.win.IntersectionObserver = (callback) => ({
        observe() {
          Promise.resolve().then(() => {
            callback([{target, time, intersectionRatio}]);
          });
        },
        unobserve() {},
        disconnect() {},
      });
    }

    describe('#layoutCallback', () => {
      it('uses data-param-* in src', async () => {
        const element = createVideoIframe({
          'data-param-vid': 'my_vid',
          'data-param-foo-bar': 'foo bar',
        });
        await layoutAndLoad(element);
        const {src} = element.querySelector('iframe');
        expect(src).to.match(/\?vid=my_vid&fooBar=foo%20bar#.*$/);
      });

      it('sets metadata in iframe name', async () => {
        const canonicalUrl = 'foo.html';
        const sourceUrl = 'bar.html';
        const title = 'My test title';
        const lang = 'es';

        env.sandbox.stub(win.document, 'title').value(title);
        env.sandbox.stub(win.document.documentElement, 'lang').value(lang);

        env.sandbox.stub(Services, 'documentInfoForDoc').returns({
          canonicalUrl,
          sourceUrl,
        });

        const videoIframe = createVideoIframe();

        await layoutAndLoad(videoIframe);

        const iframe = videoIframe.querySelector('iframe');
        expect(JSON.parse(iframe.name)).to.deep.equal({
          canonicalUrl,
          sourceUrl,
          title,
          lang,
          jsonLd: null,
        });
      });

      it('sets metadata in iframe name — with jsonLd', async () => {
        const canonicalUrl = 'foo.html';
        const sourceUrl = 'bar.html';
        const title = 'My test title';
        const lang = 'es';

        env.sandbox.stub(win.document, 'title').value(title);
        env.sandbox.stub(win.document.documentElement, 'lang').value(lang);

        env.sandbox.stub(Services, 'documentInfoForDoc').returns({
          canonicalUrl,
          sourceUrl,
        });

        const jsonLd = {jsonLd: 'blah'};
        const jsonLdScript = win.document.createElement('script');
        jsonLdScript.type = 'application/ld+json';
        jsonLdScript.text = JSON.stringify(jsonLd);

        win.document.head.appendChild(jsonLdScript);

        const videoIframe = createVideoIframe();

        await layoutAndLoad(videoIframe);

        const iframe = videoIframe.querySelector('iframe');
        expect(JSON.parse(iframe.name)).to.deep.equal({
          canonicalUrl,
          sourceUrl,
          title,
          lang,
          jsonLd,
        });
      });

      it('sets amp=1 fragment in src', async () => {
        const rawSrc = getIframeSrc();
        const videoIframe = createVideoIframe({src: rawSrc});

        await layoutAndLoad(videoIframe);

        const iframe = videoIframe.querySelector('iframe');
        expect(iframe.src).to.equal(`${rawSrc}#amp=1`);
      });

      it('does not set amp=1 fragment in src when fragment present', async () => {
        const rawSrc = `${getIframeSrc()}#my-fragment`;
        const videoIframe = createVideoIframe({src: rawSrc});

        await layoutAndLoad(videoIframe);

        const iframe = videoIframe.querySelector('iframe');
        expect(iframe.src).to.equal(rawSrc);
      });
    });

    describe('#buildCallback', () => {
      it('rejects tracking iframes', () => {
        const trackingSizes = [
          [10, 10],
          [9, 9],
          [8, 8],
          [7, 7],
          [6, 6],
          [5, 5],
          [4, 4],
          [3, 3],
          [2, 2],
          [1, 1],
        ];

        return Promise.all(
          trackingSizes.map(async (size) => {
            const videoIframe = createVideoIframe({}, size);
            const impl = await videoIframe.getImpl(false);
            allowConsoleError(() => {
              expect(() => impl.layoutCallback()).to.throw();
            });
          })
        );
      });
    });

    describe('pause', () => {
      let player, impl;
      let postMessageSpy;

      beforeEach(async () => {
        player = createVideoIframe();
        await layoutAndLoad(player);
        await acceptMockedMessages(player);
        env.sandbox.stub(player, 'isBuilt').returns(true);
        impl = await player.getImpl(false);
        postMessageSpy = await stubPostMessage(player);
      });

      it('should auto-pause when playing and no size', async () => {
        impl.onMessage_({data: {event: VideoEvents_Enum.PLAYING}});
        // First send "size" event and then "no size".
        resizeObserverStub.notifySync({
          target: player,
          borderBoxSize: [{inlineSize: 10, blockSize: 10}],
        });
        resizeObserverStub.notifySync({
          target: player,
          borderBoxSize: [{inlineSize: 0, blockSize: 0}],
        });
        await macroTask();
        expect(
          postMessageSpy.withArgs(
            env.sandbox.match({
              event: 'method',
              method: 'pause',
            })
          )
        ).to.be.calledOnce;
      });

      it('should NOT auto-pause when not playing', async () => {
        impl.onMessage_({data: {event: VideoEvents_Enum.PLAYING}});
        impl.onMessage_({data: {event: VideoEvents_Enum.PAUSE}});
        // First send "size" event and then "no size".
        resizeObserverStub.notifySync({
          target: player,
          borderBoxSize: [{inlineSize: 10, blockSize: 10}],
        });
        resizeObserverStub.notifySync({
          target: player,
          borderBoxSize: [{inlineSize: 0, blockSize: 0}],
        });
        await macroTask();
        expect(
          postMessageSpy.withArgs(
            env.sandbox.match({
              event: 'method',
              method: 'pause',
            })
          )
        ).to.not.be.called;
      });
    });

    describe('#createPlaceholderCallback', () => {
      it('does not create placeholder without poster attribute', () => {
        const placeholder = createVideoIframe().createPlaceholder();
        expect(placeholder).to.be.null;
      });

      it('creates an amp-img with the poster as src', () => {
        const poster = 'foo.bar';
        const placeholder = createVideoIframe({poster}).createPlaceholder();
        expect(placeholder).to.have.attribute('placeholder');
        expect(placeholder.tagName.toLowerCase()).to.equal('img');
        expect(placeholder).to.have.class('i-amphtml-fill-content');
        expect(placeholder.getAttribute('loading')).to.equal('lazy');
        expect(placeholder.getAttribute('src')).to.equal(poster);
      });

      it("uses data-param-* in the poster's src", () => {
        expect(
          createVideoIframe({
            poster: 'foo.png',
            'data-param-my-poster-param': 'my param',
            'data-param-another': 'value',
          })
            .createPlaceholder()
            .getAttribute('src')
        ).to.match(/foo\.png\?myPosterParam=my%20param&another=value$/);
      });
    });

    describe('#onMessage_', () => {
      it('should load and register on canplay', async () => {
        // Fixture inside frame triggers `canplay`.
        const videoIframe = createVideoIframe();
        await layoutAndLoad(videoIframe);
        const impl = await videoIframe.getImpl(false);

        const register = videoManagerStub.register.withArgs(impl);

        expect(register).to.have.been.calledOnce;
      });

      it('should not dispatch invalid events', async () => {
        const videoIframe = createVideoIframe();

        await layoutAndLoad(videoIframe);
        const impl = await videoIframe.getImpl(false);

        const invalidEvents = 'tacos al pastor'.split(' ');

        invalidEvents.forEach((event) => {
          const spy = env.sandbox.spy();
          videoIframe.addEventListener(event, spy);
          impl.onMessage_({data: {event}});
          expect(spy).to.not.have.been.called;
        });
      });

      it('should dispatch valid events', async () => {
        const videoIframe = createVideoIframe();

        await layoutAndLoad(videoIframe);

        await acceptMockedMessages(videoIframe);

        const impl = await videoIframe.getImpl(false);

        const validEvents = [
          VideoEvents_Enum.PLAYING,
          VideoEvents_Enum.PAUSE,
          VideoEvents_Enum.ENDED,
          VideoEvents_Enum.MUTED,
          VideoEvents_Enum.UNMUTED,
          VideoEvents_Enum.AD_START,
          VideoEvents_Enum.AD_END,
        ];

        for (let i = 0; i < validEvents.length; i++) {
          const event = validEvents[i];
          const spy = env.sandbox.spy();
          videoIframe.addEventListener(event, spy);
          impl.onMessage_({data: {event}});
          expect(spy).to.have.been.calledOnce;
        }
      });

      it('should return consent data on getConsentData', async () => {
        const consentString = 'foo-consentString';
        const consentMetadata = 'bar-consentMetadata';
        const consentPolicyState = 'baz-consentPolicyState';
        const consentPolicySharedData = 'foo-consentPolicySharedData';

        env.sandbox.stub(Services, 'consentPolicyServiceForDocOrNull').returns(
          Promise.resolve({
            getConsentMetadataInfo: () => Promise.resolve(consentMetadata),
            getConsentStringInfo: () => Promise.resolve(consentString),
            whenPolicyResolved: () => Promise.resolve(consentPolicyState),
            getMergedSharedData: () => Promise.resolve(consentPolicySharedData),
          })
        );

        const id = 1234;

        const videoIframe = createVideoIframe();

        await layoutAndLoad(videoIframe);

        const postMessage = await stubPostMessage(videoIframe);

        await acceptMockedMessages(videoIframe);

        const impl = await videoIframe.getImpl(false);
        impl.onMessage_({
          data: {id, method: 'getConsentData'},
        });

        await macroTask();

        expect(
          postMessage.withArgs({
            id,
            args: {
              consentString,
              consentMetadata,
              consentPolicyState,
              consentPolicySharedData,
            },
          })
        ).to.have.been.calledOnce;
      });

      it('should return intersection ratio if in autoplay range', async () => {
        const id = 1234;
        const time = 1.234;
        const intersectionRatio = 2 / 3;

        const videoIframe = createVideoIframe();

        await layoutAndLoad(videoIframe);

        const postMessage = await stubPostMessage(videoIframe);

        await acceptMockedMessages(videoIframe);

        const message = {data: {id, method: 'getIntersection'}};

        stubMeasureIntersection(videoIframe, time, intersectionRatio);
        const expectedResponseMessage = {id, args: {time, intersectionRatio}};

        const impl = await videoIframe.getImpl(false);
        await impl.onMessage_(message);

        expect(postMessage.withArgs(env.sandbox.match(expectedResponseMessage)))
          .to.have.been.calledOnce;
      });

      it('should return 0 if not in autoplay range', async () => {
        const id = 1234;
        const time = 1.234;
        const intersectionRatio = 1 / 3;
        const reportedRatioShouldBe = 0;

        const videoIframe = createVideoIframe();

        await layoutAndLoad(videoIframe);

        const postMessage = await stubPostMessage(videoIframe);

        stubMeasureIntersection(videoIframe, time, intersectionRatio);

        await acceptMockedMessages(videoIframe);

        const message = {data: {id, method: 'getIntersection'}};

        const expectedResponseMessage = {
          id,
          args: {
            time,
            intersectionRatio: reportedRatioShouldBe,
          },
        };

        const impl = await videoIframe.getImpl(false);
        await impl.onMessage_(message);

        expect(postMessage.withArgs(env.sandbox.match(expectedResponseMessage)))
          .to.have.been.calledOnce;
      });

      [
        {
          accept: true,
          sufix: 'without data',
          eventType: 'video-custom-foo',
        },
        {
          accept: true,
          sufix: 'with data',
          eventType: 'video-custom-foo',
          vars: {
            myVar: 'bar',
          },
        },
        {
          accept: false,
          eventType: 'tacos al pastor',
          sufix: 'with invalid event name',
        },
      ].forEach(({accept, eventType, sufix, vars}) => {
        const verb = accept ? 'dispatch' : 'reject';

        it(`should ${verb} custom analytics event ${sufix}`, async () => {
          const videoIframe = createVideoIframe();
          const eventSpy = env.sandbox.spy();
          videoIframe.addEventListener(VideoEvents_Enum.CUSTOM_TICK, eventSpy);

          await layoutAndLoad(videoIframe);

          await acceptMockedMessages(videoIframe);

          const data = {
            event: 'analytics',
            analytics: {
              'eventType': eventType,
            },
          };

          if (vars) {
            Object.assign(data.analytics, {vars});
          }

          const impl = await videoIframe.getImpl(false);

          if (accept) {
            const expectedEventVars = {eventType, vars: vars || {}};
            impl.onMessage_({data});
            expect(eventSpy).to.be.calledOnce;
            const eventData = eventSpy.firstCall.firstArg.data;
            expect(eventData.eventType).to.equal(expectedEventVars.eventType);
            expect(eventData.vars).to.deep.equal(expectedEventVars.vars);
          } else {
            allowConsoleError(() => {
              expect(() => impl.onMessage_({data})).to.throw();
            });
            expect(eventSpy).to.not.have.been.called;
          }
        });
      });
    });

    describe('#mutatedAttributesCallback', () => {
      it('updates src', async () => {
        const defaultSrc = getIframeSrc(defaultFixture);
        const videoIframe = createVideoIframe({src: defaultSrc});
        const impl = await videoIframe.getImpl(false);

        await layoutAndLoad(videoIframe);

        const {iframe_} = impl;

        expect(iframe_.src).to.match(new RegExp(`^${defaultSrc}#`));

        const newSrc = getIframeSrc('video-iframe-2.html');

        videoIframe.setAttribute('src', newSrc);

        impl.mutatedAttributesCallback({'src': true});

        expect(iframe_.src).to.match(new RegExp(`^${newSrc}#`));
      });
    });

    const implementedVideoInterfaceMethods = [
      'play',
      'pause',
      'mute',
      'unmute',
      'hideControls',
      'showControls',
      'fullscreenEnter',
      'fullscreenExit',
    ];

    implementedVideoInterfaceMethods.forEach((method) => {
      describe(`#${method}`, () => {
        const lowercaseMethod = method.toLowerCase();

        it(`should post '${lowercaseMethod}'`, async () => {
          const videoIframe = createVideoIframe();

          await layoutAndLoad(videoIframe);

          const postMessage = await stubPostMessage(videoIframe);

          const impl = await videoIframe.getImpl(false);
          impl[method]();

          await macroTask();

          expect(
            postMessage.withArgs(
              env.sandbox.match({
                event: 'method',
                method: lowercaseMethod,
              })
            )
          ).to.have.been.calledOnce;
        });
      });
    });
  }
);
