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

import {AmpCacheUrlService} from '../amp-cache-url';

describes.fakeWin(
  'amp-cache-url',
  {amp: {extensions: ['amp-cache-url']}},
  () => {
    it('should return a cached url', async () => {
      const cacheUrlService = new AmpCacheUrlService();
      const result = await cacheUrlService.createCacheUrl(
        'https://amp.dev/stories'
      );
      expect(result).to.equal(
        'https://amp-dev.cdn.ampproject.org/c/s/amp.dev/stories'
      );
    });

    it('should not throw with empty url', async () => {
      const cacheUrlService = new AmpCacheUrlService();
      expect(
        async () => await cacheUrlService.createCacheUrl('')
      ).to.not.throw();
    });

    it('should not throw with invalid url', async () => {
      const cacheUrlService = new AmpCacheUrlService();
      expect(
        async () => await cacheUrlService.createCacheUrl('invalid url')
      ).to.not.throw();
    });
  }
);
