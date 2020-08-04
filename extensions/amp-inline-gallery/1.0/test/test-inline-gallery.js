/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

import * as Preact from '../../../../src/preact';
import {BaseCarousel} from '../../../amp-base-carousel/1.0/base-carousel';
import {InlineGallery} from '../inline-gallery';
import {Pagination} from '../pagination';
import {mount} from 'enzyme';

describes.sandboxed('InlineGallery preact component', {}, () => {
  it('should render BaseCarousel and Pagination', () => {
    const jsx = (
      <InlineGallery>
        <BaseCarousel>
          <div>slide 1</div>
          <div>slide 2</div>
          <div>slide 3</div>
        </BaseCarousel>
        <Pagination />
      </InlineGallery>
    );
    const wrapper = mount(jsx);
    const carousel = wrapper.find('BaseCarousel');
    expect(carousel).to.have.lengthOf(1);

    const pagination = wrapper.find('Pagination');
    expect(pagination).to.have.lengthOf(1);
    expect(pagination.props().children).to.have.ordered.members(
      carousel.props().children
    );
  });
});
