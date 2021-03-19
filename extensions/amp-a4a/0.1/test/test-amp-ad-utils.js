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
import {
  extensionsHasElement,
  getAmpAdMetadata,
  getExtensionsFromMetadata,
  mergeExtensionsMetadata,
} from '../amp-ad-utils';

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

describe('mergeExtensionsMetadata', () => {
  it('should add els that exist in customElementExtensions but not extensions', () => {
    const customElementExtensions = ['amp-analytics'];
    const extensions = [];
    mergeExtensionsMetadata(extensions, customElementExtensions);
    expect(extensions).to.have.lengthOf(1);
    expect(extensions).to.deep.include({
      'custom-element': 'amp-analytics',
      'src': 'https://cdn.ampproject.org/v0/amp-analytics-0.1.js',
    });
  });

  it('should ignore elements that already exist in extensions', () => {
    const customElementExtensions = ['amp-analytics', 'amp-foo'];
    const extensions = [
      {
        'custom-element': 'amp-analytics',
        'src': 'https://cdn.ampproject.org/v0/amp-analytics-latest.js',
      },
    ];
    mergeExtensionsMetadata(extensions, customElementExtensions);
    expect(extensions).to.have.lengthOf(2);
    expect(extensions).to.deep.include({
      'custom-element': 'amp-analytics',
      'src': 'https://cdn.ampproject.org/v0/amp-analytics-latest.js',
    });
    expect(extensions).to.deep.include({
      'custom-element': 'amp-foo',
      'src': 'https://cdn.ampproject.org/v0/amp-foo-0.1.js',
    });
  });
});

describe('extensionsHasElement', () => {
  it('should return true if containing extension', () => {
    const extensions = [
      {
        'custom-element': 'amp-cats',
        src: 'https://cdn.ampproject.org/v0/amp-cats-0.1.js',
      },
    ];
    expect(extensionsHasElement(extensions, 'amp-cats')).to.be.true;
  });

  it('should return false if it does not contain extension', () => {
    const extensions = [
      {
        'custom-element': 'amp-cats',
        src: 'https://cdn.ampproject.org/v0/amp-cats-0.1.js',
      },
    ];
    expect(extensionsHasElement(extensions, 'amp-dogs')).to.be.false;
  });

  it('should return false if empty array', () => {
    const extensions = [];
    expect(extensionsHasElement(extensions, 'amp-dogs')).to.be.false;
  });
});

describe('getExtensionsFromMetadata', () => {
  it('should return extension name and version', () => {
    const metadata = {
      extensions: [
        {
          'custom-element': 'amp-analytics',
          'src': 'https://cdn.ampproject.org/v0/amp-analytics-0.1.js',
        },
        {
          'custom-element': 'amp-mustache',
          'src': 'https://cdn.ampproject.org/v0/amp-mustache-1.0.js',
        },
      ],
    };
    const extensions = getExtensionsFromMetadata(metadata);
    expect(extensions).to.deep.include({
      extensionId: 'amp-analytics',
      extensionVersion: '0.1',
    });
    expect(extensions).to.deep.include({
      extensionId: 'amp-mustache',
      extensionVersion: '1.0',
    });
  });

  it('should handle no `extensions` key in metadata', () => {
    const metadata = {};
    const extensions = getExtensionsFromMetadata(metadata);
    expect(extensions).to.eql([]);
  });
});
