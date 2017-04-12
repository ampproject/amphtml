/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import {getAttributesFromConfigObj} from '../attributes';

describe('attributes', () => {

  it('should ignore attributes field if an array', () => {
    const configObj = {
      attributes: [
        'val1',
        'val2',
      ],
    };

    expect(getAttributesFromConfigObj(configObj)).to.deep.equal({});
  });

  it('should get only whitelisted attributes', () => {
    const configObj = {
      attributes: {
        'not-allowed': 'val1',
        'type': 'val2',
        'layout': 'val3',
        '-key': 'val4',
        'data-something': 'val5',
        'data-1234': 'val6',
      },
    };

    expect(getAttributesFromConfigObj(configObj)).to.deep.equal({
      'type': 'val2',
      'data-something': 'val5',
      'data-1234': 'val6',
    });
  });

  it('should accept number values', () => {
    const configObj = {
      attributes: {
        'data-key': 1,
      },
    };
    expect(getAttributesFromConfigObj(configObj)).to.deep.equal({
      'data-key': '1',
    });
  });

  it('should accept string values', () => {
    const configObj = {
      attributes: {
        'data-key': 'one',
      },
    };
    expect(getAttributesFromConfigObj(configObj)).to.deep.equal({
      'data-key': 'one',
    });
  });

  it('should accept boolean values', () => {
    const configObj = {
      attributes: {
        'data-key1': true,
        'data-key2': false,
      },
    };
    expect(getAttributesFromConfigObj(configObj)).to.deep.equal({
      'data-key1': 'true',
      'data-key2': 'false',
    });
  });

  it('should not accept non-(number, string or boolean values)', () => {
    const configObj = {
      attributes: {
        'data-key1': {},
        'data-key2': [],
      },
    };
    expect(getAttributesFromConfigObj(configObj)).to.deep.equal({});
  });
});
