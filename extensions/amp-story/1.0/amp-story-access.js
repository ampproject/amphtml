import * as Preact from '#core/dom/jsx';
import {
  Action,
  StateProperty,
  getStoreService,
} from './amp-story-store-service';
import {Layout_Enum} from '#core/dom/layout';
import {closest} from '#core/dom/query';
import {copyChildren, removeChildren} from '#core/dom';
import {devAssert, user} from '#utils/log';
import {getStoryAttributeSrc} from './utils';
import {isArray, isObject} from '#core/types';
import {parseJson} from '#core/types/object/json';

/** @const {string} */
const TAG = 'amp-story-access';

/**
 * @enum {string}
 */
export const Type_Enum = {
  BLOCKING: 'blocking',
  NOTIFICATION: 'notification',
};

/**
 * @param {?Element=} header
 * @param {?Element=} closeButton
 * @return {!Element}
 */
const renderDrawerElement = (header, closeButton) => {
  return (
    <div class="i-amphtml-story-access-overflow">
      <div class="i-amphtml-story-access-container">
        {header}
        <div class="i-amphtml-story-access-content">{closeButton}</div>
      </div>
    </div>
  );
};

/**
 * The <amp-story-access> custom element.
 */
export class AmpStoryAccess extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?Element} */
    this.containerEl_ = null;

    /** @private @const {!./amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = getStoreService(this.win);
  }

  /** @override */
  buildCallback() {
    // Defaults to blocking paywall.
    if (!this.element.hasAttribute('type')) {
      this.element.setAttribute('type', Type_Enum.BLOCKING);
    }

    const drawerEl = this.renderDrawerEl_();

    this.containerEl_ = devAssert(
      drawerEl.querySelector('.i-amphtml-story-access-container')
    );
    const contentEl = devAssert(
      drawerEl.querySelector('.i-amphtml-story-access-content')
    );

    copyChildren(this.element, contentEl);
    removeChildren(this.element);

    this.element.appendChild(drawerEl);

    this.allowlistActions_();

    this.initializeListeners_();
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout_Enum.CONTAINER;
  }

  /**
   * @private
   */
  initializeListeners_() {
    this.storeService_.subscribe(StateProperty.ACCESS_STATE, (isAccess) => {
      this.onAccessStateChange_(isAccess);
    });

    this.storeService_.subscribe(
      StateProperty.CURRENT_PAGE_INDEX,
      (currentPageIndex) => {
        this.onCurrentPageIndexChange_(currentPageIndex);
      },
      true /** callToInitialize */
    );

    this.element.addEventListener('click', (event) => this.onClick_(event));
  }

  /**
   * Reacts to access state updates, and shows/hides the UI accordingly.
   * @param {boolean} isAccess
   * @private
   */
  onAccessStateChange_(isAccess) {
    if (this.getType_() === Type_Enum.BLOCKING) {
      this.toggle_(isAccess);
    }
  }

  /**
   * Reacts to story active page index update, and maybe display the
   * "notification" story-access.
   * @param {number} currentPageIndex
   */
  onCurrentPageIndexChange_(currentPageIndex) {
    if (this.getType_() === Type_Enum.NOTIFICATION) {
      // Only show the notification if on the first page of the story.
      // Note: this can be overriden by an amp-access attribute that might
      // show/hide the notification based on the user's authorizations.
      this.toggle_(currentPageIndex === 0);
    }
  }

  /**
   * Handles click events and maybe closes the paywall.
   * @param {!Event} event
   * @return {*} TODO(#23582): Specify return type
   * @private
   */
  onClick_(event) {
    const el = devAssert(event.target);

    if (el.classList.contains('i-amphtml-story-access-close-button')) {
      return this.toggle_(false);
    }

    // Closes the menu if click happened outside of the main container.
    if (!closest(el, (el) => el === this.containerEl_, this.element)) {
      this.storeService_.dispatch(Action.TOGGLE_ACCESS, false);
    }
  }

  /**
   * @param {boolean} show
   * @private
   */
  toggle_(show) {
    this.mutateElement(() => {
      this.element.classList.toggle('i-amphtml-story-access-visible', show);
    });
  }

  /**
   * Returns the element's type.
   * @return {string}
   * @private
   */
  getType_() {
    return this.element.getAttribute('type').toLowerCase();
  }

  /**
   * Renders and returns an empty drawer element element that will contain the
   * publisher provided DOM, depending on the type of <amp-story-access>.
   * Blocking template gets a header containing the publisher's logo, and
   * notification template gets a "dismiss" button.
   * @return {!Element|undefined}
   * @private
   */
  renderDrawerEl_() {
    switch (this.getType_()) {
      case Type_Enum.BLOCKING:
        const logoSrc = getStoryAttributeSrc(
          this.element,
          'publisher-logo-src',
          /* warn */ true
        );
        const header = (
          <div class="i-amphtml-story-access-header">
            <div
              class="i-amphtml-story-access-logo"
              style={
                logoSrc ? `background-image: url(${logoSrc}) !important;` : null
              }
            ></div>
          </div>
        );
        return renderDrawerElement(header);
      case Type_Enum.NOTIFICATION:
        const closeButton = (
          <span class="i-amphtml-story-access-close-button" role="button">
            &times;
          </span>
        );
        return renderDrawerElement(null, closeButton);
      default:
        user().error(
          TAG,
          'Unknown "type" attribute, expected one of: ' +
            'blocking, notification.'
        );
    }
  }

  /**
   * Allowlists the <amp-access> actions.
   * Depending on the publisher configuration, actions can be:
   *   - login
   *   - login-<namespace>
   *   - login-<namespace>-<type>
   *
   * Publishers can provide one (object) or multiple (array) configurations,
   * identified by their "namespace" property.
   * Each configuration can have one or multiple login URLs, called "type".
   * All the namespace/type pairs have to be allowlisted.
   * @private
   */
  allowlistActions_() {
    const accessEl = devAssert(
      this.win.document.getElementById('amp-access'),
      'Cannot find the amp-access configuration'
    );

    // Configuration validation is handled by the amp-access extension.
    let accessConfig = /** @type {!Array|!Object} */ (
      parseJson(accessEl.textContent)
    );

    if (!isArray(accessConfig)) {
      accessConfig = [accessConfig];

      // If there is only one configuration and the publisher provided a
      // namespace, we want to allow actions with or without namespace.
      if (accessConfig[0].namespace) {
        accessConfig.push({...accessConfig[0], namespace: undefined});
      }
    }

    const actions = [];

    /** @type {!Array} */ (accessConfig).forEach((config) => {
      const {login, namespace} = /** @type {{login, namespace}} */ (config);

      if (isObject(login)) {
        const types = Object.keys(login);
        types.forEach((type) =>
          actions.push(this.getActionObject_(namespace, type))
        );
      } else {
        actions.push(this.getActionObject_(namespace));
      }
    });

    this.storeService_.dispatch(Action.ADD_TO_ACTIONS_ALLOWLIST, actions);
  }

  /**
   * Allowlists an action for the given namespace / type pair.
   * @param {string=} namespace
   * @param {string=} type
   * @return {*} TODO(#23582): Specify return type
   * @private
   */
  getActionObject_(namespace = undefined, type = undefined) {
    const method = ['login', namespace, type].filter(Boolean).join('-');
    return {tagOrTarget: 'SCRIPT', method};
  }
}
