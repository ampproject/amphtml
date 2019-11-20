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
import {AutocompleteBindingInline} from '../autocomplete-binding-inline';
import {AutocompleteBindingSingle} from '../autocomplete-binding-single';
import {toggleExperiment} from '../../../../src/experiments';

describes.realWin(
  'amp-autocomplete bindings',
  {
    amp: {
      extensions: ['amp-autocomplete'],
    },
  },
  env => {
    let win, doc, input;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
      input = doc.createElement('input');
    });

    function getBindingStub(attributes) {
      const ampAutocomplete = doc.createElement('amp-autocomplete');
      ampAutocomplete.setAttribute('layout', 'container');
      ampAutocomplete.setAttribute('filter', 'substring');
      for (const key in attributes) {
        ampAutocomplete.setAttribute(key, attributes[key]);
      }
      ampAutocomplete.appendChild(input);

      const form = doc.createElement('form');
      form.appendChild(ampAutocomplete);
      doc.body.appendChild(form);
      return ampAutocomplete
        .build()
        .then(() =>
          ampAutocomplete.hasAttribute('inline')
            ? new AutocompleteBindingInline(ampAutocomplete.implementation_)
            : new AutocompleteBindingSingle(ampAutocomplete.implementation_)
        );
    }

    describe('Single binding', () => {
      it('should always intend to autocomplete', () => {
        return getBindingStub().then(binding => {
          expect(binding.shouldAutocomplete(input)).to.be.true;
        });
      });

      it('should provide partial user input from the given input', () => {
        return getBindingStub().then(binding => {
          expect(binding.getUserInputForUpdate(input)).to.equal('');
          input.value = 'hello';
          expect(binding.getUserInputForUpdate(input)).to.equal('hello');
        });
      });

      it('should set the input value to the given value', () => {
        return getBindingStub().then(binding => {
          input.value = 'selection';
          binding.resetInputOnWrapAround('', input);
          expect(input.value).to.equal('');
          binding.resetInputOnWrapAround('asdf', input);
          expect(input.value).to.equal('asdf');
        });
      });

      it('should not suggest first when attribute is not present', () => {
        return getBindingStub().then(binding => {
          expect(binding.shouldSuggestFirst()).to.be.false;
        });
      });

      it('should error when suggest first is present without prefix filter', () => {
        return allowConsoleError(() => {
          return expect(
            getBindingStub({
              'suggest-first': 'true',
            }).then(binding => {
              binding.shouldSuggestFirst();
            })
          ).to.be.rejectedWith(
            /"suggest-first" requires "filter" type "prefix"/
          );
        });
      });

      it('should not suggest first when attribute is not present', () => {
        return getBindingStub({
          'suggest-first': 'true',
          'filter': 'prefix',
        }).then(binding => {
          expect(binding.shouldSuggestFirst()).to.be.true;
        });
      });

      it('should always show on focus', () => {
        return getBindingStub().then(binding => {
          expect(binding.shouldShowOnFocus()).to.be.true;
        });
      });

      it('should display active item in input', () => {
        return getBindingStub().then(binding => {
          input.focus();
          const selectionSpy = sandbox.spy(input, 'setSelectionRange');
          expect(input.value).to.equal('');

          binding.displayActiveItemInInput(input, 'apple', '');
          expect(input.value).to.equal('apple');
          expect(selectionSpy).not.to.have.been.called;

          binding.shouldHighlight_ = true;
          binding.displayActiveItemInInput(input, 'apple', '');
          expect(input.value).to.equal('apple');
          expect(selectionSpy).to.have.been.calledWith(0, 5);
        });
      });

      it('should remove highlighting', () => {
        return getBindingStub().then(binding => {
          input.value = 'apple';
          input.setSelectionRange(0, 5);
          expect(input.selectionStart).to.equal(0);
          binding.removeSelectionHighlighting(input);
          expect(input.selectionEnd).to.equal(5);
        });
      });

      it('should prevent submission when "submit-on-enter" is absent', () => {
        return getBindingStub().then(binding => {
          expect(binding.shouldPreventFormSubmissionOnEnter(true)).to.be.true;
          expect(binding.shouldPreventFormSubmissionOnEnter(false)).to.be.true;
        });
      });

      it('should not prevent submission when "submit-on-enter" is true', () => {
        return getBindingStub({'submit-on-enter': 'true'}).then(binding => {
          expect(binding.shouldPreventFormSubmissionOnEnter(true)).to.be.false;
          expect(binding.shouldPreventFormSubmissionOnEnter(false)).to.be.false;
        });
      });
    });

    describe('Inline binding', () => {
      let pre, userInput, match;

      function getInlineBinding(attr = {}) {
        attr['inline'] = ['@'];
        return getBindingStub(attr);
      }

      beforeEach(() => {
        toggleExperiment(win, 'amp-autocomplete', true);
        pre = 'My friend is ';
        userInput = 'har';
        match = {0: '@' + userInput, index: pre.length};
      });

      it('should require experiment when "inline" is specified', () => {
        toggleExperiment(win, 'amp-autocomplete', false);
        return allowConsoleError(() => {
          return expect(getInlineBinding()).to.be.rejectedWith(
            /Experiment amp-autocomplete is not turned on/
          );
        });
      });

      it('should not always autocomplete', () => {
        return getInlineBinding().then(binding => {
          expect(binding.shouldAutocomplete(input)).to.be.false;
        });
      });

      it('should autocomplete based on found matches', () => {
        return getInlineBinding().then(binding => {
          sandbox
            .stub(binding, 'getClosestPriorMatch_')
            .onFirstCall()
            .returns(match)
            .onSecondCall()
            .returns(null);
          expect(binding.shouldAutocomplete(input)).to.be.true;
          expect(binding.match_).to.equal(match);

          expect(binding.shouldAutocomplete(input)).to.be.false;
          expect(binding.match_).to.equal(null);
        });
      });

      it('should provide partial user input based on the stored match', () => {
        return getInlineBinding().then(binding => {
          expect(binding.getUserInputForUpdate(input)).to.equal('');
          binding.match_ = match;
          expect(binding.getUserInputForUpdate(input)).to.equal(userInput);
        });
      });

      it('should provide new input value based on the stored match', () => {
        return getInlineBinding().then(binding => {
          const text = pre + '@' + userInput;
          const selection = 'harrypotter@gmail.com';

          expect(input.value).to.equal('');
          expect(
            binding.getUserInputForUpdateWithSelection(selection, input, '')
          ).to.equal(input.value);

          input.value = text;
          expect(
            binding.getUserInputForUpdateWithSelection(
              selection,
              input,
              match[0]
            )
          ).to.equal(text);

          binding.match_ = match;
          expect(
            binding.getUserInputForUpdateWithSelection(
              selection,
              input,
              match[0]
            )
          ).to.equal(pre + '@' + selection + ' ');
        });
      });

      it('should not do anything to input value', () => {
        return getInlineBinding().then(binding => {
          const initial = input.value;
          const selectionSpy = sandbox.spy(input, 'setSelectionRange');

          binding.resetInputOnWrapAround('', input);
          binding.resetInputOnWrapAround('asdf', input);

          binding.displayActiveItemInInput(input, 'apple', '');

          binding.removeSelectionHighlighting(input);

          expect(input.value).to.equal(initial);
          expect(selectionSpy).not.to.have.been.called;
        });
      });

      it('should not suggest first if attribute is absent', () => {
        return getInlineBinding().then(binding => {
          expect(binding.shouldSuggestFirst()).to.be.false;
        });
      });

      it('should suggest first if attribute is present', () => {
        return getInlineBinding({'suggest-first': 'true'}).then(binding => {
          expect(binding.shouldSuggestFirst()).to.be.true;
        });
      });

      it('should never show on focus', () => {
        return getInlineBinding().then(binding => {
          expect(binding.shouldShowOnFocus()).to.be.false;
        });
      });

      it('should prevent default whenever there are active suggestions shown', () => {
        return getInlineBinding().then(binding => {
          expect(binding.shouldPreventFormSubmissionOnEnter(true)).to.be.true;
          expect(binding.shouldPreventFormSubmissionOnEnter(false)).to.be.false;
        });
      });
    });
  }
);
