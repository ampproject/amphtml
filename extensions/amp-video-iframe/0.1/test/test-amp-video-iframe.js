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

import '../amp-video-iframe';
import {Services} from '../../../../src/services';
import {
  VideoAnalyticsEvents,
  VideoEvents,
} from '../../../../src/video-interface';
import {
  addAttributesToElement,
  whenUpgradedToCustomElement,
} from '../../../../src/dom';
import {htmlFor} from '../../../../src/static-template';
import {listenOncePromise} from '../../../../src/event-helper';
import {tryParseJson} from '../../../../src/json';

function getIntersectionMessage(id) {
  return {data: {id, method: 'getIntersection'}};
}

describes.realWin('amp-video-iframe', {
  amp: {
    extensions: ['amp-video-iframe'],
  },
}, env => {
  const {any} = sinon.match;
  const defaultFixture = 'video-iframe.html';

  let win;
  let doc;
  let videoManagerStub;

  beforeEach(() => {
    win = env.win;
    doc = win.document;

    videoManagerStub = {
      register: env.sandbox.spy(),
    };

    env.sandbox.stub(Services, 'videoManagerForDoc').returns(videoManagerStub);
  });

  function getIframeSrc(fixture = null) {
    const {port} = location;
    return (
      `http://iframe.localhost:${port}/test/fixtures/served/${
        fixture || defaultFixture}`);
  }

  const layoutConfigAttrs = size => !size ? {layout: 'fill'} : {
    layout: 'fixed',
    width: size[0],
    height: size[1],
  };

  function createVideoIframe({size, src} = {}) {
    const html = htmlFor(doc);
    const el = html`<amp-video-iframe poster=foo.png></amp-video-iframe>`;
    el.setAttribute('src', src || getIframeSrc());
    addAttributesToElement(el, layoutConfigAttrs(size));
    doc.body.appendChild(el);
    return el;
  }

  function spyDispatch(el) {
    return env.sandbox.spy(el, 'dispatchCustomEvent');
  }

  function acceptMockedMessages(videoIframe) {
    env.sandbox./*OK*/stub(videoIframe.implementation_, 'originMatches_')
        .returns(true);
  }

  function layoutAndLoad(videoIframe) {
    return whenUpgradedToCustomElement(videoIframe).then(() => {
      videoIframe.implementation_.layoutCallback();
      return listenOncePromise(videoIframe, VideoEvents.LOAD);
    });
  }

  function stubPostMessage(videoIframe) {
    return env.sandbox./*OK*/stub(videoIframe.implementation_, 'postMessage_');
  }

  function stubIntersectionEntry(element, time, intersectionRatio) {
    const entry = {time, intersectionRatio};
    env.sandbox./*OK*/stub(element, 'getIntersectionChangeEntry')
        .returns(entry);
    return entry;
  }

  describe('#layoutCallback', () => {
    it('sets metadata in iframe name', async() => {
      const metadata = {
        canonicalUrl: 'foo.html',
        sourceUrl: 'bar.html',
      };

      env.sandbox.stub(Services, 'documentInfoForDoc').returns(metadata);

      const videoIframe = createVideoIframe();

      await layoutAndLoad(videoIframe);

      const {name} = videoIframe.implementation_.iframe_;

      expect(tryParseJson(name)).to.deep.equal(metadata);
    });

    it('sets amp=1 fragment in src', async() => {
      const rawSrc = getIframeSrc();
      const videoIframe = createVideoIframe({src: rawSrc});

      await layoutAndLoad(videoIframe);

      const {src} = videoIframe.implementation_.iframe_;
      expect(src).to.equal(`${rawSrc}#amp=1`);
    });

    it('does not set amp=1 fragment in src when fragment present', async() => {
      const rawSrc = `${getIframeSrc()}#my-fragment`;
      const videoIframe = createVideoIframe({src: rawSrc});

      await layoutAndLoad(videoIframe);

      const {src} = videoIframe.implementation_.iframe_;
      expect(src).to.equal(rawSrc);
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

      trackingSizes.forEach(size => {
        const {implementation_} = createVideoIframe({size});
        allowConsoleError(() => {
          expect(() => implementation_.buildCallback()).to.throw();
        });
      });
    });
  });

  describe('#createPlaceholderCallback', () => {
    it('creates an amp-img with the poster as src', () => {
      const videoIframe = createVideoIframe();

      const placeholder =
          videoIframe.implementation_.createPlaceholderCallback();

      expect(placeholder).to.have.attribute('placeholder');
      expect(placeholder.tagName.toLowerCase()).to.equal('amp-img');
      expect(placeholder.getAttribute('layout')).to.equal('fill');
      expect(placeholder.getAttribute('src')).to.equal(
          videoIframe.getAttribute('poster'));
    });
  });

  describe('#onMessage_', () => {

    it('should load and register on canplay', async() => {
      // Fixture inside frame triggers `canplay`.
      const videoIframe = createVideoIframe();
      await layoutAndLoad(videoIframe);

      const register =
        videoManagerStub.register.withArgs(videoIframe.implementation_);

      expect(register).to.have.been.calledOnce;
    });

    it('should not dispatch invalid events', async() => {
      const videoIframe = createVideoIframe();

      await layoutAndLoad(videoIframe);

      const dispatch = spyDispatch(videoIframe);

      const invalidEvents = 'tacos al pastor'.split(' ');

      invalidEvents.forEach(event => {
        videoIframe.implementation_.onMessage_({data: {event}});
        expect(dispatch.withArgs(event)).to.not.have.been.called;
      });
    });

    it('should dispatch valid events', async() => {
      const videoIframe = createVideoIframe();

      await layoutAndLoad(videoIframe);

      const dispatch = spyDispatch(videoIframe);

      acceptMockedMessages(videoIframe);

      const validEvents = [
        VideoEvents.PLAYING,
        VideoEvents.PAUSE,
        VideoEvents.ENDED,
        VideoEvents.MUTED,
        VideoEvents.UNMUTED,
        VideoEvents.AD_START,
        VideoEvents.AD_END,
      ];

      for (let i = 0; i < validEvents.length; i++) {
        const event = validEvents[i];
        videoIframe.implementation_.onMessage_({data: {event}});
        expect(dispatch.withArgs(event)).to.have.been.calledOnce;
      }
    });

    it('should return intersection ratio if in autoplay range', async() => {
      const id = 1234;
      const time = 1.234;
      const intersectionRatio = 2 / 3;

      const videoIframe = createVideoIframe();

      await layoutAndLoad(videoIframe);

      const postMessage = stubPostMessage(videoIframe);

      acceptMockedMessages(videoIframe);

      const message = getIntersectionMessage(id);

      const expectedResponseMessage = {
        id,
        args: stubIntersectionEntry(videoIframe, time, intersectionRatio),
      };

      videoIframe.implementation_.onMessage_(message);

      expect(postMessage.withArgs(sinon.match(expectedResponseMessage)))
          .to.have.been.calledOnce;
    });

    it('should return 0 if not in autoplay range', async() => {
      const id = 1234;
      const time = 1.234;
      const intersectionRatio = 1 / 3;
      const reportedRatioShouldBe = 0;

      const videoIframe = createVideoIframe();

      await layoutAndLoad(videoIframe);

      const postMessage = stubPostMessage(videoIframe);

      stubIntersectionEntry(videoIframe, time, intersectionRatio);

      acceptMockedMessages(videoIframe);

      const message = getIntersectionMessage(id);

      const expectedResponseMessage = {
        id,
        args: {
          time,
          intersectionRatio: reportedRatioShouldBe,
        },
      };

      videoIframe.implementation_.onMessage_(message);

      expect(postMessage.withArgs(sinon.match(expectedResponseMessage)))
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
    ].forEach(({sufix, eventType, vars, accept}) => {
      const verb = accept ? 'dispatch' : 'reject';

      it(`should ${verb} custom analytics event ${sufix}`, async() => {
        const videoIframe = createVideoIframe();
        const dispatch = spyDispatch(videoIframe);

        await layoutAndLoad(videoIframe);

        acceptMockedMessages(videoIframe);

        const data = {
          event: 'analytics',
          analytics: {
            'eventType': eventType,
          },
        };

        if (vars) {
          Object.assign(data.analytics, {vars});
        }

        const {implementation_} = videoIframe;

        if (accept) {
          const expectedEventVars = {eventType, vars: vars || {}};
          const expectedDispatch =
              dispatch.withArgs(VideoAnalyticsEvents.CUSTOM, expectedEventVars);
          implementation_.onMessage_({data});
          expect(expectedDispatch).to.have.been.calledOnce;
        } else {
          allowConsoleError(() => {
            expect(() => implementation_.onMessage_({data})).to.throw();
          });
          expect(dispatch.withArgs(VideoAnalyticsEvents.CUSTOM, any))
              .to.not.have.been.called;
        }
      });
    });
  });

  describe('#mutatedAttributesCallback', () => {
    it('updates src', async() => {
      const defaultSrc = getIframeSrc(defaultFixture);
      const videoIframe = createVideoIframe({src: defaultSrc});
      const {implementation_} = videoIframe;

      await layoutAndLoad(videoIframe);

      const {iframe_} = implementation_;

      expect(iframe_.src).to.match(new RegExp(`^${defaultSrc}#`));

      const newSrc = getIframeSrc('video-iframe-2.html');

      videoIframe.setAttribute('src', newSrc);

      implementation_.mutatedAttributesCallback({'src': true});

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

  implementedVideoInterfaceMethods.forEach(method => {
    describe(`#${method}`, () => {
      const lowercaseMethod = method.toLowerCase();

      it(`should post '${lowercaseMethod}'`, async() => {
        const videoIframe = createVideoIframe();

        await layoutAndLoad(videoIframe);

        const postMessage = stubPostMessage(videoIframe);

        videoIframe.implementation_[method]();

        expect(postMessage.withArgs(sinon.match({
          event: 'method',
          method: lowercaseMethod,
        }))).to.have.been.calledOnce;
      });
    });
  });


});
