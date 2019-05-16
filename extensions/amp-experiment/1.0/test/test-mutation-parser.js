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

  function setupMutationSelector() {
    const targetId = 'mutation-parser-test';
    const targetElement = createElementWithAttributes(doc, 'div', {
      'id': targetId,
    });

    doc.body.appendChild(targetElement);

    return `#${targetId}`;
  }

  function getAttributeMutation(opt_attributeName, opt_value) {
    const selector = setupMutationSelector();

    return {
      type: 'attributes',
      target: selector,
      attributeName: opt_attributeName || 'style',
      value: opt_value || 'color: #FF0000',
    };
  }

  function getCharacterDataMutation(opt_value) {
    const selector = setupMutationSelector();

    return {
      type: 'characterData',
      target: selector,
      value: opt_value || 'Testing...',
    };
  }

  it('should allow a valid mutation', () => {
    const mutation = getAttributeMutation();
    const mutationOperation = parseMutation(mutation, doc);
    expect(mutationOperation).to.be.ok;
  });

  it('should error when no mutation', () => {
    allowConsoleError(() => {
      expect(() => {
        parseMutation(undefined, doc);
      }).to.throw(/object/);
    });
  });

  it('should error when no type', () => {
    const mutation = getAttributeMutation();
    delete mutation['type'];
    allowConsoleError(() => {
      expect(() => {
        parseMutation(mutation, doc);
      }).to.throw(/type/);
    });
  });

  it('should error when invalid type', () => {
    const mutation = getAttributeMutation();
    mutation['type'] = 'test';
    allowConsoleError(() => {
      expect(() => {
        parseMutation(mutation, doc);
      }).to.throw(/type/);
    });
  });

  it('should error when no target', () => {
    const mutation = getAttributeMutation();
    delete mutation['target'];
    allowConsoleError(() => {
      expect(() => {
        parseMutation(mutation, doc);
      }).to.throw(/target/);
    });
  });

  it('should error when no target element', () => {
    const mutation = getAttributeMutation();
    doc.body.querySelector(mutation['target']).remove();
    allowConsoleError(() => {
      expect(() => {
        parseMutation(mutation, doc);
      }).to.throw(/selector/);
    });
  });

  describe('attributes', () => {
    it('should allow a valid attributes mutation', () => {
      const mutation = getAttributeMutation();
      const mutationOperation = parseMutation(mutation, doc);
      expect(mutationOperation).to.be.ok;
    });

    it('should error when no value', () => {
      const mutation = getAttributeMutation();
      delete mutation['value'];
      allowConsoleError(() => {
        expect(() => {
          parseMutation(mutation, doc);
        }).to.throw(/value/);
      });
    });

    it('should error when no attributeName', () => {
      const mutation = getAttributeMutation();
      delete mutation['attributeName'];
      allowConsoleError(() => {
        expect(() => {
          parseMutation(mutation, doc);
        }).to.throw(/attributeName/);
      });
    });

    it('should error when unallowed attributeName', () => {
      const mutation = getAttributeMutation('test');
      allowConsoleError(() => {
        expect(() => {
          parseMutation(mutation, doc);
        }).to.throw(/attributeName/);
      });
    });

    it('should error when unallowed style', () => {
      const mutation = getAttributeMutation('style', 'position: fixed');
      allowConsoleError(() => {
        expect(() => {
          parseMutation(mutation, doc);
        }).to.throw(/value/);
      });
    });

    it('should error when unallowed src', () => {
      const mutation = getAttributeMutation('src', 'http://amp.dev');
      allowConsoleError(() => {
        expect(() => {
          parseMutation(mutation, doc);
        }).to.throw(/value/);
      });
    });

    it('should error when unallowed href', () => {
      const mutation = getAttributeMutation('href', 'http://amp.dev');
      allowConsoleError(() => {
        expect(() => {
          parseMutation(mutation, doc);
        }).to.throw(/value/);
      });
    });

    it(
      'should return an operation that,' + ' changes attribute of selector',
      () => {
        const expectedStyle = 'color: #FFF';
        const mutation = getAttributeMutation('style', expectedStyle);
        const mutationOperation = parseMutation(mutation, doc);

        mutationOperation();

        expect(
          doc.querySelector(mutation['target']).getAttribute('style')
        ).to.be.equal(expectedStyle);
      }
    );
  });

  describe('characterData', () => {
    it('should allow valid characterData mutation', () => {
      const mutation = getCharacterDataMutation();
      const mutationOperation = parseMutation(mutation, doc);
      expect(mutationOperation).to.be.ok;
    });

    it('should error when no value', () => {
      const mutation = getCharacterDataMutation();
      delete mutation['value'];
      allowConsoleError(() => {
        expect(() => {
          parseMutation(mutation, doc);
        }).to.throw(/value/);
      });
    });

    it(
      'should return an operation that,' + ' changes textContent of selector',
      () => {
        const expectedTextContent = 'Expected';
        const mutation = getCharacterDataMutation(expectedTextContent);
        const mutationOperation = parseMutation(mutation, doc);

        mutationOperation();

        expect(doc.querySelector(mutation['target']).textContent).to.be.equal(
          expectedTextContent
        );
      }
    );
  });
});
