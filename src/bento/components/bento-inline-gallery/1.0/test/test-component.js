import {mount} from 'enzyme';

import {BentoBaseCarousel} from '#bento/components/bento-base-carousel/1.0/component';
import {BentoInlineGallery} from '#bento/components/bento-inline-gallery/1.0/component';
import {BentoInlineGalleryPagination} from '#bento/components/bento-inline-gallery/1.0/pagination';
import {BentoInlineGalleryThumbnails} from '#bento/components/bento-inline-gallery/1.0/thumbnails';

import * as Preact from '#preact';

describes.sandboxed('InlineGallery preact component', {}, () => {
  describe('BentoInlineGalleryPagination component', () => {
    it('should render BentoBaseCarousels and BentoInlineGalleryPagination', () => {
      const jsx = (
        <BentoInlineGallery>
          <BentoBaseCarousel>
            <div>slide 1</div>
            <div>slide 2</div>
            <div>slide 3</div>
          </BentoBaseCarousel>
          <BentoInlineGalleryPagination />
        </BentoInlineGallery>
      );
      const wrapper = mount(jsx);
      const carousel = wrapper.find('BentoBaseCarousel');
      expect(carousel).to.have.lengthOf(1);
      const slides = carousel.find('[data-slide]');
      expect(slides).to.have.lengthOf(3);

      const pagination = wrapper.find('BentoInlineGalleryPagination');
      expect(pagination).to.have.lengthOf(1);
    });
  });

  describe('Thumbnail component', () => {
    it('should render BentoBaseCarousel and BentoInlineGalleryThumbnails', () => {
      const jsx = (
        <BentoInlineGallery>
          <BentoBaseCarousel>
            <div>slide 1</div>
            <div>slide 2</div>
            <div>slide 3</div>
          </BentoBaseCarousel>
          <BentoInlineGalleryThumbnails />
        </BentoInlineGallery>
      );
      const wrapper = mount(jsx);

      const carousels = wrapper.find('BentoBaseCarousel');
      expect(carousels).to.have.lengthOf(2);
      const slides = carousels.first().find('[data-slide]');
      expect(slides).to.have.lengthOf(3);

      const thumbnails = wrapper.find('BentoInlineGalleryThumbnails');
      expect(thumbnails).to.have.lengthOf(1);
      const generatedCarousel = thumbnails.find('BentoBaseCarousel');
      expect(generatedCarousel).to.have.lengthOf(1);
      expect(generatedCarousel.prop('loop')).to.be.false;
      expect(generatedCarousel.prop('snapAlign')).to.equal('start');
      expect(generatedCarousel.prop('outsetArrows')).to.be.true;

      const generatedSlides = generatedCarousel.find('[data-slide]');
      expect(generatedSlides).to.have.lengthOf(3);

      // By default there is no `src`
      expect(generatedSlides.at(0).find('img').prop('src')).to.be.undefined;
      expect(generatedSlides.at(1).find('img').prop('src')).to.be.undefined;
      expect(generatedSlides.at(2).find('img').prop('src')).to.be.undefined;
    });

    it('should respect thumbnailSrc', () => {
      const jsx = (
        <BentoInlineGallery>
          <BentoBaseCarousel>
            <div thumbnailSrc="slide1.jpg">slide 1</div>
            <div thumbnailSrc="slide2.jpg">slide 2</div>
            <div thumbnailSrc="slide3.jpg">slide 3</div>
          </BentoBaseCarousel>
          <BentoInlineGalleryThumbnails />
        </BentoInlineGallery>
      );
      const wrapper = mount(jsx);

      const carousels = wrapper.find('BentoBaseCarousel');
      expect(carousels).to.have.lengthOf(2);
      const slides = carousels.first().find('[data-slide]');
      expect(slides).to.have.lengthOf(3);

      const thumbnails = wrapper.find('BentoInlineGalleryThumbnails');
      expect(thumbnails).to.have.lengthOf(1);
      const generatedCarousel = thumbnails.find('BentoBaseCarousel');
      expect(generatedCarousel).to.have.lengthOf(1);
      expect(generatedCarousel.prop('loop')).to.be.false;
      expect(generatedCarousel.prop('snapAlign')).to.equal('start');
      expect(generatedCarousel.prop('outsetArrows')).to.be.true;

      const generatedSlides = generatedCarousel.find('[data-slide]');
      expect(generatedSlides).to.have.lengthOf(3);

      // Take from `thumbnailSrc` prop.
      expect(generatedSlides.at(0).find('img').prop('src')).to.equal(
        'slide1.jpg'
      );
      expect(generatedSlides.at(1).find('img').prop('src')).to.equal(
        'slide2.jpg'
      );
      expect(generatedSlides.at(2).find('img').prop('src')).to.equal(
        'slide3.jpg'
      );
    });

    it('should respect looping with slide alignment', () => {
      const jsx = (
        <BentoInlineGallery>
          <BentoBaseCarousel>
            <div>slide 1</div>
            <div>slide 2</div>
            <div>slide 3</div>
          </BentoBaseCarousel>
          <BentoInlineGalleryThumbnails loop />
        </BentoInlineGallery>
      );
      const wrapper = mount(jsx);

      const carousels = wrapper.find('BentoBaseCarousel');
      expect(carousels).to.have.lengthOf(2);
      const slides = carousels.first().find('[data-slide]');
      expect(slides).to.have.lengthOf(3);

      const thumbnails = wrapper.find('BentoInlineGalleryThumbnails');
      expect(thumbnails).to.have.lengthOf(1);
      const generatedCarousel = thumbnails.find('BentoBaseCarousel');
      expect(generatedCarousel).to.have.lengthOf(1);
      expect(generatedCarousel.prop('loop')).to.be.true;
      expect(generatedCarousel.prop('snapAlign')).to.equal('center');
      expect(generatedCarousel.prop('outsetArrows')).to.be.true;
    });
  });
});
