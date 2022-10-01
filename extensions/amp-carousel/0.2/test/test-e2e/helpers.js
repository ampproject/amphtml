const TAG_NAME = 'amp-carousel';
const SCROLLABLE_SLIDE = 'amp-scrollable-carousel-slide';
const NEXT_ARROW_SELECTOR = `.amp-carousel-button.amp-carousel-button-next`;

export function getSlides(controller) {
  return controller.findElements(`${TAG_NAME} .${SCROLLABLE_SLIDE}`);
}

export async function getSlide(controller, n) {
  const slides = await getSlides(controller);
  return slides[n];
}

export function getNextArrow(controller) {
  return controller.findElement(NEXT_ARROW_SELECTOR);
}
