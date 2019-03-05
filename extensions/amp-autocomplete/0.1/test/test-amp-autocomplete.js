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
import {Keys} from '../../../../src/utils/key-codes';
import {toggleExperiment} from '../../../../src/experiments';

describes.realWin('amp-autocomplete', {
  amp: {
    extensions: ['amp-autocomplete'],
  },
}, env => {

  let win, doc;

  describe('test extension', () => {
    beforeEach(() => {
      win = env.win;
      doc = win.document;
      toggleExperiment(win, 'amp-autocomplete', true);
    });

    function getAutocomplete(attributes,
      json = '{ "items" : ["apple", "banana", "orange"] }') {
      win.sessionStorage.clear();
      const ampAutocomplete = doc.createElement('amp-autocomplete');
      ampAutocomplete.setAttribute('layout', 'container');
      for (const key in attributes) {
        ampAutocomplete.setAttribute(key, attributes[key]);
      }

      const input = win.document.createElement('input');
      input.setAttribute('type', 'text');
      ampAutocomplete.appendChild(input);

      const script = win.document.createElement('script');
      script.setAttribute('type', 'application/json');
      script.innerHTML = json;
      ampAutocomplete.appendChild(script);

      doc.body.appendChild(ampAutocomplete);
      return ampAutocomplete.build().then(() => ampAutocomplete);
    }

    it('should render with experiment on', () => {
      return getAutocomplete({
        'filter': 'substring',
      }).then(ampAutocomplete => {
        const impl = ampAutocomplete.implementation_;
        const expectedItems = ['apple', 'banana', 'orange'];
        expect(impl.inlineData_).to.have.ordered.members(expectedItems);
        expect(impl.inputElement__).not.to.be.null;
        expect(impl.container_).not.to.be.null;
        expect(impl.filter_).to.equal('substring');

        const renderSpy = sandbox.spy(impl, 'renderResults_');
        return ampAutocomplete.layoutCallback().then(() => {
          expect(ampAutocomplete).to.have.class('i-amphtml-autocomplete');
          expect(impl.inputElement_)
              .to.have.class('i-amphtml-autocomplete-input');
          expect(impl.inputElement_.hasAttribute('autocomplete')).to.be.true;
          expect(renderSpy).to.have.been.calledOnce;
        });
      });
    });

    it('should require filter attribute', () => {
      return allowConsoleError(() => {
        return expect(getAutocomplete({})).to.be
            .rejectedWith('amp-autocomplete requires "filter" attribute.​​​');
      });
    });

    it('should require valid filter attribute', () => {
      return allowConsoleError(() => {
        return expect(getAutocomplete({
          'filter': 'invalid-option',
        })).to.be.rejectedWith('Unexpected filter: invalid-option');
      });
    });

    it('should render with min-characters passed', () => {
      return getAutocomplete({
        'filter': 'substring',
        'min-characters': '3',
      }).then(ampAutocomplete => {
        expect(ampAutocomplete.implementation_.minChars_).to.equal(3);
      });
    });

    it('should render with max-entries passed', () => {
      return getAutocomplete({
        'filter': 'substring',
        'max-entries': '10',
      }).then(ampAutocomplete => {
        expect(ampAutocomplete.implementation_.maxEntries_).to.equal(10);
      });
    });

    it('should not render with experiment off', () => {
      toggleExperiment(win, 'amp-autocomplete', false);
      return allowConsoleError(() => {
        return expect(getAutocomplete({})).to.be.rejectedWith(
            'Experiment amp-autocomplete is not turned on.');
      });
    });

    it('should error with invalid JSON script', () => {
      expectAsyncConsoleError('Unexpected token o in JSON at position'
        + ' 32 [object HTMLElement]');
      return expect(getAutocomplete({
        'filter': 'substring',
      }, '{ "items" : ["apple", "banana", orange] }')).to.be.rejectedWith(
          'Unexpected token o in JSON at position 32');
    });

    it('should accept empty JSON script', () => {
      return getAutocomplete({
        'filter': 'substring',
      }, '{}').then(ampAutocomplete => {
        const impl = ampAutocomplete.implementation_;
        expect(impl.inlineData_).to.be.an('array').that.is.empty;
      });
    });

    it('should accept empty items JSON script', () => {
      return getAutocomplete({
        'filter': 'substring',
      }, '{ "items" : [] }').then(ampAutocomplete => {
        const impl = ampAutocomplete.implementation_;
        expect(impl.inlineData_).to.be.an('array').that.is.empty;
      });
    });

    describe('unit tests', () => {

      let element, impl;
      beforeEach(() => {
        return getAutocomplete({'filter': 'substring'}).then(
            ampAutocomplete => {
              element = ampAutocomplete;
              impl = element.implementation_;
            });
      });

      it('createElementFromItem_() should return element', () => {
        let element = impl.createElementFromItem_('hello');
        expect(element).not.to.be.null;
        expect(element).to.have.class('i-amphtml-autocomplete-item');
        expect(element.hasAttribute('role')).to.be.true;
        expect(element.innerText).to.equal('hello');

        element = impl.createElementFromItem_('');
        expect(element).not.to.be.null;
        expect(element).to.have.class('i-amphtml-autocomplete-item');
        expect(element.hasAttribute('role')).to.be.true;
        expect(element.innerText).to.equal('');
      });

      it('renderResults_() should update the container_', () => {
        expect(impl.container_).not.to.be.null;
        expect(impl.container_.children.length).to.equal(0);
        impl.inputElement_.value = 'ap';
        const clearAllItemsSpy = sandbox.spy(impl, 'clearAllItems');
        const filterDataSpy = sandbox.spy(impl, 'filterData_');

        // Only clear if input < minChars_
        impl.minChars_ = 3;
        impl.renderResults_();
        expect(clearAllItemsSpy).to.have.been.calledOnce;
        expect(filterDataSpy).not.to.have.been.called;

        impl.minChars_ = 2;
        impl.renderResults_();
        expect(impl.container_.children.length).to.equal(1);
        expect(impl.container_.children[0].innerText).to.equal('apple');
        expect(clearAllItemsSpy).to.have.been.calledTwice;
        expect(filterDataSpy).to.have.been.calledOnce;
      });

      it('filterData_() should filter based on all types', () => {
        // Substring filter
        expect(impl.filterData_(['a', 'b', 'ab', 'ba', 'c'], 'a')).to.have
            .ordered.members(['a', 'ab', 'ba']);

        // Prefix filter
        impl.filter_ = 'prefix';
        expect(impl.filterData_(['a', 'b', 'ab', 'ba', 'c'], 'a')).to.have
            .ordered.members(['a', 'ab']);

        // Token-prefix filter
        impl.filter_ = 'token-prefix';
        expect(impl.filterData_(['a', 'b a', 'ab', 'ba', 'c a'], 'a')).to.have
            .ordered.members(['a', 'b a', 'ab', 'c a']);

        // Remaining filters should error
        impl.filter_ = 'fuzzy';
        expect(() => impl.filterData_(['a', 'b', 'c'], 'a')).to.throw(
            'Filter not yet supported: fuzzy');
        impl.filter_ = 'custom';
        expect(() => impl.filterData_(['a', 'b', 'c'], 'a')).to.throw(
            'Filter not yet supported: custom');
        impl.filter_ = 'none';
        expect(() => impl.filterData_(['a', 'b', 'c'], 'a')).to.throw(
            'Filter not yet supported: none');
        impl.filter_ = 'invalid';
        expect(() => impl.filterData_(['a', 'b', 'c'], 'a')).to.throw(
            'Unexpected filter: invalid');
      });

      it('should show and hide results', () => {
        const resetSpy = sandbox.spy(impl, 'resetActiveElement_');
        expect(impl.resultsShowing()).to.be.false;
        impl.inputElement_.value = 'ap';
        impl.renderResults_();
        expect(impl.resultsShowing()).to.be.false;
        expect(resetSpy).not.to.have.been.called;
        impl.showResults();
        expect(impl.resultsShowing()).to.be.true;
        expect(resetSpy).not.to.have.been.called;
        impl.hideResults();
        expect(impl.resultsShowing()).to.be.false;
        expect(resetSpy).to.have.been.calledOnce;
      });

      it('should call event handlers', () => {
        return element.layoutCallback().then(() => {
          // inputHandler_()
          const renderSpy = sandbox.spy(impl, 'renderResults_');
          const showResultsSpy = sandbox.spy(impl, 'showResults');
          impl.inputElement_.value = 'a';
          let event = {
            inputType: 'insertText',
            data: 'a',
          };
          impl.inputHandler_(event);
          expect(renderSpy).to.have.been.calledOnce;
          expect(showResultsSpy).to.have.been.calledOnce;
          expect(impl.container_.children.length).to.equal(3);

          // keyDownHandler_()
          const updateActiveSpy = sandbox.spy(impl, 'updateActiveItem_');
          const resultsShowingSpy = sandbox.spy(impl, 'resultsShowing');
          event = {key: Keys.DOWN_ARROW};
          impl.keyDownHandler_(event);
          expect(resultsShowingSpy).to.have.been.calledOnce;
          expect(updateActiveSpy).to.have.been.calledWith(1);

          event = {key: Keys.UP_ARROW};
          impl.keyDownHandler_(event);
          expect(resultsShowingSpy).to.have.been.calledTwice;
          expect(updateActiveSpy).to.have.been.calledWith(-1);

          const selectItemSpy = sandbox.spy(impl, 'selectItem');
          const resetSpy = sandbox.spy(impl, 'resetActiveElement_');
          event = {key: Keys.ENTER, preventDefault: () => {}};
          impl.keyDownHandler_(event);
          expect(selectItemSpy).to.have.been.calledOnce;
          expect(resetSpy).to.have.been.calledOnce;

          const hideResultsSpy = sandbox.spy(impl, 'hideResults');
          event = {key: Keys.ESCAPE};
          impl.keyDownHandler_(event);
          expect(hideResultsSpy).to.have.been.calledOnce;

          // selectHandler_()
          impl.showResults();
          const isItemSpy = sandbox.spy(impl, 'isItemElement');
          let mockEl = doc.createElement('div');
          impl.selectHandler_({target: mockEl});
          expect(isItemSpy).to.have.been.calledOnce;
          expect(selectItemSpy).to.have.been.calledOnce; // Prior call

          mockEl = impl.createElementFromItem_('abc');
          impl.selectHandler_({target: mockEl});
          expect(isItemSpy).to.have.been.calledTwice;
          expect(selectItemSpy).to.have.been.calledTwice;
        });
      });

      it('should support marking active items', () => {
        return element.layoutCallback().then(() => {
          expect(impl.activeElement_).to.be.null;
          expect(impl.activeIndex_).to.equal(-1);
          impl.inputElement_.value = 'a';
          impl.renderResults_();
          expect(impl.container_.children.length).to.equal(3);
          const resetSpy = sandbox.spy(impl, 'resetActiveElement_');
          impl.updateActiveItem_(1);
          expect(resetSpy).not.to.have.been.called;
          expect(impl.activeIndex_).to.equal(0);
          expect(impl.activeElement_).not.to.be.null;
          impl.updateActiveItem_(-1);
          expect(resetSpy).to.have.been.calledOnce;
          expect(impl.activeElement_).not.to.be.null;
          expect(impl.activeIndex_).to.equal(2);
          impl.updateActiveItem_(0);
          expect(resetSpy).to.have.been.calledOnce;
          expect(impl.activeElement_).not.to.be.null;
          expect(impl.activeIndex_).to.equal(2);
        });
      });
    });
  });
});
