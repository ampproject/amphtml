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

import * as Preact from '#preact';
import {Iframe} from '../component';
import {mount} from 'enzyme';

describes.sandboxed('Iframe preact component v1.0', {}, (env) => {
  it('should render', () => {
    const wrapper = mount(<Iframe src={'https://www.google.com'} />);

    const component = wrapper.find(Iframe.name);
    expect(component).to.have.lengthOf(1);
    expect(component.prop('src')).to.equal('https://www.google.com');
  });

  it('should set truthy props and strip falsy props', () => {
    const wrapper = mount(
      <Iframe
        src={'https://www.google.com'}
        allowFullScreen={true}
        allowPaymentRequest={false}
      />
    );

    const component = wrapper.find(Iframe.name);
    expect(component).to.have.lengthOf(1);
    expect(component.prop('src')).to.equal('https://www.google.com');
    expect(component.prop('allowFullScreen')).to.be.true;
    // falsy values are stripped by Preact
    expect(component.prop('allowpaymentrequest')).to.be.undefined;
  });

  it('should trigger onLoadCallback when iframe loads', () => {
    const onLoadSpy = env.sandbox.spy();
    const wrapper = mount(
      <Iframe src={'https://www.google.com'} onLoadCallback={onLoadSpy} />
    );
    wrapper.find('iframe').simulate('load');
    expect(onLoadSpy).to.be.calledOnce;
  });
});
