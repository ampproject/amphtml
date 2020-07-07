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

import '../amp-speechkit';
import {createElementWithAttributes} from '../../../../src/dom';

describes.realWin(
  'amp-speechkit',
  {
    amp: {
      runtimeOn: true,
      extensions: ['amp-speechkit'],
    },
  },
  (env) => {
    const podcastEmbedUrlWithPodcastId =
      'https://staging.spkt.io/amp/3311?podcast_id=281062';
    const podcastEmbedUrlWithExternalId =
      'https://staging.spkt.io/amp/3311?external_id=778015';
    const podcastEmbedUrlWithArticleUrl = `https://staging.spkt.io/amp/3311?article_url=${encodeURIComponent(
      'https://www.kicker.de/778015/artikel/nach_knieverletzung_maupay_wehrt_sich_gegen_lenos_vorwuerfe#omrss'
    )}`;
    let win;
    let element;

    beforeEach(() => {
      win = env.win;
    });

    const getSpeechkitPlayer = (projectId, opt_attrs = {}) => {
      element = createElementWithAttributes(win.document, 'amp-speechkit', {
        height: 40,
        layout: 'fixed-height',
        'data-projectid': projectId,
        ...opt_attrs,
      });
      win.document.body.appendChild(element);

      return element
        .build()
        .then(() => element.layoutCallback())
        .then(() => element);
    };

    it('renders player with data-podcastid', async () => {
      await getSpeechkitPlayer(3311, {'data-podcastid': 281062});
      const iframe = element.firstChild;
      expect(iframe).to.not.be.null;
      expect(iframe.tagName).to.equal('IFRAME');
      expect(iframe.src).to.equal(podcastEmbedUrlWithPodcastId);
    });

    it('renders player with data-externalid', async () => {
      await getSpeechkitPlayer(3311, {'data-externalid': 778015});
      const iframe = element.firstChild;
      expect(iframe).to.not.be.null;
      expect(iframe.tagName).to.equal('IFRAME');
      expect(iframe.src).to.equal(podcastEmbedUrlWithExternalId);
    });

    it('renders player with data-articleurl', async () => {
      await getSpeechkitPlayer(3311, {
        'data-articleurl':
          'https://www.kicker.de/778015/artikel/nach_knieverletzung_maupay_wehrt_sich_gegen_lenos_vorwuerfe#omrss',
      });
      const iframe = element.firstChild;
      expect(iframe).to.not.be.null;
      expect(iframe.tagName).to.equal('IFRAME');
      expect(iframe.src).to.equal(podcastEmbedUrlWithArticleUrl);
    });

    it('renders without data-projectid', async () => {
      expectAsyncConsoleError(/data-projectid is required for/);
      await expect(getSpeechkitPlayer('')).to.be.rejectedWith(
        /data-projectid is required for/
      );
    });

    it('renders without data-podcastid', async () => {
      expectAsyncConsoleError(
        /data-podcastid or data-externalid or data-articleurl is required for/
      );
      await expect(getSpeechkitPlayer(3311)).to.be.rejectedWith(
        /data-podcastid or data-externalid or data-articleurl is required for/
      );
    });
  }
);
