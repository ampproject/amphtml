/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

import {Action, StateProperty} from '../amp-story-store-service';
import {BookendComponent} from './bookend-component';
import {CSS} from '../../../../build/amp-story-bookend-1.0.css';
import {EventType, dispatch} from '../events';
import {KeyCodes} from '../../../../src/utils/key-codes';
import {ScrollableShareWidget} from '../amp-story-share';
import {Services} from '../../../../src/services';
import {closest} from '../../../../src/dom';
import {createShadowRootWithStyle} from '../utils';
import {dev, user} from '../../../../src/log';
import {dict} from '../../../../src/utils/object';
import {getAmpdoc} from '../../../../src/service';
import {getJsonLd} from '../jsonld';
import {isArray} from '../../../../src/types';
import {isProtocolValid, parseUrl} from '../../../../src/url';
import {renderAsElement} from '../simple-template';
import {throttle} from '../../../../src/utils/rate-limit';

/**
 * Scroll amount required for full-bleed in px.
 * @private @const {number}
 */
const FULLBLEED_THRESHOLD = 88;


/** @private @const {string} */
const FULLBLEED_CLASSNAME = 'i-amphtml-story-bookend-fullbleed';


/** @private @const {string} */
const HIDDEN_CLASSNAME = 'i-amphtml-hidden';

// TODO(#14591): Clean when bookend API v0.1 is deprecated.
const BOOKEND_VERSION_1 = 'v1.0';
const BOOKEND_VERSION_0 = 'v0.1';
const BOOKEND_VERSION_KEY = 'bookend-version';

/** @private @const {!../simple-template.ElementDef} */
const ROOT_TEMPLATE = {
  tag: 'section',
  attrs: dict({
    'class': 'i-amphtml-story-bookend i-amphtml-story-system-reset ' +
        HIDDEN_CLASSNAME}),
  children: [
    // Overflow container that gets pushed to the bottom when content height is
    // smaller than viewport.
    {
      tag: 'div',
      attrs: dict({'class': 'i-amphtml-story-bookend-overflow'}),
      children: [
        // Holds bookend content.
        {
          tag: 'div',
          attrs: dict({'class': 'i-amphtml-story-bookend-inner'}),
        },
      ],
    },
  ],
};

/** @private @const {!../simple-template.ElementDef} */
const REPLAY_ICON_TEMPLATE = {
  tag: 'div',
  attrs: dict({'class': 'i-amphtml-story-bookend-replay-icon'}),
};


/** @type {string} */
const TAG = 'amp-story';

/**
 * @param {!Document} doc
 * @param {string} title
 * @param {string} domainName
 * @param {string=} opt_imageUrl
 * @return {!../simple-template.ElementDef}
 */
function buildReplayButtonTemplate(doc, title, domainName, opt_imageUrl) {
  return /** @type {!../simple-template.ElementDef} */ ({
    tag: 'div',
    attrs: dict({'class': 'i-amphtml-story-bookend-replay'}),
    children: [
      !opt_imageUrl ? REPLAY_ICON_TEMPLATE : {
        tag: 'div',
        attrs: dict({
          'class': 'i-amphtml-story-bookend-replay-image',
          'style': `background-image: url(${opt_imageUrl}) !important`,
        }),
        children: [REPLAY_ICON_TEMPLATE],
      },
      {
        tag: 'h2',
        attrs: dict({'class': 'i-amphtml-story-bookend-article-heading'}),
        unlocalizedString: title,
      },
      {
        tag: 'div',
        attrs: dict({'class': 'i-amphtml-story-bookend-article-meta'}),
        unlocalizedString: domainName,
      },
    ],
  });
}

/**
 * Bookend component for <amp-story>.
 * This component has to be built and preloaded before it can be displayed,
 * through the 'build' and 'loadConfig' method. It can then be toggled by
 * dispatching the store TOGGLE_BOOKEND action.
 */
export class AmpStoryBookend extends AMP.BaseElement {
  /**
   * @param {!Element} element
   */
  constructor(element) {
    super(element);

    /** @private {?./bookend-component.BookendDataDef} */
    this.config_ = null;

    /** @private {boolean} */
    this.isBuilt_ = false;

    /** @private {boolean} */
    this.isBookendRendered_ = false;

    /** @private {?Element} */
    this.replayButton_ = null;

    /**
     * Root element containing a shadow DOM root.
     * @private {?Element}
     */
    this.root_ = null;

    /**
     * Actual bookend.
     * @private {?Element}
     */
    this.bookendEl_ = null;

    /** @private @const {!../amp-story-request-service.AmpStoryRequestService} */
    this.requestService_ = Services.storyRequestService(this.win);

    /** @private {!ScrollableShareWidget} */
    this.shareWidget_ = ScrollableShareWidget.create(this.win);

    /** @private @const {!../amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = Services.storyStoreService(this.win);

    /** @private @const {!../../../../src/service/vsync-impl.Vsync} */
    this.vsync_ = Services.vsyncFor(this.win);

    /** @private @const {!../../../../src/service/resources-impl.Resources} */
    this.resources_ = Services.resourcesForDoc(getAmpdoc(this.win.document));
  }

  /**
   * Builds the bookend components and appends it to the provided story.
   */
  build() {
    if (this.isBuilt_) {
      return;
    }

    this.isBuilt_ = true;

    this.root_ = this.win.document.createElement('div');
    this.bookendEl_ = renderAsElement(this.win.document, ROOT_TEMPLATE);

    createShadowRootWithStyle(this.root_, this.bookendEl_, CSS);

    this.replayButton_ = this.buildReplayButton_();

    const innerContainer = this.getInnerContainer_();
    innerContainer.appendChild(this.replayButton_);
    innerContainer.appendChild(this.shareWidget_.build(this.getAmpDoc()));
    this.initializeListeners_();

    this.vsync_.mutate(() => {
      this.element.parentElement.appendChild(this.getRoot());
    });
  }

  /**
   * @private
   */
  initializeListeners_() {
    this.getShadowRoot()
        .addEventListener('click', event => this.maybeClose_(event));
    this.replayButton_.addEventListener(
        'click', event => this.onReplayButtonClick_(event));

    this.getOverflowContainer_().addEventListener('scroll',
        // minInterval is high since this is a step function that does not
        // require smoothness
        throttle(this.win, () => this.onScroll_(), 100));

    this.win.addEventListener('keyup', event => {
      if (!this.isActive_()) {
        return;
      }
      if (event.keyCode == KeyCodes.ESCAPE) {
        event.preventDefault();
        this.close_();
      }
    });

    this.storeService_.subscribe(StateProperty.BOOKEND_STATE, isActive => {
      this.onBookendStateUpdate_(isActive);
    });

    this.storeService_.subscribe(StateProperty.CAN_SHOW_SHARING_UIS, show => {
      this.onCanShowSharingUisUpdate_(show);
    }, true /** callToInitialize */);

    this.storeService_.subscribe(StateProperty.DESKTOP_STATE, isDesktop => {
      this.onDesktopStateUpdate_(isDesktop);
    }, true /** callToInitialize */);
  }

  /**
   * Whether the bookend is displayed.
   * @return {boolean}
   * @private
   */
  isActive_() {
    return !!this.storeService_.get(StateProperty.BOOKEND_STATE);
  }

  /**
   * @param {!Event} event
   * @private
   */
  onReplayButtonClick_(event) {
    event.stopPropagation();
    dispatch(this.getRoot(), EventType.REPLAY, /* opt_bubbles */ true);
  }

  /**
   * Reacts to bookend state updates.
   * @param {boolean} isActive
   * @private
   */
  onBookendStateUpdate_(isActive) {
    this.toggle_(isActive);
  }

  /**
   * Reacts to updates to whether sharing UIs may be shown, and updates the UI
   * accordingly.
   * @param {boolean} canShowSharingUis
   * @private
   */
  onCanShowSharingUisUpdate_(canShowSharingUis) {
    this.vsync_.mutate(() => {
      this.getShadowRoot()
          .classList.toggle('i-amphtml-story-no-sharing', !canShowSharingUis);
    });
  }

  /**
   * Reacts to desktop state updates.
   * @param {boolean} isDesktop
   * @private
   */
  onDesktopStateUpdate_(isDesktop) {
    this.toggleDesktopAttribute_(isDesktop);
  }

  /**
   * Retrieves the publisher bookend configuration.
   * @return {!Promise<?./bookend-component.BookendDataDef>}
   */
  loadConfig() {
    if (this.config_) {
      return Promise.resolve(this.config_);
    }

    return this.requestService_.loadBookendConfig()
        .then(response => {
          if (!response) {
            return null;
          }
          if (response[BOOKEND_VERSION_KEY] === BOOKEND_VERSION_1) {
            this.config_ = /** @type {./bookend-component.BookendDataDef} */ ({
              [BOOKEND_VERSION_KEY]: BOOKEND_VERSION_1,
              'components': BookendComponent
                  .buildFromJson(response['components']),
              'share-providers': response['share-providers'],
            });
          } else {
            // TODO(#14667): Write doc regarding amp-story bookend v1.0.
            dev().warn(TAG, `Version ${BOOKEND_VERSION_0} of the amp-story` +
            `-bookend is deprecated. Use ${BOOKEND_VERSION_1} instead.`);
          }
          return this.config_;
        })
        .catch(e => {
          user().error(TAG, 'Error fetching bookend configuration', e.message);
          return null;
        });
  }

  /**
   * Retrieves the publisher bookend configuration. Applying the configuration
   * will prerender the bookend DOM, but there are cases where we need it before
   * the component is built. Eg: the desktop share button needs the providers.
   * @param {boolean=} renderBookend  Whether the bookend should be rendered.
   * When set to false it allows the config to be fetched before the component
   * is built, for cases like getting the share providers
   * on desktop.
   * @return {!Promise<?./bookend-component.BookendDataDef>}
   */
  loadConfigAndMaybeRenderBookend(renderBookend = true) {
    return this.loadConfig().then(config => {
      if (renderBookend && config) {
        this.renderBookend_(config);
      }
      return config;
    });
  }

  /**
   * Closes bookend if tapping outside usable area.
   * @param {!Event} event
   * @private
   */
  maybeClose_(event) {
    if (this.elementOutsideUsableArea_(dev().assertElement(event.target))) {
      event.stopPropagation();
      this.close_();
    }
  }

  /**
   * Closes the bookend.
   */
  close_() {
    this.storeService_.dispatch(Action.TOGGLE_BOOKEND, false);
  }

  /**
   * @param {!Element} el
   * @return {boolean}
   */
  elementOutsideUsableArea_(el) {
    return !closest(el, el => el == this.getInnerContainer_());
  }

  /**
   * Changes between card view and full-bleed based on scroll position.
   * @private
   */
  onScroll_() {
    if (!this.isActive_()) {
      return;
    }
    this.vsync_.run({
      measure: state => {
        state.shouldBeFullBleed =
            this.getOverflowContainer_()./*OK*/scrollTop >= FULLBLEED_THRESHOLD;
      },
      mutate: state => {
        this.getShadowRoot().classList.toggle(
            FULLBLEED_CLASSNAME, state.shouldBeFullBleed);
      },
    }, {});
  }

  /**
   * @param {boolean} show
   * @private
   */
  toggle_(show) {
    this.vsync_.mutate(() => {
      this.getShadowRoot().classList.toggle(HIDDEN_CLASSNAME, !show);
    });
  }

  /**
   * Toggles the bookend desktop UI.
   * @param {boolean} isDesktop
   * @private
   */
  toggleDesktopAttribute_(isDesktop) {
    this.vsync_.mutate(() => {
      isDesktop ?
        this.getShadowRoot().setAttribute('desktop', '') :
        this.getShadowRoot().removeAttribute('desktop');
    });
  }

  /**
   * @retun {boolean}
   */
  isBuilt() {
    return this.isBuilt_;
  }

  /** @private */
  assertBuilt_() {
    dev().assert(this.isBuilt(), 'Bookend component needs to be built.');
  }

  /**
   * @param {!./bookend-component.BookendDataDef} bookendConfig
   * @private
   */
  renderBookend_(bookendConfig) {
    if (this.isBookendRendered_) {
      return;
    }

    this.assertBuilt_();
    this.isBookendRendered_ = true;

    this.renderComponents_(bookendConfig.components);
  }

  /**
   * @param {!Array<!../bookend/bookend-component.BookendComponentDef>} components
   * @private
   */
  renderComponents_(components) {
    dev().assertElement(this.bookendEl_, 'Error rendering amp-story-bookend.');
    const fragment = BookendComponent
        .buildTemplates(components, this.win.document);
    const container = this.getInnerContainer_();
    this.resources_.mutateElement(container,
        () => container.appendChild(fragment));
  }

  /** @return {!Element} */
  getRoot() {
    this.assertBuilt_();
    return dev().assertElement(this.root_);
  }

  /** @return {!Element} */
  getShadowRoot() {
    this.assertBuilt_();
    return dev().assertElement(this.bookendEl_);
  }

  /**
   * Gets container for bookend content.
   * @return {!Element}
   * @private
   */
  getInnerContainer_() {
    return dev().assertElement(this.getOverflowContainer_().firstElementChild);
  }

  /**
   * Gets outer container that gets scrolled.
   * @return {!Element}
   * @private
   */
  getOverflowContainer_() {
    return dev().assertElement(this.getShadowRoot().firstElementChild);
  }

  /**
   * @return {{
   *   title: string,
   *   domainName: string,
   *   imageUrl: (string|undefined),
   * }}
   * @private
   */
  getStoryMetadata_() {
    const jsonLd = getJsonLd(this.getAmpDoc().getRootNode());

    const metadata = {
      title: jsonLd && jsonLd['headline'] ?
        jsonLd['headline'] :
        user().assertElement(
            this.win.document.head.querySelector('title'),
            'Please set <title> or structured data (JSON-LD).').textContent,

      domainName: parseUrl(
          Services.documentInfoForDoc(this.getAmpDoc()).canonicalUrl).hostname,
    };

    if (jsonLd && isArray(jsonLd['image']) && jsonLd['image'].length) {
      user().assert(isProtocolValid(jsonLd['image']),
          `Unsupported protocol for story image URL ${jsonLd['image']}`);
      metadata.imageUrl = jsonLd['image'][0];
    }

    return metadata;
  }

  /**
   * @return {!Element}
   * @private
   */
  buildReplayButton_() {
    const metadata = this.getStoryMetadata_();
    return renderAsElement(this.win.document, buildReplayButtonTemplate(
        this.win.document,
        metadata.title,
        metadata.domainName,
        metadata.imageUrl));
  }
}
