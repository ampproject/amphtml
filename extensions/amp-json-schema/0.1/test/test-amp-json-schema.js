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
import {AmpJsonSchema} from '../amp-json-schema';

describes.fakeWin('AmpJsonSchema', {
  amp: true,
  location: 'https://pub.com/doc1',
}, env => {

  let document;
  let jsonSchemaService;
  beforeEach(() => {
    document = env.win.document;

    const element = document.createElement('script');
    element.setAttribute('id', 'premutate');
    element.setAttribute('type', 'application/schema+json');

    const schema = {
      'type': 'object',
      'properties': {
        'shoeType': {
          'type': 'string',
        },
      },
      'required': ['shoeType'],
      'additionalProperties': false,
    };
    element.textContent = JSON.stringify(schema);
    document.body.appendChild(element);
    jsonSchemaService = new AmpJsonSchema(env.ampdoc);

  });

  it('Validate should return true if valid data', () => {
    expect(jsonSchemaService.validate('premutate', {shoeType: 'jordans'}))
        .to.be.true;
  });

  it('Validate should fail if data does not match schema', () => {
    allowConsoleError(() => {
      expect(jsonSchemaService.validate('premutate', {cat: 'hat'})).to.be.false;
    });
  });

  it('Validate should fail is schema has not been defined', () => {
    allowConsoleError(() => {
      expect(jsonSchemaService.validate('test', {cat: 'hat'})).to.be.false;
    });
  });

  it('Validate should fail if JSON Parse fails', () => {
    const element = document.createElement('script');
    element.setAttribute('id', 'test');
    element.setAttribute('type', 'application/schema+json');

    element.textContent = '{asdf';
    document.body.appendChild(element);
    allowConsoleError(() => {
      expect(jsonSchemaService.validate('test', {cat: 'hat'})).to.be.false;
    });
  });
});
