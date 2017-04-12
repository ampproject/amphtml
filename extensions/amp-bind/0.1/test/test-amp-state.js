/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

import * as sinon from 'sinon';
import '../amp-bind';
import {createIframePromise} from '../../../../testing/iframe';

describe('AmpState', () => {
  let sandbox;
  let ampState;
  let fetchStub;
  let updateStub;

  function getAmpState() {
    return createIframePromise(true, undefined).then(iframe => {
      const el = iframe.doc.createElement('amp-state');
      el.setAttribute('id', 'myAmpState');
      return iframe.addElement(el);
    });
  }

  beforeEach(() => {
    sandbox = sinon.sandbox.create();

    return getAmpState().then(element => {
      ampState = element;

      const impl = ampState.implementation_;
      fetchStub = sandbox.stub(impl, 'fetchSrcAndUpdateState_');
      updateStub = sandbox.stub(impl, 'updateState_');
    });
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should parse its child script if `src` is not present at build', () => {
    ampState.innerHTML = '<script type="application/json">' +
        '{"foo": "bar"}</script>';
    ampState.implementation_.buildCallback();
    expect(fetchStub).to.not.have.been.called;
    expect(updateStub).calledWithMatch({foo: 'bar'});
  });

  it('should fetch json if `src` is present at build', () => {
    ampState.setAttribute('src', 'https://foo.com/bar?baz=1');
    ampState.implementation_.buildCallback();
    expect(fetchStub).calledWith(/* opt_isInit */ true);
    expect(updateStub).to.not.have.been.called;
  });

  it('should fetch json if `src` is mutated', () => {
    ampState.setAttribute('src', 'https://foo.com/bar?baz=1');
    ampState.mutatedAttributesCallback({
      src: 'https://foo.com/bar?baz=1',
    });
    expect(fetchStub).calledWith(/* opt_isInit */ false);
  });
});
