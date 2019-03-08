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

describes.realWin('amp-autocomplete unit tests', {
  amp: {
    extensions: ['amp-autocomplete'],
  },
}, env => {

  let win, doc, element, impl;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
    toggleExperiment(win, 'amp-autocomplete', true);

    const ampAutocomplete = doc.createElement('amp-autocomplete');
    ampAutocomplete.setAttribute('layout', 'container');
    ampAutocomplete.setAttribute('filter', 'substring');

    const input = win.document.createElement('input');
    input.setAttribute('type', 'text');
    ampAutocomplete.appendChild(input);

    const script = win.document.createElement('script');
    script.setAttribute('type', 'application/json');
    script.innerHTML = '{ "items" : ["apple", "banana", "orange"] }';
    ampAutocomplete.appendChild(script);

    doc.body.appendChild(ampAutocomplete);
    return ampAutocomplete.build().then(() => {
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
    expect(impl.container_.children.length).to.equal(2);
    expect(impl.container_.children[0].innerText).to.equal('apple');
    expect(impl.container_.children[1].innerText).to.equal('ap');
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

  it('should show and hide results on toggle', () => {
    expect(impl.resultsShowing()).to.be.false;
    impl.inputElement_.value = 'ap';
    impl.renderResults_();
    expect(impl.resultsShowing()).to.be.false;
    impl.toggleResults(true);
    expect(impl.resultsShowing()).to.be.true;
    impl.toggleResults(false);
    expect(impl.resultsShowing()).to.be.false;
  });

  it('should call inputHandler_() on input', () => {
    return element.layoutCallback().then(() => {
      const renderSpy = sandbox.spy(impl, 'renderResults_');
      const toggleResultsSpy = sandbox.spy(impl, 'toggleResults');
      impl.inputElement_.value = 'a';
      return impl.inputHandler_().then(() => {
        expect(renderSpy).to.have.been.calledOnce;
        expect(toggleResultsSpy).to.have.been.calledWith(true);
        expect(impl.container_.children.length).to.equal(4);
      });
    });
  });

  it('should call keyDownHandler_() on Down and Up arrow', () => {
    const event = {key: Keys.DOWN_ARROW, preventDefault: () => {}};
    const updateActiveSpy = sandbox.spy(impl, 'updateActiveItem_');
    const preventSpy = sandbox.spy(event, 'preventDefault');
    return element.layoutCallback().then(() => {
      return impl.keyDownHandler_(event).then(() => {
        expect(preventSpy).to.have.been.calledOnce;
        expect(updateActiveSpy).to.have.been.calledWith(1);
      }).then(() => {
        event.key = Keys.UP_ARROW;
        return impl.keyDownHandler_(event).then(() => {
          expect(preventSpy).to.have.been.calledTwice;
          expect(updateActiveSpy).to.have.been.calledWith(-1);
        });
      });
    });
  });

  it('should call keyDownHandler_() on Enter', () => {
    const event = {
      key: Keys.ENTER,
      preventDefault: () => {},
      target: {textContent: 'hello'},
    };
    return element.layoutCallback().then(() => {
      const selectItemSpy = sandbox.spy(impl, 'selectItem');
      const resetSpy = sandbox.spy(impl, 'resetActiveElement_');
      const clearAllSpy = sandbox.spy(impl, 'clearAllItems');
      return impl.keyDownHandler_(event).then(() => {
        expect(impl.inputElement_.value).to.equal('');
        expect(selectItemSpy).not.to.have.been.called;
        expect(clearAllSpy).not.to.have.been.called;
        expect(resetSpy).not.to.have.been.called;
      }).then(() => {
        impl.activeElement_ = impl.createElementFromItem_('abc');
        return impl.keyDownHandler_(event).then(() => {
          expect(impl.inputElement_.value).to.equal('abc');
          expect(selectItemSpy).to.have.been.calledOnce;
          expect(clearAllSpy).to.have.been.calledOnce;
          expect(resetSpy).to.have.been.calledOnce;
        });
      });
    });
  });

  it('should call keyDownHandler_() on Esc', () => {
    const event = {key: Keys.ESCAPE};
    const selectItemSpy = sandbox.spy(impl, 'selectItem');
    const resetSpy = sandbox.spy(impl, 'resetActiveElement_');
    const toggleResultsSpy = sandbox.spy(impl, 'toggleResults');
    return element.layoutCallback().then(() => {
      impl.inputElement_.value = 'a';
      impl.renderResults_();
      expect(impl.container_.children.length).to.equal(4);
      impl.toggleResults(true);
      expect(impl.resultsShowing()).to.be.true;
      return impl.keyDownHandler_(event).then(() => {
        expect(selectItemSpy).to.have.been.calledOnce;
        expect(resetSpy).to.have.been.calledOnce;
        expect(toggleResultsSpy).to.have.been.calledWith(false);
        expect(impl.resultsShowing()).to.be.false;
      });
    });
  });

  it('should call keyDownHandler_() and fallthrough on any other key', () => {
    const event = {key: Keys.LEFT_ARROW};
    return element.layoutCallback().then(() => {
      return expect(impl.keyDownHandler_(event)).to.be.fulfilled;
    });
  });

  it('should call toggleResultsHandler_()', () => {
    return element.layoutCallback().then(() => {
      const toggleResultsSpy = sandbox.spy(impl, 'toggleResults');
      const resetSpy = sandbox.spy(impl, 'resetActiveElement_');
      return impl.toggleResultsHandler_(true).then(() => {
        expect(toggleResultsSpy).to.have.been.calledOnce;
        expect(resetSpy).not.to.have.been.called;
      }).then(() => {
        return impl.toggleResultsHandler_(false).then(() => {
          expect(toggleResultsSpy).to.have.been.calledTwice;
          expect(resetSpy).to.have.been.calledOnce;
        });
      });
    });
  });

  it('should call selectHandler_() on mousedown', () => {
    return element.layoutCallback().then(() => {
      impl.toggleResults(true);
      const isItemSpy = sandbox.spy(impl, 'isItemElement');
      const selectItemSpy = sandbox.spy(impl, 'selectItem');
      let mockEl = doc.createElement('div');
      mockEl.textContent = 'test';
      return impl.selectHandler_({target: mockEl}).then(() => {
        expect(isItemSpy).to.have.been.calledOnce;
        expect(selectItemSpy).not.to.have.been.called;
        expect(impl.inputElement_.value).to.equal('');
      }).then(() => {
        mockEl = impl.createElementFromItem_('abc');
        return impl.selectHandler_({target: mockEl}).then(() => {
          expect(isItemSpy).to.have.been.calledWith(mockEl);
          expect(selectItemSpy).to.have.been.calledWith(mockEl);
          expect(impl.inputElement_.value).to.equal('abc');
        });
      });
    });
  });

  it('should support marking active items', () => {
    return element.layoutCallback().then(() => {
      expect(impl.activeElement_).to.be.null;
      expect(impl.activeIndex_).to.equal(-1);
      impl.inputElement_.value = 'a';
      impl.renderResults_();
      expect(impl.container_.children.length).to.equal(4);

      impl.activeElement_ = doc.createElement('div');
      expect(impl.activeElement_).not.to.be.null;
      expect(impl.resetActiveElement_()).to.equal();
      expect(impl.activeElement_).to.be.null;

      impl.toggleResults(true);
      const resetSpy = sandbox.spy(impl, 'resetActiveElement_');
      return impl.updateActiveItem_(1).then(() => {
        expect(resetSpy).to.have.been.calledOnce;
        expect(impl.activeIndex_).to.equal(0);
        expect(impl.activeElement_).not.to.be.null;
        expect(impl.activeElement_).to.have.class(
            'i-amphtml-autocomplete-item-active');
        expect(impl.container_.children[1]).not.to.have.class(
            'i-amphtml-autocomplete-item-active');
        expect(impl.container_.children[2]).not.to.have.class(
            'i-amphtml-autocomplete-item-active');
      }).then(() => {
        return impl.updateActiveItem_(-1).then(() => {
          expect(resetSpy).to.have.been.calledTwice;
          expect(impl.activeIndex_).to.equal(3);
          expect(impl.activeElement_).to.be.null;
          expect(impl.container_.children[0]).not.to.have.class(
              'i-amphtml-autocomplete-item-active');
          expect(impl.container_.children[1]).not.to.have.class(
              'i-amphtml-autocomplete-item-active');
          expect(impl.container_.children[2]).not.to.have.class(
              'i-amphtml-autocomplete-item-active');
          expect(impl.container_.children[3]).not.to.have.class(
              'i-amphtml-autocomplete-item-active');
        }).then(() => {
          return impl.updateActiveItem_(-1).then(() => {
            expect(resetSpy).to.have.been.calledThrice;
            expect(impl.activeIndex_).to.equal(2);
          expect(impl.activeElement_).not.to.be.null;
          expect(impl.activeElement_).to.have.class(
              'i-amphtml-autocomplete-item-active');
          expect(impl.container_.children[0]).not.to.have.class(
              'i-amphtml-autocomplete-item-active');
          expect(impl.container_.children[1]).not.to.have.class(
              'i-amphtml-autocomplete-item-active');
            expect(impl.container_.children[3]).not.to.have.class(
                'i-amphtml-autocomplete-item-active');
        }).then(() => {
          return impl.updateActiveItem_(0).then(() => {
              expect(resetSpy).to.have.been.calledThrice;
              expect(impl.activeIndex_).to.equal(2);
              expect(impl.activeElement_).not.to.be.null;
            expect(impl.activeElement_).to.have.class(
                'i-amphtml-autocomplete-item-active');
            });
          });
        });
      });
    });
  });
});
