/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

import '../amp-lightbox';
import {
  ActionInvocation,
  ActionService,
} from '../../../../src/service/action-impl';
import {ActionTrust} from '../../../../src/action-constants';
import {Services} from '../../../../src/services';
import {
  createElementWithAttributes,
  whenUpgradedToCustomElement,
} from '../../../../src/dom';

describes.realWin(
  'amp-lightbox component',
  {
    amp: {
      extensions: ['amp-lightbox'],
      runtimeOn: true,
    },
  },
  (env) => {
    let win, doc;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
    });

    it('should allow default actions in email documents', async () => {
      doc.documentElement.setAttribute('amp4email', '');
      const action = new ActionService(env.ampdoc, doc);
      env.sandbox.stub(Services, 'actionServiceForDoc').returns(action);

      const element = createElementWithAttributes(doc, 'amp-lightbox', {
        'layout': 'nodisplay',
      });
      const img = createElementWithAttributes(doc, 'amp-img', {
        'src': '/examples/img/sample.jpg',
        'width': '640',
        'height': '480',
      });
      element.appendChild(img);
      doc.body.appendChild(element);
      const spy = env.sandbox.spy();
      element.enqueAction = spy;
      element.getDefaultActionAlias = env.sandbox.stub();
      await whenUpgradedToCustomElement(element);

      let i = new ActionInvocation(
        element,
        'open',
        /* args */ null,
        'source',
        'caller',
        'event',
        ActionTrust.HIGH,
        'tap',
        element.tagName
      );
      action.invoke_(i);
      expect(spy).to.be.calledWithExactly(i);

      i = new ActionInvocation(
        element,
        'close',
        /* args */ null,
        'source',
        'caller',
        'event',
        ActionTrust.HIGH,
        'tap',
        element.tagName
      );
      action.invoke_(i);
      expect(spy).to.be.calledWithExactly(i);
    });
  }
);
