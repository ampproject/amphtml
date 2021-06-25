/**
 * Copyright __current_year__ The AMP HTML Authors. All Rights Reserved.
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
import {__component_name_pascalcase__} from '../component';
import {mount} from 'enzyme';
import {waitFor} from '#testing/test-helper';

describes.sandboxed('__component_name_pascalcase__ preact component v1.0', {}, (env) => {
  it('should render', () => {
    const wrapper = mount(
      <__component_name_pascalcase__ testProp={true}/>
    );

    const component = wrapper.find(__component_name_pascalcase__.name);
    expect(component).to.have.lengthOf(1);
    expect(component.prop('testProp')).to.be.true;
  });
});
