import '../amp-autocomplete';
import {createElementWithAttributes} from '#core/dom';

import {AutocompleteBindingInline} from '../autocomplete-binding-inline';
import {AutocompleteBindingSingle} from '../autocomplete-binding-single';

describes.realWin(
  'amp-autocomplete bindings',
  {
    amp: {
      extensions: ['amp-autocomplete'],
    },
  },
  (env) => {
    let win, doc, input;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
      input = doc.createElement('input');
    });

    function stubAmpAutocomplete(attributes) {
      const element = createElementWithAttributes(
        doc,
        'div',
        Object.assign(attributes, {layout: 'container'})
      );
      return {element, win: env.win};
    }

    describe('Single binding', () => {
      let binding;
      const getBindingSingle = (attributes) =>
        new AutocompleteBindingSingle(stubAmpAutocomplete(attributes));

      beforeEach(() => {
        binding = getBindingSingle({filter: 'substring'});
      });

      it('should always intend to autocomplete', () => {
        expect(binding.shouldAutocomplete(input)).to.be.true;
      });

      it('should provide partial user input from the given input', () => {
        expect(binding.getUserInputForUpdate(input)).to.equal('');
        input.value = 'hello';
        expect(binding.getUserInputForUpdate(input)).to.equal('hello');
      });

      it('should set the input value to the given value', () => {
        input.value = 'selection';
        binding.resetInputOnWrapAround('', input);
        expect(input.value).to.equal('');
        binding.resetInputOnWrapAround('asdf', input);
        expect(input.value).to.equal('asdf');
      });

      it('should not suggest first when attribute is not present', () => {
        expect(binding.shouldSuggestFirst()).to.be.false;
      });

      it('should ignore when suggest first is present without prefix filter', () => {
        binding = getBindingSingle({'suggest-first': ''});
        expect(binding.shouldSuggestFirst()).to.be.false;
      });

      it('should suggest first when attribute is present', () => {
        binding = getBindingSingle({
          'suggest-first': '',
          'filter': 'prefix',
        });
        expect(binding.shouldSuggestFirst()).to.be.true;
      });

      it('should always show on focus', () => {
        expect(binding.shouldShowOnFocus()).to.be.true;
      });

      it('should display active item in input', () => {
        input.focus();
        const selectionSpy = env.sandbox.spy(input, 'setSelectionRange');
        expect(input.value).to.equal('');

        binding.displayActiveItemInInput(input, 'apple', '');
        expect(input.value).to.equal('apple');
        expect(selectionSpy).not.to.have.been.called;

        binding.shouldSuggestFirst_ = true;
        binding.displayActiveItemInInput(input, 'apple', '');
        expect(input.value).to.equal('apple');
        expect(selectionSpy).to.have.been.calledWith(0, 5);
      });

      it('should remove highlighting', () => {
        input.value = 'apple';
        input.setSelectionRange(0, 5);
        expect(input.selectionStart).to.equal(0);
        binding.removeSelectionHighlighting(input);
        expect(input.selectionEnd).to.equal(5);
      });

      it('should prevent submission when "submit-on-enter" is absent', () => {
        expect(binding.shouldPreventDefaultOnEnter(true)).to.be.true;
        expect(binding.shouldPreventDefaultOnEnter(false)).to.be.true;
      });

      it('should not prevent submission when "submit-on-enter" is true', () => {
        binding = getBindingSingle({'submit-on-enter': 'true'});
        expect(binding.shouldPreventDefaultOnEnter(true)).to.be.false;
        expect(binding.shouldPreventDefaultOnEnter(false)).to.be.false;
      });
    });

    describe('Inline binding', () => {
      let pre, userInput, match, binding;
      const getBindingInline = (attributes) =>
        new AutocompleteBindingInline(stubAmpAutocomplete(attributes));

      beforeEach(() => {
        pre = 'My friend is ';
        userInput = 'har';
        match = {0: '@' + userInput, index: pre.length};
        binding = getBindingInline({filter: 'substring', inline: '@'});
      });

      it('should not always autocomplete', () => {
        expect(binding.shouldAutocomplete(input)).to.be.false;
      });

      it('should autocomplete based on found matches', () => {
        env.sandbox
          .stub(binding, 'getClosestPriorMatch_')
          .onFirstCall()
          .returns(match)
          .onSecondCall()
          .returns(null);
        expect(binding.shouldAutocomplete(input)).to.be.true;
        expect(binding.match_).to.equal(match);

        expect(binding.shouldAutocomplete(input)).to.be.false;
        expect(binding.match_).to.be.null;
      });

      it('should provide partial user input based on the stored match', () => {
        expect(binding.getUserInputForUpdate(input)).to.equal('');
        binding.match_ = match;
        expect(binding.getUserInputForUpdate(input)).to.equal(userInput);
      });

      it('should provide new input value based on the stored match', () => {
        const text = pre + '@' + userInput;
        const selection = 'harrypotter@gmail.com';

        expect(input.value).to.equal('');
        expect(
          binding.getUserInputForUpdateWithSelection(selection, input, '')
        ).to.equal(input.value);

        input.value = text;
        expect(
          binding.getUserInputForUpdateWithSelection(selection, input, match[0])
        ).to.equal(text);

        binding.match_ = match;
        expect(
          binding.getUserInputForUpdateWithSelection(selection, input, match[0])
        ).to.equal(pre + '@' + selection + ' ');
      });

      it('should not do anything to input value', () => {
        const initial = input.value;
        const selectionSpy = env.sandbox.spy(input, 'setSelectionRange');
        binding.resetInputOnWrapAround('', input);
        binding.resetInputOnWrapAround('asdf', input);
        binding.displayActiveItemInInput(input, 'apple', '');
        binding.removeSelectionHighlighting(input);
        expect(input.value).to.equal(initial);
        expect(selectionSpy).not.to.have.been.called;
      });

      it('should not suggest first if attribute is absent', () => {
        expect(binding.shouldSuggestFirst()).to.be.false;
      });

      it('should suggest first if attribute is present', () => {
        binding = getBindingInline({'inline': '@', 'suggest-first': 'true'});
        expect(binding.shouldSuggestFirst()).to.be.true;
      });

      it('should never show on focus', () => {
        expect(binding.shouldShowOnFocus()).to.be.false;
      });

      it('should prevent default whenever there are active suggestions shown', () => {
        expect(binding.shouldPreventDefaultOnEnter(true)).to.be.true;
        expect(binding.shouldPreventDefaultOnEnter(false)).to.be.false;
      });
    });
  }
);
