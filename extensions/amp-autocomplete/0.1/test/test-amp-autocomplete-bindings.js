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

    describe('Single binding', () => {
      const binding = new AutocompleteBindingSingle();

      it('should always autocomplete', () => {
        expect(binding.shouldAutocomplete(input)).to.be.true;
      });

      it('should provide partial user input from the given input', () => {
        expect(binding.updateUserInput(input)).to.equal('');
        input.value = 'hello';
        expect(binding.updateUserInput(input)).to.equal('hello');
      });

      it('should set the input value to the given value', () => {
        input.value = 'selection';
        binding.resetInput('', input);
        expect(input.value).to.equal('');
        binding.resetInput('asdf', input);
        expect(input.value).to.equal('asdf');
      });

      it('should only suggest first for the prefix filter', () => {
        expect(binding.shouldSuggestFirst('')).to.be.false;
        expect(binding.shouldSuggestFirst('prefix')).to.be.true;
      });

      it('should always show on focus', () => {
        expect(binding.shouldShowOnFocus()).to.be.true;
      });

      it('should display active item in input', () => {
        const selectionSpy = sandbox.spy(input, 'setSelectionRange');
        const element = doc.createElement('div');
        element.setAttribute('data-value', 'apple');
        expect(input.value).to.equal('');
        binding.displayActiveItemInInput(element, input, 0, false);
        expect(input.value).to.equal('apple');
        expect(selectionSpy).not.to.have.been.called;
        binding.displayActiveItemInInput(element, input, 0, true);
        expect(input.value).to.equal('apple');
        expect(selectionSpy).to.have.been.calledWith(0, 5);
      });

      it('should remove highlighting', () => {
        input.value = 'apple';
        input.setSelectionRange(0, 5);
        expect(input.selectionStart).to.equal(0);
        binding.removeHighlighting(input);
        expect(input.selectionEnd).to.equal(5);
      });

      it('should prevent default when results are showing or submitOnEnter is true', () => {
        const event = {preventDefault: () => {}};
        const preventSpy = sandbox.spy(event, 'preventDefault');
        binding.maybePreventDefaultOnEnter(event, true, true, true);
        binding.maybePreventDefaultOnEnter(event, false, true, true);
        binding.maybePreventDefaultOnEnter(event, false, false, true);
        expect(preventSpy).not.to.have.been.called;
        binding.maybePreventDefaultOnEnter(event, true, false, true);
        expect(preventSpy).to.have.been.calledOnce;
      });
    });

    describe('Inline binding', () => {
      let binding, pre, userInput, match;

      beforeEach(() => {
        binding = new AutocompleteBindingInline('@');
        pre = 'My friend is ';
        userInput = 'har';
        match = {0: '@' + userInput, index: pre.length};
      });

      it('should not always autocomplete', () => {
        expect(binding.shouldAutocomplete(input)).to.be.false;
      });

      it('should autocomplete based on found matches', () => {
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

      it('should provide partial user input based on the stored match', () => {
        expect(binding.updateUserInput(input)).to.equal('');
        binding.match_ = match;
        expect(binding.updateUserInput(input)).to.equal(userInput);
      });

      it('should provide new input value based on the stored match', () => {
        const text = pre + '@' + userInput;
        const selection = 'harrypotter@gmail.com';
        const len = match[0].length;

        expect(input.value).to.equal('');
        expect(binding.updateInputWithSelection(selection, input, 0)).to.equal(
          input.value
        );

        input.value = text;
        expect(
          binding.updateInputWithSelection(selection, input, len)
        ).to.equal(text);

        binding.match_ = match;
        expect(
          binding.updateInputWithSelection(selection, input, len)
        ).to.equal(pre + '@' + selection + ' ');
      });

      it('should not do anything to input value', () => {
        const initial = input.value;
        const element = doc.createElement('div');
        element.setAttribute('data-value', 'apple');
        const selectionSpy = sandbox.spy(input, 'setSelectionRange');

        binding.resetInput('', input);
        binding.resetInput('asdf', input);

        binding.displayActiveItemInInput(element, input, 0, false);
        binding.displayActiveItemInInput(element, input, 0, true);

        binding.removeHighlighting(input);

        expect(input.value).to.equal(initial);
        expect(selectionSpy).not.to.have.been.called;
      });

      it('should always suggest first', () => {
        expect(binding.shouldSuggestFirst('')).to.be.true;
      });

      it('should never show on focus', () => {
        expect(binding.shouldShowOnFocus()).to.be.false;
      });

      it('should prevent default whenever there are active suggestions shown', () => {
        const event = {preventDefault: () => {}};
        const preventSpy = sandbox.spy(event, 'preventDefault');
        binding.maybePreventDefaultOnEnter(event, true, true, false);
        binding.maybePreventDefaultOnEnter(event, false, true, true);
        binding.maybePreventDefaultOnEnter(event, false, true, false);
        expect(preventSpy).not.to.have.been.called;
        binding.maybePreventDefaultOnEnter(event, true, true, true);
        expect(preventSpy).to.have.been.calledOnce;
      });
    });
  }
);
