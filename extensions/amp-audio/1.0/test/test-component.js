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
import {Audio} from '../component';
import {mount} from 'enzyme';

describes.sandboxed('Audio preact component v1.0', {}, () => {
  it('should load audio through attribute', () => {
    const wrapper = mount(
      <Audio src="audio.mp3" style="height: 30px; width: 300px" />
    );

    const component = wrapper.find('audio');

    expect(component).to.have.lengthOf(1);
    expect(component.name()).to.equal('audio');
    expect(component.prop('src')).to.equal('audio.mp3');
    expect(component.prop('controls')).to.be.true;

    /**
     * Please verify the following assertion code.
     */
    expect(component.prop('style')).to.contain('width: 300px');
    expect(component.prop('style')).to.contain('height: 30px');
  });
  it('should not preload audio', () => {
    const wrapper = mount(<Audio src="audio.mp3" preload="none" />);

    const component = wrapper.find('audio');
    expect(component).to.have.lengthOf(1);
    expect(component.prop('preload')).to.equal('none');
  });
  it('should only preload audio metadata', () => {
    const wrapper = mount(<Audio src="audio.mp3" preload="metadata" />);

    const component = wrapper.find('audio');
    expect(component).to.have.lengthOf(1);
    expect(component.prop('preload')).to.equal('metadata');
  });
  it('should load audio through sources', () => {
    const wrapper = mount(
      <Audio
        autoplay=""
        preload=""
        muted=""
        loop=""
        width="503px"
        height="53px"
      >
        <source src="audio.mp3" type="audio/mpeg" />
        <source src="audio.ogg" type="audio/ogg" />
      </Audio>
    );

    const component = wrapper.find(Audio.displayName).find('audio');
    expect(component).to.have.lengthOf(1);

    expect(component.name()).to.equal('audio');
    expect(component.prop('width')).to.equal('503px');
    expect(component.prop('height')).to.equal('53px');

    /**
     * I am not sure about offset* properties.
     * May be by using getComputedStyle?
     */
    expect(component.prop('offsetWidth')).to.be.greaterThan(1);
    expect(component.prop('offsetHeight')).to.be.greaterThan(1);

    expect(component.prop('controls')).to.be.true;

    /**
     * Following remains false.
     * May be due to removal of propagateAttributes?
     */
    expect(component.prop('autoplay')).to.be.true;
    expect(component.prop('muted')).to.be.true;
    expect(component.muted).to.be.true;
    expect(component.prop('preload')).to.be.true;
    expect(component.prop('loop')).to.be.true;
    expect(component.prop('src')).to.be.false;

    expect(component.childAt(0).name()).to.equal('source');
    expect(component.childAt(0).prop('src')).to.equal('audio.mp3');
    expect(component.childAt(1).name()).to.equal('source');
    expect(component.childAt(1).prop('src')).to.equal('audio.ogg');
  });
  it('should propagate ARIA attributes', () => {
    const wrapper = mount(
      <Audio
        src="audio.mp3"
        aria-label="Hello"
        aria-labelledby="id2"
        aria-describedby="id3"
      />
    );

    const component = wrapper.find('audio');
    expect(component).to.have.lengthOf(1);
    expect(component.prop('aria-label')).to.equal('Hello');
    expect(component.prop('aria-labelledby')).to.equal('id2');
    expect(component.prop('aria-describedby')).to.equal('id3');
  });
});
