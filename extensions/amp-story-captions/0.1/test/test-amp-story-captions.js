/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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

import '../amp-story-captions';
import {createElementWithAttributes} from '#core/dom';

const BLANK_VIDEO =
  'data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAAAIZnJlZQAABDBtZGF0AAACsAYF//+s3EXpvebZSLeWLNgg2SPu73gyNjQgLSBjb3JlIDE1NSByMjkxNyAwYTg0ZDk4IC0gSC4yNjQvTVBFRy00IEFWQyBjb2RlYyAtIENvcHlsZWZ0IDIwMDMtMjAxOCAtIGh0dHA6Ly93d3cudmlkZW9sYW4ub3JnL3gyNjQuaHRtbCAtIG9wdGlvbnM6IGNhYmFjPTEgcmVmPTMgZGVibG9jaz0xOi0zOi0zIGFuYWx5c2U9MHgzOjB4MTEzIG1lPWhleCBzdWJtZT03IHBzeT0xIHBzeV9yZD0yLjAwOjAuNzAgbWl4ZWRfcmVmPTEgbWVfcmFuZ2U9MTYgY2hyb21hX21lPTEgdHJlbGxpcz0xIDh4OGRjdD0xIGNxbT0wIGRlYWR6b25lPTIxLDExIGZhc3RfcHNraXA9MSBjaHJvbWFfcXBfb2Zmc2V0PS00IHRocmVhZHM9MSBsb29rYWhlYWRfdGhyZWFkcz0xIHNsaWNlZF90aHJlYWRzPTAgbnI9MCBkZWNpbWF0ZT0xIGludGVybGFjZWQ9MCBibHVyYXlfY29tcGF0PTAgY29uc3RyYWluZWRfaW50cmE9MCBiZnJhbWVzPTMgYl9weXJhbWlkPTIgYl9hZGFwdD0xIGJfYmlhcz0wIGRpcmVjdD0xIHdlaWdodGI9MSBvcGVuX2dvcD0wIHdlaWdodHA9MiBrZXlpbnQ9MjUwIGtleWludF9taW49MjUgc2NlbmVjdXQ9NDAgaW50cmFfcmVmcmVzaD0wIHJjX2xvb2thaGVhZD00MCByYz1jcmYgbWJ0cmVlPTEgY3JmPTIzLjAgcWNvbXA9MC42MCBxcG1pbj0wIHFwbWF4PTY5IHFwc3RlcD00IGlwX3JhdGlvPTEuNDAgYXE9MToxLjIwAIAAAAAQZYiEABHOf/73iB8yy2+ceQAAAAlBmiRsQRzn/uAAAAAJQZ5CeIdnP7eBAAAACQGeYXRDc5+6gAAAAAkBnmNqQ3OfuoEAAAAPQZpoSahBaJlMCCOc//7hAAAAC0GehkURLDs5/7eBAAAACQGepXRDc5+6gQAAAAkBnqdqQ3OfuoAAAAAPQZqsSahBbJlMCCOc//7gAAAAC0GeykUVLDs5/7eBAAAACQGe6XRDc5+6gAAAAAkBnutqQ3OfuoAAAAAPQZrwSahBbJlMCCGc//7hAAAAC0GfDkUVLDs5/7eBAAAACQGfLXRDc5+6gQAAAAkBny9qQ3OfuoAAAAAPQZs0SahBbJlMCH5z//7gAAAAC0GfUkUVLDs5/7eBAAAACQGfcXRDc5+6gAAAAAkBn3NqQ3OfuoAAAAAPQZt4SahBbJlMCG5z//7hAAAAC0GflkUVLDs5/7eAAAAACQGftXRDc5+6gQAAAAkBn7dqQ3OfuoEAAARPbW9vdgAAAGxtdmhkAAAAAAAAAAAAAAAAAAAD6AAAA+gAAQAAAQAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAA3l0cmFrAAAAXHRraGQAAAADAAAAAAAAAAAAAAABAAAAAAAAA+gAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAABAAAAAAAIAAAACAAAAAAAkZWR0cwAAABxlbHN0AAAAAAAAAAEAAAPoAAAEAAABAAAAAALxbWRpYQAAACBtZGhkAAAAAAAAAAAAAAAAAAAyAAAAMgBVxAAAAAAALWhkbHIAAAAAAAAAAHZpZGUAAAAAAAAAAAAAAABWaWRlb0hhbmRsZXIAAAACnG1pbmYAAAAUdm1oZAAAAAEAAAAAAAAAAAAAACRkaW5mAAAAHGRyZWYAAAAAAAAAAQAAAAx1cmwgAAAAAQAAAlxzdGJsAAAAqHN0c2QAAAAAAAAAAQAAAJhhdmMxAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAIAAgBIAAAASAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGP//AAAAMmF2Y0MBZAAK/+EAGWdkAAqs2V+IiMBEAAADAAQAAAMAyDxIllgBAAZo6+PEyEwAAAAQcGFzcAAAAAEAAAABAAAAGHN0dHMAAAAAAAAAAQAAABkAAAIAAAAAFHN0c3MAAAAAAAAAAQAAAAEAAADYY3R0cwAAAAAAAAAZAAAAAQAABAAAAAABAAAKAAAAAAEAAAQAAAAAAQAAAAAAAAABAAACAAAAAAEAAAoAAAAAAQAABAAAAAABAAAAAAAAAAEAAAIAAAAAAQAACgAAAAABAAAEAAAAAAEAAAAAAAAAAQAAAgAAAAABAAAKAAAAAAEAAAQAAAAAAQAAAAAAAAABAAACAAAAAAEAAAoAAAAAAQAABAAAAAABAAAAAAAAAAEAAAIAAAAAAQAACgAAAAABAAAEAAAAAAEAAAAAAAAAAQAAAgAAAAAcc3RzYwAAAAAAAAABAAAAAQAAABkAAAABAAAAeHN0c3oAAAAAAAAAAAAAABkAAALIAAAADQAAAA0AAAANAAAADQAAABMAAAAPAAAADQAAAA0AAAATAAAADwAAAA0AAAANAAAAEwAAAA8AAAANAAAADQAAABMAAAAPAAAADQAAAA0AAAATAAAADwAAAA0AAAANAAAAFHN0Y28AAAAAAAAAAQAAADAAAABidWR0YQAAAFptZXRhAAAAAAAAACFoZGxyAAAAAAAAAABtZGlyYXBwbAAAAAAAAAAAAAAAAC1pbHN0AAAAJal0b28AAAAdZGF0YQAAAAEAAAAATGF2ZjU4LjIwLjEwMA==';

describes.realWin(
  'amp-story-captions',
  {
    amp: {
      runtimeOn: true,
      extensions: ['amp-story-captions'],
    },
  },
  (env) => {
    let win;
    let element;

    beforeEach(() => {
      win = env.win;
      element = createElementWithAttributes(
        win.document,
        'amp-story-captions',
        {
          layout: 'fixed-height',
          height: '100px',
        }
      );
      win.document.body.appendChild(element);
    });

    async function setUpVideoWithCaptions() {
      await element.whenBuilt();
      const impl = await element.getImpl();

      const video = createElementWithAttributes(win.document, 'video', {
        'width': '100',
        'height': '100',
        'muted': '',
        'src': BLANK_VIDEO,
      });
      win.document.body.appendChild(video);

      video.play();
      video.pause();

      // Wait for loadedmetadata event to fire.
      await new Promise((resolve) => {
        video.addEventListener('loadedmetadata', resolve);
      });

      // Add captions to the video.
      const track = video.addTextTrack('captions', 'English', 'en');
      track.mode = 'showing';
      track.addCue(new VTTCue(0, 0.1, 'first caption'));
      track.addCue(new VTTCue(0.4, 1, 'second caption'));

      impl.setVideoElement(video);
      expect(element.querySelector('div').textContent).to.equal(
        'first caption'
      );
      return video;
    }

    it('should be empty when built', async () => {
      await element.whenBuilt();
      expect(element.querySelector('div').textContent).to.equal('');
    });

    it('update on cuechange', async () => {
      const video = await setUpVideoWithCaptions();

      video.currentTime = 0.5;
      await new Promise((resolve) => {
        video.addEventListener('timeupdate', resolve);
      });
      expect(element.querySelector('div').textContent).to.equal(
        'second caption'
      );
    });

    it('should apply preset when attribute is present and value is valid', async () => {
      element.setAttribute('style-preset', 'default');
      await setUpVideoWithCaptions();
      expect(element.querySelector('.amp-story-captions-default')).to.exist;
    });

    it('should not apply preset when attribute value is invalid', async () => {
      element.setAttribute('style-preset', 'dflt');
      await setUpVideoWithCaptions();
      expect(element.querySelector('.amp-story-captions-default')).to.be.null;
    });
  }
);
