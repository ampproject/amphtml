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

import * as Preact from '../../../../src/preact';
import {LightboxGalleryProvider, WithLightbox} from '../component';
import {mount} from 'enzyme';

describes.sandboxed('LightboxGallery preact component', {}, () => {
  describe('LightboxGalleryProvider with children', () => {
    it('renders with WithLightbox', () => {
      const wrapper = mount(
        <LightboxGalleryProvider>
          <WithLightbox key="1" id="standard">
            <img />
          </WithLightbox>
          <img key="2" id="no-lightbox" />
          <div key="3">
            <div>
              <WithLightbox id="deeply-nested">
                <img />
              </WithLightbox>
            </div>
          </div>
        </LightboxGalleryProvider>
      );

      // Children are rendered inside provider.
      const provider = wrapper.find('Provider');
      expect(provider).to.have.lengthOf(1);
      expect(provider.children()).to.have.lengthOf(3);

      // Elements are not rendered inside lightbox (closed).
      const lightbox = wrapper.find('Lightbox');
      expect(lightbox).to.have.lengthOf(1);
      expect(lightbox.children()).to.have.lengthOf(0);
    });

    it('renders with WithLightbox[as]', () => {
      const wrapper = mount(
        <LightboxGalleryProvider>
          <WithLightbox key="1" id="standard">
            <img />
          </WithLightbox>
          <img key="2" id="no-lightbox" />
          <WithLightbox key="3" as="img" id="with-as" />
          <div key="4">
            <div>
              <WithLightbox id="deeply-nested">
                <img />
              </WithLightbox>
              <WithLightbox as="img" id="deeply-nested-with-as" />
            </div>
          </div>
        </LightboxGalleryProvider>
      );

      // Children are rendered inside provider.
      const provider = wrapper.find('Provider');
      expect(provider).to.have.lengthOf(1);
      expect(provider.children()).to.have.lengthOf(4);
      expect(wrapper.find('img')).to.have.lengthOf(5);

      // Elements are not rendered inside lightbox (closed).
      const lightbox = wrapper.find('Lightbox');
      expect(lightbox).to.have.lengthOf(1);
      expect(lightbox.children()).to.have.lengthOf(0);
    });

    it('opens with clones when clicking on a lightboxed element', () => {
      const wrapper = mount(
        <LightboxGalleryProvider>
          <WithLightbox key="1" id="standard">
            <img />
          </WithLightbox>
          <img key="2" id="no-lightbox" />
          <div key="3">
            <div>
              <WithLightbox id="deeply-nested">
                <img />
              </WithLightbox>
            </div>
          </div>
        </LightboxGalleryProvider>
      );

      // Children are rendered inside provider.
      const provider = wrapper.find('Provider');
      expect(provider).to.have.lengthOf(1);
      expect(provider.children()).to.have.lengthOf(3);

      // Elements are not rendered inside lightbox (closed).
      let lightbox = wrapper.find('Lightbox');
      expect(lightbox).to.have.lengthOf(1);
      expect(lightbox.children()).to.have.lengthOf(0);

      // Note: We would normally click the first `img` element,
      // not its generated `div` wrapper. However, enzyme's
      // shallow renderer does not support event propagation as
      // we would expect in a real environment.
      wrapper.find('div').first().simulate('click');
      wrapper.update();

      // Render provided children
      lightbox = wrapper.find('Lightbox');
      expect(lightbox).to.have.lengthOf(1);
      expect(lightbox.prop('closeButtonAs').name).to.equal('CloseButtonIcon');
      expect(lightbox.children()).to.have.lengthOf(1);

      // Carousel UI
      const carousel = lightbox.find('BaseCarousel');
      expect(carousel).to.have.lengthOf(1);
      expect(carousel.prop('arrowPrevAs').name).to.equal('NavButtonIcon');
      expect(carousel.prop('arrowNextAs').name).to.equal('NavButtonIcon');
      expect(carousel.find('img')).to.have.lengthOf(2);
    });

    it('opens with rendered when given', () => {
      const renderImg = () => <img className="rendered-img"></img>;
      const wrapper = mount(
        <LightboxGalleryProvider>
          <WithLightbox key="1" id="standard">
            <img />
          </WithLightbox>
          <img key="2" id="no-lightbox" />
          <WithLightbox key="3" as="img" id="with-as" render={renderImg} />
          <div key="4">
            <div>
              <WithLightbox id="deeply-nested">
                <img />
              </WithLightbox>
              <WithLightbox
                as="img"
                id="deeply-nested-with-as"
                render={renderImg}
              />
            </div>
          </div>
        </LightboxGalleryProvider>
      );

      // Children are rendered inside provider.
      const provider = wrapper.find('Provider');
      expect(provider).to.have.lengthOf(1);
      expect(provider.children()).to.have.lengthOf(4);
      expect(wrapper.find('img')).to.have.lengthOf(5);

      // Elements are not rendered inside lightbox (closed).
      let lightbox = wrapper.find('Lightbox');
      expect(lightbox).to.have.lengthOf(1);
      expect(lightbox.children()).to.have.lengthOf(0);

      // Note: We would normally click the first `img` element,
      // not its generated `div` wrapper. However, enzyme's
      // shallow renderer does not support event propagation as
      // we would expect in a real environment.
      wrapper.find('div').first().simulate('click');
      wrapper.update();

      // Render provided children
      lightbox = wrapper.find('Lightbox');
      expect(lightbox).to.have.lengthOf(1);
      expect(lightbox.prop('closeButtonAs').name).to.equal('CloseButtonIcon');
      expect(lightbox.children()).to.have.lengthOf(1);

      // Carousel UI
      const carousel = lightbox.find('BaseCarousel');
      expect(carousel).to.have.lengthOf(1);
      expect(carousel.prop('arrowPrevAs').name).to.equal('NavButtonIcon');
      expect(carousel.prop('arrowNextAs').name).to.equal('NavButtonIcon');

      // Children are given to carousel
      const imgs = carousel.find('img');
      expect(imgs).to.have.lengthOf(3); // Carousel only renders 3 items.
      expect(imgs.at(0).hasClass('rendered-img')).to.be.false;
      expect(imgs.at(1).hasClass('rendered-img')).to.be.true;
      expect(imgs.at(2).hasClass('rendered-img')).to.be.false;
    });
  });

  describe('LightboxGalleryProvider with render prop', () => {
    it('renders with WithLightbox', () => {
      const render = () => [
        <WithLightbox key="1" id="standard">
          <img />
        </WithLightbox>,
        <img key="2" id="no-lightbox" />,
        <div key="3">
          <div>
            <WithLightbox id="deeply-nested">
              <img />
            </WithLightbox>
          </div>
        </div>,
      ];
      const wrapper = mount(<LightboxGalleryProvider render={render} />);

      // Children are rendered inside provider.
      const provider = wrapper.find('Provider');
      expect(provider).to.have.lengthOf(1);
      expect(provider.children()).to.have.lengthOf(3);

      // Elements are not rendered inside lightbox (closed).
      const lightbox = wrapper.find('Lightbox');
      expect(lightbox).to.have.lengthOf(1);
      expect(lightbox.children()).to.have.lengthOf(0);
    });

    it('renders with WithLightbox[as]', () => {
      const render = () => [
        <WithLightbox key="1" id="standard">
          <img />
        </WithLightbox>,
        <img key="2" id="no-lightbox" />,
        <WithLightbox key="3" as="img" id="with-as" />,
        <div key="4">
          <div>
            <WithLightbox id="deeply-nested">
              <img />
            </WithLightbox>
            <WithLightbox as="img" id="deeply-nested-with-as" />
          </div>
        </div>,
      ];
      const wrapper = mount(<LightboxGalleryProvider render={render} />);

      // Children are rendered inside provider.
      const provider = wrapper.find('Provider');
      expect(provider).to.have.lengthOf(1);
      expect(provider.children()).to.have.lengthOf(4);
      expect(wrapper.find('img')).to.have.lengthOf(5);

      // Elements are not rendered inside lightbox (closed).
      const lightbox = wrapper.find('Lightbox');
      expect(lightbox).to.have.lengthOf(1);
      expect(lightbox.children()).to.have.lengthOf(0);
    });

    it('opens with clones when clicking on a lightboxed element', () => {
      const render = () => [
        <WithLightbox key="1" id="standard">
          <img />
        </WithLightbox>,
        <img key="2" id="no-lightbox" />,
        <div key="3">
          <div>
            <WithLightbox id="deeply-nested">
              <img />
            </WithLightbox>
          </div>
        </div>,
      ];
      const wrapper = mount(<LightboxGalleryProvider render={render} />);

      // Children are rendered inside provider.
      const provider = wrapper.find('Provider');
      expect(provider).to.have.lengthOf(1);
      expect(provider.children()).to.have.lengthOf(3);

      // Elements are not rendered inside lightbox (closed).
      let lightbox = wrapper.find('Lightbox');
      expect(lightbox).to.have.lengthOf(1);
      expect(lightbox.children()).to.have.lengthOf(0);

      // Note: We would normally click the first `img` element,
      // not its generated `div` wrapper. However, enzyme's
      // shallow renderer does not support event propagation as
      // we would expect in a real environment.
      wrapper.find('div').first().simulate('click');
      wrapper.update();

      // Render provided children
      lightbox = wrapper.find('Lightbox');
      expect(lightbox).to.have.lengthOf(1);
      expect(lightbox.prop('closeButtonAs').name).to.equal('CloseButtonIcon');
      expect(lightbox.children()).to.have.lengthOf(1);

      // Carousel UI
      const carousel = lightbox.find('BaseCarousel');
      expect(carousel).to.have.lengthOf(1);
      expect(carousel.prop('arrowPrevAs').name).to.equal('NavButtonIcon');
      expect(carousel.prop('arrowNextAs').name).to.equal('NavButtonIcon');
      expect(carousel.find('img')).to.have.lengthOf(2);
    });

    it('opens with rendered when given', () => {
      const renderImg = () => <img className="rendered-img"></img>;
      const render = () => [
        <WithLightbox key="1" id="standard">
          <img />
        </WithLightbox>,
        <img key="2" id="no-lightbox" />,
        <WithLightbox key="3" as="img" id="with-as" render={renderImg} />,
        <div key="4">
          <div>
            <WithLightbox id="deeply-nested">
              <img />
            </WithLightbox>
            <WithLightbox
              as="img"
              id="deeply-nested-with-as"
              render={renderImg}
            />
          </div>
        </div>,
      ];
      const wrapper = mount(<LightboxGalleryProvider render={render} />);

      // Children are rendered inside provider.
      const provider = wrapper.find('Provider');
      expect(provider).to.have.lengthOf(1);
      expect(provider.children()).to.have.lengthOf(4);
      expect(wrapper.find('img')).to.have.lengthOf(5);

      // Elements are not rendered inside lightbox (closed).
      let lightbox = wrapper.find('Lightbox');
      expect(lightbox).to.have.lengthOf(1);
      expect(lightbox.children()).to.have.lengthOf(0);

      // Note: We would normally click the first `img` element,
      // not its generated `div` wrapper. However, enzyme's
      // shallow renderer does not support event propagation as
      // we would expect in a real environment.
      wrapper.find('div').first().simulate('click');
      wrapper.update();

      // Render provided children
      lightbox = wrapper.find('Lightbox');
      expect(lightbox).to.have.lengthOf(1);
      expect(lightbox.prop('closeButtonAs').name).to.equal('CloseButtonIcon');
      expect(lightbox.children()).to.have.lengthOf(1);

      // Carousel UI
      const carousel = lightbox.find('BaseCarousel');
      expect(carousel).to.have.lengthOf(1);
      expect(carousel.prop('arrowPrevAs').name).to.equal('NavButtonIcon');
      expect(carousel.prop('arrowNextAs').name).to.equal('NavButtonIcon');

      // Children are given to carousel
      const imgs = carousel.find('img');
      expect(imgs).to.have.lengthOf(3); // Carousel only renders 3 items.
      expect(imgs.at(0).hasClass('rendered-img')).to.be.false;
      expect(imgs.at(1).hasClass('rendered-img')).to.be.true;
      expect(imgs.at(2).hasClass('rendered-img')).to.be.false;
    });
  });
});
