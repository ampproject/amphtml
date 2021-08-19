import {AmpScrollableCarousel} from './scrollable-carousel';
import {AmpSlideScroll} from './slidescroll';
import {CSS} from '../../../build/amp-carousel-0.1.css';

class CarouselSelector extends AMP.BaseElement {
  /** @override */
  upgradeCallback() {
    if (this.element.getAttribute('type') == 'slides') {
      return new AmpSlideScroll(this.element);
    }
    return new AmpScrollableCarousel(this.element);
  }
}

AMP.extension('amp-carousel', '0.1', (AMP) => {
  AMP.registerElement('amp-carousel', CarouselSelector, CSS);
});
