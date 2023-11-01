import {Deferred} from '#core/data-structures/promise';
import {insertAtStart, removeElement, tryFocus} from '#core/dom';
import {
  isAmpElement,
  whenUpgradedToCustomElement,
} from '#core/dom/amp-element-helpers';
import {elementByTag} from '#core/dom/query';
import {htmlFor} from '#core/dom/static-template';
import {setImportantStyles, setStyles, toggle} from '#core/dom/style';
import {isEsm} from '#core/mode';

import {Services} from '#service';

import {getData} from '#utils/event-helper';
import {dev, user} from '#utils/log';

import {expandConsentEndpointUrl} from './consent-config';
import {getConsentStateValue} from './consent-info';
import {getConsentStateManager} from './consent-state-manager';

import {assertHttpsUrl} from '../../../src/url';

const TAG = 'amp-consent-ui';
const MINIMUM_INITIAL_HEIGHT = 10;
const DEFAULT_INITIAL_HEIGHT = 30;
const MODAL_HEIGHT_ENABLED = 60;
const MAX_INITIAL_HEIGHT = 80;
const DEFAULT_ENABLE_BORDER = true;
const FULLSCREEN_SUCCESS = 'Entering fullscreen.';
const FULLSCREEN_ERROR =
  'Could not enter fullscreen. Fullscreen is only supported ' +
  'when the iframe is visible as a bottom sheet and after ' +
  'user interaction.';
const CONSENT_PROMPT_CAPTION = 'User Consent Prompt';
const BUTTON_ACTION_CAPTION = 'Focus Prompt';
const CANCEL_OVERLAY = 'cancelFullOverlay';
const REQUEST_OVERLAY = 'requestFullOverlay';
const ALLOWED_SANDBOX_ATTRIBUTES = [
  'allow-popups-to-escape-sandbox',
  'allow-top-navigation-by-user-activation',
];

const IFRAME_RUNNING_TIMEOUT = 1000;

export const actionState = {
  error: 'error',
  success: 'success',
};

export const ampConsentMessageType = {
  response: 'amp-consent-response',
};

// Classes for consent UI
export const consentUiClasses = {
  iframeFullscreen: 'i-amphtml-consent-ui-iframe-fullscreen',
  iframeActive: 'i-amphtml-consent-ui-iframe-active',
  modal: 'i-amphtml-consent-ui-modal',
  in: 'i-amphtml-consent-ui-in',
  loading: 'i-amphtml-consent-ui-loading',
  fill: 'i-amphtml-consent-ui-fill',
  placeholder: 'i-amphtml-consent-ui-placeholder',
  mask: 'i-amphtml-consent-ui-mask',
  borderEnabled: 'i-amphtml-consent-ui-border-enabled',
  screenReaderDialog: 'i-amphtml-consent-alertdialog',
  iframeTransform: 'i-amphtml-consent-ui-iframe-transform',
};

export class ConsentUI {
  /**
   * @param {!AMP.BaseElement} baseInstance
   * @param {!JsonObject} config
   * @param {string=} opt_postPromptUI
   */
  constructor(baseInstance, config, opt_postPromptUI) {
    /** @private {!AMP.BaseElement} */
    this.baseInstance_ = baseInstance;

    /** @private {boolean} */
    this.isCreatedIframe_ = false;

    /** @private {boolean} */
    this.isPostPrompt_ = false;

    /** @private {boolean} */
    this.isVisible_ = false;

    /** @private {boolean} */
    this.isIframeVisible_ = false;

    /** @private {boolean} */
    this.isFullscreen_ = false;

    /** @private {?Element} */
    this.ui_ = null;

    /** @private {boolean} */
    this.overlayEnabled_ =
      config['uiConfig'] && config['uiConfig']['overlay'] === true;

    /** @private {string} */
    this.consentPromptCaption_ =
      (config['captions'] && config['captions']['consentPromptCaption']) ||
      CONSENT_PROMPT_CAPTION;

    /** @private {string} */
    this.buttonActionCaption_ =
      (config['captions'] && config['captions']['buttonActionCaption']) ||
      BUTTON_ACTION_CAPTION;

    /** @private {boolean} */
    this.srAlertShown_ = false;

    /** @private {boolean} */
    this.scrollEnabled_ = true;

    /** @private {?Element} */
    this.maskElement_ = null;

    /** @private {?Element} */
    this.srAlert_ = null;

    /** @private {?Element} */
    this.elementWithFocusBeforeShowing_ = null;

    /** @private {!../../../src/service/ampdoc-impl.AmpDoc} */
    this.ampdoc_ = baseInstance.getAmpDoc();

    /** @private {!../../../src/service/viewport/viewport-interface.ViewportInterface} */
    this.viewport_ = Services.viewportForDoc(this.ampdoc_);

    /** @private {?../../../src/service/viewer-interface.ViewerInterface} */
    this.viewer_ = Services.viewerForDoc(this.ampdoc_);

    /** @private {!Element} */
    this.parent_ = baseInstance.element;

    /** @private {!Window} */
    this.win_ = baseInstance.win;

    /** @private @const {!Document} */
    this.document_ = this.win_.document;

    /** @private {?Deferred} */
    this.iframeReady_ = null;

    /** @private {boolean} */
    this.removeIframe_ = false;

    /** @private {?JsonObject} */
    this.clientConfig_ = null;

    /** @private {?Element} */
    this.placeholder_ = null;

    /** @private {string} */
    this.initialHeight_ = `${DEFAULT_INITIAL_HEIGHT}vh`;

    /** @private {boolean} */
    this.borderEnabled_ = DEFAULT_ENABLE_BORDER;

    /** @private {boolean} */
    this.modalEnabled_ = false;

    /** @private {boolean} */
    this.isActionPromptTrigger_ = false;

    /** @private @const {!Function} */
    this.boundHandleIframeMessages_ = this.handleIframeMessages_.bind(this);

    /** @private @const {!JsonObject} */
    this.config_ = config;

    this.init_(config, opt_postPromptUI);
  }

  /**
   * @param {!JsonObject} config
   * @param {string=} opt_postPromptUI
   */
  init_(config, opt_postPromptUI) {
    if (opt_postPromptUI) {
      const postPromptUI = this.ampdoc_.getElementById(opt_postPromptUI);
      if (!postPromptUI) {
        user().error(
          TAG,
          'postPromptUI element with id=%s not found',
          opt_postPromptUI
        );
      }
      this.ui_ = dev().assertElement(postPromptUI);
      this.isPostPrompt_ = true;
      return;
    }
    const promptUI = config['promptUI'];
    const promptUISrc = config['promptUISrc'];
    if (promptUI) {
      // Always respect promptUI first
      const promptElement = this.ampdoc_.getElementById(promptUI);
      if (!promptElement || !this.parent_.contains(promptElement)) {
        user().error(
          TAG,
          'child element of <amp-consent> with promptUI id %s not found',
          promptUI
        );
      }
      // Warn of use of <amp-iframe> within a promptUI element.
      if (!isEsm() && promptElement.querySelector('amp-iframe')) {
        user().error(
          TAG,
          '`promptUI` element contains an <amp-iframe>. This may cause content flashing when consent is not required. Consider using `promptUISrc` instead. See https://go.amp.dev/c/amp-analytics'
        );
      }
      this.ui_ = dev().assertElement(promptElement);
    } else if (promptUISrc) {
      // Create an iframe element with the provided src
      this.isCreatedIframe_ = true;
      assertHttpsUrl(promptUISrc, this.parent_);
      // TODO: Preconnect to the promptUISrc?

      this.ui_ = this.createPromptIframe_(promptUISrc);
      this.placeholder_ = this.createPlaceholder_();
      this.clientConfig_ = config['clientConfig'] || null;
    }
  }

  /**
   * Display the UI.
   * @param {boolean} isActionPromptTrigger
   */
  show(isActionPromptTrigger) {
    if (!this.ui_) {
      // No prompt UI specified, nothing to do
      return;
    }
    if (this.isPostPrompt_ && !this.parent_.contains(this.ui_)) {
      toggle(this.ui_, true);
      return;
    }
    toggle(dev().assertElement(this.parent_), true);
    const {classList} = this.parent_;
    classList.add('amp-active');
    classList.remove('amp-hidden');

    this.baseInstance_
      .getViewport()
      .addToFixedLayer(this.parent_, /* forceTransfer */ true);

    if (this.isCreatedIframe_) {
      // show() can be called multiple times, but notificationsUiManager
      // ensures that only 1 is shown at a time, so no race condition here
      this.isActionPromptTrigger_ = isActionPromptTrigger;
      this.loadIframe_().then(() => {
        // It is safe to assume that the loadIframe_ promise will resolve
        // before resetIframe_. Because the iframe needs to be shown first
        // being hidden. CMP iframe is responsible to call consent-iframe-ready
        // API before consent-response API.
        this.baseInstance_.mutateElement(() => {
          if (!this.isPostPrompt_) {
            this.elementWithFocusBeforeShowing_ = this.document_.activeElement;
          }

          this.maybeShowOverlay_();

          // Create and append SR alert for the when iframe
          // initially loads.
          this.maybeShowSrAlert_();

          this.showIframe_();
        });
      });
    } else {
      const show = () => {
        if (!this.ui_) {
          return;
        }

        toggle(this.ui_, true);

        if (!this.isPostPrompt_) {
          this.elementWithFocusBeforeShowing_ = this.document_.activeElement;

          this.maybeShowOverlay_();
          this.resume();
          this.ui_./*OK*/ focus();
        }
      };

      // If the UI is an AMP Element, wait until it's built before showing it,
      // to avoid race conditions where the UI would be hidden by the runtime
      // at build time. (see #18841).
      if (isAmpElement(this.ui_)) {
        whenUpgradedToCustomElement(this.ui_)
          .then(() => this.ui_.build())
          .then(() => show());
      } else {
        show();
      }
    }

    this.isVisible_ = true;
  }

  /**
   * Hide the UI
   */
  hide() {
    if (!this.ui_) {
      // Nothing to hide from;
      return;
    }

    this.pause();

    this.baseInstance_.mutateElement(() => {
      if (this.isCreatedIframe_) {
        this.resetIframe_();
      }

      if (!this.isPostPrompt_) {
        const {classList} = this.parent_;
        classList.remove('amp-active');
        classList.add('amp-hidden');
      }

      // Hide the overlay
      this.maybeHideOverlay_();
      // Remove the SR alert from DOM
      this.maybeRemoveSrAlert_();
      // Enable the scroll, in case we were fullscreen with no overlay
      this.enableScroll_();
      // Reset any animation styles set by style attribute
      this.resetAnimationStyles_();

      // NOTE (torch2424): This is very sensitive. Fixed layer applies
      // a `top: calc(0px)` in order to fix some bugs, thus
      // We should be careful in moving this around as
      // `removeFromFixedLayer` will remove the `top` styling.
      // This will preserve The animation,
      // and prevent element flashing.
      this.baseInstance_.getViewport().removeFromFixedLayer(this.parent_);
      toggle(dev().assertElement(this.ui_), false);
      this.isVisible_ = false;

      if (this.elementWithFocusBeforeShowing_) {
        this.elementWithFocusBeforeShowing_./*OK*/ focus();
        this.elementWithFocusBeforeShowing_ = null;
      } else if (this.win_.document.body.children.length > 0) {
        // TODO (torch2424): Find if the first child can not be
        // focusable due to styling.
        this.win_.document.body.children[0]./*OK*/ focus();
      }
    });
  }

  /** */
  pause() {
    if (this.ui_) {
      Services.ownersForDoc(this.baseInstance_.element).schedulePause(
        this.baseInstance_.element,
        this.ui_
      );
    }
  }

  /** */
  resume() {
    if (this.ui_) {
      // scheduleLayout is required everytime because some AMP element may
      // get un laid out after toggle display (#unlayoutOnPause)
      // for example <amp-iframe>
      Services.ownersForDoc(this.baseInstance_.element).scheduleLayout(
        this.baseInstance_.element,
        this.ui_
      );
      Services.ownersForDoc(this.baseInstance_.element).scheduleResume(
        this.baseInstance_.element,
        this.ui_
      );
    }
  }

  /**
   * Handle the ready event from the CMP iframe
   * @param {!JsonObject} data
   */
  handleReady_(data) {
    this.initialHeight_ = `${DEFAULT_INITIAL_HEIGHT}vh`;
    this.borderEnabled_ = DEFAULT_ENABLE_BORDER;
    this.modalEnabled_ = false;

    // Set our initial height
    if (data['initialHeight']) {
      if (
        typeof data['initialHeight'] === 'string' &&
        data['initialHeight'].indexOf('vh') >= 0
      ) {
        const dataHeight = parseInt(data['initialHeight'], 10);
        // Set initialHeight to max height fallback if applicable
        this.initialHeight_ =
          dataHeight >= MAX_INITIAL_HEIGHT
            ? `${MAX_INITIAL_HEIGHT}vh`
            : this.initialHeight_;

        if (
          dataHeight >= MINIMUM_INITIAL_HEIGHT &&
          dataHeight <= MAX_INITIAL_HEIGHT
        ) {
          this.initialHeight_ = `${dataHeight}vh`;
          this.modalEnabled_ = dataHeight > MODAL_HEIGHT_ENABLED;
          // Force overlay if modal is enabled.
          this.overlayEnabled_ = this.modalEnabled_ || this.overlayEnabled_;
        } else {
          user().error(
            TAG,
            `Inavlid initial height: ${data['initialHeight']}.` +
              `Minimum: ${MINIMUM_INITIAL_HEIGHT}vh. Maximum: ${MAX_INITIAL_HEIGHT}vh.`
          );
        }
      } else {
        user().error(
          TAG,
          `Inavlid initial height: ${data['initialHeight']}.` +
            'Must be a string in "vh" units.'
        );
      }
    }

    // Disable our border, if set to false and not modal view.
    if (data['border'] === false && !this.modalEnabled_) {
      this.borderEnabled_ = false;
    }

    this.iframeReady_.resolve();
  }

  /**
   * Enter the fullscreen state for the UI
   */
  enterFullscreen_() {
    if (!this.ui_ || !this.isVisible_ || this.isFullscreen_) {
      return;
    }

    this.resetAnimationStyles_();

    this.sendViewerEvent_(REQUEST_OVERLAY);

    const {classList} = this.parent_;
    classList.add(consentUiClasses.iframeFullscreen);

    this.disableScroll_();

    this.isFullscreen_ = true;
  }

  /**
   * Send viewer an event.
   * @param {string} event
   */
  sendViewerEvent_(event) {
    this.viewer_.sendMessage(event, {}, /* cancelUnsent */ true);
  }

  /**
   * Create the iframe if promptUISrc is valid
   * @param {string} promptUISrc
   * @return {!Element}
   */
  createPromptIframe_(promptUISrc) {
    const iframe = this.parent_.ownerDocument.createElement('iframe');
    const sandbox = this.getSandboxAttribute_(promptUISrc);
    iframe.setAttribute('sandbox', sandbox);
    const {classList} = iframe;
    classList.add(consentUiClasses.fill);
    // Append iframe lazily to save resources.
    return iframe;
  }

  /**
   * Determines the sandbox attribute for the prompt iframe
   * @param {string} src
   * @return {string}
   */
  getSandboxAttribute_(src) {
    const sandbox = ['allow-scripts', 'allow-popups'];
    const allowSameOrigin = this.allowSameOrigin_(src);
    if (allowSameOrigin) {
      sandbox.push('allow-same-origin');
    }

    const additional = this.getAdditionalSandboxAttributes_();
    Array.prototype.push.apply(sandbox, additional);

    return sandbox.join(' ');
  }

  /**
   * Determines if allow-same-origin should be enabled for the prompt iframe
   * @param {string} src
   * @return {boolean}
   */
  allowSameOrigin_(src) {
    const urlService = Services.urlForDoc(this.parent_);
    const srcUrl = urlService.parse(src);
    const containerUrl = urlService.parse(this.ampdoc_.getUrl());
    return srcUrl.origin != containerUrl.origin;
  }

  /**
   * Retrieve additional sandbox restrictions to be removed from the iframe.
   * @return {Array<string>}
   */
  getAdditionalSandboxAttributes_() {
    return (this.config_['sandbox'] || '')
      .split(' ')
      .filter(Boolean)
      .filter((attribute) => {
        const isAllowed = ALLOWED_SANDBOX_ATTRIBUTES.indexOf(attribute) !== -1;
        if (!isAllowed) {
          user().error(
            TAG,
            `The sandbox attribute "${attribute}" is not allowed`
          );
        }
        return isAllowed;
      });
  }

  /**
   * Create the default placeholder
   * @return {!Element}
   */
  createPlaceholder_() {
    const placeholder = this.parent_.ownerDocument.createElement('placeholder');
    toggle(placeholder, false);
    placeholder.classList.add(consentUiClasses.placeholder);

    const loadingSpinner = htmlFor(placeholder)`
      <svg viewBox="0 0 40 40">
        <defs>
          <linearGradient id="grad">
            <stop stop-color="rgb(105, 105, 105)"></stop>
            <stop offset="100%"
            stop-color="rgb(105, 105, 105)"
            stop-opacity="0"></stop>
          </linearGradient>
        </defs>
        <path d="M11,4.4 A18,18, 0,1,0, 38,20" stroke="url(#grad)"></path>
      </svg>`;

    placeholder.appendChild(loadingSpinner);
    return placeholder;
  }

  /**
   * Get the client information that needs to be passed to cmp iframe
   * @return {!Promise<JsonObject>}
   */
  getClientInfoPromise_() {
    const consentStateManagerPromise = getConsentStateManager(this.ampdoc_);
    return consentStateManagerPromise.then((consentStateManager) => {
      return consentStateManager
        .getLastConsentInstanceInfo()
        .then((consentInfo) => {
          return {
            'clientConfig': this.clientConfig_,
            // consentState to be deprecated
            'consentState': getConsentStateValue(consentInfo['consentState']),
            'consentStateValue': getConsentStateValue(
              consentInfo['consentState']
            ),
            'tcfPolicyVersion': consentInfo['tcfPolicyVersion'],
            'consentMetadata': consentInfo['consentMetadata'],
            'consentString': consentInfo['consentString'],
            'promptTrigger': this.isActionPromptTrigger_ ? 'action' : 'load',
            'isDirty': !!consentInfo['isDirty'],
            'purposeConsents': consentInfo['purposeConsents'],
          };
        });
    });
  }

  /**
   * Apply placeholder
   * Set up event listener to handle UI related messages.
   * @return {!Promise}
   */
  loadIframe_() {
    this.iframeReady_ = new Deferred();
    const {classList} = this.parent_;
    if (!elementByTag(this.parent_, 'placeholder')) {
      insertAtStart(this.parent_, dev().assertElement(this.placeholder_));
    }
    classList.add(consentUiClasses.loading);
    toggle(dev().assertElement(this.ui_), false);

    this.removeIframe_ = false;
    const iframePromise = this.getClientInfoPromise_().then((clientInfo) => {
      return expandConsentEndpointUrl(
        this.parent_,
        this.config_['promptUISrc'],
        {
          'CONSENT_INFO': (property) => JSON.stringify(clientInfo[property]),
        }
      ).then((expandedSrc) => {
        this.ui_.src = expandedSrc;
        this.ui_.setAttribute('name', JSON.stringify(clientInfo));
        this.win_.addEventListener('message', this.boundHandleIframeMessages_);
        insertAtStart(this.parent_, dev().assertElement(this.ui_));
      });
    });

    return Promise.all([
      iframePromise,
      this.iframeReady_.promise,
      this.baseInstance_.mutateElement(() => {
        toggle(dev().assertElement(this.placeholder_), true);
      }),
    ]);
  }

  /**
   * Hide the placeholder
   * Apply animation to show the iframe
   */
  showIframe_() {
    const {classList} = this.parent_;
    classList.add(consentUiClasses.iframeActive);
    toggle(dev().assertElement(this.placeholder_), false);
    toggle(dev().assertElement(this.ui_), true);
    if (this.modalEnabled_) {
      classList.add(consentUiClasses.modal);
      tryFocus(dev().assertElement(this.ui_));
    }

    // Remove transition styles added by the fixed layer
    // Transform styles applied by us for the animation.
    this.resetAnimationStyles_();

    /**
     * Waiting for mutation twice here.
     * First mutation is for when the correct elements,
     * are shown/hidden, and the iframe active class
     * pushes it out of view.
     * Second, is for the loading class to be removed.
     * This will avoid race conditions with the slidein transition.
     */
    this.baseInstance_.mutateElement(() => {
      classList.remove(consentUiClasses.loading);
      this.baseInstance_.mutateElement(() => {
        classList.add(consentUiClasses.in);
        this.isIframeVisible_ = true;
        this.applyInitialStyles_();
      });
    });
  }

  /**
   * Remove the iframe from doc
   * Remove event listener
   * Reset UI state
   * Takes in a function to call after our transition has ended
   */
  resetIframe_() {
    const {classList} = this.parent_;
    // It is ok to remove classes even when they're not present
    classList.remove(consentUiClasses.iframeActive);
    classList.remove(consentUiClasses.modal);
    classList.remove(consentUiClasses.borderEnabled);

    this.win_.removeEventListener('message', this.boundHandleIframeMessages_);
    classList.remove(consentUiClasses.iframeFullscreen);
    // TODO(micajuineho) consolidate code to user viewport
    if (this.isFullscreen_) {
      this.sendViewerEvent_(CANCEL_OVERLAY);
    } else if (this.modalEnabled_) {
      this.viewport_.leaveLightboxMode();
    }
    this.isFullscreen_ = false;
    classList.remove(consentUiClasses.in);
    this.isIframeVisible_ = false;
    this.ui_.removeAttribute('name');
    toggle(dev().assertElement(this.placeholder_), false);
    this.removeIframe_ = true;
    this.win_.setTimeout(() => {
      if (this.removeIframe_) {
        removeElement(dev().assertElement(this.ui_));
      }
    }, IFRAME_RUNNING_TIMEOUT);
  }

  /**
   * If this is the first time viewing the iframe, create
   * an 'invisible' alert dialog with a title and a button.
   * Clicking on the button will transfer focus to the iframe.
   *
   * This only applies for bottom pane iframes.
   */
  maybeShowSrAlert_() {
    // If the SR alert has been shown, don't show it again
    if (this.srAlertShown_ || this.modalEnabled_) {
      return;
    }

    const alertDialog = this.document_.createElement('div');
    const button = this.document_.createElement('button');
    const titleDiv = this.document_.createElement('div');

    alertDialog.setAttribute('role', 'alertdialog');

    titleDiv.textContent = this.consentPromptCaption_;
    button.textContent = this.buttonActionCaption_;
    button.onclick = () => {
      tryFocus(dev().assertElement(this.ui_));
    };

    alertDialog.appendChild(titleDiv);
    alertDialog.appendChild(button);

    // Style to be visiblly hidden, but not hidden from the SR
    const {classList} = alertDialog;
    classList.add(consentUiClasses.screenReaderDialog);

    this.baseInstance_.element.appendChild(alertDialog);
    tryFocus(button);

    // SR alert was shown when consent prompt loaded for
    // the first time. Don't show it again
    this.srAlertShown_ = true;

    // Keep reference of the SR alert to remove later
    this.srAlert_ = alertDialog;
  }

  /**
   * Remove the SR alert from the DOM once it has been shown once
   */
  maybeRemoveSrAlert_() {
    if (this.srAlert_) {
      removeElement(this.srAlert_);
      delete this.srAlert_;
    }
  }

  /**
   * Reset transition and transform styles
   * Set by the fixed layer, and us
   */
  resetAnimationStyles_() {
    setStyles(this.parent_, {
      transform: '',
      transition: '',
    });
  }

  /**
   * Apply styles for ready event
   */
  applyInitialStyles_() {
    const {classList} = this.parent_;
    // Apply our initial height and border
    if (this.ui_) {
      setStyles(this.ui_, {
        height: this.initialHeight_,
      });
    }
    setImportantStyles(this.parent_, {
      '--i-amphtml-modal-height': `${this.initialHeight_}`,
    });
    classList.add(consentUiClasses.iframeTransform);
    // Border is default with modal enabled and option with non-modal
    if (this.borderEnabled_ || this.modalEnabled_) {
      classList.add(consentUiClasses.borderEnabled);
    }
    if (this.modalEnabled_) {
      this.viewport_.enterLightboxMode();
    }
  }

  /**
   * Shows the overlay (mask element, and lock scrolling)
   * if the overlay is enabled
   * @private
   */
  maybeShowOverlay_() {
    if (!this.overlayEnabled_) {
      return;
    }

    if (!this.maskElement_) {
      const mask = this.win_.document.createElement('div');
      mask.classList.add(consentUiClasses.mask);
      this.parent_.ownerDocument.body.appendChild(mask);
      this.maskElement_ = mask;
    }
    toggle(this.maskElement_, /* display */ true);
    this.disableScroll_();
  }

  /**
   * Hides the overlay (mask element, and lock scrolling)
   * if the overlay is enabled
   * @private
   */
  maybeHideOverlay_() {
    if (!this.overlayEnabled_) {
      return;
    }

    if (this.maskElement_) {
      toggle(this.maskElement_, /* display */ false);
    }
    this.enableScroll_();
  }

  /**
   * Disables scrolling on the document
   * @private
   */
  disableScroll_() {
    if (this.scrollEnabled_) {
      this.viewport_.enterOverlayMode();
      this.scrollEnabled_ = false;
    }
  }

  /**
   * Disables scrolling on the document
   * @private
   */
  enableScroll_() {
    if (!this.scrollEnabled_) {
      this.viewport_.leaveOverlayMode();
      this.scrollEnabled_ = true;
    }
  }

  /**
   * Listen to iframe messages and handle events.
   * Current supported APIs:
   *
   * Required message from iframe to hide placeholder and display iframe
   * {
   *   type: 'consent-ui',
   *   action: 'ready',
   *   initialHeight: '30vh',
   *   border: true
   * }
   *
   * Enter Fullscreen
   * {
   *   type: 'consent-ui',
   *   action: 'enter-fullscreen'
   * }
   *
   * @param {!Event} event
   */
  handleIframeMessages_(event) {
    if (this.ui_.contentWindow !== event.source) {
      // Ignore messages from else where
      return;
    }

    const data = getData(event);
    if (!data || data['type'] != 'consent-ui') {
      return;
    }

    const requestAction = data['action'];
    const requestType = data['type'];

    if (requestAction === 'ready') {
      this.handleReady_(/** @type {!JsonObject} */ (data));
    }

    if (requestAction === 'enter-fullscreen') {
      // Do nothing iff:
      // - iframe not visible or
      // - iframe not active element && not called via actionPromptTrigger
      // - iframe is not modalEnabled
      if (
        !this.isIframeVisible_ ||
        this.modalEnabled_ ||
        (this.document_.activeElement !== this.ui_ &&
          !this.isActionPromptTrigger_)
      ) {
        user().warn(TAG, FULLSCREEN_ERROR);
        this.sendEnterFullscreenResponse_(requestType, requestAction, true);
        return;
      }
      this.sendEnterFullscreenResponse_(requestType, requestAction);

      this.baseInstance_.mutateElement(() => {
        this.enterFullscreen_();
      });
    }
  }

  /**
   * @param {string} requestType
   * @param {string} requestAction
   * @param {boolean} isError
   * */
  sendEnterFullscreenResponse_(requestType, requestAction, isError = false) {
    this.sendIframeMessage_(
      ampConsentMessageType.response,
      requestType,
      requestAction,
      isError ? actionState.error : actionState.success,
      isError ? FULLSCREEN_ERROR : FULLSCREEN_SUCCESS
    );
  }

  /**
   * Send message to iframe, regarding action response or other info.
   * Silently die if iframe does not have content window.
   *
   * Example message:
   * {
   *  type: 'amp-consent-response'
   *  requestType:'consent-ui'
   *  requestAction: 'enter-fullscreen'
   *  state: 'error/success'
   *  info: 'msg'
   * }
   * @param {string} type
   * @param {string} requestType
   * @param {string} requestAction
   * @param {string} state
   * @param {string} info
   */
  sendIframeMessage_(type, requestType, requestAction, state, info) {
    const iframeWindow = this.ui_.contentWindow;
    if (iframeWindow) {
      // No sensitive information sent, so safe to use '*'
      iframeWindow./*OK*/ postMessage(
        /** @type {!JsonObject} */ ({
          type,
          requestType,
          requestAction,
          state,
          info,
        }),
        '*'
      );
    }
  }
}
