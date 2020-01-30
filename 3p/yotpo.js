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

import {createElementWithAttributes} from '../src/dom';
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
  const container = createElementWithAttributes(global.document, 'div', {
    'class': 'preview-only-full-height',
  });
  const childDiv = createElementWithAttributes(global.document, 'div', {
    'class': 'preview-only-flex-center preview-only-full-height',
  });
  const bottomLine = createElementWithAttributes(global.document, 'div', {
    'class': 'yotpo bottomLine',
    'data-product-id': data.productId,
  });
  childDiv.appendChild(bottomLine);
  container.appendChild(childDiv);

  return container;
}

/**
 * Create DOM element for the Yotpo main widget plugin:
 * @param {!Window} global
 * @param {!Object} data The element data
 * @return {!Element} div
 */
function getMainWidgetContainer(global, data) {
  const container = createElementWithAttributes(global.document, 'div', {
    'class': 'yotpo yotpo-main-widget',
    'data-product-id': data.productId,
    'data-name': data.name,
    'data-url': data.url,
    'data-image-url': data.imageUrl,
    'data-description': data.description,
    'data-yotpo-element-id': data.yotpoElementId,
  });

  return container;
}

/**
 * Create DOM element for the Yotpo reviews carousel plugin:
 * @param {!Window} global
 * @param {!Object} data The element data
 * @return {!Element} div
 */
function getReviewsCarouselContainer(global, data) {
  const container = createElementWithAttributes(global.document, 'div', {
    'class': 'yotpo yotpo-reviews-carousel yotpo-size-7',
    'data-background-color': data.backgroudColor,
    'data-mode': data.mode,
    'data-review-ids': data.reviewIds,
    'data-show-bottomline': data.showBottomLine,
    'data-autoplay-enabled': data.autoplayEnabled,
    'data-autoplay-speed': data.autoplaySpeed,
    'data-show-navigation': data.showNavigation,
    'data-yotpo-element-id': data.yotpoElementId,
    'style': 'max-width: 1250px;',
  });

  return container;
}

/**
 * Create DOM element for the Yotpo UGC Gallery plugin:
 * @param {!Window} global
 * @param {!Object} data The element data
 * @return {!Element} div
 */
function getUgcGalleryContainer(global, data) {
  const container = createElementWithAttributes(global.document, 'div', {
    'class': 'yotpo yotpo-pictures-gallery',
    'data-layout': data.layout,
    'data-layout-scroll': data.layoutScroll,
    'data-spacing': data.spacing,
    'data-source': data.source,
    'data-title': data.title,
    'data-hover-color': data.hoverColor,
    'data-hover-opacity': data.hoverOpacity,
    'data-hover-icon': data.hoverIcon,
    'data-cta-text': data.ctaText,
    'data-cta-color': data.ctaColor,
  });

  return container;
}

/**
 * Create DOM element for the Yotpo Badges plugin:
 * @param {!Window} global
 * @return {!Element} div
 */
function getBadgetsContainer(global) {
  const container = createElementWithAttributes(global.document, 'div', {
    'class': 'yotpo yotpo-badge badge-init',
    'id': 'y-badges',
  });
  return container;
}

/**
 * Create DOM element for the Yotpo Reviews Tab plugin:
 * @param {!Window} global
 * @return {!Element} div
 */
function getReviewsTabContainer(global) {
  const container = createElementWithAttributes(global.document, 'div', {
    'class': 'yotpo yotpo-modal',
  });
  return container;
}

/**
 * Create DOM element for the Yotpo Product Gallery plugin:
 * @param {!Window} global
 * @param {!Object} data The element data
 * @return {!Element} div
 */
function getProductGalleryContainer(global, data) {
  const container = createElementWithAttributes(global.document, 'div', {
    'class': 'yotpo yotpo-pictures-gallery yotpo-product-gallery yotpo-size-6',
    'data-product-id': data.productId,
    'data-demo': data.demo,
    'data-layout-rows': data.layoutRows,
    'data-layout-scroll': data.layoutScroll,
    'data-spacing': data.spacing,
    'data-source': data.source,
    'data-title': data.title,
    'data-hover-color': data.hoverColor,
    'data-hover-opacity': data.hoverOpacity,
    'data-hover-icon': data.hoverIcon,
    'data-upload-button': data.uploadButton,
    'data-preview': data.preview,
    'data-yotpo-element-id': data.yotpoElementId,
  });

  return container;
}

/**
 * Create DOM element for the Yotpo Visual UGC Gallery plugin:
 * @param {!Window} global
 * @return {!Element} div
 */
function getVisualUgcGalleryContainer(global) {
  const container = createElementWithAttributes(global.document, 'div', {
    'class': 'yotpo yotpo-preview-pictures-gallery',
  });
  const childDiv = createElementWithAttributes(global.document, 'div', {
    'class': 'yotpo yotpo-pictures-gallery',
  });
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
  const container = createElementWithAttributes(global.document, 'div', {
    'class': 'preview-only-table',
  });
  const cellCentered = createElementWithAttributes(global.document, 'div', {
    'class': 'preview-only-table-cell-centered',
  });
  const embeddedWidget = createElementWithAttributes(global.document, 'div', {
    'class': 'yotpo embedded-widget',
    'data-product-id': data.productId,
    'data-demo': data.demo,
    'data-layout': data.layout,
    'data-width': data.width,
    'data-reviews': data.reviews,
    'data-header-text': data.headerText,
    'data-header-background-color': data.headerBackgroundColor,
    'data-body-background-color': data.bodyBackgroundColor,
    'data-font-size': data.fontSize,
    'data-font-color': data.fontColor,
    'data-yotpo-element-id': data.yotpoElementId,
  });

  cellCentered.appendChild(embeddedWidget);
  container.appendChild(cellCentered);

  return container;
}

/**
 * Create DOM element for the Yotpo Embedded Widget plugin:
 * @param {!Window} global
 * @param {!Object} data The element data
 * @return {!Element} div
 */
function getPhotosCarouselContainer(global, data) {
  const container = createElementWithAttributes(global.document, 'div');
  container.className = 'yotpo yotpo-preview-slider';

  const photosCarousel = createElementWithAttributes(global.document, 'div');
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
  const container = createElementWithAttributes(global.document, 'div');
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
