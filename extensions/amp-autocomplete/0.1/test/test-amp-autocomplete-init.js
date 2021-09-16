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

import '../amp-autocomplete';

describes.realWin(
  'amp-autocomplete init',
  {
    amp: {
      extensions: ['amp-autocomplete'],
    },
  },
  (env) => {
    let win, doc;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
    });

    function setupAutocomplete(
      attributes,
      json = '{ "items" : ["apple", "banana", "orange"] }',
      wantInlineData = true
    ) {
      const ampAutocomplete = doc.createElement('amp-autocomplete');
      ampAutocomplete.setAttribute('layout', 'container');
      for (const key in attributes) {
        ampAutocomplete.setAttribute(key, attributes[key]);
      }

      const input = win.document.createElement('input');
      input.setAttribute('type', 'text');
      ampAutocomplete.appendChild(input);

      if (wantInlineData) {
        const script = win.document.createElement('script');
        script.setAttribute('type', 'application/json');
        script.innerHTML = json;
        ampAutocomplete.appendChild(script);
      }

      return ampAutocomplete;
    }

    function getAutocomplete(
      attributes,
      json,
      wantInlineData,
      formAutocompleteValue = null
    ) {
      const form = doc.createElement('form');
      if (formAutocompleteValue) {
        form.setAttribute('autocomplete', formAutocompleteValue);
      }

      const ampAutocomplete = setupAutocomplete(
        attributes,
        json,
        wantInlineData
      );
      form.appendChild(ampAutocomplete);
      doc.body.appendChild(form);
      return ampAutocomplete.build().then(() => ampAutocomplete);
    }

    it('should build with "inline" and "query" when specified', () => {
      return getAutocomplete({
        'filter': 'substring',
        'query': 'q',
      }).then((ampAutocomplete) => {
        const impl = ampAutocomplete.implementation_;
        expect(impl.queryKey_).to.equal('q');
      });
    });

    it('should layout', () => {
      let impl, autocompleteSpy, clearAllSpy, filterSpy, renderSpy;
      return getAutocomplete({
        'filter': 'substring',
      })
        .then((ampAutocomplete) => {
          impl = ampAutocomplete.implementation_;
          const expectedItems = ['apple', 'banana', 'orange'];
          expect(impl.sourceData_).to.have.ordered.members(expectedItems);
          expect(impl.inputElement_).not.to.be.null;
          expect(impl.container_).not.to.be.null;
          expect(impl.filter_).to.equal('substring');
          autocompleteSpy = env.sandbox.spy(impl, 'autocomplete_');
          clearAllSpy = env.sandbox.spy(impl, 'clearAllItems_');
          filterSpy = env.sandbox.spy(impl, 'filterData_');
          renderSpy = env.sandbox.spy(impl, 'renderResults_');
          return ampAutocomplete.layoutCallback();
        })
        .then(() => {
          expect(impl.inputElement_.hasAttribute('autocomplete')).to.be.true;
          expect(autocompleteSpy).to.have.been.calledOnce;
          expect(clearAllSpy).to.have.been.calledOnce;
          expect(filterSpy).not.to.have.been.called;
          expect(renderSpy).not.to.have.been.called;
        });
    });

    it('should render inline data before first user interaction', () => {
      let impl, filterAndRenderSpy, clearAllSpy, filterSpy, renderSpy;
      return getAutocomplete({
        'filter': 'substring',
        'min-characters': '0',
      })
        .then((ampAutocomplete) => {
          impl = ampAutocomplete.implementation_;
          const expectedItems = ['apple', 'banana', 'orange'];
          expect(impl.sourceData_).to.have.ordered.members(expectedItems);
          expect(impl.inputElement_).not.to.be.null;
          expect(impl.container_).not.to.be.null;
          expect(impl.filter_).to.equal('substring');
          filterAndRenderSpy = env.sandbox.spy(
            impl,
            'filterDataAndRenderResults_'
          );
          clearAllSpy = env.sandbox.spy(impl, 'clearAllItems_');
          filterSpy = env.sandbox.spy(impl, 'filterData_');
          renderSpy = env.sandbox.spy(impl, 'renderResults_');
          return ampAutocomplete.layoutCallback();
        })
        .then(() => {
          expect(impl.inputElement_.hasAttribute('autocomplete')).to.be.true;
          expect(filterAndRenderSpy).to.have.been.calledOnce;
          expect(clearAllSpy).to.have.been.calledOnce;
          expect(filterSpy).to.have.been.called;
          expect(renderSpy).to.have.been.called;
        });
    });

    it('should not render remote data before first user interaction', () => {
      let impl, autocompleteSpy, clearAllSpy, filterSpy, renderSpy;
      return getAutocomplete(
        {
          'filter': 'substring',
          'min-characters': '0',
        },
        '{ "items" : ["apple", "banana", "orange"] }',
        false
      )
        .then((ampAutocomplete) => {
          impl = ampAutocomplete.implementation_;
          expect(impl.sourceData_).to.be.null;
          expect(impl.inputElement_).not.to.be.null;
          expect(impl.container_).not.to.be.null;
          expect(impl.filter_).to.equal('substring');
          autocompleteSpy = env.sandbox.spy(impl, 'autocomplete_');
          clearAllSpy = env.sandbox.spy(impl, 'clearAllItems_');
          filterSpy = env.sandbox.spy(impl, 'filterData_');
          renderSpy = env.sandbox.spy(impl, 'renderResults_');
          return ampAutocomplete.layoutCallback();
        })
        .then(() => {
          expect(impl.inputElement_.hasAttribute('autocomplete')).to.be.true;
          expect(autocompleteSpy).to.have.been.calledOnce;
          expect(clearAllSpy).to.have.been.calledOnce;
          expect(filterSpy).not.to.have.been.called;
          expect(renderSpy).not.to.have.been.called;
        });
    });

    it('should require filter attribute', () => {
      return allowConsoleError(() => {
        return expect(getAutocomplete({})).to.be.rejectedWith(
          /requires "filter" attribute/
        );
      });
    });

    it('should require valid filter attribute', () => {
      return allowConsoleError(() => {
        return expect(
          getAutocomplete({
            'filter': 'invalid-option',
          })
        ).to.be.rejectedWith('Unexpected filter: invalid-option');
      });
    });

    it('should render with min-characters passed', () => {
      return getAutocomplete({
        'filter': 'substring',
        'min-characters': '3',
      }).then((ampAutocomplete) => {
        expect(ampAutocomplete.implementation_.minChars_).to.equal(3);
      });
    });

    it('should render with max-entries passed', () => {
      return getAutocomplete({
        'filter': 'substring',
        'max-entries': '10',
      }).then((ampAutocomplete) => {
        expect(ampAutocomplete.implementation_.maxItems_).to.equal(10);
      });
    });

    it('should render with max-items passed', () => {
      return getAutocomplete({
        'filter': 'substring',
        'max-items': '10',
      }).then((ampAutocomplete) => {
        expect(ampAutocomplete.implementation_.maxItems_).to.equal(10);
      });
    });
    it('should error with invalid JSON script', () => {
      expectAsyncConsoleError(
        'Unexpected token o in JSON at position 32 [object HTMLElement]'
      );
      return expect(
        getAutocomplete(
          {
            'filter': 'substring',
          },
          '{ "items" : ["apple", "banana", orange] }'
        )
      ).to.be.rejectedWith('Unexpected token o in JSON at position 32');
    });

    it('should accept empty JSON script', () => {
      return getAutocomplete(
        {
          'filter': 'substring',
        },
        '{}'
      ).then((ampAutocomplete) => {
        const impl = ampAutocomplete.implementation_;
        expect(impl.sourceData_).to.be.an('array').that.is.empty;
      });
    });

    it('should accept empty items JSON script', () => {
      return getAutocomplete(
        {
          'filter': 'substring',
        },
        '{ "items" : [] }'
      ).then((ampAutocomplete) => {
        const impl = ampAutocomplete.implementation_;
        expect(impl.sourceData_).to.be.an('array').that.is.empty;
      });
    });

    it('should accept different item property from JSON script', () => {
      return getAutocomplete(
        {
          'filter': 'substring',
          'items': 'fruit',
        },
        '{ "fruit" : [ "apples", "bananas", "pears" ] }'
      ).then((ampAutocomplete) => {
        const impl = ampAutocomplete.implementation_;
        expect(impl.sourceData_).to.have.ordered.members([
          'apples',
          'bananas',
          'pears',
        ]);
      });
    });

    it('should not fetch remote data when specified in src before first user interaction', () => {
      const data = {
        items: [
          'Albany, New York',
          'Annapolis, Maryland',
          'Atlanta, Georgia',
          'Augusta, Maine',
          'Austin, Texas',
        ],
      };
      return getAutocomplete(
        {
          'filter': 'substring',
          'src': 'https://examples.com/json',
        },
        data,
        false
      ).then((ampAutocomplete) => {
        ampAutocomplete.layoutCallback().then(() => {
          const impl = ampAutocomplete.implementation_;
          expect(impl.sourceData_).to.be.null;
        });
      });
    });

    it('should not fetch remote data when specified in src and using items property before first user interaction', () => {
      const data = {
        cities: [
          'Albany, New York',
          'Annapolis, Maryland',
          'Atlanta, Georgia',
          'Augusta, Maine',
          'Austin, Texas',
        ],
      };
      return getAutocomplete(
        {
          'filter': 'substring',
          'src': 'https://examples.com/json',
          'items': 'cities',
        },
        data,
        false
      ).then((ampAutocomplete) => {
        ampAutocomplete.layoutCallback().then(() => {
          const impl = ampAutocomplete.implementation_;
          expect(impl.sourceData_).to.be.null;
        });
      });
    });

    it('should not fetch remote data when specified in src and using nested items property before first user interactino', () => {
      const data = {
        deeply: {
          nested: {
            cities: [
              'Albany, New York',
              'Annapolis, Maryland',
              'Atlanta, Georgia',
              'Augusta, Maine',
              'Austin, Texas',
            ],
          },
        },
      };
      return getAutocomplete(
        {
          'filter': 'substring',
          'src': 'https://examples.com/json',
          'items': 'deeply.nested.cities',
        },
        data,
        false
      ).then((ampAutocomplete) => {
        ampAutocomplete.layoutCallback().then(() => {
          const impl = ampAutocomplete.implementation_;
          expect(impl.sourceData_).be.null;
        });
      });
    });

    it('should not require a form ancestor', () => {
      const autocomplete = setupAutocomplete({'filter': 'substring'});
      doc.body.appendChild(autocomplete);
      return expect(autocomplete.build()).to.be.fulfilled;
    });

    it('should read the autocomplete attribute on the form as null', () => {
      return getAutocomplete({'filter': 'substring'}).then(
        (ampAutocomplete) => {
          const impl = ampAutocomplete.implementation_;
          expect(impl.initialAutocompleteAttr_).to.be.null;
        }
      );
    });

    it('should read the autocomplete attribute on the form as on', () => {
      return getAutocomplete({'filter': 'substring'}, '{}', true, 'on').then(
        (ampAutocomplete) => {
          const impl = ampAutocomplete.implementation_;
          expect(impl.initialAutocompleteAttr_).to.equal('on');
        }
      );
    });

    it('should read the autocomplete attribute on the form as off', () => {
      return getAutocomplete({'filter': 'substring'}, '{}', true, 'off').then(
        (ampAutocomplete) => {
          const impl = ampAutocomplete.implementation_;
          expect(impl.initialAutocompleteAttr_).to.equal('off');
        }
      );
    });
  }
);
