/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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
import {
    createIframePromise,
    doNotLoadExternalResourcesInTest,
} from '../../../../testing/iframe';
import '../amp-nexxtv-player';
import {listenOncePromise} from '../../../../src/event-helper';
import {adopt} from '../../../../src/runtime';
import {timerFor} from '../../../../src/services';
import {VideoEvents} from '../../../../src/video-interface';
import * as sinon from 'sinon';

adopt(window);

describe('amp-nexxtv-player', () => {

  let sandbox;
  const timer = timerFor(window);

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  function getNexxtv(mediaid, client) {
    return createIframePromise(true).then(iframe => {
      doNotLoadExternalResourcesInTest(iframe.win);
      const nexxtv = iframe.doc.createElement('amp-nexxtv-player');

      if (mediaid) {
        nexxtv.setAttribute('data-mediaid', mediaid);
      }
      if (client) {
        nexxtv.setAttribute('data-client', client);
      }

      // see yt test implementation
      timer.promise(50).then(() => {
        const nexxTimerIframe = nexxtv.querySelector('iframe');

        nexxtv.implementation_.handleNexxMessages_({
          origin: 'https://embed.nexx.cloud',
          source: nexxTimerIframe.contentWindow,
          data: JSON.stringify({cmd: 'onload'}),
        });
      });

      return iframe.addElement(nexxtv);
    });
  }

  it('renders nexxtv video player', () => {
    return getNexxtv('PTPFEC4U184674', '583').then(nexxtv => {
      const playerIframe = nexxtv.querySelector('iframe');

      expect(playerIframe).to.not.be.null;
      expect(playerIframe.src).to.equal('https://embed.nexx.cloud/583/'
            + 'PTPFEC4U184674?start=0&datamode=static&amp=1');
    });
  });

  it('fails without mediaid', () => {
    return getNexxtv(null, '583').should.eventually.be.rejectedWith(
        /The data-mediaid attribute is required/);
  });

  it('fails without client', () => {
    return getNexxtv('PTPFEC4U184674', null).should.eventually.be.rejectedWith(
        /The data-client attribute is required/);
  });


  it('should forward events from nexxtv-player to the amp element', () => {
    return getNexxtv('PTPFEC4U184674', '583').then(nexxtv => {
      const iframe = nexxtv.querySelector('iframe');

      return Promise.resolve()
          .then(() => {
            const p = listenOncePromise(nexxtv, VideoEvents.PLAY);
            sendFakeMessage(nexxtv, iframe, {event: 'play'});
            return p;
          })
          .then(() => {
            const p = listenOncePromise(nexxtv, VideoEvents.MUTED);
            sendFakeMessage(nexxtv, iframe, {event: 'mute'});
            return p;
          })
          .then(() => {
            const p = listenOncePromise(nexxtv, VideoEvents.PAUSE);
            sendFakeMessage(nexxtv, iframe, {event: 'pause'});
            return p;
          })
          .then(() => {
            const p = listenOncePromise(nexxtv, VideoEvents.UNMUTED);
            sendFakeMessage(nexxtv, iframe, {event: 'unmute'});
            return p;
          });
    });
  });


  function sendFakeMessage(nexxtv, iframe, command) {
    nexxtv.implementation_.handleNexxMessages_({
      origin: 'https://embed.nexx.cloud',
      source: iframe.contentWindow,
      data: command,
    });
  }
});
