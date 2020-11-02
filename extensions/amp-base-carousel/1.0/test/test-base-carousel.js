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
import {BaseCarousel} from '../base-carousel';
import {mount} from 'enzyme';

describes.sandboxed('BaseCarousel preact component', {}, () => {
  it('should render Arrows and propagates children to Scroller', () => {
    const wrapper = mount(
      <BaseCarousel>
        <div>slide 1</div>
        <div>slide 2</div>
        <div>slide 3</div>
      </BaseCarousel>
    );
    expect(wrapper.find('Arrow')).to.have.lengthOf(2);

    const slides = wrapper.find('[data-slide]');
    expect(slides).to.have.lengthOf(3);

    expect(slides.first().text()).to.equal('slide 1');
    expect(slides.at(1).text()).to.equal('slide 2');
    expect(slides.last().text()).to.equal('slide 3');
  });

  it('should render custom Arrows when given', () => {
    const arrowPrev = <div class="my-custom-arrow-prev">left</div>;
    const arrowNext = <div class="my-custom-arrow-next">right</div>;
    const wrapper = mount(
      <BaseCarousel arrowPrev={arrowPrev} arrowNext={arrowNext}>
        <div>slide 1</div>
        <div>slide 2</div>
        <div>slide 3</div>
      </BaseCarousel>
    );
    const arrows = wrapper.find('Arrow');
    expect(arrows).to.have.lengthOf(2);
    expect(arrows.first().props().customArrow).to.equal(arrowPrev);
    expect(arrows.last().props().customArrow).to.equal(arrowNext);
  });

  it('should not loop by default', () => {
    const wrapper = mount(
      <BaseCarousel>
        <div>slide 1</div>
        <div>slide 2</div>
        <div>slide 3</div>
      </BaseCarousel>
    );
    const slides = wrapper.find('[data-slide]');
    expect(slides).to.have.lengthOf(3);

    // Given slides [1][2][3] should be rendered as is, but [3] is a
    // placeholder.
    expect(slides.first().text()).to.equal('slide 1');
    expect(slides.at(1).text()).to.equal('slide 2');
    expect(slides.last().text()).to.equal('slide 3');
  });

  it('should render in preparation for looping with loop prop', () => {
    const wrapper = mount(
      <BaseCarousel loop>
        <div>slide 1</div>
        <div>slide 2</div>
        <div>slide 3</div>
      </BaseCarousel>
    );
    const slides = wrapper.find('[data-slide]');
    expect(slides).to.have.lengthOf(3);

    // Given slides [1][2][3] should be rendered as [3][1][2]. But [3] is a
    // placeholder.
    expect(slides.at(0).text()).to.equal('slide 3');
    expect(slides.at(1).text()).to.equal('slide 1');
    expect(slides.at(2).text()).to.equal('slide 2');
  });

  it('should snap to slides by default', () => {
    const wrapper = mount(
      <BaseCarousel>
        <div>slide 1</div>
        <div>slide 2</div>
        <div>slide 3</div>
      </BaseCarousel>
    );
    expect(wrapper.find(`[snap="true"]`)).not.to.be.null;
  });

  it('should not snap to slides with snap="false"', () => {
    const wrapper = mount(
      <BaseCarousel>
        <div>slide 1</div>
        <div>slide 2</div>
        <div>slide 3</div>
      </BaseCarousel>
    );
    expect(wrapper.find(`[snap="false"]`)).not.to.be.null;
  });

  it('should render Arrows with controls=always', () => {
    const wrapper = mount(
      <BaseCarousel controls="always">
        <div>slide 1</div>
        <div>slide 2</div>
        <div>slide 3</div>
      </BaseCarousel>
    );
    expect(wrapper.find('Arrow')).to.have.lengthOf(2);
  });

  it('should render Arrows with controls=never and outset-arrows', () => {
    const wrapper = mount(
      <BaseCarousel controls="never" outsetArrows>
        <div>slide 1</div>
        <div>slide 2</div>
        <div>slide 3</div>
      </BaseCarousel>
    );
    expect(wrapper.find('Arrow')).to.have.lengthOf(2);
  });

  it('should not render Arrows with controls=never', () => {
    const wrapper = mount(
      <BaseCarousel controls="never">
        <div>slide 1</div>
        <div>slide 2</div>
        <div>slide 3</div>
      </BaseCarousel>
    );
    expect(wrapper.find('Arrow')).to.have.lengthOf(0);
  });
});
