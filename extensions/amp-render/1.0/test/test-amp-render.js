/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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

import '../../../amp-bind/0.1/amp-bind';
import '../../../amp-mustache/0.2/amp-mustache';
import '../../../amp-script/0.1/amp-script';
import '../amp-render';
import * as BatchedJsonModule from '../../../../src/batched-json';
import {ActionInvocation} from '../../../../src/service/action-impl';
import {ActionTrust} from '../../../../src/core/constants/action-constants';
import {Services} from '../../../../src/service';
import {htmlFor} from '../../../../src/core/dom/static-template';
import {toggleExperiment} from '../../../../src/experiments';
import {waitFor} from '../../../../testing/test-helper';
import {whenUpgradedToCustomElement} from '../../../../src/amp-element-helpers';

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
      const trust = ActionTrust.DEFAULT;
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
      toggleExperiment(win, 'amp-render', true, true);
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
      const fetchStub = env.sandbox.stub(
        BatchedJsonModule,
        'batchFetchJsonFor'
      );

      fetchStub.resolves({name: 'Joe'});

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
        BatchedJsonModule.UrlReplacementPolicy.ALL
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
  }
);
