/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import {loadScript} from './3p';

/**
 * Get the correct script for the container.
 * @param {!Window} global
 * @param {string} scriptSource The source of the script, different for post and comment embeds.
 */
function getContainerScript(global, scriptSource) {
  loadScript(global, scriptSource, () => {});
}

/**
 * Create DOM element for the Yotpo bottom line plugin:
 * @param {!Window} global
 * @param {!Object} data The element data
 * @return {!Element} div
 */
function getBottomLineContainer(global, data) {
  const container = global.document.createElement('div');
  container.className = 'yotpo bottomLine';
  container.setAttribute('data-product-id', data.productId);
  return container;
}

/**
 * Create DOM element for the Yotpo main widget plugin:
 * @param {!Window} global
 * @param {!Object} data The element data
 * @return {!Element} div
 */
function getMainWidgetContainer(global, data) {
  const container = global.document.createElement('div');
  container.className = 'yotpo yotpo-main-widget';
  container.setAttribute('data-product-id', data.productId);
  container.setAttribute('data-name', data.name);
  container.setAttribute('data-url', data.url);
  container.setAttribute('data-image-url', data.imageUrl);
  container.setAttribute('data-description', data.description);
  container.setAttribute('data-yotpo-element-id', data.yotpoElementId);
  return container;
}

/**
 * Create DOM element for the Yotpo reviews carousel plugin:
 * @param {!Window} global
 * @param {!Object} data The element data
 * @return {!Element} div
 */
function getReviewsCarouselContainer(global, data) {
  const container = global.document.createElement('div');
  container.className = 'yotpo yotpo-reviews-carousel yotpo-size-7';
  container.setAttribute('data-background-color', data.backgroudColor);
  container.setAttribute('data-mode', data.mode);
  container.setAttribute('data-review-ids', data.reviewIds);
  container.setAttribute('data-show-bottomline', data.showBottomLine);
  container.setAttribute('data-autoplay-enabled', data.autoplayEnabled);
  container.setAttribute('data-autoplay-speed', data.autoplaySpeed);
  container.setAttribute('data-show-navigation', data.showNavigation);
  container.setAttribute('data-yotpo-element-id', data.yotpoElementId);
  container.setAttribute('style', 'max-width: 1250px;');
  return container;
}

/**
 * Create DOM element for the Yotpo UGC Gallery plugin:
 * @param {!Window} global
 * @param {!Object} data The element data
 * @return {!Element} div
 */
function getUgcGalleryContainer(global, data) {
  const container = global.document.createElement('div');
  container.className = 'yotpo yotpo-pictures-gallery';
  container.setAttribute('data-layout', data.layout);
  container.setAttribute('data-layout-scroll', data.layoutScroll);
  container.setAttribute('data-spacing', data.spacing);
  container.setAttribute('data-source', data.source);
  container.setAttribute('data-title', data.title);
  container.setAttribute('data-hover-color', data.hoverColor);
  container.setAttribute('data-hover-opacity', data.hoverOpacity);
  container.setAttribute('data-hover-icon', data.hoverIcon);
  container.setAttribute('data-cta-text', data.ctaText);
  container.setAttribute('data-cta-color', data.ctaColor);
  return container;
}

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function yotpo(global, data) {
  const widgetType = data.widgetType;

  let container;

  if (widgetType == 'BottomLine') {
    container = getBottomLineContainer(global, data);
  } else if (widgetType == 'PicturesGallery') {
    container = getUgcGalleryContainer(global, data);
  } else if (widgetType == 'ReviewsCarousel') {
    container = getReviewsCarouselContainer(global, data);
  } else {
    container = getMainWidgetContainer(global, data);
  }

  global.document.getElementById('c').appendChild(container);

  const scriptSource = 'https://staticw2.yotpo.com/' + data.appKey + '/widget.js';
  getContainerScript(global, scriptSource);
}
