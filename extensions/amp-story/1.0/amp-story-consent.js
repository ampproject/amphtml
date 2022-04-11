import objstr from 'obj-str';

import {ActionTrust_Enum} from '#core/constants/action-constants';
import {isJsonScriptTag} from '#core/dom';
import * as Preact from '#core/dom/jsx';
import {Layout_Enum} from '#core/dom/layout';
import {
  childElementByTag,
  closest,
  closestAncestorElementBySelector,
  matches,
} from '#core/dom/query';
import {computedStyle, setImportantStyles} from '#core/dom/style';
import {isArray} from '#core/types';
import {parseJson} from '#core/types/object/json';

import {Services} from '#service';
import {LocalizedStringId_Enum} from '#service/localization/strings';

import {dev, user, userAssert} from '#utils/log';

import {localizeTemplate} from './amp-story-localization-service';
import {
  Action,
  StateProperty,
  getStoreService,
} from './amp-story-store-service';
import {
  createShadowRootWithStyle,
  getRGBFromCssColorValue,
  getStoryAttributeSrc,
  getTextColorForRGB,
  triggerClickFromLightDom,
} from './utils';

import {CSS} from '../../../build/amp-story-consent-1.0.css';

/** @const {string} */
const TAG = 'amp-story-consent';

/**
 * Default optional config parameters.
 * @const {!Object}
 */
const DEFAULT_OPTIONAL_PARAMETERS = {
  externalLink: {},
  onlyAccept: false,
};

/**
 * Story consent template.
 * @param {!Object} config
 * @param {string} consentId
 * @param {?string} logoSrc
 * @return {!Element}
 * @private @const
 */
const renderElement = (config, consentId, logoSrc) => (
  <div class="i-amphtml-story-consent i-amphtml-story-system-reset">
    <div class="i-amphtml-story-consent-overflow">
      <div class="i-amphtml-story-consent-container">
        <div class="i-amphtml-story-consent-header">
          <div
            class="i-amphtml-story-consent-logo"
            style={logoSrc && {backgroundImage: `url('${logoSrc}') !important`}}
          />
        </div>
        <div class="i-amphtml-story-consent-content">
          <h3>{config.title}</h3>
          <p>{config.message}</p>
          <ul class="i-amphtml-story-consent-vendors">
            {config.vendors?.map((vendor) => (
              <li class="i-amphtml-story-consent-vendor">{vendor}</li>
            ))}
          </ul>
          <a
            class={objstr({
              'i-amphtml-story-consent-external-link': true,
              'i-amphtml-hidden': !(
                config.externalLink.title && config.externalLink.href
              ),
            })}
            href={config.externalLink.href}
            target="_top"
            title={config.externalLink.title}
          >
            {config.externalLink.title}
          </a>
        </div>
      </div>
      <div class="i-amphtml-story-consent-actions">
        <button
          class={objstr({
            'i-amphtml-story-consent-action': true,
            'i-amphtml-story-consent-action-reject': true,
            'i-amphtml-hidden': config.onlyAccept === true,
          })}
          on={`tap:${consentId}.reject`}
          i-amphtml-i18n-text-content={
            LocalizedStringId_Enum.AMP_STORY_CONSENT_DECLINE_BUTTON_LABEL
          }
        ></button>
        <button
          class={objstr({
            'i-amphtml-story-consent-action': true,
            'i-amphtml-story-consent-action-accept': true,
          })}
          on={`tap:${consentId}.accept`}
          i-amphtml-i18n-text-content={
            LocalizedStringId_Enum.AMP_STORY_CONSENT_ACCEPT_BUTTON_LABEL
          }
        ></button>
      </div>
    </div>
  </div>
);

/**
 * The <amp-story-consent> custom element.
 */
export class AmpStoryConsent extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?../../../src/service/action-impl.ActionService} */
    this.actions_ = null;

    /** @private {?Object} */
    this.consentConfig_ = null;

    /** @private @const {!./amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = getStoreService(this.win);

    /** @private {?Object} */
    this.storyConsentConfig_ = null;

    /** @private {?Element} */
    this.storyConsentEl_ = null;
  }

  /** @override */
  buildCallback() {
    this.actions_ = Services.actionServiceForDoc(this.element);

    this.assertAndParseConfig_();

    const consentEl = closestAncestorElementBySelector(
      this.element,
      'AMP-CONSENT'
    );
    const consentId = consentEl.id;

    this.storeConsentId_(consentId);

    const logoSrc = getStoryAttributeSrc(
      this.element,
      'publisher-logo-src',
      /* warn */ true
    );

    // Story consent config is set by the `assertAndParseConfig_` method.
    if (this.storyConsentConfig_) {
      this.storyConsentEl_ = renderElement(
        this.storyConsentConfig_,
        consentId,
        logoSrc
      );

      // Allow <amp-consent> actions in STAMP (defaults to no actions allowed).
      const actions = [
        {tagOrTarget: 'AMP-CONSENT', method: 'accept'},
        {tagOrTarget: 'AMP-CONSENT', method: 'prompt'},
        {tagOrTarget: 'AMP-CONSENT', method: 'reject'},
      ];
      this.storeService_.dispatch(Action.ADD_TO_ACTIONS_ALLOWLIST, actions);

      return localizeTemplate(this.storyConsentEl_, this.element).then(() => {
        createShadowRootWithStyle(this.element, this.storyConsentEl_, CSS);
        this.setAcceptButtonFontColor_();
        this.initializeListeners_();
      });
    }
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout_Enum.NODISPLAY;
  }

  /**
   * @private
   */
  initializeListeners_() {
    this.storyConsentEl_.addEventListener(
      'click',
      (event) => this.onClick_(event),
      true /** useCapture */
    );

    this.storeService_.subscribe(
      StateProperty.RTL_STATE,
      (rtlState) => {
        this.onRtlStateUpdate_(rtlState);
      },
      true /** callToInitialize */
    );
  }

  /**
   * Listens to click events to trigger the actions programatically.
   * Since events bubble up from the Shadow DOM but their target is updated to
   * the Shadow root, the top level actions event listeners would not detect
   * and trigger the actions upon click events.
   * @param {!Event} event
   * @private
   */
  onClick_(event) {
    if (!event.target) {
      return;
    }
    if (event.target.hasAttribute('on')) {
      const targetEl = dev().assertElement(event.target);
      this.actions_.trigger(targetEl, 'tap', event, ActionTrust_Enum.HIGH);
    }
    const anchorClicked = closest(event.target, (e) => matches(e, 'a[href]'));
    if (anchorClicked) {
      triggerClickFromLightDom(anchorClicked, this.element);
      event.preventDefault();
    }
  }

  /**
   * Reacts to RTL state updates and triggers the UI for RTL.
   * @param {boolean} rtlState
   * @private
   */
  onRtlStateUpdate_(rtlState) {
    const mutator = () => {
      rtlState
        ? this.storyConsentEl_.setAttribute('dir', 'rtl')
        : this.storyConsentEl_.removeAttribute('dir');
    };

    this.mutateElement(mutator, this.storyConsentEl_);
  }

  /**
   * Validates the story-consent config. `story-consent` is a new parameter
   * specific to stories, added on the `amp-consent` JSON config.
   * @private
   */
  assertAndParseConfig_() {
    // Validation of the amp-consent config is handled by the amp-consent
    // javascript.
    const parentEl = dev().assertElement(this.element.parentElement);
    const consentScript = childElementByTag(parentEl, 'script');
    this.consentConfig_ = consentScript && parseJson(consentScript.textContent);
    this.mergeLegacyConsents_();

    // amp-consent already triggered console errors, step out to avoid polluting
    // the console.
    if (!this.consentConfig_) {
      return;
    }

    const storyConsentScript = childElementByTag(this.element, 'script');

    userAssert(
      storyConsentScript && isJsonScriptTag(storyConsentScript),
      `${TAG} config should be put in a <script> tag with ` +
        'type="application/json"'
    );

    this.storyConsentConfig_ = {
      ...DEFAULT_OPTIONAL_PARAMETERS,
      ...parseJson(storyConsentScript.textContent),
    };

    user().assertString(
      this.storyConsentConfig_.title,
      `${TAG}: config requires a title`
    );
    user().assertString(
      this.storyConsentConfig_.message,
      `${TAG}: config requires a message`
    );
    userAssert(
      this.storyConsentConfig_.vendors &&
        isArray(this.storyConsentConfig_.vendors),
      `${TAG}: config requires an array of vendors`
    );
    user().assertBoolean(
      this.storyConsentConfig_.onlyAccept,
      `${TAG}: config requires "onlyAccept" to be a boolean`
    );

    // Runs the validation if any of the title or link are provided, since
    // both have to be provided for the external link to be displayed.
    if (
      this.storyConsentConfig_.externalLink.href ||
      this.storyConsentConfig_.externalLink.title
    ) {
      user().assertString(
        this.storyConsentConfig_.externalLink.title,
        `${TAG}: config requires "externalLink.title" to be a string`
      );
      user().assertString(
        this.storyConsentConfig_.externalLink.href,
        `${TAG}: config requires "externalLink.href" to be an absolute URL`
      );
      Services.urlForDoc(this.element).assertAbsoluteHttpOrHttpsUrl(
        this.storyConsentConfig_.externalLink.href
      );
    }
  }

  /**
   * Merge legacy `consents` policy object from
   * amp-consent config into top level.
   * @private
   */
  mergeLegacyConsents_() {
    const legacyConsents = this.consentConfig_['consents'];
    if (legacyConsents) {
      const policyId = Object.keys(legacyConsents)[0];
      const policy = legacyConsents[policyId];
      this.consentConfig_.consentInstanceId = policyId;
      this.consentConfig_.checkConsentHref = policy.checkConsentHref;
      this.consentConfig_.promptIfUnknownForGeoGroup =
        policy.promptIfUnknownForGeoGroup;
      delete this.consentConfig_['consents'];
    }
  }

  /**
   * @param {string} consentId
   * @private
   */
  storeConsentId_(consentId) {
    // checkConsentHref response overrides the amp-geo config, if provided.
    if (this.consentConfig_.checkConsentHref) {
      this.storeService_.dispatch(Action.SET_CONSENT_ID, consentId);
      return;
    }

    // If using amp-access with amp-geo, only set the consent id if the user is
    // in the expected geo group.
    const geoGroup = this.consentConfig_.promptIfUnknownForGeoGroup;
    if (geoGroup) {
      Services.geoForDocOrNull(this.element).then((geo) => {
        const matchedGeoGroups = /** @type {!Array<string>} */ (
          geo.matchedISOCountryGroups
        );
        if (geo && !matchedGeoGroups.includes(geoGroup)) {
          return;
        }
        this.storeService_.dispatch(Action.SET_CONSENT_ID, consentId);
      });
    }
  }

  /**
   * Sets the accept button font color to either white or black, depending on
   * the publisher custom background color.
   * Must be called from the `buildCallback` or in another vsync mutate state.
   * @private
   */
  setAcceptButtonFontColor_() {
    const buttonEl = dev().assertElement(
      this.storyConsentEl_.querySelector(
        '.i-amphtml-story-consent-action-accept'
      )
    );
    const styles = computedStyle(this.win, buttonEl);

    const rgb = getRGBFromCssColorValue(styles['background-color']);
    const color = getTextColorForRGB(rgb);

    setImportantStyles(buttonEl, {color});
  }
}
