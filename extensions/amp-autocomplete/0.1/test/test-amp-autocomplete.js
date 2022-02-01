import '../amp-autocomplete';
import {Keys_Enum} from '#core/constants/key-codes';
import {createElementWithAttributes} from '#core/dom';
import {htmlFor} from '#core/dom/static-template';

import {AmpAutocomplete} from '../amp-autocomplete';

describes.realWin(
  'amp-autocomplete unit tests',
  {
    amp: {
      extensions: ['amp-autocomplete'],
    },
  },
  (env) => {
    let win, doc, impl;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
      return buildAmpAutocomplete().then((ampAutocomplete) => {
        impl = ampAutocomplete;
      });
    });

    function buildAmpAutocomplete(wantSsr) {
      const element = createElementWithAttributes(doc, 'amp-autocomplete', {
        layout: 'container',
        filter: 'substring',
      });

      const input = win.document.createElement('input');
      input.setAttribute('type', 'text');
      element.appendChild(input);

      const script = win.document.createElement('script');
      script.setAttribute('type', 'application/json');
      script.innerHTML = '{ "items" : ["apple", "banana", "orange"] }';
      element.appendChild(script);

      doc.body.appendChild(element);

      if (wantSsr) {
        element.removeAttribute('filter');
        element.setAttribute('src', 'example.json');
        const template = doc.createElement('template');
        element.appendChild(template);
      }

      const ampAutocomplete = new AmpAutocomplete(element);
      const ssrTemplateHelper = ampAutocomplete.getSsrTemplateHelper();
      env.sandbox.stub(ssrTemplateHelper, 'isEnabled').returns(wantSsr);

      return ampAutocomplete.buildCallback().then(() => {
        return ampAutocomplete;
      });
    }

    function getRenderedSuggestions() {
      const html = htmlFor(doc);
      return [
        html`<div data-value="apple"></div>`,
        html`<div data-value="mango"></div>`,
        html`<div data-value="pear"></div>`,
      ];
    }

    describe('mutatedAttributesCallback_()', () => {
      let remoteDataSpy, autocompleteSpy;

      beforeEach(() => {
        remoteDataSpy = env.sandbox
          .stub(impl, 'getRemoteData_')
          .resolves(['a', 'b', 'c']);
        autocompleteSpy = env.sandbox.spy(impl, 'autocomplete_');
      });

      it('should resolve when param is {}', () => {
        return impl.mutatedAttributesCallback({}).then(() => {
          expect(remoteDataSpy).not.to.have.been.called;
          expect(autocompleteSpy).not.to.have.been.called;
        });
      });

      it('should resolve when src is undefined', () => {
        return impl.mutatedAttributesCallback({'src': undefined}).then(() => {
          expect(remoteDataSpy).not.to.have.been.called;
          expect(autocompleteSpy).not.to.have.been.called;
        });
      });

      it('should resolve when src is null', () => {
        return impl.mutatedAttributesCallback({'src': null}).then(() => {
          expect(remoteDataSpy).not.to.have.been.called;
          expect(autocompleteSpy).not.to.have.been.called;
        });
      });

      it('should pass on calls when src is type str', () => {
        return impl
          .mutatedAttributesCallback({'src': 'example.json'})
          .then(() => {
            expect(remoteDataSpy).to.have.been.calledOnce;
            expect(impl.sourceData_).to.have.ordered.members(['a', 'b', 'c']);
            expect(autocompleteSpy).to.have.been.calledOnce;
            expect(autocompleteSpy).to.have.been.calledWith(
              ['a', 'b', 'c'],
              ''
            );
          });
      });

      it('should mutate expected src value with "query" attribute', () => {
        return impl
          .layoutCallback()
          .then(() => {
            impl.queryKey_ = 'q';
            impl.srcBase_ = 'https://www.data.com/';
            expect(impl.generateSrc_('')).to.equal('https://www.data.com/?q=');
            expect(impl.generateSrc_('abc')).to.equal(
              'https://www.data.com/?q=abc'
            );
            return impl.mutatedAttributesCallback({
              'src': 'https://example.com',
            });
          })
          .then(() => {
            expect(impl.srcBase_).to.equal('https://example.com');
            expect(impl.generateSrc_('')).to.equal('https://example.com?q=');
            expect(impl.generateSrc_('abc')).to.equal(
              'https://example.com?q=abc'
            );
          });
      });

      it('should pass on calls when src is type object with "items"', () => {
        return impl
          .mutatedAttributesCallback({'src': {'items': ['a', 'b', 'c']}})
          .then(() => {
            expect(remoteDataSpy).not.to.have.been.called;
            expect(impl.sourceData_).to.have.ordered.members(['a', 'b', 'c']);
            expect(autocompleteSpy).to.have.been.calledOnce;
            expect(autocompleteSpy).to.have.been.calledWith(
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
            expect(autocompleteSpy).to.have.been.calledOnce;
            expect(autocompleteSpy).to.have.been.calledWith([], '');
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

    describe('autocomplete_()', () => {
      let clearAllItemsSpy;
      let renderSpy;
      let filterDataSpy;

      beforeEach(() => {
        expect(impl.container_).not.to.be.null;
        expect(impl.container_.children).to.have.length(0);
        clearAllItemsSpy = env.sandbox.spy(impl, 'clearAllItems_');
        filterDataSpy = env.sandbox.spy(impl, 'filterData_');
        renderSpy = env.sandbox.spy(impl, 'renderResults_');
      });

      it('should only clear if input < minChars_', () => {
        impl.minChars_ = 3;
        return impl.autocomplete_([], 'ap').then(() => {
          expect(clearAllItemsSpy).to.have.been.calledOnce;
          expect(filterDataSpy).not.to.have.been.called;
          expect(renderSpy).not.to.have.been.called;
        });
      });

      it('should only clear if data is null', () => {
        return impl.autocomplete_(null, 'ap').then(() => {
          expect(clearAllItemsSpy).to.have.been.calledOnce;
          expect(filterDataSpy).not.to.have.been.called;
          expect(renderSpy).not.to.have.been.called;
        });
      });

      it('should only clear if data is []', () => {
        return impl.autocomplete_([], 'ap').then(() => {
          expect(clearAllItemsSpy).to.have.been.calledOnce;
          expect(filterDataSpy).not.to.have.been.called;
          expect(renderSpy).not.to.have.been.called;
        });
      });

      it('should pass on valid arguments', () => {
        impl.minChars_ = 2;
        return impl.autocomplete_(impl.sourceData_, 'ap').then(() => {
          expect(clearAllItemsSpy).to.have.been.calledOnce;
          expect(filterDataSpy).to.have.been.calledWith(impl.sourceData_, 'ap');
          expect(renderSpy).to.have.been.calledWith(['apple'], impl.container_);
          expect(impl.container_.children).to.have.length(1);
          expect(impl.container_.children[0].innerText).to.equal('apple');
        });
      });
    });

    describe('getRemoteData_()', () => {
      it('should proxy XHR to viewer', async () => {
        impl = await buildAmpAutocomplete(true);
        impl.element.setAttribute('src', '');
        const rendered = getRenderedSuggestions();
        const ssrSpy = env.sandbox
          .stub(impl.getSsrTemplateHelper(), 'ssr')
          .returns(Promise.resolve({rendered}));
        await impl.getRemoteData_();
        expect(ssrSpy).to.be.calledOnce;
      });
    });

    describe('filterDataAndRenderResults_()', () => {
      let renderSpy;

      describe('with string data', () => {
        beforeEach(() => {
          // Use prefix filter for these tests.
          impl.filter_ = 'prefix';
          renderSpy = env.sandbox.spy(impl, 'renderResults_');
        });

        it('should resolve when data is []', async () => {
          await impl.filterDataAndRenderResults_([], '');
          expect(renderSpy).not.to.have.been.called;
        });

        it('should render data unchanged when input empty', async () => {
          await impl.filterDataAndRenderResults_(['aa', 'bb', 'cc'], '');
          expect(renderSpy).to.have.been.calledWith(
            ['aa', 'bb', 'cc'],
            impl.container_,
            ''
          );
        });

        it("should render no data when input doesn't match", async () => {
          await impl.filterDataAndRenderResults_(['aa', 'bb', 'cc'], 'd');
          expect(renderSpy).to.have.been.calledWith([], impl.container_, 'd');
        });

        it('should filter string data when input provided', async () => {
          await impl.filterDataAndRenderResults_(['aa', 'bb', 'cc'], 'a');
          expect(renderSpy).to.have.been.calledWith(
            ['aa'],
            impl.container_,
            'a'
          );
        });
      });

      describe('with object data', () => {
        beforeEach(async () => {
          impl = await buildAmpAutocomplete(true);
          impl.filter_ = 'prefix';
          renderSpy = env.sandbox.spy(impl, 'renderResults_');
          env.sandbox
            .stub(impl.getSsrTemplateHelper(), 'applySsrOrCsrTemplate')
            .returns(Promise.resolve(getRenderedSuggestions()));
        });

        it('should add objToJson property to objects', async () => {
          const obj1 = {value: 'aa', any: 'zz'};
          const obj2 = {value: 'bb', any: 'yy'};
          await impl.filterDataAndRenderResults_([obj1, obj2], '');
          expect(renderSpy).to.have.been.calledWithMatch(
            [
              {...obj1, objToJson: env.sandbox.match.func},
              {...obj2, objToJson: env.sandbox.match.func},
            ],
            impl.container_,
            ''
          );
        });

        it('should add objToJson property to objects and filter', async () => {
          const obj1 = {value: 'aa', any: 'zz'};
          const obj2 = {value: 'bb', any: 'yy'};
          await impl.filterDataAndRenderResults_([obj1, obj2], 'a');
          expect(renderSpy).to.have.been.calledWithMatch(
            [{...obj1, objToJson: env.sandbox.match.func}],
            impl.container_,
            'a'
          );
        });
      });
    });

    describe('renderResults()', () => {
      it('should delegate template rendering to viewer', async () => {
        impl = await buildAmpAutocomplete(true);
        const data = ['apple', 'mango', 'pear'];
        env.sandbox
          .stub(impl.getSsrTemplateHelper(), 'applySsrOrCsrTemplate')
          .returns(Promise.resolve(getRenderedSuggestions()));
        await impl.renderResults_(data, impl.container_);
        expect(impl.getSsrTemplateHelper().applySsrOrCsrTemplate).to.be
          .calledOnce;
        expect(
          impl.getSsrTemplateHelper().applySsrOrCsrTemplate
        ).to.have.been.calledWith(impl.element, data);
        expect(impl.container_.children[0].getAttribute('data-value')).to.equal(
          data[0]
        );
        expect(impl.container_.children[1].getAttribute('data-value')).to.equal(
          data[1]
        );
        expect(impl.container_.children[2].getAttribute('data-value')).to.equal(
          data[2]
        );
        expect(impl.container_.children).to.have.length(3);
      });

      it('should update the container_ with plain text', async () => {
        const createSpy = env.sandbox.spy(impl, 'createElementFromItem_');
        await impl.renderResults_(['apple'], impl.container_);
        expect(impl.container_.children).to.have.length(1);
        expect(impl.container_.children[0].innerText).to.equal('apple');
        expect(createSpy).to.have.been.calledOnce;
        expect(createSpy).to.have.been.calledWith('apple');
      });

      it('should update the container_ with rich text', async () => {
        const sourceData = [
          {value: 'apple'},
          {value: 'mango'},
          {value: 'pear'},
        ];
        impl = await buildAmpAutocomplete(true);
        const renderTemplateSpy = env.sandbox
          .stub(impl.getSsrTemplateHelper(), 'applySsrOrCsrTemplate')
          .returns(Promise.resolve(getRenderedSuggestions()));
        await impl.renderResults_(sourceData, impl.container_);
        expect(impl.container_.children).to.have.length(3);
        expect(impl.container_.children[0].getAttribute('data-value')).to.equal(
          sourceData[0].value
        );
        expect(impl.container_.children[1].getAttribute('data-value')).to.equal(
          sourceData[1].value
        );
        expect(impl.container_.children[2].getAttribute('data-value')).to.equal(
          sourceData[2].value
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

    it('truncateToMaxItems_() should truncate given data', () => {
      expect(
        impl.truncateToMaxItems_(['a', 'b', 'c', 'd'])
      ).to.have.ordered.members(['a', 'b', 'c', 'd']);
      impl.maxItems_ = 3;
      expect(
        impl.truncateToMaxItems_(['a', 'b', 'c', 'd'])
      ).to.have.ordered.members(['a', 'b', 'c']);
      expect(impl.truncateToMaxItems_(['a', 'b', 'c'])).to.have.ordered.members(
        ['a', 'b', 'c']
      );
      expect(impl.truncateToMaxItems_(['a', 'b'])).to.have.ordered.members([
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
        return impl
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

      it('should only fetch data when autocompleting for SSR', async () => {
        impl = await buildAmpAutocomplete(true);
        await impl.layoutCallback();
        const autocompleteSpy = env.sandbox.spy(impl, 'autocomplete_');
        toggleResultsSpy = env.sandbox.spy(impl, 'toggleResults_');
        remoteDataSpy = env.sandbox
          .stub(impl, 'getRemoteData_')
          .resolves(['abc']);
        env.sandbox.stub(impl.binding_, 'shouldAutocomplete').returns(true);
        await impl.inputHandler_();
        expect(remoteDataSpy).to.have.been.calledOnce;
        expect(autocompleteSpy).to.have.been.calledOnce;
        expect(toggleResultsSpy).to.have.been.calledOnce;
        await impl.inputHandler_();
        expect(remoteDataSpy).to.have.been.calledTwice;
        expect(autocompleteSpy).to.have.been.calledTwice;
        expect(toggleResultsSpy).to.have.been.calledTwice;
      });

      it('should record and respond to input', () => {
        return impl
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
            expect(impl.container_.children).to.have.length(3);
            expect(updateActiveSpy).not.to.have.been.called;
          });
      });

      it('should suggest first item when present', () => {
        return impl
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
            expect(impl.container_.children).to.have.length(3);
            expect(updateActiveSpy).to.have.been.calledWith(1);
          });
      });
    });

    describe('keyDownHandler_() on arrow keys', () => {
      const event = {key: Keys_Enum.DOWN_ARROW, preventDefault: () => {}};
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
        return impl
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
        return impl
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
        let autocompleteSpy, toggleResultsSpy;
        return impl
          .layoutCallback()
          .then(() => {
            autocompleteSpy = env.sandbox.spy(impl, 'autocomplete_');
            toggleResultsSpy = env.sandbox.spy(impl, 'toggleResults_');
            return impl.keyDownHandler_(event);
          })
          .then(() => {
            expect(eventPreventSpy).to.have.been.calledOnce;
            expect(autocompleteSpy).to.have.been.calledOnce;
            expect(toggleResultsSpy).to.have.been.calledWith(true);
            expect(displayInputSpy).not.to.have.been.called;
            expect(updateActiveSpy).not.to.have.been.called;
          });
      });

      it('should updateActiveItem_ on Up arrow', () => {
        return impl
          .layoutCallback()
          .then(() => {
            event.key = Keys_Enum.UP_ARROW;
            return impl.keyDownHandler_(event);
          })
          .then(() => {
            expect(eventPreventSpy).to.have.been.calledOnce;
            expect(displayInputSpy).not.to.have.been.called;
            expect(updateActiveSpy).to.have.been.calledWith(-1);
          });
      });

      it('should displayUserInput_ when looping on Up arrow', () => {
        return impl
          .layoutCallback()
          .then(() => {
            event.key = Keys_Enum.UP_ARROW;
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
        key: Keys_Enum.ENTER,
        preventDefault: () => {},
        target: {textContent: 'hello'},
      };
      let selectItemSpy, resetSpy, clearAllSpy, eventPreventSpy;
      function layoutAndSetSpies() {
        return impl.layoutCallback().then(() => {
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
              .stub(impl.binding_, 'shouldPreventDefaultOnEnter')
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
      const event = {key: Keys_Enum.ESCAPE, preventDefault: () => {}};
      const displayInputSpy = env.sandbox.spy(impl, 'displayUserInput_');
      const resetSpy = env.sandbox.spy(impl, 'resetActiveElement_');
      const toggleResultsSpy = env.sandbox.spy(impl, 'toggleResults_');
      return impl
        .layoutCallback()
        .then(() => {
          impl.userInput_ = 'a';
          return impl.renderResults_(impl.sourceData_, impl.container_);
        })
        .then(() => {
          expect(impl.container_.children).to.have.length(3);
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
      const event = {key: Keys_Enum.TAB, preventDefault: () => {}};
      const eventPreventSpy = env.sandbox.spy(event, 'preventDefault');
      impl.inputElement_.value = 'expected';
      impl.activeElement_ = doc.createElement('div');
      expect(impl.userInput_).not.to.equal(impl.inputElement_.value);
      env.sandbox.stub(impl, 'areResultsDisplayed_').returns(true);
      const fireEventSpy = env.sandbox.spy(impl, 'fireSelectAndChangeEvents_');
      return impl
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
      const event = {key: Keys_Enum.BACKSPACE};

      it('should set flag to true when suggest-first is present', () => {
        return impl
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
        return impl
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
      const event = {key: Keys_Enum.LEFT_ARROW};
      return impl.layoutCallback().then(() => {
        return expect(impl.keyDownHandler_(event)).to.be.fulfilled;
      });
    });

    it('should call toggleResultsHandler_()', () => {
      const toggleResultsSpy = env.sandbox.spy(impl, 'toggleResults_');
      const resetSpy = env.sandbox.spy(impl, 'resetActiveElement_');
      const form = doc.createElement('form');
      form.appendChild(impl.element);
      doc.body.appendChild(form);
      return impl
        .layoutCallback()
        .then(() => {
          return impl.toggleResultsHandler_(true);
        })
        .then(() => {
          expect(toggleResultsSpy).to.have.been.calledOnce;
          expect(impl.getFormOrNull_().getAttribute('autocomplete')).to.equal(
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
      return impl
        .layoutCallback()
        .then(() => {
          impl.toggleResults_(true);
          mockEl.textContent = 'test';
          return impl.selectHandler_({target: mockEl});
        })
        .then(() => {
          expect(getItemSpy).to.have.been.calledTwice;
          expect(selectItemSpy).to.have.been.calledWith(null);
          expect(impl.inputElement_.value).to.equal('');
          mockEl = impl.createElementFromItem_('abc');
          return impl.selectHandler_({target: mockEl});
        })
        .then(() => {
          expect(getItemSpy).to.have.been.calledWith(mockEl);
          expect(selectItemSpy).to.have.been.calledWith('abc');
          expect(impl.inputElement_.value).to.equal('abc');
        });
    });

    it('should set input based on data-value and select item from data-json', async () => {
      const selectItemSpy = env.sandbox.spy(impl, 'selectItem_');
      const mockEl = impl.createElementFromItem_('abc');
      const object = {a: 'aa', b: 'bb'};
      mockEl.setAttribute('data-json', JSON.stringify(object));

      await impl.layoutCallback();
      await impl.selectHandler_({target: mockEl});

      expect(impl.inputElement_.value).to.equal('abc');
      expect(selectItemSpy).to.have.been.calledWith('abc', object);
    });

    it('should fire events from selectItem_', () => {
      const fireEventSpy = env.sandbox.spy(impl, 'fireSelectAndChangeEvents_');
      const triggerSpy = env.sandbox.spy(impl.action_, 'trigger');
      const dispatchSpy = env.sandbox.spy(impl.inputElement_, 'dispatchEvent');
      return impl.layoutCallback().then(() => {
        impl.toggleResults_(true);
        impl.selectItem_('test', {val: 'v'});
        expect(fireEventSpy).to.have.been.calledOnce;
        expect(fireEventSpy).to.have.been.calledWith('test', {val: 'v'});
        expect(triggerSpy).to.have.been.calledWith(impl.element, 'select');
        expect(triggerSpy).to.have.been.calledWith(
          impl.inputElement_,
          'change'
        );
        expect(dispatchSpy).to.have.been.calledOnce;
      });
    });

    it('should fire event if when selectedObject is null', () => {
      const fireEventSpy = env.sandbox.spy(impl, 'fireSelectAndChangeEvents_');
      const triggerSpy = env.sandbox.spy(impl.action_, 'trigger');
      const dispatchSpy = env.sandbox.spy(impl.inputElement_, 'dispatchEvent');
      return impl.layoutCallback().then(() => {
        impl.toggleResults_(true);
        impl.selectItem_('test', /* selectedObject= */ null);
        expect(fireEventSpy).to.have.been.calledOnce;
        expect(fireEventSpy).to.have.been.calledWith(
          'test',
          /* selectedObject= */ null
        );
        expect(triggerSpy).to.have.been.calledWith(impl.element, 'select');
        expect(triggerSpy).to.have.been.calledWith(
          impl.inputElement_,
          'change'
        );
        expect(dispatchSpy).to.have.been.calledOnce;
      });
    });

    it('should support marking active items', () => {
      let resetSpy;
      return impl
        .layoutCallback()
        .then(() => {
          expect(impl.activeElement_).to.be.null;
          expect(impl.activeIndex_).to.equal(-1);
          impl.userInput_ = 'a';
          return impl.renderResults_(impl.sourceData_, impl.container_);
        })
        .then(() => {
          expect(impl.container_.children).to.have.length(3);
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

    it('should not return disabled items from getEnabledItems_()', async () => {
      impl = await buildAmpAutocomplete(true);
      const sourceData = ['apple', 'mango', 'pear'];
      const rendered = getRenderedSuggestions();
      rendered[2].removeAttribute('data-value', '');
      rendered[2].setAttribute('data-disabled', '');
      env.sandbox
        .stub(impl.getSsrTemplateHelper(), 'applySsrOrCsrTemplate')
        .returns(Promise.resolve(rendered));

      await impl.renderResults_(sourceData, impl.container_);
      expect(impl.container_.children).to.have.length(3);
      expect(impl.getEnabledItems_()).to.have.length(2);
      expect(
        impl.container_.children[2].getAttribute('aria-disabled')
      ).to.equal('true');
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
        return impl.layoutCallback().catch((e) => {
          expect(getDataSpy).to.have.been.calledOnce;
          expect(fallbackSpy).to.have.been.calledWith(e);
          expect(toggleFallbackSpy).not.to.have.been.called;
        });
      });

      it('should not display fallback before user interaction', () => {
        env.sandbox.stub(impl, 'getFallback').returns(true);
        return impl.layoutCallback().then(() => {
          expect(getDataSpy).not.to.have.been.called;
          expect(fallbackSpy).not.to.have.been.called;
          expect(toggleFallbackSpy).not.to.have.been.called;
        });
      });

      it('should display fallback after user interaction if provided', () => {
        env.sandbox.stub(impl, 'getFallback').returns(true);
        return impl.layoutCallback().then(() => {
          impl.checkFirstInteractionAndMaybeFetchData_().then(() => {
            expect(getDataSpy).to.have.been.calledOnce;
            expect(fallbackSpy).to.have.been.calledWith('Error for test');
            expect(toggleFallbackSpy).to.have.been.calledWith(true);
          });
        });
      });
    });

    it('should generate expected src values from "query" attribute', () => {
      return impl.layoutCallback().then(() => {
        impl.queryKey_ = 'q';
        impl.srcBase_ = 'https://www.data.com/';
        expect(impl.generateSrc_('')).to.equal('https://www.data.com/?q=');
        expect(impl.generateSrc_('abc')).to.equal(
          'https://www.data.com/?q=abc'
        );
      });
    });

    it('should preserve existing query parameters when generating src values from "query" attribute', () => {
      return impl.layoutCallback().then(() => {
        impl.queryKey_ = 'q';
        impl.srcBase_ = 'https://www.data.com/?param=1';
        expect(impl.generateSrc_('')).to.equal(
          'https://www.data.com/?param=1&q='
        );
        expect(impl.generateSrc_('abc')).to.equal(
          'https://www.data.com/?param=1&q=abc'
        );
      });
    });
  }
);
