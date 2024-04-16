import '../../../amp-bind/0.1/amp-bind';
import '../../../amp-mustache/0.2/amp-mustache';
import '../../../amp-script/0.1/amp-script';
import '../amp-render';
import {ActionTrust_Enum} from '#core/constants/action-constants';
import {whenUpgradedToCustomElement} from '#core/dom/amp-element-helpers';
import {htmlFor} from '#core/dom/static-template';
import * as Style from '#core/dom/style';

import {Services} from '#service';
import {ActionInvocation} from '#service/action-impl';

import * as log from '#utils/log';

import {waitFor} from '#testing/helpers/service';

import * as BatchedJsonModule from '../../../../src/batched-json';

describes.realWin(
  'amp-render-v1.0',
  {
    amp: {
      extensions: [
        'amp-mustache:0.2',
        'amp-bind:0.1',
        'amp-render:1.0',
        'amp-script:0.1',
      ],
    },
  },
  (env) => {
    let win, doc, html, element;

    async function waitRendered() {
      await whenUpgradedToCustomElement(element);
      await element.buildInternal();
      await waitFor(() => {
        // The rendered container inserts a <div> element.
        const div = element.querySelector('div');
        return div && div.textContent;
      }, 'wrapper div rendered');
      return element.querySelector('div');
    }

    async function waitForText(el, txt) {
      const hasText = () => el.querySelector('div').textContent === txt;
      await waitFor(hasText, 'element text updated');
    }

    async function getRenderedData() {
      const wrapper = await waitRendered();
      return wrapper.textContent;
    }

    function invocation(method, args = {}) {
      const source = null;
      const caller = null;
      const event = null;
      const trust = ActionTrust_Enum.DEFAULT;
      return new ActionInvocation(
        element,
        method,
        args,
        source,
        caller,
        event,
        trust
      );
    }

    beforeEach(async function () {
      win = env.win;
      doc = win.document;
      html = htmlFor(doc);
    });

    it('renders from amp-state', async () => {
      const ampState = html`
        <amp-state id="theFood">
          <script type="application/json">
            {
              "name": "Bill"
            }
          </script>
        </amp-state>
      `;
      doc.body.appendChild(ampState);

      element = html`
        <amp-render
          binding="no"
          src="amp-state:theFood"
          width="auto"
          height="140"
          layout="fixed-height"
        >
          <template type="amp-mustache"><p>Hello {{name}}</p></template>
        </amp-render>
      `;
      doc.body.appendChild(element);

      await whenUpgradedToCustomElement(ampState);
      await ampState.buildInternal();

      const text = await getRenderedData();
      expect(text).to.equal('Hello Bill');
    });

    it('renders json from src', async () => {
      const fetchStub = env.sandbox
        .stub(BatchedJsonModule, 'batchFetchJsonFor')
        .resolves({name: 'Joe'});

      element = html`
        <amp-render
          binding="no"
          src="https://example.com/data.json"
          width="auto"
          height="140"
          layout="fixed-height"
        >
          <template type="amp-mustache"><p>Hello {{name}}</p></template>
        </amp-render>
      `;
      doc.body.appendChild(element);

      const text = await getRenderedData();
      expect(text).to.equal('Hello Joe');
      expect(fetchStub).to.have.been.calledOnce;
    });

    it('should render with layout=container', async () => {
      env.sandbox
        .stub(BatchedJsonModule, 'batchFetchJsonFor')
        .resolves({name: 'Joe'});

      const setStylesStub = env.sandbox.spy(Style, 'setStyles');

      const fakeMutator = {
        measureMutateElement: (unusedElement, measurer, mutator) =>
          Promise.resolve().then(measurer).then(mutator),
        requestChangeSize: () => {
          return Promise.resolve();
        },
      };
      env.sandbox.stub(Services, 'mutatorForDoc').returns(fakeMutator);

      element = html`
        <amp-render
          binding="no"
          src="https://example.com/data.json"
          layout="container"
        >
          <template type="amp-mustache"><p>Hello {{name}}</p></template>
          <div placeholder>Placeholder text</div>
        </amp-render>
      `;
      doc.body.appendChild(element);

      // We do this twice to flush out vsync
      // TODO(dmanek): investigate if this can be done with one call
      await getRenderedData();
      await getRenderedData();

      expect(setStylesStub).to.be.calledTwice;
    });

    it('layout=container does not resize', async () => {
      env.sandbox
        .stub(BatchedJsonModule, 'batchFetchJsonFor')
        .resolves({name: 'Joe'});

      const setStylesStub = env.sandbox.stub(Style, 'setStyles');

      const fakeMutator = {
        measureMutateElement: (unusedElement, measurer, mutator) =>
          Promise.resolve().then(measurer).then(mutator),
        requestChangeSize: () => Promise.reject(),
      };
      env.sandbox.stub(Services, 'mutatorForDoc').returns(fakeMutator);

      element = html`
        <amp-render
          binding="no"
          src="https://example.com/data.json"
          layout="container"
        >
          <template type="amp-mustache"><p>Hello {{name}}</p></template>
          <div placeholder>Placeholder text</div>
        </amp-render>
      `;
      doc.body.appendChild(element);

      // We do this twice to flush out vsync
      // TODO(dmanek): investigate if this can be done with one call
      await getRenderedData();
      await getRenderedData();

      expect(setStylesStub).to.be.calledOnce;
    });

    it('should error when layout=container is used without placeholder', async () => {
      const errorSpy = env.sandbox.stub(log, 'userAssert');

      env.sandbox
        .stub(BatchedJsonModule, 'batchFetchJsonFor')
        .resolves({name: 'Joe'});

      element = html`
        <amp-render
          binding="no"
          src="https://example.com/data.json"
          layout="container"
        >
          <template type="amp-mustache"><p>Hello {{name}}</p></template>
        </amp-render>
      `;
      doc.body.appendChild(element);

      await getRenderedData();
      // TODO: Called once again in template-impl.js. Investigate the error "Type must be specified: %s".
      expect(errorSpy).to.be.calledTwice;
      expect(errorSpy.getCall(0).args[1]).to.match(
        /placeholder required with layout="container"/
      );
    });

    it('renders from amp-script', async () => {
      const ampScript = html`
        <amp-script id="dataFunctions" script="local-script" nodom></amp-script>
      `;
      const fetchScript = html`
        <script id="local-script" type="text/plain" target="amp-script">
          function getRemoteData() {
            return fetch('https://example.com/data.json')
                .then((resp) => resp.json());
          }
          exportFunction('getRemoteData', getRemoteData);
        </script>
      `;

      element = html`
        <amp-render
          binding="no"
          src="amp-script:dataFunctions.getRemoteData"
          width="auto"
          height="200"
          layout="fixed-height"
        >
          <template type="amp-mustache"><p>Hello {{name}}</p></template>
        </amp-render>
      `;
      doc.body.appendChild(fetchScript);
      doc.body.appendChild(ampScript);
      doc.body.appendChild(element);

      const impl = {
        callFunction: env.sandbox.stub(),
      };
      impl.callFunction.resolves({name: 'Joe'});
      env.sandbox.stub(ampScript, 'getImpl').resolves(impl);

      const text = await getRenderedData();
      expect(text).to.equal('Hello Joe');
    });

    it('fails gracefully when src is omitted', async () => {
      element = html`
        <amp-render
          width="auto"
          height="140"
          layout="fixed-height"
          binding="no"
        >
          <template type="amp-mustache"><p>Hello {{name}}</p></template>
        </amp-render>
      `;
      doc.body.appendChild(element);

      const text = await getRenderedData();
      expect(text).to.equal('Hello ');
    });

    it('re-fetches json on refresh action', async () => {
      const fetchJsonStub = env.sandbox.stub(
        BatchedJsonModule,
        'batchFetchJsonFor'
      );
      fetchJsonStub.resolves({name: 'Joe'});

      element = html`
        <amp-render
          binding="no"
          id="my-amp-render"
          src="https://example.com/data.json"
          width="auto"
          height="140"
          layout="fixed-height"
        >
          <template type="amp-mustache"><p>Hello {{name}}</p></template>
        </amp-render>
      `;
      doc.body.appendChild(element);

      await getRenderedData();
      let options = fetchJsonStub.getCall(0).args[2];
      // verify initial call to `batchFetchJsonFor`
      expect(options.refresh).to.be.false;
      expect(options.xssiPrefix).to.be.null;
      expect(options.expr).to.equal('.');

      element.enqueAction(invocation('refresh'));
      await getRenderedData();
      expect(fetchJsonStub).to.have.been.calledTwice;
      options = fetchJsonStub.getCall(1).args[2];
      // verify subsequent call to `batchFetchJsonFor`
      expect(options.refresh).to.be.true;
      expect(options.xssiPrefix).to.be.null;
      expect(options.expr).to.equal('.');
    });

    it('should not re-fetch when src=amp-state', async () => {
      const fetchJsonStub = env.sandbox.stub(
        BatchedJsonModule,
        'batchFetchJsonFor'
      );

      const bindStub = env.sandbox
        .stub(Services, 'bindForDocOrNull')
        .callThrough();

      const ampState = html`
        <amp-state id="theFood">
          <script type="application/json">
            {
              "name": "Bill"
            }
          </script>
        </amp-state>
      `;
      doc.body.appendChild(ampState);

      element = html`
        <amp-render
          binding="no"
          src="amp-state:theFood"
          width="auto"
          height="140"
          layout="fixed-height"
        >
          <template type="amp-mustache"><p>Hello {{name}}</p></template>
        </amp-render>
      `;
      doc.body.appendChild(element);

      await getRenderedData();
      expect(bindStub).to.have.been.calledOnce;
      expect(fetchJsonStub).not.to.have.been.called;

      element.enqueAction(invocation('refresh'));
      await getRenderedData();
      expect(bindStub).to.have.been.calledOnce;
      expect(fetchJsonStub).not.to.have.been.called;
    });

    it('should not re-fetch when src=amp-script', async () => {
      const fetchJsonStub = env.sandbox.stub(
        BatchedJsonModule,
        'batchFetchJsonFor'
      );

      const ampScript = html`
        <amp-script id="dataFunctions" script="local-script" nodom></amp-script>
      `;
      const fetchScript = html`
        <script id="local-script" type="text/plain" target="amp-script">
          function getRemoteData() {
            return fetch('https://example.com/data.json')
                .then((resp) => resp.json());
          }
          exportFunction('getRemoteData', getRemoteData);
        </script>
      `;

      element = html`
        <amp-render
          binding="no"
          src="amp-script:dataFunctions.getRemoteData"
          width="auto"
          height="200"
          layout="fixed-height"
        >
          <template type="amp-mustache"><p>Hello {{name}}</p></template>
        </amp-render>
      `;
      doc.body.appendChild(fetchScript);
      doc.body.appendChild(ampScript);
      doc.body.appendChild(element);

      const impl = {
        callFunction: env.sandbox.stub(),
      };
      impl.callFunction.resolves({name: 'Joe'});
      env.sandbox.stub(ampScript, 'getImpl').resolves(impl);

      await getRenderedData();
      expect(ampScript.getImpl).to.have.been.calledOnce;
      expect(fetchJsonStub).not.to.have.been.called;

      element.enqueAction(invocation('refresh'));
      await getRenderedData();
      expect(ampScript.getImpl).to.have.been.calledOnce;
      expect(fetchJsonStub).not.to.have.been.called;
    });

    it('should use the specified xssi-prefix and key attributes', async () => {
      const json = {
        fullName: {
          firstName: 'Joe',
          lastName: 'Biden',
        },
      };

      const fetchJsonStub = env.sandbox
        .stub(BatchedJsonModule, 'batchFetchJsonFor')
        .callThrough();

      env.sandbox.stub(Services, 'batchedXhrFor').returns({
        fetchJson: () => Promise.resolve(json),
      });

      env.sandbox.stub(Services, 'xhrFor').returns({
        fetch: () => Promise.resolve(json),
        xssiJson: () => Promise.resolve(json),
      });

      element = html`
        <amp-render
          binding="no"
          xssi-prefix=")]}"
          key="fullName"
          src="https://example.com/data.json"
          width="auto"
          height="140"
          layout="fixed-height"
        >
          <template type="amp-mustache">{{lastName}}, {{firstName}}</template>
        </amp-render>
      `;
      doc.body.appendChild(element);

      const text = await getRenderedData();
      expect(text).to.equal('Biden, Joe');
      const options = fetchJsonStub.getCall(0).args[2];
      expect(options.xssiPrefix).to.equal(')]}');
      expect(options.expr).to.equal('fullName');
      expect(options.refresh).to.be.false;
    });

    it('should perform url replacement in src', async () => {
      const json = {
        fullName: {
          firstName: 'Joe',
          lastName: 'Biden',
        },
      };

      const fetchJsonStub = env.sandbox
        .stub(BatchedJsonModule, 'batchFetchJsonFor')
        .callThrough();

      env.sandbox.stub(Services, 'batchedXhrFor').returns({
        fetchJson: () => Promise.resolve(json),
      });

      env.sandbox.stub(Services, 'xhrFor').returns({
        fetch: () => Promise.resolve(json),
        xssiJson: () => Promise.resolve(json),
      });

      element = html`
        <amp-render
          binding="no"
          xssi-prefix=")]}"
          key="fullName"
          src="https://example.com/data.json?RANDOM"
          width="auto"
          height="140"
          layout="fixed-height"
        >
          <template type="amp-mustache">{{lastName}}, {{firstName}}</template>
        </amp-render>
      `;
      doc.body.appendChild(element);

      const text = await getRenderedData();
      expect(text).to.equal('Biden, Joe');
      const options = fetchJsonStub.getCall(0).args[2];
      expect(options.urlReplacement).to.equal(
        BatchedJsonModule.UrlReplacementPolicy_Enum.ALL
      );
    });

    it('should render updates when src mutates', async () => {
      const fetchJsonStub = env.sandbox.stub(
        BatchedJsonModule,
        'batchFetchJsonFor'
      );
      fetchJsonStub.resolves({
        firstName: 'Joe',
        lastName: 'Biden',
      });

      const ampState = html`
        <amp-state id="president">
          <script type="application/json">
            {
              "firstName": "Bill",
              "lastName": "Clinton"
            }
          </script>
        </amp-state>
      `;
      doc.body.appendChild(ampState);

      element = html`
        <amp-render
          binding="no"
          src="amp-state:president"
          [src]="srcUrl"
          width="auto"
          height="100"
          layout="fixed-height"
        >
          <template type="amp-mustache">{{lastName}}, {{firstName}}</template>
        </amp-render>
      `;
      doc.body.appendChild(element);

      await whenUpgradedToCustomElement(ampState);
      await ampState.buildInternal();

      const text = await getRenderedData();
      expect(text).to.equal('Clinton, Bill');
      expect(fetchJsonStub).not.to.have.been.called;

      element.setAttribute('src', 'https://example.com/data.json');

      await waitForText(element, 'Biden, Joe');
      expect(fetchJsonStub).to.have.been.called;
    });

    it('should add aria-live="polite" attribute', async () => {
      const ampState = html`
        <amp-state id="theFood">
          <script type="application/json">
            {
              "name": "Bill"
            }
          </script>
        </amp-state>
      `;
      doc.body.appendChild(ampState);

      element = html`
        <amp-render
          binding="no"
          src="amp-state:theFood"
          width="auto"
          height="140"
          layout="fixed-height"
        >
          <template type="amp-mustache"><p>Hello {{name}}</p></template>
        </amp-render>
      `;
      doc.body.appendChild(element);

      await whenUpgradedToCustomElement(ampState);
      await ampState.buildInternal();

      await getRenderedData();
      expect(element.getAttribute('aria-live')).to.equal('polite');
    });

    it('should not add aria-live="polite" attribute if one already exists', async () => {
      const ampState = html`
        <amp-state id="theFood">
          <script type="application/json">
            {
              "name": "Bill"
            }
          </script>
        </amp-state>
      `;
      doc.body.appendChild(ampState);

      element = html`
        <amp-render
          binding="no"
          src="amp-state:theFood"
          width="auto"
          height="140"
          layout="fixed-height"
          aria-live="assertive"
        >
          <template type="amp-mustache"><p>Hello {{name}}</p></template>
        </amp-render>
      `;
      doc.body.appendChild(element);

      await whenUpgradedToCustomElement(ampState);
      await ampState.buildInternal();

      await getRenderedData();
      expect(element.getAttribute('aria-live')).to.equal('assertive');
    });

    it('should render a placeholder', async () => {
      const fetchStub = env.sandbox.stub(
        BatchedJsonModule,
        'batchFetchJsonFor'
      );

      element = html`
        <amp-render
          src="https://example.com/data.json"
          width="auto"
          height="140"
          layout="fixed-height"
          binding="no"
        >
          <template type="amp-mustache"><p>Hello {{name}}</p></template>
          <p placeholder>Loading data</p>
          <p fallback>Failed</p>
        </amp-render>
      `;
      doc.body.appendChild(element);

      await waitFor(() => {
        const div = element.querySelector(`[placeholder]`);
        return div && div.textContent;
      }, 'placeholder rendered');
      const placeholder = element.querySelector(`[placeholder]`);

      expect(placeholder.textContent).to.equal('Loading data');

      await element.buildInternal();
      fetchStub.resolves({name: 'Joe'});
      await waitForText(element, 'Hello Joe');
      expect(fetchStub).to.be.calledOnce;
    });

    it('should render a fallback', async () => {
      const fetchStub = env.sandbox.stub(
        BatchedJsonModule,
        'batchFetchJsonFor'
      );

      element = html`
        <amp-render
          src="https://example.com/data.json"
          width="auto"
          height="140"
          layout="fixed-height"
          binding="no"
        >
          <template type="amp-mustache"><p>Hello {{name}}</p></template>
          <p placeholder>Loading data</p>
          <p fallback>Failed</p>
        </amp-render>
      `;
      doc.body.appendChild(element);

      await whenUpgradedToCustomElement(element);

      fetchStub.rejects();
      await element.buildInternal();

      await waitFor(() => {
        const div = element.querySelector(`[fallback]`);
        return div && div.textContent;
      }, 'fallback rendered');
      const fallback = element.querySelector(`[fallback]`);

      expect(fallback.textContent).to.equal('Failed');
    });

    it('should work with binding="always"', async () => {
      const rescanStub = env.sandbox.stub();
      rescanStub.resolves({});
      env.sandbox.stub(Services, 'bindForDocOrNull').resolves({
        rescan: rescanStub,
        signals: () => {
          return {
            get: () => null,
          };
        },
      });

      env.sandbox
        .stub(BatchedJsonModule, 'batchFetchJsonFor')
        .resolves({name: 'Joe'});

      element = html`
        <amp-render
          binding="always"
          src="https://example.com/data.json"
          width="auto"
          height="140"
          layout="fixed-height"
        >
          <template type="amp-mustache"><p>Hello {{name}}</p></template>
        </amp-render>
      `;
      doc.body.appendChild(element);

      await whenUpgradedToCustomElement(element);
      await element.buildInternal();

      expect(rescanStub).to.be.calledOnce;
      const {fast, update} = rescanStub.getCall(0).args[2];
      expect(fast).to.be.true;
      expect(update).to.be.true;
    });

    it('should work with binding="refresh"', async () => {
      const rescanStub = env.sandbox.stub();
      rescanStub.resolves({});
      env.sandbox.stub(Services, 'bindForDocOrNull').resolves({
        rescan: rescanStub,
        signals: () => {
          return {
            get: () => 123,
          };
        },
      });

      const fetchStub = env.sandbox.stub(
        BatchedJsonModule,
        'batchFetchJsonFor'
      );
      fetchStub.resolves({name: 'Joe'});

      element = html`
        <amp-render
          binding="refresh"
          src="https://example.com/data.json"
          width="auto"
          height="140"
          layout="fixed-height"
        >
          <template type="amp-mustache"><p>Hello {{name}}</p></template>
        </amp-render>
      `;
      doc.body.appendChild(element);

      await whenUpgradedToCustomElement(element);
      await element.buildInternal();

      expect(rescanStub).to.be.calledOnce;
      const {fast, update} = rescanStub.getCall(0).args[2];
      expect(fast).to.be.true;
      expect(update).to.be.true;
    });

    it('should default to binding="refresh" when nothing is specified', async () => {
      const rescanStub = env.sandbox.stub();
      rescanStub.resolves({});
      env.sandbox.stub(Services, 'bindForDocOrNull').resolves({
        rescan: rescanStub,
        signals: () => {
          return {
            get: () => null,
          };
        },
      });

      const fetchStub = env.sandbox.stub(
        BatchedJsonModule,
        'batchFetchJsonFor'
      );
      fetchStub.resolves({name: 'Joe'});

      element = html`
        <amp-render
          src="https://example.com/data.json"
          width="auto"
          height="140"
          layout="fixed-height"
        >
          <template type="amp-mustache"><p>Hello {{name}}</p></template>
        </amp-render>
      `;
      doc.body.appendChild(element);

      await whenUpgradedToCustomElement(element);
      await element.buildInternal();

      expect(rescanStub).to.be.calledOnce;
      const {fast, update} = rescanStub.getCall(0).args[2];
      expect(fast).to.be.true;
      expect(update).to.be.false;
    });

    it('should not perform any updates when binding="no"', async () => {
      env.sandbox
        .stub(BatchedJsonModule, 'batchFetchJsonFor')
        .resolves({name: 'Joe'});

      element = html`
        <amp-render
          binding="no"
          src="https://example.com/data.json"
          width="auto"
          height="140"
          layout="fixed-height"
        >
          <template type="amp-mustache"
            >Hello {{name}} 1+1=<span [text]="1+1">?</span></template
          >
        </amp-render>
      `;
      doc.body.appendChild(element);

      const text = await getRenderedData();
      expect(text).to.equal('Hello Joe 1+1=?');
    });

    it('should not perform any updates when binding="never"', async () => {
      env.sandbox
        .stub(BatchedJsonModule, 'batchFetchJsonFor')
        .resolves({name: 'Joe'});

      element = html`
        <amp-render
          binding="never"
          src="https://example.com/data.json"
          width="auto"
          height="140"
          layout="fixed-height"
        >
          <template type="amp-mustache"
            >Hello {{name}} 1+1=<span [text]="1+1">?</span></template
          >
        </amp-render>
      `;
      doc.body.appendChild(element);

      const text = await getRenderedData();
      expect(text).to.equal('Hello Joe 1+1=?');
    });

    const items = {
      'items': [
        {
          'name': 'Apple',
          'price': '1.99',
        },
        {
          'name': 'Orange',
          'price': '0.99',
        },
        {
          'name': 'Pear',
          'price': '1.50',
        },
        {
          'name': 'Banana',
          'price': '1.50',
        },
        {
          'name': 'Watermelon',
          'price': '4.50',
        },
        {
          'name': 'Melon',
          'price': '3.50',
        },
      ],
    };

    it('should grow on resizeToContents action when height is insufficient', async () => {
      const fakeMutator = {
        measureMutateElement: (unusedElement, measurer, mutator) =>
          Promise.resolve().then(measurer).then(mutator),
        forceChangeSize: env.sandbox.spy(),
      };
      env.sandbox.stub(Services, 'mutatorForDoc').returns(fakeMutator);

      env.sandbox.stub(BatchedJsonModule, 'batchFetchJsonFor').resolves(items);

      // set the height small enough so component resizes
      element = html`
        <amp-render
          binding="never"
          src="https://example.com/data.json"
          height="100"
          layout="fixed-height"
        >
          <template type="amp-mustache">
            {{#items}}
            <div>
              <div>{{name}}</div>
              <div>{{price}}</div>
            </div>
            {{/items}}
          </template>
        </amp-render>
      `;
      doc.body.appendChild(element);

      await getRenderedData();

      element.enqueAction(invocation('resizeToContents'));
      await getRenderedData();
      expect(fakeMutator.forceChangeSize).to.be.calledOnce;
    });

    it('should shrink on resizeToContents action when there is exta whitespace', async () => {
      const fakeMutator = {
        measureMutateElement: (unusedElement, measurer, mutator) =>
          Promise.resolve().then(measurer).then(mutator),
        forceChangeSize: env.sandbox.spy(),
      };
      env.sandbox.stub(Services, 'mutatorForDoc').returns(fakeMutator);

      env.sandbox.stub(BatchedJsonModule, 'batchFetchJsonFor').resolves(items);

      // set the height large enough so component shrinks
      element = html`
        <amp-render
          binding="never"
          src="https://example.com/data.json"
          height="5000"
          layout="fixed-height"
        >
          <template type="amp-mustache">
            {{#items}}
            <div>
              <div>{{name}}</div>
              <div>{{price}}</div>
            </div>
            {{/items}}
          </template>
        </amp-render>
      `;
      doc.body.appendChild(element);

      await getRenderedData();

      element.enqueAction(invocation('resizeToContents'));
      await getRenderedData();
      expect(fakeMutator.forceChangeSize).to.be.calledOnce;
    });

    it('should preserve the wrapper element for template tag', async () => {
      env.sandbox.stub(BatchedJsonModule, 'batchFetchJsonFor').resolves({
        'menu': '<li>Item 2</li><li>Item 3</li>',
      });

      // prettier-ignore
      element = html`
        <amp-render
          binding="never"
          src="https://example.com/data.json"
          width="auto"
          height="300"
          layout="fixed-height">
          <template type="amp-mustache"><ul><li>Item 1</li>{{{menu}}}</ul></template></amp-render>`;
      doc.body.appendChild(element);

      const wrapper = await waitRendered();
      expect(wrapper.innerHTML).to.equal(
        '<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>'
      );
    });

    it('should preserve the wrapper element for script template tag', async () => {
      env.sandbox.stub(BatchedJsonModule, 'batchFetchJsonFor').resolves({
        'menu': '<p>Hello</p>',
      });

      // prettier-ignore
      element = html`
        <amp-render
          binding="never"
          src="https://example.com/data.json"
          width="auto"
          height="300"
          layout="fixed-height">
          <script type="text/plain" template="amp-mustache">{{{menu}}}</script></amp-render>`;
      doc.body.appendChild(element);

      const wrapper = await waitRendered();
      expect(wrapper.innerHTML).to.equal('<p>Hello</p>');
    });
  }
);
