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

describes.realWin(
  'amp-autocomplete unit tests',
  {
    amp: {
      extensions: ['amp-autocomplete'],
    },
  },
  env => {
    let win, doc, element, impl;

    beforeEach(() => {
      win = env.win;
      doc = win.document;

      const form = doc.createElement('form');
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

      form.appendChild(ampAutocomplete);
      doc.body.appendChild(form);
      return ampAutocomplete.build().then(() => {
        element = ampAutocomplete;
        impl = element.implementation_;
      });
    });

    describe('mutatedAttributesCallback_()', () => {
      let remoteDataSpy;
      let filterAndRenderSpy;

      beforeEach(() => {
        remoteDataSpy = env.sandbox
          .stub(impl, 'getRemoteData_')
          .resolves(['a', 'b', 'c']);
        filterAndRenderSpy = env.sandbox.spy(
          impl,
          'filterDataAndRenderResults_'
        );
      });

      it('should resolve when param is {}', () => {
        return impl.mutatedAttributesCallback({}).then(() => {
          expect(remoteDataSpy).not.to.have.been.called;
          expect(filterAndRenderSpy).not.to.have.been.called;
        });
      });

      it('should resolve when src is undefined', () => {
        return impl.mutatedAttributesCallback({'src': undefined}).then(() => {
          expect(remoteDataSpy).not.to.have.been.called;
          expect(filterAndRenderSpy).not.to.have.been.called;
        });
      });

      it('should resolve when src is null', () => {
        return impl.mutatedAttributesCallback({'src': null}).then(() => {
          expect(remoteDataSpy).not.to.have.been.called;
          expect(filterAndRenderSpy).not.to.have.been.called;
        });
      });

      it('should pass on calls when src is type str', () => {
        return impl
          .mutatedAttributesCallback({'src': 'example.json'})
          .then(() => {
            expect(remoteDataSpy).to.have.been.calledOnce;
            expect(impl.sourceData_).to.have.ordered.members(['a', 'b', 'c']);
            expect(filterAndRenderSpy).to.have.been.calledOnce;
            expect(filterAndRenderSpy).to.have.been.calledWith(
              ['a', 'b', 'c'],
              ''
            );
          });
      });

      it('should pass on calls when src is type object with "items"', () => {
        return impl
          .mutatedAttributesCallback({'src': {'items': ['a', 'b', 'c']}})
          .then(() => {
            expect(remoteDataSpy).not.to.have.been.called;
            expect(impl.sourceData_).to.have.ordered.members(['a', 'b', 'c']);
            expect(filterAndRenderSpy).to.have.been.calledOnce;
            expect(filterAndRenderSpy).to.have.been.calledWith(
              ['a', 'b', 'c'],
              ''
            );
          });
      });

      it('should pass on calls when src is type object without "items"', () => {
        return impl
          .mutatedAttributesCallback({'src': {'random': 'value'}})
          .then(() => {
            expect(remoteDataSpy).not.to.have.been.called;
            expect(impl.sourceData_).to.be.an('array').that.is.empty;
            expect(filterAndRenderSpy).to.have.been.calledOnce;
            expect(filterAndRenderSpy).to.have.been.calledWith([], '');
          });
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

      impl.highlightUserEntry_ = true;
      element = impl.createElementFromItem_('hello');
      expect(element).not.to.be.null;
      expect(element).to.have.class('i-amphtml-autocomplete-item');
      expect(element.hasAttribute('role')).to.be.true;
      expect(element.innerHTML).to.equal('hello');

      element = impl.createElementFromItem_('');
      expect(element).not.to.be.null;
      expect(element).to.have.class('i-amphtml-autocomplete-item');
      expect(element.hasAttribute('role')).to.be.true;
      expect(element.innerHTML).to.equal('');

      element = impl.createElementFromItem_('hello', 'el');
      expect(element).not.to.be.null;
      expect(element).to.have.class('i-amphtml-autocomplete-item');
      expect(element.hasAttribute('role')).to.be.true;
      expect(element.innerHTML).to.equal(
        'h<span class="autocomplete-partial">el</span>lo'
      );

      element = impl.createElementFromItem_('hello', 'HeLlO');
      expect(element).not.to.be.null;
      expect(element).to.have.class('i-amphtml-autocomplete-item');
      expect(element.hasAttribute('role')).to.be.true;
      expect(element.innerHTML).to.equal(
        '<span class="autocomplete-partial">hello</span>'
      );

      element = impl.createElementFromItem_('hello', 'hellohello');
      expect(element).not.to.be.null;
      expect(element).to.have.class('i-amphtml-autocomplete-item');
      expect(element.hasAttribute('role')).to.be.true;
      expect(element.innerHTML).to.equal('hello');
    });

    describe('filterDataAndRenderResults_()', () => {
      let clearAllItemsSpy;
      let renderSpy;
      let filterDataSpy;

      beforeEach(() => {
        expect(impl.container_).not.to.be.null;
        expect(impl.container_.children.length).to.equal(0);
        clearAllItemsSpy = env.sandbox.spy(impl, 'clearAllItems_');
        filterDataSpy = env.sandbox.spy(impl, 'filterData_');
        renderSpy = env.sandbox.spy(impl, 'renderResults_');
      });

      it('should only clear if input < minChars_', () => {
        impl.minChars_ = 3;
        return impl.filterDataAndRenderResults_([], 'ap').then(() => {
          expect(clearAllItemsSpy).to.have.been.calledOnce;
          expect(filterDataSpy).not.to.have.been.called;
          expect(renderSpy).not.to.have.been.called;
        });
      });

      it('should only clear if data is null', () => {
        return impl.filterDataAndRenderResults_(null, 'ap').then(() => {
          expect(clearAllItemsSpy).to.have.been.calledOnce;
          expect(filterDataSpy).not.to.have.been.called;
          expect(renderSpy).not.to.have.been.called;
        });
      });

      it('should only clear if data is []', () => {
        return impl.filterDataAndRenderResults_([], 'ap').then(() => {
          expect(clearAllItemsSpy).to.have.been.calledOnce;
          expect(filterDataSpy).not.to.have.been.called;
          expect(renderSpy).not.to.have.been.called;
        });
      });

      it('should pass on valid arguments', () => {
        impl.minChars_ = 2;
        return impl
          .filterDataAndRenderResults_(impl.sourceData_, 'ap')
          .then(() => {
            expect(clearAllItemsSpy).to.have.been.calledOnce;
            expect(filterDataSpy).to.have.been.calledWith(
              impl.sourceData_,
              'ap'
            );
            expect(renderSpy).to.have.been.calledWith(
              ['apple'],
              impl.container_
            );
            expect(impl.container_.children.length).to.equal(1);
            expect(impl.container_.children[0].innerText).to.equal('apple');
          });
      });
    });

    it('renderResults_() should update the container_ with plain text', () => {
      const createSpy = env.sandbox.spy(impl, 'createElementFromItem_');
      return impl.renderResults_(['apple'], impl.container_).then(() => {
        expect(impl.container_.children.length).to.equal(1);
        expect(impl.container_.children[0].innerText).to.equal('apple');
        expect(createSpy).to.have.been.calledOnce;
        expect(createSpy).to.have.been.calledWith('apple');
      });
    });

    it('renderResults_() should update the container_ with rich text', () => {
      const sourceData = [{value: 'apple'}, {value: 'mango'}, {value: 'pear'}];
      impl.templateElement_ = doc.createElement('template');
      const renderedChildren = [];
      sourceData.forEach(item => {
        const renderedChild = doc.createElement('div');
        renderedChild.setAttribute('data-value', item.value);
        renderedChildren.push(renderedChild);
      });
      const renderTemplateSpy = env.sandbox
        .stub(impl.templates_, 'renderTemplateArray')
        .returns(Promise.resolve(renderedChildren));

      return impl.renderResults_(sourceData, impl.container_).then(() => {
        expect(impl.container_.children.length).to.equal(3);
        expect(impl.container_.children[0].getAttribute('data-value')).to.equal(
          'apple'
        );
        expect(impl.container_.children[1].getAttribute('data-value')).to.equal(
          'mango'
        );
        expect(impl.container_.children[2].getAttribute('data-value')).to.equal(
          'pear'
        );
        expect(renderTemplateSpy).to.have.been.calledOnce;
      });
    });

    it('filterData_() should filter based on all types', () => {
      // Substring filter
      expect(
        impl.filterData_(['a', 'b', 'ab', 'ba', 'c'], 'a')
      ).to.have.ordered.members(['a', 'ab', 'ba']);
      expect(
        impl.filterData_(['a', 'b', 'ab', 'ba', 'c'], 'A')
      ).to.have.ordered.members(['a', 'ab', 'ba']);
      // Prefix filter
      impl.filter_ = 'prefix';
      expect(
        impl.filterData_(['a', 'b', 'ab', 'ba', 'c'], 'a')
      ).to.have.ordered.members(['a', 'ab']);
      // Token-prefix filter
      impl.filter_ = 'token-prefix';
      expect(
        impl.filterData_(['a', 'b a', 'ab', 'ba', 'c a'], 'a')
      ).to.have.ordered.members(['a', 'b a', 'ab', 'c a']);
      expect(
        impl.filterData_(['a', 'b a', 'ab', 'ba', 'c a'], 'a c')
      ).to.have.ordered.members(['c a']);
      // None filter
      impl.filter_ = 'none';
      expect(
        impl.filterData_(['a', 'b a', 'ab', 'ba', 'c a'], 'a')
      ).to.have.ordered.members(['a', 'b a', 'ab', 'ba', 'c a']);
      // Fuzzy filter
      impl.filter_ = 'fuzzy';
      expect(
        impl.filterData_(
          ['interesting', 'into', 'stint', 'indigo', 'tin'],
          'int'
        )
      ).to.have.ordered.members(['interesting', 'into', 'stint']);
      // Remaining filters should error
      impl.filter_ = 'custom';
      expect(() => impl.filterData_(['a', 'b', 'c'], 'a')).to.throw(
        /Filter not yet supported:/
      );
      impl.filter_ = 'invalid';
      expect(() => impl.filterData_(['a', 'b', 'c'], 'a')).to.throw(
        /Unexpected filter:/
      );
    });

    it('tokenizeString_ should return an array of tokens', () => {
      expect(impl.tokenizeString_('')).to.have.ordered.members(['']);
      expect(impl.tokenizeString_('a b c')).to.have.ordered.members([
        'a',
        'b',
        'c',
      ]);
      expect(impl.tokenizeString_('a-b-c')).to.have.ordered.members([
        'a',
        'b',
        'c',
      ]);
      expect(impl.tokenizeString_('a. ...b).c')).to.have.ordered.members([
        'a',
        'b',
        'c',
      ]);
    });

    it('mapFromTokensArray_ should return a map of token counts', () => {
      expect(impl.mapFromTokensArray_([])).to.be.empty;
      expect(impl.mapFromTokensArray_(['a', 'b', 'c'])).to.have.all.keys(
        'a',
        'b',
        'c'
      );
      expect(
        impl.mapFromTokensArray_(['a', 'b', 'c', 'a', 'a'])
      ).to.have.all.keys('a', 'b', 'c');
    });

    it('tokenPrefixMatch_ should exhaustively match on complex cases', () => {
      const item = 'washington, district of columbia (d.c.)';
      expect(impl.tokenPrefixMatch_(item, 'washington')).to.be.true;
      expect(impl.tokenPrefixMatch_(item, 'district of columbia')).to.be.true;
      expect(impl.tokenPrefixMatch_(item, 'of colum')).to.be.true;
      expect(impl.tokenPrefixMatch_(item, 'district washington columbia of')).to
        .be.true;
      expect(impl.tokenPrefixMatch_(item, 'dc')).to.be.true;
      expect(impl.tokenPrefixMatch_(item, 'washington dc')).to.be.true;
      expect(impl.tokenPrefixMatch_(item, 'washington, d.c.')).to.be.true;
      expect(impl.tokenPrefixMatch_(item, 'washington, (dc)')).to.be.true;
      expect(impl.tokenPrefixMatch_(item, 'w.a.s.h.i.n.g.t.o.n.')).to.be.true;
      expect(impl.tokenPrefixMatch_(item, 'district-of-columbia')).to.be.true;
      expect(impl.tokenPrefixMatch_(item, "washington 'dc'")).to.be.true;
      expect(impl.tokenPrefixMatch_(item, 'washin.gton,   (..dc)+++++')).to.be
        .true;
      expect(impl.tokenPrefixMatch_(item, 'ashington dc')).to.be.false;
      expect(impl.tokenPrefixMatch_(item, 'washi distri')).to.be.false;
      expect(impl.tokenPrefixMatch_(item, 'columbia columbia')).to.be.false;
      expect(impl.tokenPrefixMatch_(item, 'd c')).to.be.false;
    });

    it('truncateToMaxEntries_() should truncate given data', () => {
      expect(
        impl.truncateToMaxEntries_(['a', 'b', 'c', 'd'])
      ).to.have.ordered.members(['a', 'b', 'c', 'd']);
      impl.maxEntries_ = 3;
      expect(
        impl.truncateToMaxEntries_(['a', 'b', 'c', 'd'])
      ).to.have.ordered.members(['a', 'b', 'c']);
      expect(
        impl.truncateToMaxEntries_(['a', 'b', 'c'])
      ).to.have.ordered.members(['a', 'b', 'c']);
      expect(impl.truncateToMaxEntries_(['a', 'b'])).to.have.ordered.members([
        'a',
        'b',
      ]);
    });

    it('should show and hide results on toggle', () => {
      expect(impl.areResultsDisplayed_()).to.be.false;
      return impl.renderResults_(['apple'], impl.container_).then(() => {
        expect(impl.areResultsDisplayed_()).to.be.false;
        impl.toggleResults_(true);
        expect(impl.areResultsDisplayed_()).to.be.true;
        impl.toggleResults_(false);
        expect(impl.areResultsDisplayed_()).to.be.false;
      });
    });

    describe('inputHandler_() on input', () => {
      let renderSpy,
        toggleResultsSpy,
        updateActiveSpy,
        clearAllItemsSpy,
        remoteDataSpy;

      it('should only clear items if binding should not autocomplete', () => {
        return element
          .layoutCallback()
          .then(() => {
            renderSpy = env.sandbox.spy(impl, 'renderResults_');
            toggleResultsSpy = env.sandbox.spy(impl, 'toggleResults_');
            clearAllItemsSpy = env.sandbox.spy(impl, 'clearAllItems_');
            env.sandbox
              .stub(impl.binding_, 'shouldAutocomplete')
              .returns(false);
            return impl.inputHandler_();
          })
          .then(() => {
            expect(clearAllItemsSpy).to.have.been.calledOnce;
            expect(renderSpy).not.to.have.been.called;
            expect(toggleResultsSpy).not.to.have.been.called;
          });
      });

      it('should only fetch data when autocompleting for email', () => {
        return element
          .layoutCallback()
          .then(() => {
            renderSpy = env.sandbox.spy(impl, 'filterDataAndRenderResults_');
            toggleResultsSpy = env.sandbox.spy(impl, 'toggleResults_');
            remoteDataSpy = env.sandbox
              .stub(impl, 'getRemoteData_')
              .resolves(['abc']);
            env.sandbox.stub(impl.binding_, 'shouldAutocomplete').returns(true);
            expect(impl.isEmail_).to.be.false;
            return impl.inputHandler_();
          })
          .then(() => {
            expect(remoteDataSpy).not.to.have.been.called;
            expect(renderSpy).to.have.been.calledOnce;
            expect(toggleResultsSpy).to.have.been.calledOnce;
            impl.isEmail_ = true;
            return impl.inputHandler_();
          })
          .then(() => {
            expect(remoteDataSpy).to.have.been.calledOnce;
            expect(renderSpy).to.have.been.calledTwice;
            expect(toggleResultsSpy).to.have.been.calledTwice;
          });
      });

      it('should record and respond to input', () => {
        return element
          .layoutCallback()
          .then(() => {
            impl.inputElement_.value = 'a';
            renderSpy = env.sandbox.spy(impl, 'renderResults_');
            toggleResultsSpy = env.sandbox.spy(impl, 'toggleResults_');
            updateActiveSpy = env.sandbox.spy(impl, 'updateActiveItem_');
            expect(impl.shouldSuggestFirst_).to.be.false;
            return impl.inputHandler_();
          })
          .then(() => {
            expect(renderSpy).to.have.been.calledOnce;
            expect(toggleResultsSpy).to.have.been.calledWith(true);
            expect(impl.container_.children.length).to.equal(3);
            expect(updateActiveSpy).not.to.have.been.called;
          });
      });

      it('should suggest first item when present', () => {
        return element
          .layoutCallback()
          .then(() => {
            impl.inputElement_.value = 'a';
            renderSpy = env.sandbox.spy(impl, 'renderResults_');
            toggleResultsSpy = env.sandbox.spy(impl, 'toggleResults_');
            updateActiveSpy = env.sandbox.spy(impl, 'updateActiveItem_');
            impl.shouldSuggestFirst_ = true;
            return impl.inputHandler_();
          })
          .then(() => {
            expect(renderSpy).to.have.been.calledOnce;
            expect(toggleResultsSpy).to.have.been.calledWith(true);
            expect(impl.container_.children.length).to.equal(3);
            expect(updateActiveSpy).to.have.been.calledWith(1);
          });
      });
    });

    describe('keyDownHandler_() on arrow keys', () => {
      const event = {key: Keys.DOWN_ARROW, preventDefault: () => {}};
      let displayInputSpy, updateActiveSpy, eventPreventSpy;

      beforeEach(() => {
        displayInputSpy = env.sandbox.spy(impl, 'displayUserInput_');
        updateActiveSpy = env.sandbox.spy(impl, 'updateActiveItem_');
        eventPreventSpy = env.sandbox.spy(event, 'preventDefault');
      });

      it('should updateActiveItem_ when results showing on Down arrow', () => {
        env.sandbox
          .stub(impl, 'areResultsDisplayed_')
          .onFirstCall()
          .returns(true);
        return element
          .layoutCallback()
          .then(() => {
            impl.activeIndex_ = 0;
            return impl.keyDownHandler_(event);
          })
          .then(() => {
            expect(eventPreventSpy).to.have.been.calledOnce;
            expect(displayInputSpy).not.to.have.been.called;
            expect(updateActiveSpy).to.have.been.calledWith(1);
          });
      });

      it('should displayUserInput_ when looping on Down arrow', () => {
        env.sandbox.stub(impl, 'areResultsDisplayed_').returns(true);
        return element
          .layoutCallback()
          .then(() => {
            return impl.keyDownHandler_(event);
          })
          .then(() => {
            expect(eventPreventSpy).to.have.been.calledOnce;
            expect(displayInputSpy).to.have.been.calledOnce;
            expect(updateActiveSpy).not.to.have.been.called;
          });
      });

      it('should display results if not already on Down arrow', () => {
        let filterAndRenderSpy, toggleResultsSpy;
        return element
          .layoutCallback()
          .then(() => {
            filterAndRenderSpy = env.sandbox.spy(
              impl,
              'filterDataAndRenderResults_'
            );
            toggleResultsSpy = env.sandbox.spy(impl, 'toggleResults_');
            return impl.keyDownHandler_(event);
          })
          .then(() => {
            expect(eventPreventSpy).to.have.been.calledOnce;
            expect(filterAndRenderSpy).to.have.been.calledOnce;
            expect(toggleResultsSpy).to.have.been.calledWith(true);
            expect(displayInputSpy).not.to.have.been.called;
            expect(updateActiveSpy).not.to.have.been.called;
          });
      });

      it('should updateActiveItem_ on Up arrow', () => {
        return element
          .layoutCallback()
          .then(() => {
            event.key = Keys.UP_ARROW;
            return impl.keyDownHandler_(event);
          })
          .then(() => {
            expect(eventPreventSpy).to.have.been.calledOnce;
            expect(displayInputSpy).not.to.have.been.called;
            expect(updateActiveSpy).to.have.been.calledWith(-1);
          });
      });

      it('should displayUserInput_ when looping on Up arrow', () => {
        return element
          .layoutCallback()
          .then(() => {
            event.key = Keys.UP_ARROW;
            impl.activeIndex_ = 0;
            return impl.keyDownHandler_(event);
          })
          .then(() => {
            expect(eventPreventSpy).to.have.been.calledOnce;
            expect(displayInputSpy).to.have.been.calledOnce;
            expect(updateActiveSpy).not.to.have.been.called;
          });
      });
    });

    describe('keyDownHandler_() on Enter', () => {
      const event = {
        key: Keys.ENTER,
        preventDefault: () => {},
        target: {textContent: 'hello'},
      };
      let selectItemSpy, resetSpy, clearAllSpy, eventPreventSpy;
      function layoutAndSetSpies() {
        return element.layoutCallback().then(() => {
          eventPreventSpy = env.sandbox.spy(event, 'preventDefault');
          selectItemSpy = env.sandbox.spy(impl, 'selectItem_');
          resetSpy = env.sandbox.spy(impl, 'resetActiveElement_');
          clearAllSpy = env.sandbox.spy(impl, 'clearAllItems_');
        });
      }

      it('should do nothing when there is no active item', () => {
        return layoutAndSetSpies()
          .then(() => {
            return impl.keyDownHandler_(event);
          })
          .then(() => {
            expect(impl.inputElement_.value).to.equal('');
            expect(selectItemSpy).not.to.have.been.called;
            expect(clearAllSpy).not.to.have.been.called;
            expect(resetSpy).not.to.have.been.called;
            expect(eventPreventSpy).not.to.have.been.called;
          });
      });

      it('should call selectItem_ and resetActiveElement_ as expected', () => {
        return layoutAndSetSpies()
          .then(() => {
            impl.activeElement_ = impl.createElementFromItem_('abc');
            env.sandbox.stub(impl, 'areResultsDisplayed_').returns(true);
            return impl.keyDownHandler_(event);
          })
          .then(() => {
            expect(impl.inputElement_.value).to.equal('abc');
            expect(selectItemSpy).to.have.been.calledOnce;
            expect(clearAllSpy).to.have.been.calledOnce;
            expect(resetSpy).to.have.been.calledOnce;
            expect(eventPreventSpy).to.have.been.calledOnce;
          });
      });

      it('should call event.preventDefault based on binding', () => {
        return layoutAndSetSpies()
          .then(() => {
            impl.activeElement_ = impl.createElementFromItem_('abc');
            env.sandbox.stub(impl, 'areResultsDisplayed_').returns(true);
            env.sandbox
              .stub(impl.binding_, 'shouldPreventFormSubmissionOnEnter')
              .returns(true);
            return impl.keyDownHandler_(event);
          })
          .then(() => {
            expect(selectItemSpy).to.have.been.calledOnce;
            expect(clearAllSpy).to.have.been.calledOnce;
            expect(resetSpy).to.have.been.calledOnce;
            expect(eventPreventSpy).to.have.been.called;
          });
      });
    });

    it('should call keyDownHandler_() on Esc', () => {
      const event = {key: Keys.ESCAPE, preventDefault: () => {}};
      const displayInputSpy = env.sandbox.spy(impl, 'displayUserInput_');
      const resetSpy = env.sandbox.spy(impl, 'resetActiveElement_');
      const toggleResultsSpy = env.sandbox.spy(impl, 'toggleResults_');
      return element
        .layoutCallback()
        .then(() => {
          impl.userInput_ = 'a';
          return impl.renderResults_(impl.sourceData_, impl.container_);
        })
        .then(() => {
          expect(impl.container_.children.length).to.equal(3);
          expect(resetSpy).to.have.been.calledOnce;
          impl.toggleResults_(true);
          expect(impl.areResultsDisplayed_()).to.be.true;
          return impl.keyDownHandler_(event);
        })
        .then(() => {
          expect(displayInputSpy).to.have.been.calledOnce;
          expect(resetSpy).to.have.been.calledTwice;
          expect(toggleResultsSpy).to.have.been.calledWith(false);
          expect(impl.areResultsDisplayed_()).to.be.false;
        });
    });

    it('should call keyDownHandler_() on Tab', () => {
      const event = {key: Keys.TAB, preventDefault: () => {}};
      const eventPreventSpy = env.sandbox.spy(event, 'preventDefault');
      impl.inputElement_.value = 'expected';
      impl.activeElement_ = doc.createElement('div');
      expect(impl.userInput_).not.to.equal(impl.inputElement_.value);
      env.sandbox.stub(impl, 'areResultsDisplayed_').returns(true);
      const fireEventSpy = env.sandbox.spy(impl, 'fireSelectEvent_');
      return element
        .layoutCallback()
        .then(() => {
          return impl.keyDownHandler_(event);
        })
        .then(() => {
          expect(impl.userInput_).to.equal(impl.inputElement_.value);
          expect(fireEventSpy).to.have.been.calledWith(impl.userInput_);
          expect(eventPreventSpy).to.have.been.calledOnce;
        });
    });

    describe('keyDownHandler_() on Backspace', () => {
      const event = {key: Keys.BACKSPACE};

      it('should set flag to true when suggest-first is present', () => {
        return element
          .layoutCallback()
          .then(() => {
            impl.shouldSuggestFirst_ = true;
            expect(impl.detectBackspace_).to.be.false;
            return impl.keyDownHandler_(event);
          })
          .then(() => {
            expect(impl.detectBackspace_).to.be.true;
          });
      });

      it('should not set flag when suggest-first is absent', () => {
        return element
          .layoutCallback()
          .then(() => {
            expect(impl.shouldSuggestFirst_).to.be.false;
            expect(impl.detectBackspace_).to.be.false;
            return impl.keyDownHandler_(event);
          })
          .then(() => {
            expect(impl.detectBackspace_).to.be.false;
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
      const toggleResultsSpy = env.sandbox.spy(impl, 'toggleResults_');
      const resetSpy = env.sandbox.spy(impl, 'resetActiveElement_');
      return element
        .layoutCallback()
        .then(() => {
          return impl.toggleResultsHandler_(true);
        })
        .then(() => {
          expect(toggleResultsSpy).to.have.been.calledOnce;
          expect(impl.inputElement_.form.getAttribute('autocomplete')).to.equal(
            'off'
          );
          expect(resetSpy).not.to.have.been.called;
          return impl.toggleResultsHandler_(false);
        })
        .then(() => {
          expect(toggleResultsSpy).to.have.been.calledTwice;
          expect(impl.inputElement_.form.hasAttribute('autocomplete')).to.be
            .false;
          expect(resetSpy).to.have.been.calledOnce;
        });
    });

    it('should call selectHandler_() on mousedown', () => {
      const getItemSpy = env.sandbox.spy(impl, 'getItemElement_');
      const selectItemSpy = env.sandbox.spy(impl, 'selectItem_');
      let mockEl = doc.createElement('div');
      return element
        .layoutCallback()
        .then(() => {
          impl.toggleResults_(true);
          mockEl.textContent = 'test';
          return impl.selectHandler_({target: mockEl});
        })
        .then(() => {
          expect(getItemSpy).to.have.been.calledTwice;
          expect(selectItemSpy).to.have.been.called;
          expect(impl.inputElement_.value).to.equal('');
          mockEl = impl.createElementFromItem_('abc');
          return impl.selectHandler_({target: mockEl});
        })
        .then(() => {
          expect(getItemSpy).to.have.been.calledWith(mockEl);
          expect(selectItemSpy).to.have.been.calledWith(mockEl);
          expect(impl.inputElement_.value).to.equal('abc');
        });
    });

    it('should fire select event from selectItem_', () => {
      const fireEventSpy = env.sandbox.spy(impl, 'fireSelectEvent_');
      const triggerSpy = env.sandbox.spy(impl.action_, 'trigger');
      const mockEl = doc.createElement('div');
      return element.layoutCallback().then(() => {
        impl.toggleResults_(true);
        mockEl.setAttribute('data-value', 'test');
        impl.selectItem_(mockEl);
        expect(fireEventSpy).to.have.been.calledOnce;
        expect(fireEventSpy).to.have.been.calledWith('test');
        expect(triggerSpy).to.have.been.calledOnce;
      });
    });

    it('should support marking active items', () => {
      let resetSpy;
      return element
        .layoutCallback()
        .then(() => {
          expect(impl.activeElement_).to.be.null;
          expect(impl.activeIndex_).to.equal(-1);
          impl.userInput_ = 'a';
          return impl.renderResults_(impl.sourceData_, impl.container_);
        })
        .then(() => {
          expect(impl.container_.children.length).to.equal(3);
          impl.activeElement_ = doc.createElement('div');
          expect(impl.activeElement_).not.to.be.null;
          expect(impl.resetActiveElement_()).to.equal();
          expect(impl.activeElement_).to.be.null;
          impl.toggleResults_(true);
          resetSpy = env.sandbox.spy(impl, 'resetActiveElement_');
          return impl.updateActiveItem_(1);
        })
        .then(() => {
          expect(resetSpy).to.have.been.calledOnce;
          expect(impl.activeIndex_).to.equal(0);
          expect(impl.activeElement_).not.to.be.null;
          expect(impl.activeElement_).to.have.class(
            'i-amphtml-autocomplete-item-active'
          );
          expect(impl.container_.children[1]).not.to.have.class(
            'i-amphtml-autocomplete-item-active'
          );
          expect(impl.container_.children[2]).not.to.have.class(
            'i-amphtml-autocomplete-item-active'
          );
          return impl.updateActiveItem_(-1);
        })
        .then(() => {
          expect(resetSpy).to.have.been.calledTwice;
          expect(impl.activeIndex_).to.equal(2);
          expect(impl.activeElement_).not.to.be.null;
          expect(impl.activeElement_).to.have.class(
            'i-amphtml-autocomplete-item-active'
          );
          expect(impl.container_.children[0]).not.to.have.class(
            'i-amphtml-autocomplete-item-active'
          );
          expect(impl.container_.children[1]).not.to.have.class(
            'i-amphtml-autocomplete-item-active'
          );
          return impl.updateActiveItem_(-1);
        })
        .then(() => {
          expect(resetSpy).to.have.been.calledThrice;
          expect(impl.activeIndex_).to.equal(1);
          expect(impl.activeElement_).not.to.be.null;
          expect(impl.activeElement_).to.have.class(
            'i-amphtml-autocomplete-item-active'
          );
          expect(impl.container_.children[0]).not.to.have.class(
            'i-amphtml-autocomplete-item-active'
          );
          expect(impl.container_.children[2]).not.to.have.class(
            'i-amphtml-autocomplete-item-active'
          );
          return impl.updateActiveItem_(0);
        })
        .then(() => {
          expect(resetSpy).to.have.been.calledThrice;
          expect(impl.activeIndex_).to.equal(1);
          expect(impl.activeElement_).not.to.be.null;
          expect(impl.activeElement_).to.have.class(
            'i-amphtml-autocomplete-item-active'
          );
          expect(impl.container_.children[0]).not.to.have.class(
            'i-amphtml-autocomplete-item-active'
          );
          expect(impl.container_.children[2]).not.to.have.class(
            'i-amphtml-autocomplete-item-active'
          );
        });
    });

    it('should not select disabled items', () => {
      const disabledItem = doc.createElement('div');
      disabledItem.setAttribute('data-disabled', '');
      expect(impl.selectItem_(disabledItem)).to.be.undefined;
    });

    it('should not return disabled items from getEnabledItems_()', () => {
      impl.templateElement_ = doc.createElement('template');
      const sourceData = ['apple', 'mango', 'pear'];
      const renderedChildren = sourceData.map(item => {
        const renderedChild = doc.createElement('div');
        renderedChild.setAttribute('data-value', item);
        return renderedChild;
      });
      renderedChildren[2].setAttribute('data-disabled', '');
      env.sandbox
        .stub(impl.templates_, 'renderTemplateArray')
        .returns(Promise.resolve(renderedChildren));

      return impl.renderResults_(sourceData, impl.container_).then(() => {
        expect(impl.container_.children.length).to.equal(3);
        expect(impl.getEnabledItems_().length).to.equal(2);
        expect(impl.container_.children[2].hasAttribute('aria-disabled')).to.be
          .true;
      });
    });

    describe('fallback on error', () => {
      let fallbackSpy;
      let toggleFallbackSpy;
      let getDataSpy;

      beforeEach(() => {
        impl.element.setAttribute('src', 'invalid-path');
        fallbackSpy = env.sandbox.spy(impl, 'displayFallback_');
        toggleFallbackSpy = env.sandbox.spy(impl, 'toggleFallback');
        getDataSpy = env.sandbox
          .stub(impl, 'getRemoteData_')
          .returns(Promise.reject('Error for test'));
      });

      it('should throw error when fallback is not provided', () => {
        return element.layoutCallback().catch(e => {
          expect(getDataSpy).to.have.been.calledOnce;
          expect(fallbackSpy).to.have.been.calledWith(e);
          expect(toggleFallbackSpy).not.to.have.been.called;
        });
      });

      it('should not display fallback before user interaction', () => {
        env.sandbox.stub(impl, 'getFallback').returns(true);
        return element.layoutCallback().then(() => {
          expect(getDataSpy).not.to.have.been.called;
          expect(fallbackSpy).not.to.have.been.called;
          expect(toggleFallbackSpy).not.to.have.been.called;
        });
      });

      it('should display fallback after user interaction if provided', () => {
        env.sandbox.stub(impl, 'getFallback').returns(true);
        return element.layoutCallback().then(() => {
          impl.checkFirstInteractionAndMaybeFetchData_().then(() => {
            expect(getDataSpy).to.have.been.calledOnce;
            expect(fallbackSpy).to.have.been.calledWith('Error for test');
            expect(toggleFallbackSpy).to.have.been.calledWith(true);
          });
        });
      });
    });

    it('should generate expected src values from "query" attribute', () => {
      return element.layoutCallback().then(() => {
        impl.queryKey_ = 'q';
        impl.srcBase_ = 'https://www.data.com/';
        expect(impl.generateSrc_('')).to.equal('https://www.data.com/?q=');
        expect(impl.generateSrc_('abc')).to.equal(
          'https://www.data.com/?q=abc'
        );
      });
    });
  }
);
