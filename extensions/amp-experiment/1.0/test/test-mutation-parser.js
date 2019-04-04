/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

import {createElementWithAttributes} from '../../../../src/dom';
import {parseMutation} from '../mutation-parser';

describes.realWin('amp-experiment mutation-parser', {}, env => {
  let win, doc;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
  });

  function getAttributeMutation() {
    const targetId = 'mutation-parser-test';
    const targetElement = createElementWithAttributes(
      doc,
      'div',
      {
        'id': targetId
      }
    );

    doc.body.appendChild(targetElement);

    return {
      type: "attributes",
      target: `#${targetId}`,
      attributeName: "style",
      value: "color: red"
    }
  }

  it('should allow a valid mutation', () => {
    const mutation = getAttributeMutation();
    const mutationOperation = parseMutation(mutation, doc);
    expect(mutationOperation).to.be.ok;
  });

  it('should error when no mutation', () => {
    allowConsoleError(() => {
      expect(() => {
        parseMutation(undefined, doc)
      }).to.throw(/object/);
    });
  });

  it('should error when no type', () => {
    const mutation = getAttributeMutation();
    delete mutation['type'];
    allowConsoleError(() => {
      expect(() => {
        parseMutation(mutation, doc)
      }).to.throw(/type/);
    });
  });

  it('should error when invalid type', () => {
    const mutation = getAttributeMutation();
    mutation['type'] = 'test';
    allowConsoleError(() => {
      expect(() => {
        parseMutation(mutation, doc)
      }).to.throw(/type/);
    });
  });

  it('should error when no target', () => {
    const mutation = getAttributeMutation();
    delete mutation['target'];
    allowConsoleError(() => {
      expect(() => {
        parseMutation(mutation, doc)
      }).to.throw(/target/);
    });
  });

  it('should error when no target element', () => {
    const mutation = getAttributeMutation();
    doc.body.querySelector(mutation['target']).remove();
    allowConsoleError(() => {
      expect(() => {
        parseMutation(mutation, doc)
      }).to.throw(/selector/);
    });
  });


});
