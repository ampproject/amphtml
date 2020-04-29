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

import {data} from './testdata/valid_css_at_rules_amp.reserialized';
import {getAmpAdMetadata} from '../amp-ad-utils';

describe('getAmpAdMetadata', () => {
  it('should parse metadata successfully', () => {
    const creativeMetadata = getAmpAdMetadata(data.reserialized);
    expect(creativeMetadata).to.be.ok;
    expect(creativeMetadata.minifiedCreative).to.equal(data.minifiedCreative);
    expect(creativeMetadata.customElementExtensions.length).to.equal(1);
    expect(creativeMetadata.customElementExtensions[0]).to.equal('amp-font');
    expect(creativeMetadata.customStylesheets.length).to.equal(1);
    expect(creativeMetadata.customStylesheets[0]).to.deep.equal({
      'href': 'https://fonts.googleapis.com/css?family=Questrial',
    });
    expect(creativeMetadata.images).to.not.be.ok;
  });

  it('should parse metadata despite missing offsets', () => {
    const creativeMetadata = getAmpAdMetadata(data.reserializedMissingOffset);
    expect(creativeMetadata).to.be.ok;
    expect(creativeMetadata.minifiedCreative).to.equal(data.minifiedCreative);
    expect(creativeMetadata.customElementExtensions.length).to.equal(1);
    expect(creativeMetadata.customElementExtensions[0]).to.equal('amp-font');
    expect(creativeMetadata.customStylesheets.length).to.equal(1);
    expect(creativeMetadata.customStylesheets[0]).to.deep.equal({
      'href': 'https://fonts.googleapis.com/css?family=Questrial',
    });
    expect(creativeMetadata.images).to.not.be.ok;
  });

  it('should return null -- bad offset', () => {
    const creativeMetadata = getAmpAdMetadata(data.reserializedInvalidOffset);
    expect(creativeMetadata).to.be.null;
  });

  it('should return null -- missing closing script tag', () => {
    const creativeMetadata = getAmpAdMetadata(
      data.reserializedMissingScriptTag
    );
    expect(creativeMetadata).to.be.null;
  });
});
