const TAG_NAME = 'amp-base-carousel';
const SLOTTED_CLASS = 'i-amphtml-carousel-slotted';
const SPACER_CLASS = 'i-amphtml-carousel-spacer';
const SCROLLER_SELECTOR = `${TAG_NAME} .i-amphtml-carousel-scroll`;
const PREV_ARROW_SLOT_SELECTOR = '.i-amphtml-base-carousel-arrow-prev-slot';
const NEXT_ARROW_SLOT_SELECTOR = '.i-amphtml-base-carousel-arrow-next-slot';
const PREV_ARROW_SELECTOR = `${PREV_ARROW_SLOT_SELECTOR} :first-child`;
const NEXT_ARROW_SELECTOR = `${NEXT_ARROW_SLOT_SELECTOR} :first-child`;

async function waitForImgLoad(controller, el) {
  await expect(
    controller.getElementProperty(el, 'naturalWidth')
  ).to.be.greaterThan(0);
}

export async function waitForCarouselImg(controller, n) {
  // We cannot use CSS's nth child due to non-slide elements in the scroll
  // container. We query all the imgs upfront, since they might not have
  // laid out yet.
  const el = await controller.findElementXPath(
    `//${TAG_NAME}//*[contains(@class, "${SLOTTED_CLASS}")][${n + 1}]//img`
  );
  return await waitForImgLoad(controller, el);
}

export function getSlides(controller, opt_carouselId = '') {
  return controller.findElements(
    `${TAG_NAME}${opt_carouselId} .${SLOTTED_CLASS}`
  );
}

export async function getSlide(controller, n) {
  const slides = await getSlides(controller);
  return slides[n];
}

export async function getSpacers(controller) {
  return controller.findElements(`${TAG_NAME} .${SPACER_CLASS}`);
}

export async function getSpacersForSlide(controller, n) {
  const spacers = await getSpacers(controller);
  const slideCount = spacers.length / 3;

  return [spacers[n], spacers[n + slideCount], spacers[n + 2 * slideCount]];
}

export async function getScrollingElement(controller) {
  return controller.findElement(SCROLLER_SELECTOR);
}

export function getPrevArrowSlot(controller) {
  return controller.findElement(PREV_ARROW_SLOT_SELECTOR);
}

export function getNextArrowSlot(controller) {
  return controller.findElement(NEXT_ARROW_SLOT_SELECTOR);
}

export function getPrevArrow(controller) {
  return controller.findElement(PREV_ARROW_SELECTOR);
}

export function getNextArrow(controller) {
  return controller.findElement(NEXT_ARROW_SELECTOR);
}
