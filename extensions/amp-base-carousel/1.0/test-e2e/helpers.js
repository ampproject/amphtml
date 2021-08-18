

const TAG_NAME = 'amp-base-carousel';
const SLIDE_CLASS = 'slideElement';
const SCROLLER_CLASS = 'hideScrollbar';
const PREV_ARROW_CLASS = 'arrowPrev';
const NEXT_ARROW_CLASS = 'arrowNext';
const PREV_ARROW_SLOT_SELECTOR = '[slot="prev-arrow"]';
const NEXT_ARROW_SLOT_SELECTOR = '[slot="next-arrow"]';

/** Increase element wait timeout for Selenium controller */
const ELEMENT_WAIT_TIMEOUT = 10000;

export function getCarousel(controller) {
  return controller.findElement(TAG_NAME);
}

export function getSlides(styles, controller) {
  return controller.findElements(`.${styles[SLIDE_CLASS]}`);
}

export async function getSlide(styles, controller, n) {
  return controller.findElement(`.${styles[SLIDE_CLASS]}[data-slide="${n}"]`);
}

export async function getScrollingElement(styles, controller) {
  return controller.findElement(
    `.${styles[SCROLLER_CLASS]}`,
    ELEMENT_WAIT_TIMEOUT
  );
}

export async function getPrevArrowSlot(controller) {
  return controller.findElement(PREV_ARROW_SLOT_SELECTOR);
}

export async function getNextArrowSlot(controller) {
  return controller.findElement(NEXT_ARROW_SLOT_SELECTOR);
}

export async function getPrevArrow(styles, controller) {
  return controller.findElement(
    `.${styles[PREV_ARROW_CLASS]}`,
    ELEMENT_WAIT_TIMEOUT
  );
}

export async function getNextArrow(styles, controller) {
  return controller.findElement(
    `.${styles[NEXT_ARROW_CLASS]}`,
    ELEMENT_WAIT_TIMEOUT
  );
}

export function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms));
}
