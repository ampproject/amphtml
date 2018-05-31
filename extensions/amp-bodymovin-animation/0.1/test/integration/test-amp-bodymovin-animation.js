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

import {AmpBodymovinAnimation} from '../../amp-bodymovin-animation';
import {poll} from '../../../../../testing/iframe';

describe.configure().ifNewChrome().run('amp-bodymovin-animation', function() {
  const extensions = ['amp-bodymovin-animation'];
  const bodymovinBody = `
    <amp-bodymovin-animation id="anim"
      layout="fixed" width="200" height="200"
      src="testresource.json">
    </amp-bodymovin-animation>
    <div id="stop" on="tap:anim.stop">Stop</div>`;
  describes.integration('amp-bodymovin-animation iframe renders', {
    body: bodymovinBody,
    extensions,
  }, () => {

    it('iframe renders', () => {
      const loadPromise = waitForAnimationLoad();
      return loadPromise.then(iframeExists => {
        expect(iframeExists).to.be.true;
      });
    });
  });

  const bodymovinNoAutoplayBody = `
    <amp-bodymovin-animation id="anim"
      layout="fixed" width="200" height="200"
      src="testresource.json"
      noautoplay>
    </amp-bodymovin-animation>
    <div id="play" on="tap:anim.play">Play</div>
    <div id="pause" on="tap:anim.pause">Pause</div>`;

  describes.integration('amp-bodymovin-animation actions work', {
    body: bodymovinNoAutoplayBody,
    extensions,
  }, env => {

    let playSpy;
    let pauseSpy;

    beforeEach(() => {
      playSpy = sandbox.spy(AmpBodymovinAnimation.prototype, 'play_');
      pauseSpy = sandbox.spy(AmpBodymovinAnimation.prototype, 'pause_');
    });


    it('play/pause actions work on `<amp-bodymovin-animation>` elements',
        () => {
          const loadPromise = waitForAnimationLoad();
          return loadPromise.then(iframeExists => {
            expect(iframeExists).to.be.true;
            const playTrigger = env.win.document.querySelector('#play');
            playTrigger.click();
            expect(playSpy).to.not.have.been.called;
            const pauseTrigger = env.win.document.querySelector('#pause');
            pauseTrigger.click();
            expect(pauseSpy).to.not.have.been.called;
          });
        });
  });

  describes.integration('amp-bodymovin-animation actions work', {
    body: bodymovinBody,
    extensions,
  }, env => {

    let stopSpy;

    beforeEach(() => {
      stopSpy = sandbox.spy(AmpBodymovinAnimation.prototype, 'stop_');
    });


    it('stop action works on `<amp-bodymovin-animation>` elements', () => {
      const loadPromise = waitForAnimationLoad();
      return loadPromise.then(iframeExists => {
        expect(iframeExists).to.be.true;
        const stopTrigger = env.win.document.querySelector('#stop');
        stopTrigger.click();
        expect(stopSpy).to.not.have.been.called;
      });
    });
  });

  const bodymovinSeekToBody = `
    <amp-bodymovin-animation id="anim"
      layout="fixed" width="200" height="200"
      src="testresource.json"
      noautoplay>
    </amp-bodymovin-animation>
    <div id="seekToHalf" on="tap:anim.seekTo(percent=0.5)">Seek to 1/2</div>`;

  describes.integration('amp-bodymovin-animation actions work', {
    body: bodymovinSeekToBody,
    extensions,
  }, env => {

    let seekToSpy;

    beforeEach(() => {
      seekToSpy = sandbox.spy(AmpBodymovinAnimation.prototype, 'seekTo_');
    });


    it('seekTo action works on `<amp-bodymovin-animation>` elements', () => {
      const loadPromise = waitForAnimationLoad();
      return loadPromise.then(iframeExists => {
        expect(iframeExists).to.be.true;
        const seekToHalfTrigger = env.win.document.querySelector('#seekToHalf');
        seekToHalfTrigger.click();
        expect(seekToSpy).to.not.have.been.called;
      });
    });
  });
});

function waitForAnimationLoad() {
  return poll('wait for iframe to load', () => {
    const iframe = document.getElementsByTagName('iframe')[0];
    return iframe !== null;
  });
}
