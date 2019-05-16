/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
 * @param {function(!Object, string)} cb
 */
function getContainerScript(global, scriptSource, cb) {
  loadScript(global, scriptSource, () => {
    global.Yotpo = global.Yotpo || {};
    delete global.Yotpo.widgets['testimonials'];
    const yotpoWidget =
      typeof global.yotpo === 'undefined' ? undefined : global.yotpo;
    yotpoWidget.on('CssReady', function() {
      cb(yotpoWidget, 'cssLoaded');
    });
    yotpoWidget.on('BatchReady', function() {
      cb(yotpoWidget, 'batchLoaded');
    });
  });
}

/**
 * Create DOM element for the Yotpo bottom line plugin:
 * @param {!Window} global
 * @param {!Object} data The element data
 * @return {!Element} div
 */
function getBottomLineContainer(global, data) {
  const container = global.document.createElement('div');
  container.className = 'preview-only-full-height';

  const childDiv = global.document.createElement('div');
  childDiv.className = 'preview-only-flex-center preview-only-full-height';
  container.appendChild(childDiv);

  const bottomLine = global.document.createElement('div');
  bottomLine.className = 'yotpo bottomLine';
  bottomLine.setAttribute('data-product-id', data.productId);

  childDiv.appendChild(bottomLine);

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
 * Create DOM element for the Yotpo Badges plugin:
 * @param {!Window} global
 * @return {!Element} div
 */
function getBadgetsContainer(global) {
  const container = global.document.createElement('div');
  container.className = 'yotpo yotpo-badge badge-init';
  container.setAttribute('id', 'y-badges');
  return container;
}

/**
 * Create DOM element for the Yotpo Reviews Tab plugin:
 * @param {!Window} global
 * @return {!Element} div
 */
function getReviewsTabContainer(global) {
  const container = global.document.createElement('div');
  container.className = 'yotpo yotpo-modal';
  return container;
}

/**
 * Create DOM element for the Yotpo Product Gallery plugin:
 * @param {!Window} global
 * @param {!Object} data The element data
 * @return {!Element} div
 */
function getProductGalleryContainer(global, data) {
  const container = global.document.createElement('div');
  container.className =
    'yotpo yotpo-pictures-gallery yotpo-product-gallery ' + 'yotpo-size-6';
  container.setAttribute('data-product-id', data.productId);
  container.setAttribute('data-demo', data.demo);
  container.setAttribute('data-layout-rows', data.layoutRows);
  container.setAttribute('data-layout-scroll', data.layoutScroll);
  container.setAttribute('data-spacing', data.spacing);
  container.setAttribute('data-source', data.source);
  container.setAttribute('data-title', data.title);
  container.setAttribute('data-hover-color', data.hoverColor);
  container.setAttribute('data-hover-opacity', data.hoverOpacity);
  container.setAttribute('data-hover-icon', data.hoverIcon);
  container.setAttribute('data-upload-button', data.uploadButton);
  container.setAttribute('data-preview', data.preview);
  container.setAttribute('data-yotpo-element-id', data.yotpoElementId);
  return container;
}

/**
 * Create DOM element for the Yotpo Visual UGC Gallery plugin:
 * @param {!Window} global
 * @return {!Element} div
 */
function getVisualUgcGalleryContainer(global) {
  const container = global.document.createElement('div');
  container.className = 'yotpo yotpo-preview-pictures-gallery';

  const childDiv = global.document.createElement('div');
  childDiv.className = 'yotpo yotpo-pictures-gallery';
  container.appendChild(childDiv);

  return container;
}

/**
 * Create DOM element for the Yotpo Embedded Widget plugin:
 * @param {!Window} global
 * @param {!Object} data The element data
 * @return {!Element} div
 */
function getEmbeddedWidgetContainer(global, data) {
  const container = global.document.createElement('div');
  container.className = 'preview-only-table';

  const cellCentered = global.document.createElement('div');
  cellCentered.className = 'preview-only-table-cell-centered';
  container.appendChild(cellCentered);

  const embeddedWidget = global.document.createElement('div');
  embeddedWidget.className = 'yotpo embedded-widget';
  cellCentered.appendChild(embeddedWidget);

  embeddedWidget.setAttribute('data-product-id', data.productId);
  embeddedWidget.setAttribute('data-demo', data.demo);
  embeddedWidget.setAttribute('data-layout', data.layout);
  embeddedWidget.setAttribute('data-width', data.width);
  embeddedWidget.setAttribute('data-reviews', data.reviews);
  embeddedWidget.setAttribute('data-header-text', data.headerText);
  embeddedWidget.setAttribute(
    'data-header-background-color',
    data.headerBackgroundColor
  );
  embeddedWidget.setAttribute(
    'data-body-background-color',
    data.bodyBackgroundColor
  );
  embeddedWidget.setAttribute('data-font-size', data.fontSize);
  embeddedWidget.setAttribute('data-font-color', data.fontColor);
  embeddedWidget.setAttribute('data-yotpo-element-id', data.yotpoElementId);

  return container;
}

/**
 * Create DOM element for the Yotpo Embedded Widget plugin:
 * @param {!Window} global
 * @param {!Object} data The element data
 * @return {!Element} div
 */
function getPhotosCarouselContainer(global, data) {
  const container = global.document.createElement('div');
  container.className = 'yotpo yotpo-preview-slider';

  const photosCarousel = global.document.createElement('div');
  photosCarousel.className = 'yotpo yotpo-slider';
  container.appendChild(photosCarousel);

  photosCarousel.setAttribute('data-product-id', data.productId);
  photosCarousel.setAttribute('data-demo', data.demo);

  return container;
}

/**
 * Create DOM element for the Yotpo Promoted Products plugin:
 * @param {!Window} global
 * @param {!Object} data The element data
 * @return {!Element} div
 */
function getPromotedProductsContainer(global, data) {
  const container = global.document.createElement('div');
  container.className =
    'yotpo yotpo-main-widget yotpo-promoted-product ' +
    'yotpo-medium promoted-products-box';

  container.setAttribute('id', 'widget-div-id');
  container.setAttribute('data-demo', data.demo);
  container.setAttribute('data-product-id', data.productId);

  return container;
}

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function yotpo(global, data) {
  const {widgetType} = data;
  let container;
  if (widgetType == 'BottomLine') {
    container = getBottomLineContainer(global, data);
  } else if (widgetType == 'ReviewsCarousel') {
    container = getReviewsCarouselContainer(global, data);
  } else if (widgetType == 'PicturesGallery') {
    container = getUgcGalleryContainer(global, data);
  } else if (widgetType == 'Badge') {
    container = getBadgetsContainer(global);
  } else if (widgetType == 'ReviewsTab') {
    container = getReviewsTabContainer(global);
  } else if (widgetType == 'ProductGallery') {
    container = getProductGalleryContainer(global, data);
  } else if (widgetType == 'VisualUgcGallery') {
    container = getVisualUgcGalleryContainer(global);
  } else if (widgetType == 'EmbeddedWidget') {
    container = getEmbeddedWidgetContainer(global, data);
  } else if (widgetType == 'PhotosCarousel') {
    container = getPhotosCarouselContainer(global, data);
  } else if (widgetType == 'PromotedProducts') {
    container = getPromotedProductsContainer(global, data);
  } else {
    container = getMainWidgetContainer(global, data);
  }

  global.document.getElementById('c').appendChild(container);

  let cssLoaded = false;
  let batchLoaded = false;
  const scriptSource =
    'https://staticw2.yotpo.com/' + data.appKey + '/widget.js';
  getContainerScript(global, scriptSource, (yotpoWidget, eventType) => {
    if (eventType === 'cssLoaded') {
      cssLoaded = true;
    }
    if (eventType === 'batchLoaded') {
      batchLoaded = true;
    }

    if (batchLoaded && cssLoaded) {
      setTimeout(() => {
        if (yotpoWidget.widgets[0]) {
          context.updateDimensions(
            yotpoWidget.widgets[0].element./*OK*/ offsetWidth,
            yotpoWidget.widgets[0].element./*OK*/ offsetHeight
          );
        }
      }, 100);
    }
  });
}
