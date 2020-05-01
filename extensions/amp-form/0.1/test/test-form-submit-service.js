/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

import {FormSubmitService} from '../form-submit-service';

describe('form-submit-service', () => {
  let submitService;

  beforeEach(() => {
    submitService = new FormSubmitService();
  });

  it('firing without callbacks should not break', () => {
    expect(() => submitService.fire()).not.to.throw();
  });

  it('should register & fire one callback', () => {
    const cb = window.sandbox.spy();
    submitService.beforeSubmit(cb);

    const fakeFormEl = {};
    submitService.fire(fakeFormEl);

    expect(cb.calledOnce).to.be.true;
    expect(cb).calledWith(fakeFormEl);
  });

  it('should register & fire many callbacks', () => {
    const cb = window.sandbox.spy();
    submitService.beforeSubmit(cb);
    submitService.beforeSubmit(cb);
    submitService.beforeSubmit(cb);

    const fakeFormEl = {};
    submitService.fire(fakeFormEl);

    expect(cb.calledThrice).to.be.true;
    expect(cb).calledWith(fakeFormEl);
  });
});
