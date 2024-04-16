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
      return ampAutocomplete.buildInternal().then(() => ampAutocomplete);
    }

    it('should build with "inline" and "query" when specified', async () => {
      const ampAutocomplete = await getAutocomplete({
        'filter': 'substring',
        'query': 'q',
      });
      const impl = await ampAutocomplete.getImpl();
      expect(impl.queryKey_).to.equal('q');
    });

    it('should layout', async () => {
      const ampAutocomplete = await getAutocomplete({
        'filter': 'substring',
      });
      const impl = await ampAutocomplete.getImpl();

      const expectedItems = ['apple', 'banana', 'orange'];
      expect(impl.sourceData_).to.have.ordered.members(expectedItems);
      expect(impl.inputElement_).not.to.be.null;
      expect(impl.container_).not.to.be.null;
      expect(impl.filter_).to.equal('substring');
      const autocompleteSpy = env.sandbox.spy(impl, 'autocomplete_');
      const clearAllSpy = env.sandbox.spy(impl, 'clearAllItems_');
      const filterSpy = env.sandbox.spy(impl, 'filterData_');
      const renderSpy = env.sandbox.spy(impl, 'renderResults_');

      await ampAutocomplete.layoutCallback();
      expect(impl.inputElement_.hasAttribute('autocomplete')).to.be.true;
      expect(autocompleteSpy).to.have.been.calledOnce;
      expect(clearAllSpy).to.have.been.calledOnce;
      expect(filterSpy).not.to.have.been.called;
      expect(renderSpy).not.to.have.been.called;
    });

    it('should render inline data before first user interaction', async () => {
      const ampAutocomplete = await getAutocomplete({
        'filter': 'substring',
        'min-characters': '0',
      });
      const impl = await ampAutocomplete.getImpl();

      const expectedItems = ['apple', 'banana', 'orange'];
      expect(impl.sourceData_).to.have.ordered.members(expectedItems);
      expect(impl.inputElement_).not.to.be.null;
      expect(impl.container_).not.to.be.null;
      expect(impl.filter_).to.equal('substring');
      const filterAndRenderSpy = env.sandbox.spy(
        impl,
        'filterDataAndRenderResults_'
      );
      const clearAllSpy = env.sandbox.spy(impl, 'clearAllItems_');
      const filterSpy = env.sandbox.spy(impl, 'filterData_');
      const renderSpy = env.sandbox.spy(impl, 'renderResults_');

      await ampAutocomplete.layoutCallback();
      expect(impl.inputElement_.hasAttribute('autocomplete')).to.be.true;
      expect(filterAndRenderSpy).to.have.been.calledOnce;
      expect(clearAllSpy).to.have.been.calledOnce;
      expect(filterSpy).to.have.been.called;
      expect(renderSpy).to.have.been.called;
    });

    it('should not render remote data before first user interaction', async () => {
      const ampAutocomplete = await getAutocomplete(
        {
          'filter': 'substring',
          'min-characters': '0',
        },
        '{ "items" : ["apple", "banana", "orange"] }',
        false
      );
      const impl = await ampAutocomplete.getImpl();

      expect(impl.sourceData_).to.be.null;
      expect(impl.inputElement_).not.to.be.null;
      expect(impl.container_).not.to.be.null;
      expect(impl.filter_).to.equal('substring');
      const autocompleteSpy = env.sandbox.spy(impl, 'autocomplete_');
      const clearAllSpy = env.sandbox.spy(impl, 'clearAllItems_');
      const filterSpy = env.sandbox.spy(impl, 'filterData_');
      const renderSpy = env.sandbox.spy(impl, 'renderResults_');

      await ampAutocomplete.layoutCallback();
      expect(impl.inputElement_.hasAttribute('autocomplete')).to.be.true;
      expect(autocompleteSpy).to.have.been.calledOnce;
      expect(clearAllSpy).to.have.been.calledOnce;
      expect(filterSpy).not.to.have.been.called;
      expect(renderSpy).not.to.have.been.called;
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

    it('should render with min-characters passed', async () => {
      const ampAutocomplete = await getAutocomplete({
        'filter': 'substring',
        'min-characters': '3',
      });
      const impl = await ampAutocomplete.getImpl();
      expect(impl.minChars_).to.equal(3);
    });

    it('should render with max-entries passed', async () => {
      const ampAutocomplete = await getAutocomplete({
        'filter': 'substring',
        'max-entries': '10',
      });
      const impl = await ampAutocomplete.getImpl();
      expect(impl.maxItems_).to.equal(10);
    });

    it('should render with max-items passed', async () => {
      const ampAutocomplete = await getAutocomplete({
        'filter': 'substring',
        'max-items': '10',
      });
      const impl = await ampAutocomplete.getImpl();
      expect(impl.maxItems_).to.equal(10);
    });
    it('should error with invalid JSON script', () => {
      expectAsyncConsoleError(/Unexpected token/);
      return expect(
        getAutocomplete(
          {
            'filter': 'substring',
          },
          '{ "items" : ["apple", "banana", orange] }'
        )
      ).to.be.rejectedWith(/Unexpected token/);
    });

    it('should accept empty JSON script', async () => {
      const ampAutocomplete = await getAutocomplete(
        {
          'filter': 'substring',
        },
        '{}'
      );
      const impl = await ampAutocomplete.getImpl();
      expect(impl.sourceData_).to.be.an('array').that.is.empty;
    });

    it('should accept empty items JSON script', async () => {
      const ampAutocomplete = await getAutocomplete(
        {
          'filter': 'substring',
        },
        '{ "items" : [] }'
      );
      const impl = await ampAutocomplete.getImpl();
      expect(impl.sourceData_).to.be.an('array').that.is.empty;
    });

    it('should accept different item property from JSON script', async () => {
      const ampAutocomplete = await getAutocomplete(
        {
          'filter': 'substring',
          'items': 'fruit',
        },
        '{ "fruit" : [ "apples", "bananas", "pears" ] }'
      );
      const impl = await ampAutocomplete.getImpl();
      expect(impl.sourceData_).to.have.ordered.members([
        'apples',
        'bananas',
        'pears',
      ]);
    });

    it('should not fetch remote data when specified in src before first user interaction', async () => {
      const data = {
        items: [
          'Albany, New York',
          'Annapolis, Maryland',
          'Atlanta, Georgia',
          'Augusta, Maine',
          'Austin, Texas',
        ],
      };
      const ampAutocomplete = await getAutocomplete(
        {
          'filter': 'substring',
          'src': 'https://examples.com/json',
        },
        data,
        false
      );
      const impl = await ampAutocomplete.getImpl();
      expect(impl.sourceData_).to.be.null;
    });

    it('should not fetch remote data when specified in src and using items property before first user interaction', async () => {
      const data = {
        cities: [
          'Albany, New York',
          'Annapolis, Maryland',
          'Atlanta, Georgia',
          'Augusta, Maine',
          'Austin, Texas',
        ],
      };
      const ampAutocomplete = await getAutocomplete(
        {
          'filter': 'substring',
          'src': 'https://examples.com/json',
          'items': 'cities',
        },
        data,
        false
      );
      const impl = await ampAutocomplete.getImpl();
      expect(impl.sourceData_).to.be.null;
    });

    it('should prefetch remote data if prefetch attribute is specified', async () => {
      const ampAutocomplete = await getAutocomplete(
        {
          'prefetch': '', // boolean attribute, presence means prefetch is enabled.
          'src': 'https://examples.com/json',
          'filter': 'substring',
        },
        '{}',
        false
      );
      const impl = await ampAutocomplete.getImpl();
      expect(impl.hasFetchedInitialData_).to.be.false;

      await ampAutocomplete.layoutCallback();
      expect(impl.hasFetchedInitialData_).to.be.true;
    });

    it('should not fetch remote data when specified in src and using nested items property before first user interactino', async () => {
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
      const ampAutocomplete = await getAutocomplete(
        {
          'filter': 'substring',
          'src': 'https://examples.com/json',
          'items': 'deeply.nested.cities',
        },
        data,
        false
      );
      const impl = await ampAutocomplete.getImpl();
      await ampAutocomplete.layoutCallback();
      expect(impl.sourceData_).be.null;
    });

    it('should not require a form ancestor', () => {
      const autocomplete = setupAutocomplete({'filter': 'substring'});
      doc.body.appendChild(autocomplete);
      return expect(autocomplete.buildInternal()).to.be.fulfilled;
    });

    it('should read the autocomplete attribute on the form as null', async () => {
      const ampAutocomplete = await getAutocomplete({'filter': 'substring'});
      const impl = await ampAutocomplete.getImpl();
      expect(impl.initialAutocompleteAttr_).to.be.null;
    });

    it('should read the autocomplete attribute on the form as on', async () => {
      const ampAutocomplete = await getAutocomplete(
        {'filter': 'substring'},
        '{}',
        true,
        'on'
      );
      const impl = await ampAutocomplete.getImpl();
      expect(impl.initialAutocompleteAttr_).to.equal('on');
    });

    it('should read the autocomplete attribute on the form as off', async () => {
      const ampAutocomplete = await getAutocomplete(
        {'filter': 'substring'},
        '{}',
        true,
        'off'
      );
      const impl = await ampAutocomplete.getImpl();
      expect(impl.initialAutocompleteAttr_).to.equal('off');
    });
  }
);
