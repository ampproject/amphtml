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
import {ActionTrust} from '../../../../src/action-constants';
import {Services} from '../../../../src/services';
import {htmlFor} from '../../../../src/static-template';
import {toggleExperiment} from '../../../../src/experiments';
import {waitFor} from '../../../../testing/test-helper';
import {whenUpgradedToCustomElement} from '../../../../src/dom';

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
        <amp-render width="auto" height="140" layout="fixed-height">
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
      // verify initial call to `batchFetJsonFor`
      expect(options.refresh).to.be.false;

      element.enqueAction(invocation('refresh'));
      await getRenderedData();
      expect(fetchJsonStub).to.have.been.calledTwice;
      options = fetchJsonStub.getCall(1).args[2];
      // verify subsequent call to `batchFetJsonFor`
      expect(options.refresh).to.be.true;
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
      const fetchJsonStub = env.sandbox.stub(
        BatchedJsonModule,
        'batchFetchJsonFor'
      );
      fetchJsonStub.resolves({
        fullName: {
          firstName: 'Joe',
          lastName: 'Biden',
        },
      });

      element = html`
        <amp-render
          xssi-prefix=")]}"
          key="fullName"
          src="https://example.com/data.json"
          width="auto"
          height="140"
          layout="fixed-height"
        >
          <template type="amp-mustache">
            <ul>
              <li>{{lastName}}, {{firstName}}</li>
            </ul>
          </template>
        </amp-render>
      `;
      doc.body.appendChild(element);

      await getRenderedData();
      const options = fetchJsonStub.getCall(0).args[2];
      // verify initial call to `batchFetJsonFor`
      expect(options.xssiPrefix).to.equal(')]}');
      expect(options.expr).to.equal('fullName');
    });
  }
);
