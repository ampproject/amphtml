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

import * as AttributeAllowList from '../attribute-allow-list/attribute-allow-list';
import {createElementWithAttributes} from '../../../../src/dom';
import {parseMutation} from '../mutation-parser';

describes.realWin('amp-experiment mutation-parser', {}, env => {
  let win, doc;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
  });

  function setupMutationSelector(opt_numberOfElements) {
    const targetClass = 'mutation-parser-test';

    if (!opt_numberOfElements || opt_numberOfElements < 1) {
      opt_numberOfElements = 1;
    }

    for (let i = 0; i < opt_numberOfElements; i++) {
      const targetElement = createElementWithAttributes(doc, 'div', {
        'class': targetClass,
      });

      doc.body.appendChild(targetElement);
    }

    return `.${targetClass}`;
  }

  function getAttributeMutation(opt_attributeName, opt_value, opt_numberOfElements) {
    const selector = setupMutationSelector(opt_numberOfElements);

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
    const mutationRecord = parseMutation(mutation, doc);
    expect(mutationRecord).to.be.ok;
    expect(mutationRecord.mutations.length).to.be.equal(1);
  });

  it('should select multiple elements from a selector', () => {
    const numberOfMutations = 10;
    const mutation = getAttributeMutation(undefined, undefined, numberOfMutations);
    const mutationRecord = parseMutation(mutation, doc);
    expect(mutationRecord).to.be.ok;
    expect(mutationRecord.mutations.length).to.be.equal(numberOfMutations);
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

      expectAsyncConsoleError(/attributeName/);
      try {
        parseMutation(mutation, doc);
        expect(false).to.be.ok;
      } catch (e) {
        expect(e.message).to.match(/attributeName/);
      }
    });

    it('should error when unallowed attributeName', () => {
      const mutation = getAttributeMutation('test');
      allowConsoleError(() => {
        expect(() => {
          parseMutation(mutation, doc);
        }).to.throw(/attributeName/);
      });
    });

    it('should validate the value', () => {
      const validateStub = sandbox.stub().returns(true);
      sandbox
        .stub(AttributeAllowList, 'getAllowedAttributeMutationEntry')
        .returns({
          validate: validateStub,
          mutate: () => {},
        });

      const mutation = getAttributeMutation();
      const mutationOperation = parseMutation(mutation, doc);
      expect(mutationOperation).to.be.ok;

      expect(validateStub).to.be.calledOnce;
    });

    it('should not allow an invalid value', () => {
      const validateStub = sandbox.stub().returns(false);
      sandbox
        .stub(AttributeAllowList, 'getAllowedAttributeMutationEntry')
        .returns({
          validate: validateStub,
          mutate: () => {},
        });

      expectAsyncConsoleError(/value/);
      try {
        const mutation = getAttributeMutation();
        parseMutation(mutation, doc);
        expect(false).to.be.ok;
      } catch (e) {
        expect(e.message).to.match(/value/);
      }
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

    it('should return a mutation recrord that, ' +
      'has mutatations to change the attribute of a selector', () => {
      const expectedStyle = 'color: #FFF';
      const mutation = getAttributeMutation('style', expectedStyle);
      const mutationRecord = parseMutation(mutation, doc);

      mutationRecord.mutations.forEach(mutationFunction => {
        mutationFunction();
      });

      expect(
        doc.querySelector(mutation['target']).getAttribute('style')
      ).to.be.equal(expectedStyle);
    });
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

    it('should return an mutation record that, ' +
      'has mutations to change textContent of a selector', () => {
      const expectedTextContent = 'Expected';
      const mutation = getCharacterDataMutation(expectedTextContent);
      const mutationRecord = parseMutation(mutation, doc);

      mutationRecord.mutations.forEach(mutationFunction => {
        mutationFunction();
      });

      expect(doc.querySelector(mutation['target']).textContent).to.be.equal(
        expectedTextContent
      );
    });
  });
});
