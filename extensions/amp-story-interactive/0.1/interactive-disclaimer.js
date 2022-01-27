/**
 * @fileoverview
 * Interactive components support a disclaimer bubble that tells users where their data is being sent to.
 * Disclaimers will retrieve the information from the lookup dictionary in disclaimer-backends-list.json.
 * In order to add a "Learn more" link or entity name ("Your response will be sent to <Organization>"),
 * submit a PR with a new entry on the DisclaimerBackendList and tag @ampproject/wg-stories to review it.
 */
import * as Preact from '#core/dom/jsx';

import {addAttributesToElement} from '#core/dom';

import {LocalizedStringId_Enum} from '#service/localization/strings';

import {createShadowRootWithStyle} from 'extensions/amp-story/1.0/utils';

import DisclaimerBackendsList from './disclaimer-backends-list.json' assert {type: 'json'}; // lgtm[js/syntax-error]

import {CSS} from '../../../build/amp-story-interactive-disclaimer-0.1.css';

/**
 * Creates a disclaimer dialog from the interactive element passed in.
 * @param {!AmpStoryInteractive} interactive the interactive element.
 * @param {JsonObject<string, string>=} attrs optional attributes for the disclaimer.
 * @return {!Element} the container for the shadow root that has the disclaimer.
 */
export function buildInteractiveDisclaimer(interactive, attrs = {}) {
  const backendSpecs = getBackendSpecs(backendUrl, DisclaimerBackendsList);

  const backendUrl =
    backendSpecs?.[0] ??
    interactive.element.getAttribute('endpoint').replace('https://', '');
  const learnMoreUrl = backendSpecs?.[1]?.learnMoreUrl;
  const entityName = backendSpecs?.[1].entityName;

  const descriptionId = `i-amphtml-story-disclaimer-${interactive.element.id}-description`;

  const disclaimer = (
    <div
      class="i-amphtml-story-interactive-disclaimer-dialog"
      role="alertdialog"
      aria-describedby={descriptionId}
    >
      <div
        class="i-amphtml-story-interactive-disclaimer-description"
        id={descriptionId}
      >
        <span class="i-amphtml-story-interactive-disclaimer-note">
          {interactive.localizationService.getLocalizedString(
            LocalizedStringId_Enum.AMP_STORY_INTERACTIVE_DISCLAIMER_NOTE
          )}
        </span>
        {entityName && (
          <span class="i-amphtml-story-interactive-disclaimer-entity">
            {entityName}
          </span>
        )}
        <div class="i-amphtml-story-interactive-disclaimer-url">
          {backendUrl}
        </div>
      </div>
      {learnMoreUrl && (
        <a
          target="_blank"
          class="i-amphtml-story-interactive-disclaimer-link"
          href={learnMoreUrl}
        >
          {/* TODO(wg-stories): localize label */}
          Learn more
        </a>
      )}
      {/* TODO(wg-stories): Receive onClick handler instead of setting after render */}
      <button
        class="i-amphtml-story-interactive-disclaimer-close"
        aria-label="Close disclaimer"
      ></button>
    </div>
  );

  addAttributesToElement(disclaimer, attrs);

  return createShadowRootWithStyle(
    <div class="i-amphtml-story-interactive-disclaimer-dialog-container"></div>,
    disclaimer,
    CSS
  );
}

/**
 * Creates a disclaimer icon from the interactive element passed in.
 * @return {!Element} the icon with the dialog that should be added to the shadowRoot.
 */
export function buildInteractiveDisclaimerIcon() {
  return (
    <button
      class="i-amphtml-story-interactive-disclaimer-icon"
      aria-label="Open disclaimer"
    ></button>
  );
}

/**
 * Returns the corresponding backend specs (as an array of url and specs), or undefined.
 * @param {string} backendUrl
 * @param {!Object<string, !Object<string, string>>} backendsList
 * @return {?Array<string|Object<string, string>>} array that contains: base url of backend, {learnMoreUrl, entity}.
 */
export function getBackendSpecs(backendUrl, backendsList) {
  return Object.values(backendsList).find((url) => backendUrl.startsWith(url));
}
