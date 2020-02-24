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

import {
  configureComponent,
  useComponentConfig,
} from '../../src/configure-component';

const BaseElementMock = element => ({element});

describes.sandboxed('configureComponent', {}, () => {
  it('uses implementation', () => {
    const wrapped = configureComponent(foo => ({foo}), {});
    const foo = {};
    const instance = new wrapped(foo);
    expect(instance.foo).to.equal(foo);
  });

  it('returns config when implementation is wrapped', () => {
    const config = {foo: 'bar'};
    const wrapped = configureComponent(BaseElementMock, config);
    const instance = new wrapped({});
    expect(useComponentConfig(instance)).to.equal(config);
  });

  it('fails when implementation is unwrapped', () => {
    allowConsoleError(() => {
      const instance = new BaseElementMock({});
      expect(() => useComponentConfig(instance)).to.throw();
    });
  });
});
