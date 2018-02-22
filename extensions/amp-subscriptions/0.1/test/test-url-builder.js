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

import {UrlBuilder} from '../url-builder';


describes.realWin('UrlBuilder', {amp: true}, env => {
  let ampdoc;
  let readerIdPromise;
  let urlBuilder;

  beforeEach(() => {
    ampdoc = env.ampdoc;
    readerIdPromise = Promise.resolve('reader1');
    urlBuilder = new UrlBuilder(ampdoc, readerIdPromise);
  });

  it('should resolve URL without auth response and no authdata vars', () => {
    return urlBuilder.buildUrl('?rid=READER_ID&type=AUTHDATA(child.type)',
        /* useAuthData */ false).then(url => {
      expect(url).to.equal('?rid=reader1&type=');
    });
  });

  it('should accept reader_id synonyms', () => {
    return urlBuilder.buildUrl('?rid=ACCESS_READER_ID').then(url => {
      expect(url).to.equal('?rid=reader1');
    });
  });

  it('should resolve URL without auth response and with authdata vars', () => {
    return urlBuilder.buildUrl('?rid=READER_ID&type=AUTHDATA(child.type)',
        /* useAuthData */ true).then(url => {
      expect(url).to.equal('?rid=reader1&type=');
    });
  });

  it('should resolve URL with auth response and no authdata vars', () => {
    urlBuilder.setAuthResponse({child: {type: 'premium'}});
    return urlBuilder.buildUrl('?rid=READER_ID&type=AUTHDATA(child.type)',
        /* useAuthData */ false).then(url => {
      expect(url).to.equal('?rid=reader1&type=');
    });
  });

  it('should resolve URL with auth response and with authdata vars', () => {
    urlBuilder.setAuthResponse({child: {type: 'premium'}});
    return urlBuilder.buildUrl('?rid=READER_ID&type=AUTHDATA(child.type)',
        /* useAuthData */ true).then(url => {
      expect(url).to.equal('?rid=reader1&type=premium');
    });
  });

  it('should resolve URL with unknown authdata var', () => {
    urlBuilder.setAuthResponse({child: {type: 'premium'}});
    return urlBuilder.buildUrl('?rid=READER_ID&type=AUTHDATA(child.type2)',
        /* useAuthData */ true).then(url => {
      expect(url).to.equal('?rid=reader1&type=');
    });
  });

  it('should colect URL vars with auth response and with authdata vars', () => {
    urlBuilder.setAuthResponse({child: {type: 'premium'}});
    return urlBuilder.collectUrlVars('?rid=READER_ID&type=AUTHDATA(child.type)',
        /* useAuthData */ true).then(vars => {
      expect(vars).to.deep.equal({
        'READER_ID': 'reader1',
        'AUTHDATA(child.type)': 'premium',
      });
    });
  });
});
