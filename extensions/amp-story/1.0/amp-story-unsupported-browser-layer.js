import * as Preact from '#core/dom/jsx';

import {LocalizedStringId_Enum} from '#service/localization/strings';

import {localizeTemplate} from './amp-story-localization-service';
import {createShadowRootWithStyle} from './utils';

import {CSS} from '../../../build/amp-story-unsupported-browser-layer-1.0.css';

/**
 * Full viewport black layer indicating browser is not supported.
 * @param {string} continueAnyway
 * @return {!Element}
 */
const renderContent = (continueAnyway) => (
  <div class="i-amphtml-story-unsupported-browser-overlay">
    <div class="i-amphtml-overlay-container">
      <div class="i-amphtml-gear-icon" />
      <div
        i-amphtml-i18n-text-content={
          LocalizedStringId_Enum.AMP_STORY_WARNING_UNSUPPORTED_BROWSER_TEXT
        }
      ></div>
      <button
        class="i-amphtml-continue-button"
        onClick={continueAnyway}
        i-amphtml-i18n-text-content={
          LocalizedStringId_Enum.AMP_STORY_CONTINUE_ANYWAY_BUTTON_LABEL
        }
      ></button>
    </div>
  </div>
);

/**
 * @param {!Element} context
 * @param {function(Event):void} continueAnyway
 * @return {!Element}
 */
export function renderUnsupportedBrowserLayer(context, continueAnyway) {
  const content = renderContent(continueAnyway);
  localizeTemplate(content, context);
  return createShadowRootWithStyle(<div />, content, CSS);
}
