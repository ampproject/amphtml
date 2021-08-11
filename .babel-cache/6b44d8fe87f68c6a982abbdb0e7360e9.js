import { resolvedPromise as _resolvedPromise5 } from "./../../../src/core/data-structures/promise";
import { resolvedPromise as _resolvedPromise4 } from "./../../../src/core/data-structures/promise";
import { resolvedPromise as _resolvedPromise3 } from "./../../../src/core/data-structures/promise";
import { resolvedPromise as _resolvedPromise2 } from "./../../../src/core/data-structures/promise";
import { resolvedPromise as _resolvedPromise } from "./../../../src/core/data-structures/promise";

var _MAX_MEDIA_ELEMENT_CO;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (typeof call === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

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

/**
 * @fileoverview Embeds a story
 *
 * Example:
 * <code>
 * <amp-story standalone>
 *   [...]
 * </amp-story>
 * </code>
 */
import "./amp-story-cta-layer";
import "./amp-story-grid-layer";
import "./amp-story-page";
import { Action, EmbeddedComponentState, InteractiveComponentDef, StateProperty, UIType, getStoreService } from "./amp-story-store-service";
import { ActionTrust } from "../../../src/core/constants/action-constants";
import { AdvancementConfig, TapNavigationDirection } from "./page-advancement";
import { AdvancementMode, StoryAnalyticsEvent, getAnalyticsService } from "./story-analytics";
import { AmpEvents } from "../../../src/core/constants/amp-events";
import { AmpStoryAccess } from "./amp-story-access";
import { AmpStoryConsent } from "./amp-story-consent";
import { AmpStoryCtaLayer } from "./amp-story-cta-layer";
import { AmpStoryEmbeddedComponent } from "./amp-story-embedded-component";
import { AmpStoryGridLayer } from "./amp-story-grid-layer";
import { AmpStoryHint } from "./amp-story-hint";
import { AmpStoryPage, NavigationDirection, PageState } from "./amp-story-page";
import { AmpStoryPageAttachment } from "./amp-story-page-attachment";
import { AmpStoryRenderService } from "./amp-story-render-service";
import { AmpStoryViewerMessagingHandler } from "./amp-story-viewer-messaging-handler";
import { AnalyticsVariable, getVariableService } from "./variable-service";
import { BackgroundBlur } from "./background-blur";
import { CSS } from "../../../build/amp-story-1.0.css";
import { CommonSignals } from "../../../src/core/constants/common-signals";
import { EventType, dispatch } from "./events";
import { Gestures } from "../../../src/gesture";
import { prefersReducedMotion } from "../../../src/core/dom/media-query-props";
import { HistoryState, getHistoryState, setHistoryState } from "./history";
import { InfoDialog } from "./amp-story-info-dialog";
import { Keys } from "../../../src/core/constants/key-codes";
import { Layout } from "../../../src/core/dom/layout";
import { LiveStoryManager } from "./live-story-manager";
import { MediaPool, MediaType } from "./media-pool";
import { PaginationButtons } from "./pagination-buttons";
import { Services } from "../../../src/service";
import { ShareMenu } from "./amp-story-share-menu";
import { SwipeXYRecognizer } from "../../../src/gesture-recognizers";
import { SystemLayer } from "./amp-story-system-layer";
import { UnsupportedBrowserLayer } from "./amp-story-unsupported-browser-layer";
import { ViewportWarningLayer } from "./amp-story-viewport-warning-layer";
import { VisibilityState } from "../../../src/core/constants/visibility-state";
import { childElement, childElementByTag, childElements, childNodes, closest, matches, scopedQuerySelector, scopedQuerySelectorAll } from "../../../src/core/dom/query";
import { computedStyle, setImportantStyles, toggle } from "../../../src/core/dom/style";
import { createPseudoLocale } from "../../../src/service/localization/strings";
import { debounce } from "../../../src/core/types/function";
import { dev, devAssert, user } from "../../../src/log";
import { dict, map } from "../../../src/core/types/object";
import { endsWith } from "../../../src/core/types/string";
import { escapeCssSelectorIdent } from "../../../src/core/dom/css-selectors";
import { findIndex, lastItem, toArray } from "../../../src/core/types/array";
import { getConsentPolicyState } from "../../../src/consent";
import { getDetail } from "../../../src/event-helper";
import { getLocalizationService } from "./amp-story-localization-service";
import { getMediaQueryService } from "./amp-story-media-query-service";
import { getMode, isModeDevelopment } from "../../../src/mode";
import { getHistoryState as getWindowHistoryState } from "../../../src/core/window/history";
import { isDesktopOnePanelExperimentOn } from "./amp-story-desktop-one-panel";
import { isExperimentOn } from "../../../src/experiments";
import { isRTL } from "../../../src/core/dom";
import { parseQueryString } from "../../../src/core/types/string/url";
import { removeAttributeInMutate, setAttributeInMutate, shouldShowStoryUrlInfo } from "./utils";
import { upgradeBackgroundAudio } from "./audio";
import { whenUpgradedToCustomElement } from "../../../src/amp-element-helpers";
var LocalizedStringsAr = JSON.parse("{\"2\":{\"string\":\"\u0627\u0646\u0642\u0631 \u0639\u0644\u0649 \\\"\u0627\u0644\u062A\u0627\u0644\u064A\\\"\"},\"3\":{\"string\":\"\u0627\u0646\u0642\u0631 \u0639\u0644\u0649 \\\"\u0631\u062C\u0648\u0639\\\"\"},\"4\":{\"string\":\"\u062A\u0639\u0630\u0651\u0631 \u0646\u0633\u062E \u0627\u0644\u0631\u0627\u0628\u0637 \u0625\u0644\u0649 \u0627\u0644\u062D\u0627\u0641\u0638\u0629 :(\"},\"5\":{\"string\":\"\u062A\u0645\u0651 \u0646\u0633\u062E \u0627\u0644\u0631\u0627\u0628\u0637.\"},\"6\":{\"string\":\"\u0627\u0644\u0628\u0631\u064A\u062F \u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A\"},\"7\":{\"string\":\"Facebook\"},\"8\":{\"string\":\"+Google\"},\"9\":{\"string\":\"\u0627\u0644\u062D\u0635\u0648\u0644 \u0639\u0644\u0649 \u0627\u0644\u0631\u0627\u0628\u0637\"},\"10\":{\"string\":\"LinkedIn\"},\"11\":{\"string\":\"Pinterest\"},\"12\":{\"string\":\"SMS\"},\"14\":{\"string\":\"Tumblr\"},\"15\":{\"string\":\"Twitter\"},\"16\":{\"string\":\"WhatsApp\"},\"18\":{\"string\":\"\u064A\u0645\u0643\u0646\u0643 \u062A\u0648\u0633\u064A\u0639 \u0627\u0644\u0646\u0627\u0641\u0630\u0629 \u0637\u0648\u0644\u0627\u064B \u0648\u0639\u0631\u0636\u064B\u0627 \u0644\u0627\u0633\u062A\u0639\u0631\u0627\u0636 \u0647\u0630\u0647 \u0627\u0644\u062A\u062C\u0631\u0628\u0629.\"},\"19\":{\"string\":\"\u064A\u062C\u0628 \u062A\u0641\u0639\u064A\u0644 \u062A\u062C\u0631\u0628\u0629 \u0633\u062C\u0644\u0651 AMP \u0644\u0639\u0631\u0636 \u0647\u0630\u0627 \u0627\u0644\u0645\u062D\u062A\u0648\u0649.\"},\"20\":{\"string\":\"\u0644\u0644\u062D\u0635\u0648\u0644 \u0639\u0644\u0649 \u0623\u0641\u0636\u0644 \u0639\u0631\u0636\u060C \u064A\u0645\u0643\u0646 \u0627\u0633\u062A\u0639\u0631\u0627\u0636 \u0627\u0644\u0635\u0641\u062D\u0629 \u0641\u064A \u0627\u0644\u0648\u0636\u0639 \u0627\u0644\u0631\u0623\u0633\u064A.\"},\"21\":{\"string\":\"\u0639\u0630\u0631\u064B\u0627\u060C \u064A\u0628\u062F\u0648 \u0623\u0646 \u0645\u062A\u0635\u0641\u0651\u062D\u0643 \u0644\u0627 \u064A\u0648\u0641\u0651\u0631 \u0647\u0630\u0647 \u0627\u0644\u062A\u062C\u0631\u0628\u0629.\"},\"22\":{\"string\":\"\u0642\u0628\u0648\u0644\"},\"23\":{\"string\":\"\u0631\u0641\u0636\"},\"25\":{\"string\":\"\u0627\u0644\u0639\u0631\u0636 \u0639\u0644\u0649 \u0627\u0644\u0646\u0637\u0627\u0642 \u0627\u0644\u0623\u0635\u0644\u064A:\"},\"26\":{\"string\":\"\u0627\u0644\u0645\u0632\u064A\u062F \u0639\u0646 \u0646\u062A\u0627\u0626\u062C AMP\"},\"27\":{\"string\":\"\u0627\u0644\u0645\u062A\u0627\u0628\u0639\u0629 \u0639\u0644\u0649 \u0623\u064A \u062D\u0627\u0644\"},\"31\":{\"string\":\"\u0625\u064A\u0642\u0627\u0641 \u0627\u0644\u0635\u0648\u062A\"},\"32\":{\"string\":\"\u062A\u0645 \u062A\u0641\u0639\u064A\u0644 \u0627\u0644\u0635\u0648\u062A\"},\"33\":{\"string\":\"\u0644\u0627 \u062A\u062D\u062A\u0648\u064A \u0647\u0630\u0647 \u0627\u0644\u0635\u0641\u062D\u0629 \u0639\u0644\u0649 \u0623\u064A \u0645\u062D\u062A\u0648\u0649 \u0635\u0648\u062A\u064A\"},\"34\":{\"string\":\"\u062A\u0634\u063A\u064A\u0644 \u0627\u0644\u0641\u064A\u062F\u064A\u0648\"},\"35\":{\"string\":\"\u0627\u0644\u062A\u0645\u0631\u064A\u0631 \u0633\u0631\u064A\u0639\u064B\u0627 \u0644\u0623\u0639\u0644\u0649\"},\"36\":{\"string\":\"\u062A\u0648\u0633\u064A\u0639 \u0627\u0644\u062A\u063A\u0631\u064A\u062F\u0629\"},\"37\":{\"string\":\"\u064A\u0645\u0643\u0646\u0643 \u062A\u0648\u0633\u064A\u0639 \u0627\u0644\u0646\u0627\u0641\u0630\u0629 \u0637\u0648\u0644\u0627\u064B \u0644\u0627\u0633\u062A\u0639\u0631\u0627\u0636 \u0647\u0630\u0647 \u0627\u0644\u062A\u062C\u0631\u0628\u0629.\"},\"38\":{\"string\":\"\u064A\u0645\u0643\u0646\u0643 \u062A\u0648\u0633\u064A\u0639 \u0627\u0644\u0646\u0627\u0641\u0630\u0629 \u0639\u0631\u0636\u064B\u0627 \u0644\u0627\u0633\u062A\u0639\u0631\u0627\u0636 \u0647\u0630\u0647 \u0627\u0644\u062A\u062C\u0631\u0628\u0629.\"},\"63\":{\"string\":\"Line\"}}", function (key, val) {
  if (typeof val === 'object') Object.freeze(val);
  return val;
});
// lgtm[js/syntax-error]
var LocalizedStringsDe = JSON.parse("{\"2\":{\"string\":\"Auf \\\"Weiter\\\" tippen\"},\"3\":{\"string\":\"Auf \\\"Zur\xFCck\\\" tippen\"},\"4\":{\"string\":\"Der Link konnte nicht in die Zwischenablage kopiert werden\"},\"5\":{\"string\":\"Link kopiert.\"},\"6\":{\"string\":\"E-Mail\"},\"7\":{\"string\":\"Facebook\"},\"8\":{\"string\":\"Google+\"},\"9\":{\"string\":\"Link abrufen\"},\"10\":{\"string\":\"LinkedIn\"},\"11\":{\"string\":\"Pinterest\"},\"12\":{\"string\":\"SMS\"},\"14\":{\"string\":\"Tumblr\"},\"15\":{\"string\":\"Twitter\"},\"16\":{\"string\":\"WhatsApp\"},\"18\":{\"string\":\"Maximiere die H\xF6he und Breite deines Fensters, um diese Funktion nutzen zu k\xF6nnen\"},\"19\":{\"string\":\"Wenn du diesen Inhalt aufrufen m\xF6chtest, musst du den amp-story-Test aktivieren.\"},\"20\":{\"string\":\"Diese Seite l\xE4sst sich am besten im Hochformat ansehen\"},\"21\":{\"string\":\"Dein aktueller Browser unterst\xFCtzt diese Funktion leider nicht.\"},\"22\":{\"string\":\"Annehmen\"},\"23\":{\"string\":\"Ablehnen\"},\"25\":{\"string\":\"In urspr\xFCnglicher Domain ansehen:\"},\"26\":{\"string\":\"Weitere Informationen zu AMP-Ergebnissen\"},\"27\":{\"string\":\"Trotzdem fortfahren\"},\"31\":{\"string\":\"Ton aus\"},\"32\":{\"string\":\"Ton an\"},\"33\":{\"string\":\"Diese Seite hat keinen Ton\"},\"34\":{\"string\":\"Video abspielen\"},\"35\":{\"string\":\"Nach oben wischen\"},\"36\":{\"string\":\"Tweet maximieren\"},\"37\":{\"string\":\"Maximiere die H\xF6he deines Fensters, um diese Funktion nutzen zu k\xF6nnen\"},\"38\":{\"string\":\"Maximiere die Breite deines Fensters, um diese Funktion nutzen zu k\xF6nnen\"},\"63\":{\"string\":\"Line\"}}", function (key, val) {
  if (typeof val === 'object') Object.freeze(val);
  return val;
});
// lgtm[js/syntax-error]
var LocalizedStringsDefault = JSON.parse("{\"4\":{\"string\":\":(\"},\"18\":{\"string\":\"Expand both the height and width of your window to view this experience\"},\"19\":{\"string\":\"You must enable the amp-story experiment to view this content.\"},\"20\":{\"string\":\"The page is best viewed in portrait mode\"},\"21\":{\"string\":\"We're sorry, it looks like your browser doesn't support this experience\"},\"22\":{\"string\":\"Accept\"},\"23\":{\"string\":\"Decline\"},\"25\":{\"string\":\"View on original domain:\"},\"26\":{\"string\":\"More about AMP results\"},\"27\":{\"string\":\"Continue Anyway\"},\"31\":{\"string\":\"Sound off\"},\"32\":{\"string\":\"Sound on\"},\"33\":{\"string\":\"This page has no sound\"},\"37\":{\"string\":\"Expand the height of your window to view this experience\"},\"38\":{\"string\":\"Expand the width of your window to view this experience\"},\"64\":{\"string\":\"Updated\"},\"71\":{\"string\":\"A\"},\"72\":{\"string\":\"B\"},\"73\":{\"string\":\"C\"},\"74\":{\"string\":\"D\"},\"75\":{\"string\":\"Tip 1 of 2\"},\"76\":{\"string\":\"Tap to go to the next screen\"},\"77\":{\"string\":\"Next\"},\"78\":{\"string\":\"Tip 2 of 2\"},\"79\":{\"string\":\"Swipe to go to the next story\"},\"80\":{\"string\":\"Got it\"},\"81\":{\"string\":\"Tip\"},\"84\":{\"string\":\"SCORE:\"},\"85\":{\"string\":\"Pause\"},\"86\":{\"string\":\"Play\"},\"89\":{\"string\":\"Your response will be sent to\"},\"96\":{\"string\":\"Move device to explore\"}}", function (key, val) {
  if (typeof val === 'object') Object.freeze(val);
  return val;
});
// lgtm[js/syntax-error]
var LocalizedStringsEn = JSON.parse("{\"2\":{\"string\":\"Tap Next\",\"description\":\"Label indicating that users can navigate to the next page, in the amp-story hint UI.\"},\"3\":{\"string\":\"Tap Back\",\"description\":\"Label indicating that users can navigate to the previous page, in the amp-story hint UI.\"},\"4\":{\"string\":\"Could not copy link to clipboard :(\",\"description\":\"String shown in a failure message to inform the user that a link could not be successfully copied to their clipboard.\"},\"5\":{\"string\":\"Link copied!\",\"description\":\"String shown in a confirmation message to inform the user that a link was successfully copied to their clipboard.\"},\"6\":{\"string\":\"Email\",\"description\":\"Button label for the share target that shares a link via email.\"},\"7\":{\"string\":\"Facebook\",\"description\":\"Button label for the share target that shares a link via Facebook.\"},\"8\":{\"string\":\"Google+\",\"description\":\"Button label for the share target that shares a link via Google+.\"},\"9\":{\"string\":\"Get Link\",\"description\":\"Button label for the share target that shares a link via by copying it to the user's clipboard.\"},\"10\":{\"string\":\"LinkedIn\",\"description\":\"Button label for the share target that shares a link via LinkedIn.\"},\"11\":{\"string\":\"Pinterest\",\"description\":\"Button label for the share target that shares a link via Pinterest.\"},\"12\":{\"string\":\"SMS\",\"description\":\"Button label for the share target that shares a link via SMS.\"},\"13\":{\"string\":\"More\",\"description\":\"Button label for the share target that shares a link via deferral to the operating system's native sharing handler.\"},\"14\":{\"string\":\"Tumblr\",\"description\":\"Button label for the share target that shares a link via Tumblr.\"},\"15\":{\"string\":\"Twitter\",\"description\":\"Button label for the share target that shares a link via Twitter.\"},\"16\":{\"string\":\"WhatsApp\",\"description\":\"Button label for the share target that shares a link via WhatsApp.\"},\"18\":{\"string\":\"Expand both the height and width of your window to view this experience\",\"description\":\"Text for a warning screen that informs the user that stories are only supported in larger browser windows.\"},\"19\":{\"string\":\"You must enable the amp-story experiment to view this content.\",\"description\":\"Text for a warning screen that informs the user that they must enable an experiment to use stories.\"},\"20\":{\"string\":\"The page is best viewed in portrait mode\",\"description\":\"Text for a warning screen that informs the user that stories are only supported in portrait orientation.\"},\"21\":{\"string\":\"We're sorry, it looks like your browser doesn't support this experience\",\"description\":\"Text for a warning screen that informs the user that their browser does not support stories.\"},\"22\":{\"string\":\"Accept\",\"description\":\"Label for a button that allows the user to consent to providing their cookie access.\"},\"23\":{\"string\":\"Decline\",\"description\":\"Label for a button that allows the user to disconsent to providing their cookie access.\"},\"25\":{\"string\":\"View on original domain:\",\"description\":\"Label for a heading of a dialog that shows the user the domain from which the story is served.\"},\"26\":{\"string\":\"More about AMP results\",\"description\":\"Label for a link to documentation on how AMP links are handled.\"},\"27\":{\"string\":\"Continue Anyway\",\"description\":\"Button label to allow the user to continue even if they are not using a supportive browser.\"},\"31\":{\"string\":\"Sound off\",\"description\":\"Text that informs users that the sound is off after they click the mute button\"},\"32\":{\"string\":\"Sound on\",\"description\":\"Text that informs users that the sound is on after they click the unmute button on a page with sound\"},\"33\":{\"string\":\"This page has no sound\",\"description\":\"Text that informs users that the sound is on after they click the unmute button on a page without sound\"},\"34\":{\"string\":\"Play video\",\"description\":\"Label for a button to play the video visible on the page.\"},\"35\":{\"string\":\"Swipe up\",\"description\":\"Label for a button to open a drawer containing additional content via a \\\"swipe up\\\" user gesture.\"},\"36\":{\"string\":\"Expand Tweet\",\"description\":\"Label in the tooltip text for when a Twitter embed is expandable.\"},\"37\":{\"string\":\"Expand the height of your window to view this experience\",\"description\":\"Text for a warning screen that informs the user that stories are only supported in taller browser windows.\"},\"38\":{\"string\":\"Expand the width of your window to view this experience\",\"description\":\"Text for a warning screen that informs the user that stories are only supported in wider browser windows.\"},\"62\":{\"string\":\"Share starting from this page\",\"description\":\"Checkbox label when the branching experiment is turned on  and the story is in landscape mode; checking the checkbox lets the user share the story from the current page.\"},\"63\":{\"string\":\"Line\",\"description\":\"Button label for the share target that shares a link via Line.\"},\"64\":{\"string\":\"Updated\",\"description\":\"Label that indicates that additional content has been added to a story\"},\"65\":{\"string\":\"Video failed to play\",\"description\":\"Label indicating that the video visible on the page failed to play.\"},\"66\":{\"string\":\"Mute story\",\"description\":\"Label for the mute button that turns off the sound in the story\"},\"67\":{\"string\":\"Unmute story\",\"description\":\"Label for the unmute button that turns the sound in the story back on\"},\"68\":{\"string\":\"Story information\",\"description\":\"Label for the information button that pulls up relevant information about the story content\"},\"69\":{\"string\":\"Share story\",\"description\":\"Label for the share button that pulls up a panel of options for sharing the story\"},\"70\":{\"string\":\"Toggle story menu\",\"description\":\"Label for the sidebar button that pulls up a menu of options for interacting with the story\"},\"71\":{\"string\":\"A\",\"description\":\"Label for the first answer choice from a multiple choice quiz (e.g. A in A/B/C/D)\"},\"72\":{\"string\":\"B\",\"description\":\"Label for the second answer choice from a multiple choice quiz (e.g. B in A/B/C/D)\"},\"73\":{\"string\":\"C\",\"description\":\"Label for the third answer choice from a multiple choice quiz (e.g. C in A/B/C/D)\"},\"74\":{\"string\":\"D\",\"description\":\"Label for the fourth answer choice from a multiple choice quiz (e.g. D in A/B/C/D)\"},\"75\":{\"string\":\"Tip 1 of 2\",\"description\":\"Label for a hint indicating progress on a multistep onboarding user education tutorial.\"},\"76\":{\"string\":\"Tap to go to the next screen\",\"description\":\"Instruction on how to use the product, within an onboarding user education tutorial.\"},\"77\":{\"string\":\"Next\",\"description\":\"Label for a button dismissing or advancing to the next step of an onboarding user education tutorial.\"},\"78\":{\"string\":\"Tip 2 of 2\",\"description\":\"Label for a hint indicating progress on a multistep onboarding user education tutorial.\"},\"79\":{\"string\":\"Swipe to go to the next story\",\"description\":\"Instruction on how to use the product, within an onboarding user education tutorial.\"},\"80\":{\"string\":\"Got it\",\"description\":\"Label for a button dismissing or advancing to the next step of an onboarding user education tutorial.\"},\"81\":{\"string\":\"Tip\",\"description\":\"Label for a hint in the context of an onboarding user education tutorial.\"},\"82\":{\"string\":\"Previous page\",\"description\":\"Label indicating that users can navigate to the previous page.\"},\"83\":{\"string\":\"Activate\",\"description\":\"Label for the activate button to ask for device orientation permission\"},\"84\":{\"string\":\"SCORE:\",\"description\":\"Label for the results component preceding the score in percentages\"},\"85\":{\"string\":\"Pause story\",\"description\":\"Label for a button that pauses the media content on the story\"},\"86\":{\"string\":\"Play story\",\"description\":\"Label for a button that plays the media content on the story\"},\"87\":{\"string\":\"Close\",\"description\":\"Label for a button that closes the full page experience and takes the user back to where they were originally\"},\"88\":{\"string\":\"Skip next\",\"description\":\"Label for a button that advances to the next element in the carousel\"},\"89\":{\"string\":\"Your response will be sent to\",\"description\":\"Text displayed to users after clicking a button that reveals a disclaimer, telling them more about where their user data will be stored, after they interact with a poll or quiz.\"},\"90\":{\"string\":\"Next story\",\"description\":\"Label for a button that advances to the next element in the carousel.\"},\"91\":{\"string\":\"Next page\",\"description\":\"Label for a button that advances to the next page of the story.\"},\"92\":{\"string\":\"Replay\",\"description\":\"Label for a button that replays the story.\"},\"93\":{\"string\":\"Previous page\",\"description\":\"Label for a button that returns the user to the previous page of the story.\"},\"96\":{\"string\":\"Move device to explore\",\"description\":\"Text displayed to users on gyroscope activation of an amp-story-360 component, telling them to move their device to experience the gyroscope effect.\"},\"97\":{\"string\":\"Opening\",\"description\":\"Text displayed to users on tap of outlink button.\"}}", function (key, val) {
  if (typeof val === 'object') Object.freeze(val);
  return val;
});
// lgtm[js/syntax-error]
var LocalizedStringsEnGb = JSON.parse("{\"2\":{\"string\":\"Tap Next\"},\"3\":{\"string\":\"Tap Back\"},\"4\":{\"string\":\"Could not copy link to clipboard :(\"},\"5\":{\"string\":\"Link copied!\"},\"6\":{\"string\":\"Email\"},\"7\":{\"string\":\"Facebook\"},\"8\":{\"string\":\"Google+\"},\"9\":{\"string\":\"Get Link\"},\"10\":{\"string\":\"LinkedIn\"},\"11\":{\"string\":\"Pinterest\"},\"12\":{\"string\":\"SMS\"},\"14\":{\"string\":\"Tumblr\"},\"15\":{\"string\":\"Twitter\"},\"16\":{\"string\":\"WhatsApp\"},\"18\":{\"string\":\"Expand both the height and width of your window to view this experience\"},\"19\":{\"string\":\"You must enable the amp-story experiment to view this content.\"},\"20\":{\"string\":\"The page is best viewed in portrait mode\"},\"21\":{\"string\":\"We're sorry, it looks like your browser doesn't support this experience\"},\"22\":{\"string\":\"Accept\"},\"23\":{\"string\":\"Decline\"},\"25\":{\"string\":\"View on original domain:\"},\"26\":{\"string\":\"More about AMP results\"},\"27\":{\"string\":\"Continue Anyway\"},\"31\":{\"string\":\"Sound off\"},\"32\":{\"string\":\"Sound on\"},\"33\":{\"string\":\"This page has no sound\"},\"34\":{\"string\":\"Play video\"},\"35\":{\"string\":\"Swipe up\"},\"36\":{\"string\":\"Expand Tweet\"},\"37\":{\"string\":\"Expand the height of your window to view this experience\"},\"38\":{\"string\":\"Expand the width of your window to view this experience\"},\"63\":{\"string\":\"Line\"}}", function (key, val) {
  if (typeof val === 'object') Object.freeze(val);
  return val;
});
// lgtm[js/syntax-error]
var LocalizedStringsEs = JSON.parse("{\"2\":{\"string\":\"Toca Siguiente\"},\"3\":{\"string\":\"Toca Atr\xE1s\"},\"4\":{\"string\":\"No se ha podido copiar el enlace en el portapapeles\xA0:(\"},\"5\":{\"string\":\"Se ha copiado el enlace.\"},\"6\":{\"string\":\"Correo electr\xF3nico\"},\"7\":{\"string\":\"Facebook\"},\"8\":{\"string\":\"Google+\"},\"9\":{\"string\":\"Obtener enlace\"},\"10\":{\"string\":\"LinkedIn\"},\"11\":{\"string\":\"Pinterest\"},\"12\":{\"string\":\"SMS\"},\"14\":{\"string\":\"Tumblr\"},\"15\":{\"string\":\"Twitter\"},\"16\":{\"string\":\"WhatsApp\"},\"18\":{\"string\":\"Ampl\xEDa el alto y el ancho de la ventana para ver esta experiencia\"},\"19\":{\"string\":\"Para ver este contenido, debes habilitar el experimento de historia\xA0AMP.\"},\"20\":{\"string\":\"La p\xE1gina se visualiza mejor en modo vertical\"},\"21\":{\"string\":\"Parece que este servicio no est\xE1 disponible para tu navegador\"},\"22\":{\"string\":\"Aceptar\"},\"23\":{\"string\":\"Rechazar\"},\"25\":{\"string\":\"Ver en dominio original:\"},\"26\":{\"string\":\"M\xE1s informaci\xF3n sobre los resultados de AMP\"},\"27\":{\"string\":\"Continuar de todos modos\"},\"31\":{\"string\":\"Sonido desactivado\"},\"32\":{\"string\":\"Sonido activado\"},\"33\":{\"string\":\"Esta p\xE1gina no tiene sonido\"},\"34\":{\"string\":\"Reproducir v\xEDdeo\"},\"35\":{\"string\":\"Deslizar el dedo hacia arriba\"},\"36\":{\"string\":\"Mostrar tuit\"},\"37\":{\"string\":\"Ampl\xEDa el alto de la ventana para ver esta experiencia\"},\"38\":{\"string\":\"Ampl\xEDa el ancho de la ventana para ver esta experiencia\"},\"63\":{\"string\":\"Line\"}}", function (key, val) {
  if (typeof val === 'object') Object.freeze(val);
  return val;
});
// lgtm[js/syntax-error]
var LocalizedStringsEs419 = JSON.parse("{\"2\":{\"string\":\"Presiona Siguiente\"},\"3\":{\"string\":\"Presiona Atr\xE1s\"},\"4\":{\"string\":\"No se pudo copiar el v\xEDnculo en el portapapeles :(\"},\"5\":{\"string\":\"Se copi\xF3 el v\xEDnculo.\"},\"6\":{\"string\":\"Correo electr\xF3nico\"},\"7\":{\"string\":\"Facebook\"},\"8\":{\"string\":\"Google+\"},\"9\":{\"string\":\"Obtener v\xEDnculo\"},\"10\":{\"string\":\"LinkedIn\"},\"11\":{\"string\":\"Pinterest\"},\"12\":{\"string\":\"SMS\"},\"14\":{\"string\":\"Tumblr\"},\"15\":{\"string\":\"Twitter\"},\"16\":{\"string\":\"WhatsApp\"},\"18\":{\"string\":\"Expande el ancho y la altura de la ventana para ver esta experiencia\"},\"19\":{\"string\":\"Debes habilitar el experimento de historia en formato AMP para ver este contenido.\"},\"20\":{\"string\":\"La p\xE1gina est\xE1 optimizada para verse en orientaci\xF3n vertical.\"},\"21\":{\"string\":\"Parece que el navegador no es compatible con esta experiencia\"},\"22\":{\"string\":\"Aceptar\"},\"23\":{\"string\":\"Rechazar\"},\"25\":{\"string\":\"Ver en el dominio original:\"},\"26\":{\"string\":\"M\xE1s informaci\xF3n sobre los resultados de AMP\"},\"27\":{\"string\":\"Continuar de todos modos\"},\"31\":{\"string\":\"Sonido desactivado\"},\"32\":{\"string\":\"Sonido activado\"},\"33\":{\"string\":\"Esta p\xE1gina no tiene sonido\"},\"34\":{\"string\":\"Reproducir video\"},\"35\":{\"string\":\"Deslizar el dedo hacia arriba\"},\"36\":{\"string\":\"Expandir tweet\"},\"37\":{\"string\":\"Expande la altura de la ventana para ver esta experiencia\"},\"38\":{\"string\":\"Expande el ancho de la ventana para ver esta experiencia\"},\"63\":{\"string\":\"Line\"}}", function (key, val) {
  if (typeof val === 'object') Object.freeze(val);
  return val;
});
// lgtm[js/syntax-error]
var LocalizedStringsFr = JSON.parse("{\"2\":{\"string\":\"Appuyer sur Suivant\"},\"3\":{\"string\":\"Appuyer sur Retour\"},\"4\":{\"string\":\"Impossible de copier le lien dans le presse-papiers :(\"},\"5\":{\"string\":\"Lien copi\xE9.\"},\"6\":{\"string\":\"E-mail\"},\"7\":{\"string\":\"Facebook\"},\"8\":{\"string\":\"Google+\"},\"9\":{\"string\":\"Obtenir le lien\"},\"10\":{\"string\":\"LinkedIn\"},\"11\":{\"string\":\"Pinterest\"},\"12\":{\"string\":\"SMS\"},\"14\":{\"string\":\"Tumblr\"},\"15\":{\"string\":\"Twitter\"},\"16\":{\"string\":\"WhatsApp\"},\"18\":{\"string\":\"Modifiez la hauteur et la largeur de la fen\xEAtre pour voir cette exp\xE9rience\"},\"19\":{\"string\":\"Vous devez activer l'exp\xE9rience story\xA0AMP pour voir ce contenu.\"},\"20\":{\"string\":\"La page s'affiche mieux en mode Portrait\"},\"21\":{\"string\":\"Nous sommes d\xE9sol\xE9s, mais votre navigateur n'est pas compatible avec cette exp\xE9rience\"},\"22\":{\"string\":\"Accepter\"},\"23\":{\"string\":\"Refuser\"},\"25\":{\"string\":\"Afficher sur le domaine d'origine\xA0:\"},\"26\":{\"string\":\"En savoir plus sur les r\xE9sultats AMP\"},\"27\":{\"string\":\"Continuer quand m\xEAme\"},\"31\":{\"string\":\"Son d\xE9sactiv\xE9\"},\"32\":{\"string\":\"Son activ\xE9\"},\"33\":{\"string\":\"Cette page n'a pas de son\"},\"34\":{\"string\":\"Regarder la vid\xE9o\"},\"35\":{\"string\":\"Balayer l'\xE9cran vers le haut\"},\"36\":{\"string\":\"D\xE9velopper le tweet\"},\"37\":{\"string\":\"Augmentez la hauteur de votre fen\xEAtre pour voir cette exp\xE9rience\"},\"38\":{\"string\":\"\xC9largissez la fen\xEAtre pour voir cette exp\xE9rience\"},\"63\":{\"string\":\"Line\"}}", function (key, val) {
  if (typeof val === 'object') Object.freeze(val);
  return val;
});
// lgtm[js/syntax-error]
var LocalizedStringsHi = JSON.parse("{\"2\":{\"string\":\"'\u0905\u0917\u0932\u093E' \u092A\u0930 \u091F\u0948\u092A \u0915\u0930\u0947\u0902\"},\"3\":{\"string\":\"'\u0935\u093E\u092A\u0938 \u091C\u093E\u090F\u0902' \u092A\u0930 \u091F\u0948\u092A \u0915\u0930\u0947\u0902\"},\"4\":{\"string\":\"\u0932\u093F\u0902\u0915 \u0915\u094D\u0932\u093F\u092A\u092C\u094B\u0930\u094D\u0921 \u092A\u0930 \u0915\u0949\u092A\u0940 \u0928\u0939\u0940\u0902 \u0915\u093F\u092F\u093E \u091C\u093E \u0938\u0915\u093E :(\"},\"5\":{\"string\":\"\u0932\u093F\u0902\u0915 \u0915\u0949\u092A\u0940 \u0915\u093F\u092F\u093E \u0917\u092F\u093E!\"},\"6\":{\"string\":\"\u0908\u092E\u0947\u0932\"},\"7\":{\"string\":\"Facebook\"},\"8\":{\"string\":\"Google+\"},\"9\":{\"string\":\"\u0932\u093F\u0902\u0915 \u092A\u093E\u090F\u0902\"},\"10\":{\"string\":\"LinkedIn\"},\"11\":{\"string\":\"Pinterest\"},\"12\":{\"string\":\"\u092E\u0948\u0938\u0947\u091C (\u090F\u0938\u090F\u092E\u090F\u0938)\"},\"14\":{\"string\":\"Tumblr\"},\"15\":{\"string\":\"Twitter\"},\"16\":{\"string\":\"WhatsApp\"},\"18\":{\"string\":\"\u092F\u0939 \u0935\u0930\u094D\u0936\u0928 \u0926\u0947\u0916\u0928\u0947 \u0915\u0947 \u0932\u093F\u090F \u0905\u092A\u0928\u0940 \u0935\u093F\u0902\u0921\u094B \u0915\u0940 \u0932\u0902\u092C\u093E\u0908 \u0914\u0930 \u091A\u094C\u0921\u093C\u093E\u0908, \u0926\u094B\u0928\u094B\u0902 \u0915\u094B \u092C\u0922\u093C\u093E\u090F\u0902\"},\"19\":{\"string\":\"\u092F\u0939 \u0938\u093E\u092E\u0917\u094D\u0930\u0940 \u0926\u0947\u0916\u0928\u0947 \u0915\u0947 \u0932\u093F\u090F \u0906\u092A\u0915\u094B \u090F\u090F\u092E\u092A\u0940-\u0915\u0939\u093E\u0928\u0940 \u0915\u0940 \u092A\u0930\u092B\u093C\u0949\u0930\u094D\u092E\u0947\u0902\u0938 \u091C\u093E\u0901\u091A \u091A\u093E\u0932\u0942 \u0915\u0930\u0928\u0940 \u0939\u094B\u0917\u0940.\"},\"20\":{\"string\":\"\u092F\u0939 \u092A\u0947\u091C \u092A\u094B\u0930\u094D\u091F\u094D\u0930\u0947\u091F \u092E\u094B\u0921 \u092E\u0947\u0902 \u0938\u092C\u0938\u0947 \u0905\u091A\u094D\u091B\u093E \u0926\u093F\u0916\u093E\u0908 \u0926\u0947\u0924\u093E \u0939\u0948\"},\"21\":{\"string\":\"\u092E\u093E\u092B\u093C \u0915\u0930\u0947\u0902, \u0932\u0917\u0924\u093E \u0939\u0948 \u0915\u093F \u0906\u092A\u0915\u093E \u092C\u094D\u0930\u093E\u0909\u091C\u093C\u0930 \u0907\u0938 \u0935\u0930\u094D\u0936\u0928 \u092A\u0930 \u0915\u093E\u092E \u0928\u0939\u0940\u0902 \u0915\u0930\u0924\u093E\"},\"22\":{\"string\":\"\u0938\u094D\u0935\u0940\u0915\u093E\u0930 \u0915\u0930\u0947\u0902\"},\"23\":{\"string\":\"\u0905\u0938\u094D\u0935\u0940\u0915\u093E\u0930 \u0915\u0930\u0947\u0902\"},\"25\":{\"string\":\"\u092E\u0942\u0932 \u0921\u094B\u092E\u0947\u0928 \u092A\u0930 \u0926\u0947\u0916\u0947\u0902:\"},\"26\":{\"string\":\"\u090F\u090F\u092E\u092A\u0940 \u0928\u0924\u0940\u091C\u094B\u0902 \u0915\u0947 \u092C\u093E\u0930\u0947 \u092E\u0947\u0902 \u091C\u093C\u094D\u092F\u093E\u0926\u093E \u091C\u093E\u0928\u0947\u0902\"},\"27\":{\"string\":\"\u092B\u093F\u0930 \u092D\u0940 \u091C\u093E\u0930\u0940 \u0930\u0916\u0947\u0902\"},\"31\":{\"string\":\"\u0906\u0935\u093E\u095B \u092C\u0902\u0926 \u0939\u0948\"},\"32\":{\"string\":\"\u0906\u0935\u093E\u095B \u091A\u093E\u0932\u0942 \u0939\u0948\"},\"33\":{\"string\":\"\u0907\u0938 \u092A\u0947\u091C \u092E\u0947\u0902 \u0915\u094B\u0908 \u0906\u0935\u093E\u091C\u093C \u0928\u0939\u0940\u0902 \u0939\u0948\"},\"34\":{\"string\":\"\u0935\u0940\u0921\u093F\u092F\u094B \u091A\u0932\u093E\u090F\u0902\"},\"35\":{\"string\":\"\u090A\u092A\u0930 \u0915\u0940 \u0913\u0930 \u0938\u094D\u0935\u093E\u0907\u092A \u0915\u0930\u0947\u0902\"},\"36\":{\"string\":\"\u091F\u094D\u0935\u0940\u091F \u0915\u094B \u092C\u0921\u093C\u093E \u0915\u0930\u0915\u0947 \u0926\u0947\u0916\u0947\u0902\"},\"37\":{\"string\":\"\u0907\u0938 \u0935\u0930\u094D\u0936\u0928 \u0915\u094B \u0926\u0947\u0916\u0928\u0947 \u0915\u0947 \u0932\u093F\u090F \u0905\u092A\u0928\u0940 \u0935\u093F\u0902\u0921\u094B \u0915\u0940 \u0932\u0902\u092C\u093E\u0908 \u092C\u0922\u093C\u093E\u090F\u0902\"},\"38\":{\"string\":\"\u092F\u0939 \u0935\u0930\u094D\u0936\u0928 \u0926\u0947\u0916\u0928\u0947 \u0915\u0947 \u0932\u093F\u090F \u0905\u092A\u0928\u0940 \u0935\u093F\u0902\u0921\u094B \u0915\u0940 \u091A\u094C\u0921\u093C\u093E\u0908 \u092C\u0922\u093C\u093E\u090F\u0902\"},\"63\":{\"string\":\"Line\"}}", function (key, val) {
  if (typeof val === 'object') Object.freeze(val);
  return val;
});
// lgtm[js/syntax-error]
var LocalizedStringsId = JSON.parse("{\"2\":{\"string\":\"Tap Berikutnya\"},\"3\":{\"string\":\"Tap Kembali.\"},\"4\":{\"string\":\"Tidak dapat menyalin link ke papan klip :(\"},\"5\":{\"string\":\"Link disalin!\"},\"6\":{\"string\":\"Email\"},\"7\":{\"string\":\"Facebook\"},\"8\":{\"string\":\"Google+\"},\"9\":{\"string\":\"Dapatkan Link\"},\"10\":{\"string\":\"LinkedIn\"},\"11\":{\"string\":\"Pinterest\"},\"12\":{\"string\":\"SMS\"},\"14\":{\"string\":\"Tumblr\"},\"15\":{\"string\":\"Twitter\"},\"16\":{\"string\":\"WhatsApp\"},\"18\":{\"string\":\"Luaskan tinggi dan lebar jendela untuk menampilkan pengalaman ini\"},\"19\":{\"string\":\"Anda harus mengaktifkan eksperimen cerita AMP untuk melihat konten ini.\"},\"20\":{\"string\":\"Halaman ini ditampilkan paling baik dalam mode potret\"},\"21\":{\"string\":\"Maaf, sepertinya browser Anda tidak mendukung pengalaman ini\"},\"22\":{\"string\":\"Setuju\"},\"23\":{\"string\":\"Tolak\"},\"25\":{\"string\":\"Lihat di domain asal:\"},\"26\":{\"string\":\"Lebih lanjut tentang hasil AMP\"},\"27\":{\"string\":\"Tetap Lanjutkan\"},\"31\":{\"string\":\"Suara nonaktif\"},\"32\":{\"string\":\"Suara aktif\"},\"33\":{\"string\":\"Suara tidak aktif di halaman ini\"},\"34\":{\"string\":\"Putar video\"},\"35\":{\"string\":\"Geser ke atas\"},\"36\":{\"string\":\"Luaskan Tweet\"},\"37\":{\"string\":\"Luaskan tinggi jendela untuk menampilkan pengalaman ini\"},\"38\":{\"string\":\"Luaskan lebar jendela untuk menampilkan pengalaman ini\"},\"63\":{\"string\":\"Line\"}}", function (key, val) {
  if (typeof val === 'object') Object.freeze(val);
  return val;
});
// lgtm[js/syntax-error]
var LocalizedStringsIt = JSON.parse("{\"2\":{\"string\":\"Tocca Avanti\"},\"3\":{\"string\":\"Tocca Indietro\"},\"4\":{\"string\":\"Impossibile copiare il link negli appunti :(\"},\"5\":{\"string\":\"Link copiato.\"},\"6\":{\"string\":\"Email\"},\"7\":{\"string\":\"Facebook\"},\"8\":{\"string\":\"Google+\"},\"9\":{\"string\":\"Ottieni link\"},\"10\":{\"string\":\"LinkedIn\"},\"11\":{\"string\":\"Pinterest\"},\"12\":{\"string\":\"SMS\"},\"14\":{\"string\":\"Tumblr\"},\"15\":{\"string\":\"Twitter\"},\"16\":{\"string\":\"WhatsApp\"},\"18\":{\"string\":\"Espandi sia l'altezza che la larghezza della finestra per visualizzare questa esperienza\"},\"19\":{\"string\":\"Devi attivare l'esperimento di storia AMP per visualizzare questi contenuti.\"},\"20\":{\"string\":\"La pagina viene visualizzata in modo ottimale in orientamento verticale\"},\"21\":{\"string\":\"Spiacenti, sembra che il tuo browser non supporti questa esperienza\"},\"22\":{\"string\":\"Accetta\"},\"23\":{\"string\":\"Rifiuta\"},\"25\":{\"string\":\"Visualizza sul dominio originale:\"},\"26\":{\"string\":\"Ulteriori informazioni sui risultati AMP\"},\"27\":{\"string\":\"Continua comunque\"},\"31\":{\"string\":\"Audio disattivato\"},\"32\":{\"string\":\"Audio attivo\"},\"33\":{\"string\":\"Questa pagina non ha audio\"},\"34\":{\"string\":\"Riproduci video\"},\"35\":{\"string\":\"Scorri verso l'alto\"},\"36\":{\"string\":\"Espandi tweet\"},\"37\":{\"string\":\"Espandi l'altezza della finestra per visualizzare questa esperienza\"},\"38\":{\"string\":\"Espandi la larghezza della finestra per visualizzare questa esperienza\"},\"63\":{\"string\":\"Line\"}}", function (key, val) {
  if (typeof val === 'object') Object.freeze(val);
  return val;
});
// lgtm[js/syntax-error]
var LocalizedStringsJa = JSON.parse("{\"2\":{\"string\":\"[\u6B21\u3078] \u3092\u30BF\u30C3\u30D7\"},\"3\":{\"string\":\"\u623B\u308B\u30A2\u30A4\u30B3\u30F3\u3092\u30BF\u30C3\u30D7\"},\"4\":{\"string\":\"\u30EA\u30F3\u30AF\u3092\u30AF\u30EA\u30C3\u30D7\u30DC\u30FC\u30C9\u306B\u30B3\u30D4\u30FC\u3067\u304D\u307E\u305B\u3093\u3067\u3057\u305F\u3002\"},\"5\":{\"string\":\"\u30EA\u30F3\u30AF\u3092\u30B3\u30D4\u30FC\u3057\u307E\u3057\u305F\"},\"6\":{\"string\":\"\u30E1\u30FC\u30EB\"},\"7\":{\"string\":\"Facebook\"},\"8\":{\"string\":\"Google+\"},\"9\":{\"string\":\"\u30EA\u30F3\u30AF\u3092\u53D6\u5F97\"},\"10\":{\"string\":\"LinkedIn\"},\"11\":{\"string\":\"Pinterest\"},\"12\":{\"string\":\"SMS\"},\"14\":{\"string\":\"Tumblr\"},\"15\":{\"string\":\"Twitter\"},\"16\":{\"string\":\"WhatsApp\"},\"18\":{\"string\":\"\u3053\u306E\u8A18\u4E8B\u3092\u8868\u793A\u3059\u308B\u306B\u306F\u3001\u30A6\u30A3\u30F3\u30C9\u30A6\u306E\u9AD8\u3055\u3068\u5E45\u306E\u4E21\u65B9\u3092\u62E1\u5927\u3057\u3066\u304F\u3060\u3055\u3044\"},\"19\":{\"string\":\"\u3053\u306E\u30B3\u30F3\u30C6\u30F3\u30C4\u3092\u8868\u793A\u3059\u308B\u306B\u306F amp-story \u30C6\u30B9\u30C8\u3092\u6709\u52B9\u306B\u3059\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059\u3002\"},\"20\":{\"string\":\"\u3053\u306E\u30DA\u30FC\u30B8\u306F\u30DD\u30FC\u30C8\u30EC\u30FC\u30C8 \u30E2\u30FC\u30C9\u3067\u6700\u9069\u306B\u8868\u793A\u3055\u308C\u307E\u3059\"},\"21\":{\"string\":\"\u3054\u5229\u7528\u306E\u30D6\u30E9\u30A6\u30B6\u306F\u3053\u306E\u8A18\u4E8B\u306B\u5BFE\u5FDC\u3057\u3066\u3044\u307E\u305B\u3093\"},\"22\":{\"string\":\"\u540C\u610F\u3059\u308B\"},\"23\":{\"string\":\"\u540C\u610F\u3057\u306A\u3044\"},\"25\":{\"string\":\"\u5143\u306E\u30C9\u30E1\u30A4\u30F3\u3067\u8868\u793A:\"},\"26\":{\"string\":\"AMP \u306E\u7D50\u679C\u306B\u95A2\u3059\u308B\u8A73\u7D30\"},\"27\":{\"string\":\"\u7D9A\u884C\u3059\u308B\"},\"31\":{\"string\":\"\u30B5\u30A6\u30F3\u30C9\u306F\u30AA\u30D5\u3067\u3059\"},\"32\":{\"string\":\"\u30B5\u30A6\u30F3\u30C9\u30AA\u30F3\"},\"33\":{\"string\":\"\u3053\u306E\u30DA\u30FC\u30B8\u306B\u306F\u97F3\u58F0\u304C\u3042\u308A\u307E\u305B\u3093\"},\"34\":{\"string\":\"\u52D5\u753B\u3092\u518D\u751F\"},\"35\":{\"string\":\"\u4E0A\u306B\u30B9\u30EF\u30A4\u30D7\"},\"36\":{\"string\":\"\u30C4\u30A4\u30FC\u30C8\u3092\u5C55\u958B\"},\"37\":{\"string\":\"\u3053\u306E\u8A18\u4E8B\u3092\u8868\u793A\u3059\u308B\u306B\u306F\u3001\u30A6\u30A3\u30F3\u30C9\u30A6\u306E\u9AD8\u3055\u3092\u62E1\u5927\u3057\u3066\u304F\u3060\u3055\u3044\"},\"38\":{\"string\":\"\u3053\u306E\u8A18\u4E8B\u3092\u8868\u793A\u3059\u308B\u306B\u306F\u3001\u30A6\u30A3\u30F3\u30C9\u30A6\u306E\u5E45\u3092\u62E1\u5927\u3057\u3066\u304F\u3060\u3055\u3044\"},\"63\":{\"string\":\"Line\"}}", function (key, val) {
  if (typeof val === 'object') Object.freeze(val);
  return val;
});
// lgtm[js/syntax-error]
var LocalizedStringsKo = JSON.parse("{\"2\":{\"string\":\"\uB2E4\uC74C\uC744 \uD0ED\uD558\uC138\uC694.\"},\"3\":{\"string\":\"\uB4A4\uB85C\uB97C \uD0ED\uD558\uC138\uC694.\"},\"4\":{\"string\":\"\uB9C1\uD06C\uB97C \uD074\uB9BD\uBCF4\uB4DC\uC5D0 \uBCF5\uC0AC\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.\"},\"5\":{\"string\":\"\uB9C1\uD06C\uAC00 \uBCF5\uC0AC\uB418\uC5C8\uC2B5\uB2C8\uB2E4.\"},\"6\":{\"string\":\"\uC774\uBA54\uC77C\"},\"7\":{\"string\":\"Facebook\"},\"8\":{\"string\":\"Google+\"},\"9\":{\"string\":\"\uB9C1\uD06C \uBC1B\uAE30\"},\"10\":{\"string\":\"LinkedIn\"},\"11\":{\"string\":\"Pinterest\"},\"12\":{\"string\":\"SMS\"},\"14\":{\"string\":\"Tumblr\"},\"15\":{\"string\":\"Twitter\"},\"16\":{\"string\":\"WhatsApp\"},\"18\":{\"string\":\"\uC774 \uD658\uACBD\uC744 \uBCF4\uB824\uBA74 \uCC3D \uB192\uC774\uC640 \uB108\uBE44\uB97C \uB298\uB9AC\uC138\uC694.\"},\"19\":{\"string\":\"\uC774 \uCF58\uD150\uCE20\uB97C \uBCF4\uB824\uBA74 amp-story \uC2E4\uD5D8\uC744 \uC0AC\uC6A9\uD558\uB3C4\uB85D \uC124\uC815\uD574\uC57C \uD569\uB2C8\uB2E4.\"},\"20\":{\"string\":\"\uC774 \uD398\uC774\uC9C0\uB294 \uC138\uB85C \uBAA8\uB4DC\uC5D0\uC11C \uAC00\uC7A5 \uC798 \uD45C\uC2DC\uB429\uB2C8\uB2E4.\"},\"21\":{\"string\":\"\uC0AC\uC6A9 \uC911\uC778 \uBE0C\uB77C\uC6B0\uC800\uC5D0\uC11C \uC774 \uD658\uACBD\uC744 \uC9C0\uC6D0\uD558\uC9C0 \uC54A\uB294 \uAC83 \uAC19\uC2B5\uB2C8\uB2E4.\"},\"22\":{\"string\":\"\uC218\uB77D\"},\"23\":{\"string\":\"\uAC70\uBD80\"},\"25\":{\"string\":\"\uC6D0\uB798 \uB3C4\uBA54\uC778\uC5D0\uC11C \uBCF4\uAE30:\"},\"26\":{\"string\":\"AMP \uACB0\uACFC \uC790\uC138\uD788 \uC54C\uC544\uBCF4\uAE30\"},\"27\":{\"string\":\"\uACC4\uC18D\uD558\uAE30\"},\"31\":{\"string\":\"\uC0AC\uC6B4\uB4DC \uAEBC\uC9D0\"},\"32\":{\"string\":\"\uC0AC\uC6B4\uB4DC \uCF1C\uC9D0\"},\"33\":{\"string\":\"\uC774 \uD398\uC774\uC9C0\uC5D0\uB294 \uC0AC\uC6B4\uB4DC\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.\"},\"34\":{\"string\":\"\uB3D9\uC601\uC0C1 \uC7AC\uC0DD\"},\"35\":{\"string\":\"\uC704\uB85C \uC2A4\uC640\uC774\uD504\"},\"36\":{\"string\":\"\uD2B8\uC717 \uD3BC\uCE58\uAE30\"},\"37\":{\"string\":\"\uC774 \uD658\uACBD\uC744 \uBCF4\uB824\uBA74 \uCC3D \uB192\uC774\uB97C \uB298\uB9AC\uC138\uC694.\"},\"38\":{\"string\":\"\uC774 \uD658\uACBD\uC744 \uBCF4\uB824\uBA74 \uCC3D \uB108\uBE44\uB97C \uB298\uB9AC\uC138\uC694.\"},\"63\":{\"string\":\"Line\"}}", function (key, val) {
  if (typeof val === 'object') Object.freeze(val);
  return val;
});
// lgtm[js/syntax-error]
var LocalizedStringsNl = JSON.parse("{\"2\":{\"string\":\"Tik op Volgende\"},\"3\":{\"string\":\"Tik op Terug\"},\"4\":{\"string\":\"Kan link niet kopi\xEBren naar klembord :(\"},\"5\":{\"string\":\"Link gekopieerd\"},\"6\":{\"string\":\"E-mail\"},\"7\":{\"string\":\"Facebook\"},\"8\":{\"string\":\"Google+\"},\"9\":{\"string\":\"Link ophalen\"},\"10\":{\"string\":\"LinkedIn\"},\"11\":{\"string\":\"Pinterest\"},\"12\":{\"string\":\"Sms\"},\"14\":{\"string\":\"Tumblr\"},\"15\":{\"string\":\"Twitter\"},\"16\":{\"string\":\"WhatsApp\"},\"18\":{\"string\":\"Maak je venster hoger en breder om deze functionaliteit te bekijken\"},\"19\":{\"string\":\"Je moet het amp-story-experiment inschakelen om deze content te bekijken.\"},\"20\":{\"string\":\"De pagina kan het beste worden bekeken in de staande modus\"},\"21\":{\"string\":\"Je browser ondersteunt deze functionaliteit niet\"},\"22\":{\"string\":\"Accepteren\"},\"23\":{\"string\":\"Weigeren\"},\"25\":{\"string\":\"Bekijken op oorspronkelijk domein:\"},\"26\":{\"string\":\"Meer over AMP-resultaten\"},\"27\":{\"string\":\"Toch doorgaan\"},\"31\":{\"string\":\"Geluid uit\"},\"32\":{\"string\":\"Geluid aan\"},\"33\":{\"string\":\"Deze pagina heeft geen geluid\"},\"34\":{\"string\":\"Video afspelen\"},\"35\":{\"string\":\"Omhoog vegen\"},\"36\":{\"string\":\"Tweet uitvouwen\"},\"37\":{\"string\":\"Maak je venster hoger om deze functionaliteit te bekijken\"},\"38\":{\"string\":\"Maak je venster breder om deze functionaliteit te bekijken\"},\"63\":{\"string\":\"Line\"}}", function (key, val) {
  if (typeof val === 'object') Object.freeze(val);
  return val;
});
// lgtm[js/syntax-error]
var LocalizedStringsNo = JSON.parse("{\"2\":{\"string\":\"Trykk p\xE5 Neste\"},\"3\":{\"string\":\"Trykk p\xE5 Tilbake\"},\"4\":{\"string\":\"Kunne ikke kopiere linken til utklippstavlen :(\"},\"5\":{\"string\":\"Linken er kopiert.\"},\"6\":{\"string\":\"E-post\"},\"7\":{\"string\":\"Facebook\"},\"8\":{\"string\":\"Google+\"},\"9\":{\"string\":\"Hent linken\"},\"10\":{\"string\":\"LinkedIn\"},\"11\":{\"string\":\"Pinterest\"},\"12\":{\"string\":\"SMS\"},\"14\":{\"string\":\"Tumblr\"},\"15\":{\"string\":\"Twitter\"},\"16\":{\"string\":\"WhatsApp\"},\"18\":{\"string\":\"Gj\xF8r vinduet ditt st\xF8rre for \xE5 se denne opplevelsen\"},\"19\":{\"string\":\"Du m\xE5 aktivere eksperimentet med AMP-snuttsamlinger for \xE5 se dette innholdet.\"},\"20\":{\"string\":\"Den beste visningen av siden er i st\xE5ende retning\"},\"21\":{\"string\":\"Beklager, men det ser ut til at nettleseren din ikke st\xF8tter denne opplevelsen\"},\"22\":{\"string\":\"Godta\"},\"23\":{\"string\":\"Avsl\xE5\"},\"25\":{\"string\":\"Se p\xE5 det opprinnelige domenet:\"},\"26\":{\"string\":\"Mer om AMP-resultater\"},\"27\":{\"string\":\"Fortsett likevel\"},\"31\":{\"string\":\"Lyd av\"},\"32\":{\"string\":\"Lyd p\xE5\"},\"33\":{\"string\":\"Denne siden har ikke noe lyd\"},\"34\":{\"string\":\"Spill av videoen\"},\"35\":{\"string\":\"Sveip opp\"},\"36\":{\"string\":\"Vis Twitter-meldingen\"},\"37\":{\"string\":\"Gj\xF8r vinduet ditt st\xF8rre for \xE5 se denne opplevelsen\"},\"38\":{\"string\":\"Gj\xF8r vinduet ditt bredere for \xE5 se denne opplevelsen\"},\"63\":{\"string\":\"Line\"}}", function (key, val) {
  if (typeof val === 'object') Object.freeze(val);
  return val;
});
// lgtm[js/syntax-error]
var LocalizedStringsPtBr = JSON.parse("{\"2\":{\"string\":\"Toque em \\\"Pr\xF3xima\\\"\"},\"3\":{\"string\":\"Toque em \\\"Voltar\\\"\"},\"4\":{\"string\":\"N\xE3o foi poss\xEDvel copiar o link para a \xE1rea de transfer\xEAncia :(\"},\"5\":{\"string\":\"Link copiado\"},\"6\":{\"string\":\"E-mail\"},\"7\":{\"string\":\"Facebook\"},\"8\":{\"string\":\"Google+\"},\"9\":{\"string\":\"Copiar link\"},\"10\":{\"string\":\"LinkedIn\"},\"11\":{\"string\":\"Pinterest\"},\"12\":{\"string\":\"SMS\"},\"14\":{\"string\":\"Tumblr\"},\"15\":{\"string\":\"Twitter\"},\"16\":{\"string\":\"WhatsApp\"},\"18\":{\"string\":\"Aumente a altura e largura da janela para ver esta experi\xEAncia\"},\"19\":{\"string\":\"Voc\xEA precisa ativar o experimento amp-story para ver este conte\xFAdo.\"},\"20\":{\"string\":\"Melhor visualiza\xE7\xE3o da p\xE1gina no modo retrato\"},\"21\":{\"string\":\"Parece que o navegador n\xE3o \xE9 compat\xEDvel com esta experi\xEAncia\"},\"22\":{\"string\":\"Aceitar\"},\"23\":{\"string\":\"Recusar\"},\"25\":{\"string\":\"Ver no dom\xEDnio original:\"},\"26\":{\"string\":\"Mais sobre resultados de AMP\"},\"27\":{\"string\":\"Continuar mesmo assim\"},\"31\":{\"string\":\"Som desativado\"},\"32\":{\"string\":\"Som ativado\"},\"33\":{\"string\":\"Esta p\xE1gina n\xE3o tem som\"},\"34\":{\"string\":\"Assistir v\xEDdeo\"},\"35\":{\"string\":\"Deslizar para cima\"},\"36\":{\"string\":\"Expandir tweet\"},\"37\":{\"string\":\"Aumente a altura da janela para ver esta experi\xEAncia\"},\"38\":{\"string\":\"Aumente a largura da janela para ver esta experi\xEAncia\"},\"63\":{\"string\":\"Line\"}}", function (key, val) {
  if (typeof val === 'object') Object.freeze(val);
  return val;
});
// lgtm[js/syntax-error]
var LocalizedStringsPtPt = JSON.parse("{\"2\":{\"string\":\"Toque em Seguinte.\"},\"3\":{\"string\":\"Toque em Anterior\"},\"4\":{\"string\":\"N\xE3o foi poss\xEDvel copiar o link para a \xE1rea de transfer\xEAncia :(\"},\"5\":{\"string\":\"Link copiado!\"},\"6\":{\"string\":\"Email\"},\"7\":{\"string\":\"Facebook\"},\"8\":{\"string\":\"Google+\"},\"9\":{\"string\":\"Obter link\"},\"10\":{\"string\":\"LinkedIn\"},\"11\":{\"string\":\"Pinterest\"},\"12\":{\"string\":\"SMS\"},\"14\":{\"string\":\"Tumblr\"},\"15\":{\"string\":\"Twitter\"},\"16\":{\"string\":\"WhatsApp\"},\"18\":{\"string\":\"Expanda a altura e a largura da sua janela para ver esta experi\xEAncia.\"},\"19\":{\"string\":\"Tem de ativar a experi\xEAncia da hist\xF3ria AMP para ver este conte\xFAdo.\"},\"20\":{\"string\":\"Conseguir\xE1 visualizar melhor esta p\xE1gina no modo retrato.\"},\"21\":{\"string\":\"Lamentamos, mas parece que o seu navegador n\xE3o suporta esta experi\xEAncia.\"},\"22\":{\"string\":\"Aceitar\"},\"23\":{\"string\":\"Recusar\"},\"25\":{\"string\":\"Veja no dom\xEDnio original:\"},\"26\":{\"string\":\"Mais acerca dos resultados AMP\"},\"27\":{\"string\":\"Continuar mesmo assim\"},\"31\":{\"string\":\"Som desativado\"},\"32\":{\"string\":\"Som ativado\"},\"33\":{\"string\":\"Esta p\xE1gina n\xE3o tem som.\"},\"34\":{\"string\":\"Reproduzir v\xEDdeo\"},\"35\":{\"string\":\"Deslizar rapidamente para cima\"},\"36\":{\"string\":\"Expandir twit\"},\"37\":{\"string\":\"Expanda a altura da janela para ver esta experi\xEAncia.\"},\"38\":{\"string\":\"Expanda a largura da janela para ver esta experi\xEAncia.\"},\"63\":{\"string\":\"Line\"}}", function (key, val) {
  if (typeof val === 'object') Object.freeze(val);
  return val;
});
// lgtm[js/syntax-error]
var LocalizedStringsRu = JSON.parse("{\"2\":{\"string\":\"\u041D\u0430\u0436\u043C\u0438\u0442\u0435 \\\"\u0414\u0430\u043B\u0435\u0435\\\"\"},\"3\":{\"string\":\"\u041D\u0430\u0436\u043C\u0438\u0442\u0435 \\\"\u041D\u0430\u0437\u0430\u0434\\\"\"},\"4\":{\"string\":\"\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0441\u043A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u0441\u0441\u044B\u043B\u043A\u0443 \u0432 \u0431\u0443\u0444\u0435\u0440 \u043E\u0431\u043C\u0435\u043D\u0430.\"},\"5\":{\"string\":\"\u0421\u0441\u044B\u043B\u043A\u0430 \u0441\u043A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u043D\u0430\"},\"6\":{\"string\":\"\u041F\u043E \u044D\u043B\u0435\u043A\u0442\u0440\u043E\u043D\u043D\u043E\u0439 \u043F\u043E\u0447\u0442\u0435\"},\"7\":{\"string\":\"Facebook\"},\"8\":{\"string\":\"Google+\"},\"9\":{\"string\":\"\u041F\u043E\u043B\u0443\u0447\u0438\u0442\u044C \u0441\u0441\u044B\u043B\u043A\u0443\"},\"10\":{\"string\":\"LinkedIn\"},\"11\":{\"string\":\"Pinterest\"},\"12\":{\"string\":\"SMS\"},\"14\":{\"string\":\"Tumblr\"},\"15\":{\"string\":\"\u0422\u0432\u0438\u0442\u0442\u0435\u0440\"},\"16\":{\"string\":\"WhatsApp\"},\"18\":{\"string\":\"\u0423\u0432\u0435\u043B\u0438\u0447\u044C\u0442\u0435 \u0432\u044B\u0441\u043E\u0442\u0443 \u0438 \u0448\u0438\u0440\u0438\u043D\u0443 \u043E\u043A\u043D\u0430 \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u0430, \u0447\u0442\u043E\u0431\u044B \u043F\u043E\u0441\u043C\u043E\u0442\u0440\u0435\u0442\u044C \u043A\u043E\u043D\u0442\u0435\u043D\u0442.\"},\"19\":{\"string\":\"\u0414\u043B\u044F \u0434\u043E\u0441\u0442\u0443\u043F\u0430 \u043A \u044D\u0442\u043E\u043C\u0443 \u043A\u043E\u043D\u0442\u0435\u043D\u0442\u0443 \u043D\u0443\u0436\u043D\u043E \u0432\u043A\u043B\u044E\u0447\u0438\u0442\u044C \u044D\u043A\u0441\u043F\u0435\u0440\u0438\u043C\u0435\u043D\u0442 \u0441 AMP-\u0438\u0441\u0442\u043E\u0440\u0438\u044F\u043C\u0438.\"},\"20\":{\"string\":\"\u0421\u0442\u0440\u0430\u043D\u0438\u0446\u0430 \u0434\u043E\u0441\u0442\u0443\u043F\u043D\u0430 \u0442\u043E\u043B\u044C\u043A\u043E \u0432 \u0432\u0435\u0440\u0442\u0438\u043A\u0430\u043B\u044C\u043D\u043E\u0439 \u043E\u0440\u0438\u0435\u043D\u0442\u0430\u0446\u0438\u0438.\"},\"21\":{\"string\":\"\u0412\u0430\u0448 \u0431\u0440\u0430\u0443\u0437\u0435\u0440 \u043D\u0435 \u043F\u043E\u0434\u0434\u0435\u0440\u0436\u0438\u0432\u0430\u0435\u0442 \u044D\u0442\u0443 \u0444\u0443\u043D\u043A\u0446\u0438\u044E.\"},\"22\":{\"string\":\"\u041F\u0440\u0438\u043D\u044F\u0442\u044C\"},\"23\":{\"string\":\"\u041E\u0442\u043A\u043B\u043E\u043D\u0438\u0442\u044C\"},\"25\":{\"string\":\"\u0418\u0441\u0445\u043E\u0434\u043D\u044B\u0439 \u0434\u043E\u043C\u0435\u043D:\"},\"26\":{\"string\":\"\u0421\u0432\u0435\u0434\u0435\u043D\u0438\u044F \u043E AMP-\u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442\u0430\u0445\"},\"27\":{\"string\":\"\u0412\u0441\u0435 \u0440\u0430\u0432\u043D\u043E \u043F\u0440\u043E\u0434\u043E\u043B\u0436\u0438\u0442\u044C\"},\"31\":{\"string\":\"\u0417\u0432\u0443\u043A \u043E\u0442\u043A\u043B\u044E\u0447\u0435\u043D\"},\"32\":{\"string\":\"\u0417\u0432\u0443\u043A \u0432\u043A\u043B\u044E\u0447\u0435\u043D\"},\"33\":{\"string\":\"\u0412 \u043A\u043E\u043D\u0442\u0435\u043D\u0442\u0435 \u043D\u0430 \u0441\u0442\u0440\u0430\u043D\u0438\u0446\u0435 \u043D\u0435\u0442 \u0437\u0432\u0443\u043A\u0430.\"},\"34\":{\"string\":\"\u0412\u043E\u0441\u043F\u0440\u043E\u0438\u0437\u0432\u0435\u0441\u0442\u0438 \u0432\u0438\u0434\u0435\u043E\"},\"35\":{\"string\":\"\u041F\u0440\u043E\u0432\u0435\u0441\u0442\u0438 \u0432\u0432\u0435\u0440\u0445\"},\"36\":{\"string\":\"\u0420\u0430\u0437\u0432\u0435\u0440\u043D\u0443\u0442\u044C \u0442\u0432\u0438\u0442\"},\"37\":{\"string\":\"\u0423\u0432\u0435\u043B\u0438\u0447\u044C\u0442\u0435 \u0432\u044B\u0441\u043E\u0442\u0443 \u043E\u043A\u043D\u0430 \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u0430, \u0447\u0442\u043E\u0431\u044B \u043F\u043E\u0441\u043C\u043E\u0442\u0440\u0435\u0442\u044C \u043A\u043E\u043D\u0442\u0435\u043D\u0442.\"},\"38\":{\"string\":\"\u0423\u0432\u0435\u043B\u0438\u0447\u044C\u0442\u0435 \u0448\u0438\u0440\u0438\u043D\u0443 \u043E\u043A\u043D\u0430 \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u0430, \u0447\u0442\u043E\u0431\u044B \u043F\u043E\u0441\u043C\u043E\u0442\u0440\u0435\u0442\u044C \u043A\u043E\u043D\u0442\u0435\u043D\u0442.\"},\"63\":{\"string\":\"Line\"}}", function (key, val) {
  if (typeof val === 'object') Object.freeze(val);
  return val;
});
// lgtm[js/syntax-error]
var LocalizedStringsTr = JSON.parse("{\"2\":{\"string\":\"Sonraki'ye dokunun\"},\"3\":{\"string\":\"Geri'ye dokunun\"},\"4\":{\"string\":\"Ba\u011Flant\u0131 panoya kopyalanamad\u0131 :(\"},\"5\":{\"string\":\"Ba\u011Flant\u0131 kopyaland\u0131!\"},\"6\":{\"string\":\"E-posta\"},\"7\":{\"string\":\"Facebook\"},\"8\":{\"string\":\"Google+\"},\"9\":{\"string\":\"Ba\u011Flant\u0131y\u0131 Al\"},\"10\":{\"string\":\"LinkedIn\"},\"11\":{\"string\":\"Pinterest\"},\"12\":{\"string\":\"SMS\"},\"14\":{\"string\":\"Tumblr\"},\"15\":{\"string\":\"Twitter\"},\"16\":{\"string\":\"WhatsApp\"},\"18\":{\"string\":\"Bu deneyimi g\xF6rebilmek i\xE7in pencerenizin hem y\xFCksekli\u011Fini hem de geni\u015Fli\u011Fini art\u0131r\u0131n\"},\"19\":{\"string\":\"Bu i\xE7eri\u011Fi g\xF6rebilmek i\xE7in amp hikayesi deneyimini etkinle\u015Ftirmeniz gerekir.\"},\"20\":{\"string\":\"Sayfa en iyi dikey modda g\xF6r\xFCnt\xFClenir\"},\"21\":{\"string\":\"Maalesef taray\u0131c\u0131n\u0131z bu deneyimi desteklemiyor gibi g\xF6r\xFCn\xFCyor\"},\"22\":{\"string\":\"Kabul et\"},\"23\":{\"string\":\"Reddet\"},\"25\":{\"string\":\"Orijinal alanda g\xF6r\xFCnt\xFCle:\"},\"26\":{\"string\":\"AMP sonu\xE7lar\u0131 hakk\u0131nda daha fazla bilgi\"},\"27\":{\"string\":\"Yine de Devam Et\"},\"31\":{\"string\":\"Ses kapal\u0131\"},\"32\":{\"string\":\"Ses a\xE7\u0131k\"},\"33\":{\"string\":\"Bu sayfada ses yok\"},\"34\":{\"string\":\"Videoyu oynat\"},\"35\":{\"string\":\"Yukar\u0131 kayd\u0131r\"},\"36\":{\"string\":\"Tweet'i geni\u015Flet\"},\"37\":{\"string\":\"Bu deneyimi g\xF6rebilmek i\xE7in pencerenizin y\xFCksekli\u011Fini art\u0131r\u0131n\"},\"38\":{\"string\":\"Bu deneyimi g\xF6rebilmek i\xE7in pencerenizin geni\u015Fli\u011Fini art\u0131r\u0131n\"},\"63\":{\"string\":\"Line\"}}", function (key, val) {
  if (typeof val === 'object') Object.freeze(val);
  return val;
});
// lgtm[js/syntax-error]
var LocalizedStringsVi = JSON.parse("{\"2\":{\"string\":\"Nh\u1EA5n v\xE0o Ti\u1EBFp theo\"},\"3\":{\"string\":\"Nh\u1EA5n v\xE0o Quay l\u1EA1i\"},\"4\":{\"string\":\"Kh\xF4ng th\u1EC3 sao ch\xE9p li\xEAn k\u1EBFt v\xE0o khay nh\u1EDB t\u1EA1m :(\"},\"5\":{\"string\":\"\u0110\xE3 sao ch\xE9p li\xEAn k\u1EBFt!\"},\"6\":{\"string\":\"Email\"},\"7\":{\"string\":\"Facebook\"},\"8\":{\"string\":\"Google+\"},\"9\":{\"string\":\"L\u1EA5y li\xEAn k\u1EBFt\"},\"10\":{\"string\":\"LinkedIn\"},\"11\":{\"string\":\"Pinterest\"},\"12\":{\"string\":\"SMS\"},\"14\":{\"string\":\"Tumblr\"},\"15\":{\"string\":\"Twitter\"},\"16\":{\"string\":\"WhatsApp\"},\"18\":{\"string\":\"M\u1EDF r\u1ED9ng c\u1EA3 chi\u1EC1u cao v\xE0 chi\u1EC1u r\u1ED9ng c\u1EEDa s\u1ED5 \u0111\u1EC3 xem tr\u1EA3i nghi\u1EC7m n\xE0y\"},\"19\":{\"string\":\"B\u1EA1n c\u1EA7n ph\u1EA3i b\u1EADt th\u1EED nghi\u1EC7m c\xE2u chuy\u1EC7n amp \u0111\u1EC3 xem n\u1ED9i dung n\xE0y.\"},\"20\":{\"string\":\"Trang n\xE0y \u0111\u01B0\u1EE3c xem t\u1ED1t nh\u1EA5t \u1EDF ch\u1EBF \u0111\u1ED9 ch\xE2n dung\"},\"21\":{\"string\":\"R\u1EA5t ti\u1EBFc, c\xF3 v\u1EBB nh\u01B0 tr\xECnh duy\u1EC7t c\u1EE7a b\u1EA1n kh\xF4ng h\u1ED7 tr\u1EE3 tr\u1EA3i nghi\u1EC7m n\xE0y\"},\"22\":{\"string\":\"Ch\u1EA5p nh\u1EADn\"},\"23\":{\"string\":\"T\u1EEB ch\u1ED1i\"},\"25\":{\"string\":\"Xem tr\xEAn mi\u1EC1n g\u1ED1c:\"},\"26\":{\"string\":\"Th\xEAm th\xF4ng tin v\u1EC1 k\u1EBFt qu\u1EA3 AMP\"},\"27\":{\"string\":\"V\u1EABn ti\u1EBFp t\u1EE5c\"},\"31\":{\"string\":\"T\u1EAFt \xE2m thanh\"},\"32\":{\"string\":\"B\u1EADt \xE2m thanh\"},\"33\":{\"string\":\"Trang n\xE0y kh\xF4ng c\xF3 \xE2m thanh\"},\"34\":{\"string\":\"Ph\xE1t video\"},\"35\":{\"string\":\"Vu\u1ED1t l\xEAn\"},\"36\":{\"string\":\"M\u1EDF r\u1ED9ng Tweet\"},\"37\":{\"string\":\"M\u1EDF r\u1ED9ng chi\u1EC1u cao c\u1EEDa s\u1ED5 \u0111\u1EC3 xem tr\u1EA3i nghi\u1EC7m n\xE0y\"},\"38\":{\"string\":\"M\u1EDF r\u1ED9ng chi\u1EC1u r\u1ED9ng c\u1EEDa s\u1ED5 \u0111\u1EC3 xem tr\u1EA3i nghi\u1EC7m n\xE0y\"},\"63\":{\"string\":\"Line\"}}", function (key, val) {
  if (typeof val === 'object') Object.freeze(val);
  return val;
});
// lgtm[js/syntax-error]
var LocalizedStringsZhCn = JSON.parse("{\"2\":{\"string\":\"\u70B9\u6309\u201C\u4E0B\u4E00\u9875\u201D\"},\"3\":{\"string\":\"\u70B9\u6309\u201C\u8FD4\u56DE\u201D\"},\"4\":{\"string\":\"\u65E0\u6CD5\u5C06\u94FE\u63A5\u590D\u5236\u5230\u526A\u8D34\u677F :(\"},\"5\":{\"string\":\"\u5DF2\u590D\u5236\u94FE\u63A5\uFF01\"},\"6\":{\"string\":\"\u7535\u5B50\u90AE\u4EF6\"},\"7\":{\"string\":\"Facebook\"},\"8\":{\"string\":\"Google+\"},\"9\":{\"string\":\"\u83B7\u53D6\u94FE\u63A5\"},\"10\":{\"string\":\"LinkedIn\"},\"11\":{\"string\":\"Pinterest\"},\"12\":{\"string\":\"\u77ED\u4FE1\"},\"14\":{\"string\":\"Tumblr\"},\"15\":{\"string\":\"Twitter\"},\"16\":{\"string\":\"WhatsApp\"},\"18\":{\"string\":\"\u8981\u67E5\u770B\u8FD9\u79CD\u4F53\u9A8C\uFF0C\u8BF7\u540C\u65F6\u52A0\u5927\u7A97\u53E3\u9AD8\u5EA6\u548C\u5BBD\u5EA6\"},\"19\":{\"string\":\"\u60A8\u5FC5\u987B\u542F\u7528 amp-story \u5B9E\u9A8C\u6027\u529F\u80FD\uFF0C\u624D\u80FD\u67E5\u770B\u6B64\u5185\u5BB9\u3002\"},\"20\":{\"string\":\"\u6700\u597D\u4EE5\u7EB5\u5411\u6A21\u5F0F\u67E5\u770B\u6B64\u9875\u9762\"},\"21\":{\"string\":\"\u62B1\u6B49\uFF0C\u60A8\u7684\u6D4F\u89C8\u5668\u597D\u50CF\u4E0D\u652F\u6301\u8FD9\u79CD\u4F53\u9A8C\"},\"22\":{\"string\":\"\u63A5\u53D7\"},\"23\":{\"string\":\"\u62D2\u7EDD\"},\"25\":{\"string\":\"\u5728\u539F\u59CB\u7F51\u57DF\u4E2D\u67E5\u770B\uFF1A\"},\"26\":{\"string\":\"\u5173\u4E8E AMP \u7ED3\u679C\u7684\u66F4\u591A\u5185\u5BB9\"},\"27\":{\"string\":\"\u4ECD\u7136\u7EE7\u7EED\"},\"31\":{\"string\":\"\u58F0\u97F3\u5DF2\u5173\u95ED\"},\"32\":{\"string\":\"\u58F0\u97F3\u5DF2\u5F00\u542F\"},\"33\":{\"string\":\"\u6B64\u9875\u6CA1\u6709\u58F0\u97F3\"},\"34\":{\"string\":\"\u64AD\u653E\u89C6\u9891\"},\"35\":{\"string\":\"\u5411\u4E0A\u6ED1\u52A8\"},\"36\":{\"string\":\"\u5C55\u5F00 Twitter \u5FAE\u535A\"},\"37\":{\"string\":\"\u8981\u67E5\u770B\u8FD9\u79CD\u4F53\u9A8C\uFF0C\u8BF7\u52A0\u5927\u7A97\u53E3\u9AD8\u5EA6\"},\"38\":{\"string\":\"\u8981\u67E5\u770B\u8FD9\u79CD\u4F53\u9A8C\uFF0C\u8BF7\u52A0\u5927\u7A97\u53E3\u5BBD\u5EA6\"},\"63\":{\"string\":\"Line\"}}", function (key, val) {
  if (typeof val === 'object') Object.freeze(val);
  return val;
});
// lgtm[js/syntax-error]
var LocalizedStringsZhTw = JSON.parse("{\"2\":{\"string\":\"\u8F15\u89F8 [\u4E0B\u4E00\u9801]\"},\"3\":{\"string\":\"\u8F15\u89F8 [\u4E0A\u4E00\u9801]\"},\"4\":{\"string\":\"\u7121\u6CD5\u5C07\u9023\u7D50\u8907\u88FD\u5230\u526A\u8CBC\u7C3F :(\"},\"5\":{\"string\":\"\u5DF2\u8907\u88FD\u9023\u7D50\uFF01\"},\"6\":{\"string\":\"\u96FB\u5B50\u90F5\u4EF6\"},\"7\":{\"string\":\"Facebook\"},\"8\":{\"string\":\"Google+\"},\"9\":{\"string\":\"\u53D6\u5F97\u9023\u7D50\"},\"10\":{\"string\":\"LinkedIn\"},\"11\":{\"string\":\"Pinterest\"},\"12\":{\"string\":\"\u7C21\u8A0A\"},\"14\":{\"string\":\"Tumblr\"},\"15\":{\"string\":\"Twitter\"},\"16\":{\"string\":\"WhatsApp\"},\"18\":{\"string\":\"\u5982\u8981\u67E5\u770B\u6545\u4E8B\uFF0C\u8ACB\u5C07\u8996\u7A97\u8ABF\u9AD8\u4E26\u8ABF\u5BEC\"},\"19\":{\"string\":\"\u4F60\u5FC5\u9808\u555F\u7528 AMP \u6545\u4E8B\u5BE6\u9A57\u624D\u80FD\u67E5\u770B\u6B64\u5167\u5BB9\u3002\"},\"20\":{\"string\":\"\u4F60\u53EA\u80FD\u7E31\u5411\u67E5\u770B\u9019\u500B\u9801\u9762\"},\"21\":{\"string\":\"\u5F88\u62B1\u6B49\uFF0C\u4F60\u7684\u700F\u89BD\u5668\u4E0D\u652F\u63F4\u9019\u9805\u670D\u52D9\"},\"22\":{\"string\":\"\u63A5\u53D7\"},\"23\":{\"string\":\"\u62D2\u7D55\"},\"25\":{\"string\":\"\u5728\u539F\u59CB\u7DB2\u57DF\u4E2D\u67E5\u770B\uFF1A\"},\"26\":{\"string\":\"\u66F4\u591A\u8207 AMP \u7D50\u679C\u76F8\u95DC\u7684\u8CC7\u8A0A\"},\"27\":{\"string\":\"\u4ECD\u8981\u7E7C\u7E8C\"},\"31\":{\"string\":\"\u5DF2\u95DC\u9589\u97F3\u6548\"},\"32\":{\"string\":\"\u5DF2\u958B\u555F\u97F3\u6548\"},\"33\":{\"string\":\"\u9019\u500B\u9801\u9762\u6C92\u6709\u97F3\u6548\"},\"34\":{\"string\":\"\u64AD\u653E\u5F71\u7247\"},\"35\":{\"string\":\"\u5411\u4E0A\u6ED1\u52D5\"},\"36\":{\"string\":\"\u5C55\u958B Tweet\"},\"37\":{\"string\":\"\u5982\u8981\u67E5\u770B\u6545\u4E8B\uFF0C\u8ACB\u5C07\u8996\u7A97\u9AD8\u5EA6\u8ABF\u9AD8\"},\"38\":{\"string\":\"\u5982\u8981\u67E5\u770B\u6545\u4E8B\uFF0C\u8ACB\u5C07\u8996\u7A97\u5BEC\u5EA6\u8ABF\u5BEC\"},\"63\":{\"string\":\"Line\"}}", function (key, val) {
  if (typeof val === 'object') Object.freeze(val);
  return val;
});
// lgtm[js/syntax-error]

/** @private @const {number} */
var DESKTOP_WIDTH_THRESHOLD = 1024;

/** @private @const {number} */
var DESKTOP_HEIGHT_THRESHOLD = 550;

/**
 * NOTE: If udpated here, update in amp-story-player-impl.js
 * @private @const {string}
 */
var DESKTOP_ONE_PANEL_ASPECT_RATIO_THRESHOLD = '3 / 4';

/** @private @const {number} */
var MIN_SWIPE_FOR_HINT_OVERLAY_PX = 50;

/** @enum {string} */
var Attributes = {
  AD_SHOWING: 'ad-showing',
  ADVANCE_TO: 'i-amphtml-advance-to',
  AUTO_ADVANCE_AFTER: 'auto-advance-after',
  AUTO_ADVANCE_TO: 'auto-advance-to',
  DESKTOP_POSITION: 'i-amphtml-desktop-position',
  MUTED: 'muted',
  ORIENTATION: 'orientation',
  PUBLIC_ADVANCE_TO: 'advance-to',
  RETURN_TO: 'i-amphtml-return-to',
  STANDALONE: 'standalone',
  SUPPORTS_LANDSCAPE: 'supports-landscape',
  // Attributes that desktop css looks for to decide where pages will be placed
  VISITED: 'i-amphtml-visited' // stacked offscreen to left

};

/**
 * The duration of time (in milliseconds) to wait for the Story initial content
 * to be loaded before marking the story as loaded.
 * @const {number}
 */
var INITIAL_CONTENT_LOAD_TIMEOUT_MS = 8000;

/**
 * Single page ads may be injected later. If the original story contains 0 media
 * elements the mediaPool will not be able to handle the injected audio/video
 * Therefore we preallocate a minimum here.
 * @const {number}
 */
var MINIMUM_AD_MEDIA_ELEMENTS = 2;

/**
 * CSS class for an amp-story that indicates the initial load for the story has
 * completed.
 * @const {string}
 */
var STORY_LOADED_CLASS_NAME = 'i-amphtml-story-loaded';

/**
 * CSS class for the opacity layer that separates the amp-sidebar and the rest
 * of the story when the amp-sidebar is entering the screen.
 * @const {string}
 */
var OPACITY_MASK_CLASS_NAME = 'i-amphtml-story-opacity-mask';

/**
 * CSS class for sidebars in stories.
 * @const {string}
 */
var SIDEBAR_CLASS_NAME = 'i-amphtml-story-sidebar';

/** @const {!Object<string, number>} */
var MAX_MEDIA_ELEMENT_COUNTS = (_MAX_MEDIA_ELEMENT_CO = {}, _MAX_MEDIA_ELEMENT_CO[MediaType.AUDIO] = 4, _MAX_MEDIA_ELEMENT_CO[MediaType.VIDEO] = 8, _MAX_MEDIA_ELEMENT_CO);

/** @type {string} */
var TAG = 'amp-story';

/**
 * The default dark gray for chrome supported theme color.
 * @const {string}
 */
var DEFAULT_THEME_COLOR = '#202125';

/**
 * MutationObserverInit options to listen for changes to the `open` attribute.
 */
var SIDEBAR_OBSERVER_OPTIONS = {
  attributes: true,
  attributeFilter: ['open']
};

/**
 * @implements {./media-pool.MediaPoolRoot}
 */
export var AmpStory = /*#__PURE__*/function (_AMP$BaseElement) {
  _inherits(AmpStory, _AMP$BaseElement);

  var _super = _createSuper(AmpStory);

  /** @param {!AmpElement} element */
  function AmpStory(element) {
    var _this;

    _classCallCheck(this, AmpStory);

    _this = _super.call(this, element);

    /** @private @const {!./amp-story-store-service.AmpStoryStoreService} */
    _this.storeService_ = getStoreService(_this.win);

    // Check if story is RTL.
    if (isRTL(_this.win.document)) {
      _this.storeService_.dispatch(Action.TOGGLE_RTL, true);
    }

    /** @private {!./story-analytics.StoryAnalyticsService} */
    _this.analyticsService_ = getAnalyticsService(_this.win, _this.element);

    /** @private @const {!AdvancementConfig} */
    _this.advancement_ = AdvancementConfig.forElement(_this.win, _this.element);

    _this.advancement_.start();

    /** @const @private {!../../../src/service/vsync-impl.Vsync} */
    _this.vsync_ = _this.getVsync();

    /** @private @const {!ShareMenu} Preloads and prerenders the share menu. */
    _this.shareMenu_ = new ShareMenu(_this.win, _this.element);

    /** @private @const {!SystemLayer} */
    _this.systemLayer_ = new SystemLayer(_this.win, _this.element);

    /** Instantiate in case there are embedded components. */
    new AmpStoryEmbeddedComponent(_this.win, _this.element);

    /** @private @const {!UnsupportedBrowserLayer} */
    _this.unsupportedBrowserLayer_ = new UnsupportedBrowserLayer(_this.win);

    /** Instantiates the viewport warning layer. */
    new ViewportWarningLayer(_this.win, _this.element, DESKTOP_WIDTH_THRESHOLD, DESKTOP_HEIGHT_THRESHOLD);

    /** @private {!Array<!./amp-story-page.AmpStoryPage>} */
    _this.pages_ = [];

    /** @private @const {!Array<!./amp-story-page.AmpStoryPage>} */
    _this.adPages_ = [];

    /** @const @private {!./variable-service.AmpStoryVariableService} */
    _this.variableService_ = getVariableService(_this.win);

    /** @private {?./amp-story-page.AmpStoryPage} */
    _this.activePage_ = null;

    /** @private @const */
    _this.desktopMedia_ = _this.win.matchMedia("(min-width: " + DESKTOP_WIDTH_THRESHOLD + "px) and " + ("(min-height: " + DESKTOP_HEIGHT_THRESHOLD + "px)"));

    /** @private @const */
    _this.desktopOnePanelMedia_ = _this.win.matchMedia("(min-aspect-ratio: " + DESKTOP_ONE_PANEL_ASPECT_RATIO_THRESHOLD + ")");

    /** @private @const */
    _this.canRotateToDesktopMedia_ = _this.win.matchMedia("(min-width: " + DESKTOP_HEIGHT_THRESHOLD + "px) and " + ("(min-height: " + DESKTOP_WIDTH_THRESHOLD + "px)"));

    /** @private @const */
    _this.landscapeOrientationMedia_ = _this.win.matchMedia('(orientation: landscape)');

    /** @private {?HTMLMediaElement} */
    _this.backgroundAudioEl_ = null;

    /** @private {!AmpStoryHint} */
    _this.ampStoryHint_ = new AmpStoryHint(_this.win, _this.element);

    /** @private {!MediaPool} */
    _this.mediaPool_ = MediaPool.for(_assertThisInitialized(_this));

    /** @private {boolean} */
    _this.areAccessAuthorizationsCompleted_ = false;

    /** @private */
    _this.navigateToPageAfterAccess_ = null;

    /** @private @const {!../../../src/service/timer-impl.Timer} */
    _this.timer_ = Services.timerFor(_this.win);

    /** @private @const {!../../../src/service/platform-impl.Platform} */
    _this.platform_ = Services.platformFor(_this.win);

    /** @private {?../../../src/service/viewer-interface.ViewerInterface} */
    _this.viewer_ = null;

    /** @private {?AmpStoryViewerMessagingHandler} */
    _this.viewerMessagingHandler_ = null;

    /** @private {?../../../src/service/localization.LocalizationService} */
    _this.localizationService_ = null;

    /**
     * Store the current paused state, to make sure the story does not play on
     * resume if it was previously paused. null when nothing to restore.
     * @private {?boolean}
     */
    _this.pausedStateToRestore_ = null;

    /** @private {?Element} */
    _this.sidebar_ = null;

    /** @private {?MutationObserver} */
    _this.sidebarObserver_ = null;

    /** @private {?Element} */
    _this.maskElement_ = null;

    /** @private {?LiveStoryManager} */
    _this.liveStoryManager_ = null;

    /** @private {?BackgroundBlur} */
    _this.backgroundBlur_ = null;
    return _this;
  }

  /** @override */
  _createClass(AmpStory, [{
    key: "buildCallback",
    value: function buildCallback() {
      var _this2 = this;

      this.viewer_ = Services.viewerForDoc(this.element);
      this.viewerMessagingHandler_ = this.viewer_.isEmbedded() ? new AmpStoryViewerMessagingHandler(this.win, this.viewer_) : null;
      this.localizationService_ = getLocalizationService(this.element);
      this.localizationService_.registerLocalizedStringBundle('default', LocalizedStringsDefault).registerLocalizedStringBundle('ar', LocalizedStringsAr).registerLocalizedStringBundle('de', LocalizedStringsDe).registerLocalizedStringBundle('en', LocalizedStringsEn).registerLocalizedStringBundle('en-GB', LocalizedStringsEnGb).registerLocalizedStringBundle('es', LocalizedStringsEs).registerLocalizedStringBundle('es-419', LocalizedStringsEs419).registerLocalizedStringBundle('fr', LocalizedStringsFr).registerLocalizedStringBundle('hi', LocalizedStringsHi).registerLocalizedStringBundle('id', LocalizedStringsId).registerLocalizedStringBundle('it', LocalizedStringsIt).registerLocalizedStringBundle('ja', LocalizedStringsJa).registerLocalizedStringBundle('ko', LocalizedStringsKo).registerLocalizedStringBundle('nl', LocalizedStringsNl).registerLocalizedStringBundle('no', LocalizedStringsNo).registerLocalizedStringBundle('pt-PT', LocalizedStringsPtPt).registerLocalizedStringBundle('pt-BR', LocalizedStringsPtBr).registerLocalizedStringBundle('ru', LocalizedStringsRu).registerLocalizedStringBundle('tr', LocalizedStringsTr).registerLocalizedStringBundle('vi', LocalizedStringsVi).registerLocalizedStringBundle('zh-CN', LocalizedStringsZhCn).registerLocalizedStringBundle('zh-TW', LocalizedStringsZhTw);
      var enXaPseudoLocaleBundle = createPseudoLocale(LocalizedStringsEn, function (s) {
        return "[" + s + " one two]";
      });
      this.localizationService_.registerLocalizedStringBundle('en-xa', enXaPseudoLocaleBundle);

      if (this.isStandalone_()) {
        this.initializeStandaloneStory_();
      }

      // buildCallback already runs in a mutate context. Calling another
      // mutateElement explicitly will force the runtime to remeasure the
      // amp-story element, fixing rendering bugs where the story is inactive
      // (layoutCallback not called) when accessed from any viewer using
      // prerendering, because of a height incorrectly set to 0.
      this.mutateElement(function () {});
      var pageId = this.getInitialPageId_();

      if (pageId) {
        var page = this.element.querySelector("amp-story-page#" + escapeCssSelectorIdent(pageId));
        page.setAttribute('active', '');
      }

      this.initializeStyles_();
      this.initializeListeners_();
      this.initializeListenersForDev_();
      this.initializePageIds_();
      this.initializeStoryPlayer_();
      this.storeService_.dispatch(Action.TOGGLE_UI, this.getUIType_());

      // Removes title in order to prevent incorrect titles appearing on link
      // hover. (See 17654)
      if (!this.platform_.isBot()) {
        this.element.removeAttribute('title');
      }

      // Remove text nodes which would be shown outside of the amp-story
      var textNodes = childNodes(this.element, function (node) {
        return node.nodeType === Node.TEXT_NODE;
      });
      textNodes.forEach(function (node) {
        _this2.element.removeChild(node);
      });

      if (isExperimentOn(this.win, 'amp-story-branching')) {
        this.registerAction('goToPage', function (invocation) {
          var args = invocation.args;

          if (!args) {
            return;
          }

          _this2.storeService_.dispatch(Action.SET_ADVANCEMENT_MODE, AdvancementMode.GO_TO_PAGE);

          // If open, closes the sidebar before navigating.
          var promise = _this2.storeService_.get(StateProperty.SIDEBAR_STATE) ? Services.historyForDoc(_this2.getAmpDoc()).goBack() : _resolvedPromise();
          promise.then(function () {
            return _this2.switchTo_(args['id'], NavigationDirection.NEXT);
          });
        });
      }

      if (isExperimentOn(this.win, 'story-load-first-page-only')) {
        Services.performanceFor(this.win).addEnabledExperiment('story-load-first-page-only');
      }

      if (isExperimentOn(this.win, 'story-disable-animations-first-page') || prefersReducedMotion(this.win)) {
        Services.performanceFor(this.win).addEnabledExperiment('story-disable-animations-first-page');
      }

      if (isExperimentOn(this.win, 'story-load-inactive-outside-viewport')) {
        Services.performanceFor(this.win).addEnabledExperiment('story-load-inactive-outside-viewport');
        this.element.classList.add('i-amphtml-experiment-story-load-inactive-outside-viewport');
      }

      if (this.maybeLoadStoryDevTools_()) {
        return;
      }
    }
    /**
     * Pauses the whole story on viewer visibilityState updates, or tab visibility
     * updates.
     * @private
     */

  }, {
    key: "pause_",
    value: function pause_() {
      // Preserve if previously set. This method can be called several times when
      // setting the visibilitystate to paused and then inactive.
      if (this.pausedStateToRestore_ === null) {
        this.pausedStateToRestore_ = !!this.storeService_.get(StateProperty.PAUSED_STATE);
      }

      this.storeService_.dispatch(Action.TOGGLE_PAUSED, true);

      if (!this.storeService_.get(StateProperty.MUTED_STATE)) {
        this.pauseBackgroundAudio_();
      }

      // If viewer has navigated to the next document, reset the active page.
      if (this.getAmpDoc().getVisibilityState() === VisibilityState.INACTIVE) {
        this.activePage_.setState(PageState.NOT_ACTIVE);
        this.activePage_.element.setAttribute('active', '');
      }
    }
    /**
     * Resumes the whole story on viewer visibilityState updates, or tab
     * visibility updates.
     * @private
     */

  }, {
    key: "resume_",
    value: function resume_() {
      this.storeService_.dispatch(Action.TOGGLE_PAUSED, this.pausedStateToRestore_);
      this.pausedStateToRestore_ = null;

      if (!this.storeService_.get(StateProperty.MUTED_STATE)) {
        this.playBackgroundAudio_();
      }
    }
    /**
     * Note: runs in the buildCallback vsync mutate context.
     * @private
     */

  }, {
    key: "initializeStandaloneStory_",
    value: function initializeStandaloneStory_() {
      var html = this.win.document.documentElement;
      html.classList.add('i-amphtml-story-standalone');
      // Lock body to prevent overflow.
      this.lockBody_();
      // Standalone CSS affects sizing of the entire page.
      this.onResize();
    }
    /** @private */

  }, {
    key: "initializeStyles_",
    value: function initializeStyles_() {
      var mediaQueryEls = this.element.querySelectorAll('media-query');

      if (mediaQueryEls.length) {
        this.initializeMediaQueries_(mediaQueryEls);
      }

      var styleEl = this.win.document.querySelector('style[amp-custom]');

      if (styleEl) {
        this.rewriteStyles_(styleEl);
      }
    }
    /**
     * Registers the media queries
     * @param {!NodeList<!Element>} mediaQueryEls
     * @private
     */

  }, {
    key: "initializeMediaQueries_",
    value: function initializeMediaQueries_(mediaQueryEls) {
      var _this3 = this;

      var service = getMediaQueryService(this.win);

      var onMediaQueryMatch = function onMediaQueryMatch(matches, className) {
        _this3.mutateElement(function () {
          _this3.element.classList.toggle(className, matches);
        });
      };

      toArray(mediaQueryEls).forEach(function (el) {
        var className = el.getAttribute('class-name');
        var media = el.getAttribute('media');

        if (className && media) {
          service.onMediaQueryMatch(media, function (matches) {
            return onMediaQueryMatch(matches, className);
          });
        }
      });
    }
    /**
     * Initializes page ids by deduplicating them.
     * @private
     */

  }, {
    key: "initializePageIds_",
    value: function initializePageIds_() {
      var pageEls = this.element.querySelectorAll('amp-story-page');
      var pageIds = toArray(pageEls).map(function (el) {
        return el.id || 'default-page';
      });
      var idsMap = map();

      for (var i = 0; i < pageIds.length; i++) {
        if (idsMap[pageIds[i]] === undefined) {
          idsMap[pageIds[i]] = 0;
          continue;
        }

        user().error(TAG, "Duplicate amp-story-page ID " + pageIds[i]);
        var newId = pageIds[i] + "__" + ++idsMap[pageIds[i]];
        pageEls[i].id = newId;
        pageIds[i] = newId;
      }

      this.storeService_.dispatch(Action.SET_PAGE_IDS, pageIds);
    }
    /**
     * @param {!Element} styleEl
     * @private
     */

  }, {
    key: "rewriteStyles_",
    value: function rewriteStyles_(styleEl) {
      // TODO(#15955): Update this to use CssContext from
      // ../../../extensions/amp-animation/0.1/web-animations.js
      this.mutateElement(function () {
        styleEl.textContent = styleEl.textContent.replace(/(-?[\d.]+)vh/gim, 'calc($1 * var(--story-page-vh))').replace(/(-?[\d.]+)vw/gim, 'calc($1 * var(--story-page-vw))').replace(/(-?[\d.]+)vmin/gim, 'calc($1 * var(--story-page-vmin))').replace(/(-?[\d.]+)vmax/gim, 'calc($1 * var(--story-page-vmax))');
      });
    }
    /**
     * @private
     */

  }, {
    key: "setThemeColor_",
    value: function setThemeColor_() {
      // Don't override the publisher's tag.
      if (this.win.document.querySelector('meta[name=theme-color]')) {
        return;
      }

      // The theme color should be copied from the story's primary accent color
      // if possible, with the fall back being default dark gray.
      var meta = this.win.document.createElement('meta');
      var ampStoryPageEl = this.element.querySelector('amp-story-page');
      meta.name = 'theme-color';
      meta.content = computedStyle(this.win, this.element).getPropertyValue('--primary-color') || computedStyle(this.win, dev().assertElement(ampStoryPageEl)).getPropertyValue('background-color') || DEFAULT_THEME_COLOR;
      this.win.document.head.appendChild(meta);
    }
    /**
     * Builds the system layer DOM.
     * @param {string} initialPageId
     * @private
     */

  }, {
    key: "buildSystemLayer_",
    value: function buildSystemLayer_(initialPageId) {
      this.updateAudioIcon_();
      this.updatePausedIcon_();
      this.element.appendChild(this.systemLayer_.build(initialPageId));
    }
    /** @private */

  }, {
    key: "initializeListeners_",
    value: function initializeListeners_() {
      var _this4 = this;

      this.element.addEventListener(EventType.NEXT_PAGE, function () {
        _this4.next_();
      });
      this.element.addEventListener(EventType.PREVIOUS_PAGE, function () {
        _this4.previous_();
      });
      this.storeService_.subscribe(StateProperty.MUTED_STATE, function (isMuted) {
        _this4.onMutedStateUpdate_(isMuted);

        _this4.variableService_.onVariableUpdate(AnalyticsVariable.STORY_IS_MUTED, isMuted);
      }, true
      /** callToInitialize */
      );
      this.storeService_.subscribe(StateProperty.MUTED_STATE, function (isMuted) {
        // We do not want to trigger an analytics event for the initialization of
        // the muted state.
        _this4.analyticsService_.triggerEvent(isMuted ? StoryAnalyticsEvent.STORY_MUTED : StoryAnalyticsEvent.STORY_UNMUTED);
      }, false
      /** callToInitialize */
      );
      this.storeService_.subscribe(StateProperty.SUPPORTED_BROWSER_STATE, function (isBrowserSupported) {
        _this4.onSupportedBrowserStateUpdate_(isBrowserSupported);
      });
      this.storeService_.subscribe(StateProperty.ADVANCEMENT_MODE, function (mode) {
        _this4.variableService_.onVariableUpdate(AnalyticsVariable.STORY_ADVANCEMENT_MODE, mode);
      });
      this.storeService_.subscribe(StateProperty.CAN_SHOW_AUDIO_UI, function (show) {
        _this4.element.classList.toggle('i-amphtml-story-no-audio-ui', !show);
      }, true
      /** callToInitialize */
      );
      this.element.addEventListener(EventType.SWITCH_PAGE, function (e) {
        _this4.switchTo_(getDetail(e)['targetPageId'], getDetail(e)['direction']);

        _this4.ampStoryHint_.hideAllNavigationHint();
      });
      this.element.addEventListener(EventType.PAGE_PROGRESS, function (e) {
        var detail = getDetail(e);
        var pageId = detail['pageId'];
        var progress = detail['progress'];

        if (pageId !== _this4.activePage_.element.id) {
          // Ignore progress update events from inactive pages.
          return;
        }

        if (!_this4.activePage_.isAd()) {
          _this4.systemLayer_.updateProgress(pageId, progress);
        }
      });
      this.element.addEventListener(EventType.REPLAY, function () {
        _this4.replay_();
      });
      this.element.addEventListener(EventType.NO_NEXT_PAGE, function () {
        _this4.onNoNextPage_();
      });
      this.element.addEventListener(EventType.NO_PREVIOUS_PAGE, function () {
        _this4.onNoPreviousPage_();
      });
      this.advancement_.addOnTapNavigationListener(function (direction) {
        _this4.performTapNavigation_(direction);
      });
      this.element.addEventListener(EventType.DISPATCH_ACTION, function (e) {
        if (!getMode().test) {
          return;
        }

        var action = getDetail(e)['action'];
        var data = getDetail(e)['data'];

        _this4.storeService_.dispatch(action, data);
      });
      // Actions allowlist could be initialized empty, or with some actions some
      // other components registered.
      this.storeService_.subscribe(StateProperty.ACTIONS_ALLOWLIST, function (actionsAllowlist) {
        var actions = Services.actionServiceForDoc(_this4.element);
        actions.setAllowlist(actionsAllowlist);
      }, true
      /** callToInitialize */
      );
      this.storeService_.subscribe(StateProperty.AD_STATE, function (isAd) {
        _this4.onAdStateUpdate_(isAd);
      });
      this.storeService_.subscribe(StateProperty.PAUSED_STATE, function (isPaused) {
        _this4.onPausedStateUpdate_(isPaused);
      });
      this.storeService_.subscribe(StateProperty.SIDEBAR_STATE, function (sidebarState) {
        _this4.onSidebarStateUpdate_(sidebarState);
      });
      this.storeService_.subscribe(StateProperty.UI_STATE, function (uiState) {
        _this4.onUIStateUpdate_(uiState);
      }, true
      /** callToInitialize */
      );
      this.win.document.addEventListener('keydown', function (e) {
        _this4.onKeyDown_(e);
      }, true);
      this.win.document.addEventListener('contextmenu', function (e) {
        var uiState = _this4.storeService_.get(StateProperty.UI_STATE);

        if (uiState === UIType.MOBILE) {
          if (!_this4.allowContextMenuOnMobile_(e.target)) {
            e.preventDefault();
          }

          e.stopPropagation();
        }
      });
      this.getAmpDoc().onVisibilityChanged(function () {
        return _this4.onVisibilityChanged_();
      });
      this.win.addEventListener('hashchange', function () {
        var maybePageId = parseQueryString(_this4.win.location.hash)['page'];

        if (!maybePageId || !_this4.isActualPage_(maybePageId)) {
          return;
        }

        _this4.switchTo_(maybePageId, NavigationDirection.NEXT);

        // Removes the page 'hash' parameter from the URL.
        var href = _this4.win.location.href.replace(new RegExp("page=" + maybePageId + "&?"), '');

        if (endsWith(href, '#')) {
          href = href.slice(0, -1);
        }

        _this4.win.history.replaceState(_this4.win.history && getWindowHistoryState(_this4.win.history) || {}
        /** data */
        , _this4.win.document.title
        /** title */
        , href
        /** URL */
        );
      });
      // Listen for class mutations on the <body> element.
      var bodyElObserver = new this.win.MutationObserver(function (mutations) {
        return _this4.onBodyElMutation_(mutations);
      });
      bodyElObserver.observe(this.win.document.body, {
        attributes: true,
        attributeFilter: ['class']
      });
      this.getViewport().onResize(debounce(this.win, function () {
        return _this4.onResize();
      }, 300));
      this.installGestureRecognizers_();
      // TODO(gmajoulet): migrate this to amp-story-viewer-messaging-handler once
      // there is a way to navigate to pages that does not involve using private
      // amp-story methods.
      this.viewer_.onMessage('selectPage', function (data) {
        return _this4.onSelectPage_(data);
      });
      this.viewer_.onMessage('rewind', function () {
        return _this4.onRewind_();
      });

      if (this.viewerMessagingHandler_) {
        this.viewerMessagingHandler_.startListening();
      }
    }
    /** @private */

  }, {
    key: "onBodyElMutation_",
    value: function onBodyElMutation_(mutations) {
      var _this5 = this;

      mutations.forEach(function (mutation) {
        var bodyEl = dev().assertElement(mutation.target);

        // Updates presence of the `amp-mode-keyboard-active` class on the store.
        _this5.storeService_.dispatch(Action.TOGGLE_KEYBOARD_ACTIVE_STATE, bodyEl.classList.contains('amp-mode-keyboard-active'));
      });
    }
    /** @private */

  }, {
    key: "installGestureRecognizers_",
    value: function installGestureRecognizers_() {
      var _this6 = this;

      // If the story is within a viewer that enabled the swipe capability, this
      // disables the navigation education overlay to enable:
      //   - horizontal swipe events to the next story
      //   - vertical swipe events to close the viewer, or open a page attachment
      if (this.viewer_.hasCapability('swipe')) {
        return;
      }

      var element = this.element;
      var gestures = Gestures.get(element,
      /* shouldNotPreventDefault */
      true);
      // Shows "tap to navigate" hint when swiping.
      gestures.onGesture(SwipeXYRecognizer, function (gesture) {
        var _gesture$data = gesture.data,
            deltaX = _gesture$data.deltaX,
            deltaY = _gesture$data.deltaY;

        var embedComponent =
        /** @type {InteractiveComponentDef} */
        _this6.storeService_.get(StateProperty.INTERACTIVE_COMPONENT_STATE);

        // TODO(enriqe): Move to a separate file if this keeps growing.
        if (embedComponent.state !== EmbeddedComponentState.HIDDEN || _this6.storeService_.get(StateProperty.ACCESS_STATE) || _this6.storeService_.get(StateProperty.SIDEBAR_STATE) || !_this6.storeService_.get(StateProperty.SYSTEM_UI_IS_VISIBLE_STATE) || !_this6.storeService_.get(StateProperty.CAN_SHOW_NAVIGATION_OVERLAY_HINT)) {
          // Cancels the event for this gesture entirely, ensuring the hint won't
          // show even if the user keeps swiping without releasing the touch.
          if (gesture.event && gesture.event.cancelable !== false) {
            gesture.event.preventDefault();
          }

          return;
        }

        if (gesture.event && gesture.event.defaultPrevented || !_this6.isSwipeLargeEnoughForHint_(deltaX, deltaY)) {
          return;
        }

        _this6.ampStoryHint_.showNavigationOverlay();
      });
    }
    /**
     * @param {number} deltaX
     * @param {number} deltaY
     * @return {boolean}
     * @private
     */

  }, {
    key: "isSwipeLargeEnoughForHint_",
    value: function isSwipeLargeEnoughForHint_(deltaX, deltaY) {
      var sideSwipe = Math.abs(deltaX) >= MIN_SWIPE_FOR_HINT_OVERLAY_PX;
      var upSwipe = -1 * deltaY >= MIN_SWIPE_FOR_HINT_OVERLAY_PX;
      return sideSwipe || upSwipe;
    }
    /** @private */

  }, {
    key: "initializeListenersForDev_",
    value: function initializeListenersForDev_() {
      var _this7 = this;

      if (!getMode().development) {
        return;
      }

      this.element.addEventListener(EventType.DEV_LOG_ENTRIES_AVAILABLE, function (e) {
        _this7.systemLayer_.logAll(
        /** @type {?} */
        getDetail(e));
      });
    }
    /** @private */

  }, {
    key: "lockBody_",
    value: function lockBody_() {
      var document = this.win.document;
      setImportantStyles(document.documentElement, {
        'overflow': 'hidden'
      });
      setImportantStyles(document.body, {
        'overflow': 'hidden'
      });
      this.getViewport().resetTouchZoom();
      this.getViewport().disableTouchZoom();
      this.maybeLockScreenOrientation_();
    }
    /** @private */

  }, {
    key: "maybeLockScreenOrientation_",
    value: function maybeLockScreenOrientation_() {
      var screen = this.win.screen;

      if (!screen || !this.canRotateToDesktopMedia_.matches) {
        return;
      }

      var lockOrientation = screen.orientation.lock || screen.lockOrientation || screen.mozLockOrientation || screen.msLockOrientation || function (unusedOrientation) {};

      try {
        lockOrientation('portrait');
      } catch (e) {
        dev().warn(TAG, 'Failed to lock screen orientation:', e.message);
      }
    }
    /** @override */

  }, {
    key: "layoutCallback",
    value: function layoutCallback() {
      if (!AmpStory.isBrowserSupported(this.win) && !this.platform_.isBot()) {
        this.storeService_.dispatch(Action.TOGGLE_SUPPORTED_BROWSER, false);
        return _resolvedPromise2();
      }

      return this.layoutStory_();
    }
    /**
     * Renders the layout for the story.
     * @return {!Promise} A promise that is resolved when the story layout is
     *       loaded
     * @private
     */

  }, {
    key: "layoutStory_",
    value: function layoutStory_() {
      var _this8 = this;

      var initialPageId = this.getInitialPageId_();
      this.buildSystemLayer_(initialPageId);
      this.initializeSidebar_();
      this.setThemeColor_();
      var storyLayoutPromise = Promise.all([this.getAmpDoc().whenFirstVisible(), // Pauses execution during prerender.
      this.initializePages_()]).then(function () {
        _this8.handleConsentExtension_();

        _this8.initializeStoryAccess_();

        _this8.pages_.forEach(function (page, index) {
          page.setState(PageState.NOT_ACTIVE);

          _this8.upgradeCtaAnchorTagsForTracking_(page, index);
        });

        _this8.initializeStoryNavigationPath_();

        // Build pagination buttons if they can be displayed.
        if (_this8.storeService_.get(StateProperty.CAN_SHOW_PAGINATION_BUTTONS)) {
          new PaginationButtons(_this8);
        }
      }).then(function () {
        return (// We need to call this.getInitialPageId_() again because the initial
          // page could've changed between the start of layoutStory_ and here.
          _this8.switchTo_(_this8.getInitialPageId_(), NavigationDirection.NEXT)
        );
      }).then(function () {
        var shouldReOpenAttachmentForPageId = getHistoryState(_this8.win, HistoryState.ATTACHMENT_PAGE_ID);

        if (shouldReOpenAttachmentForPageId === _this8.activePage_.element.id) {
          _this8.activePage_.openAttachment(false
          /** shouldAnimate */
          );
        }

        // Preloads and prerenders the share menu.
        _this8.shareMenu_.build();

        var infoDialog = shouldShowStoryUrlInfo(devAssert(_this8.viewer_)) ? new InfoDialog(_this8.win, _this8.element) : null;

        if (infoDialog) {
          infoDialog.build();
        }
      });
      // Do not block the layout callback on the completion of these promises, as
      // that prevents descendents from being laid out (and therefore loaded).
      storyLayoutPromise.then(function () {
        return _this8.whenInitialContentLoaded_(INITIAL_CONTENT_LOAD_TIMEOUT_MS);
      }).then(function () {
        _this8.markStoryAsLoaded_();

        _this8.initializeLiveStory_();
      });
      this.maybeLoadStoryEducation_();
      // Story is being prerendered: resolve the layoutCallback when the active
      // page is built. Other pages will only build if the document becomes
      // visible.
      var initialPageEl = this.element.querySelector("amp-story-page#" + escapeCssSelectorIdent(initialPageId));

      if (!this.getAmpDoc().hasBeenVisible()) {
        return whenUpgradedToCustomElement(initialPageEl).then(function () {
          return initialPageEl.build();
        });
      }

      // Will resolve when all pages are built.
      return storyLayoutPromise;
    }
    /**
     * Initialize LiveStoryManager if this is a live story.
     * @private
     */

  }, {
    key: "initializeLiveStory_",
    value: function initializeLiveStory_() {
      var _this9 = this;

      if (this.element.hasAttribute('live-story')) {
        this.liveStoryManager_ = new LiveStoryManager(this);
        this.liveStoryManager_.build();
        this.storeService_.dispatch(Action.ADD_TO_ACTIONS_ALLOWLIST, [{
          tagOrTarget: 'AMP-LIVE-LIST',
          method: 'update'
        }]);
        this.element.addEventListener(AmpEvents.DOM_UPDATE, function () {
          _this9.liveStoryManager_.update();

          _this9.initializePages_().then(function () {
            _this9.preloadPagesByDistance_();

            if (_this9.storeService_.get(StateProperty.UI_STATE) === UIType.DESKTOP_PANELS) {
              _this9.setDesktopPositionAttributes_(_this9.activePage_);
            }
          });
        });
      }
    }
    /**
     * Retrieves the initial pageId to begin the story with. In order, the
     * initial page for a story should be either a valid page ID in the URL
     * fragment, the page ID in the history, or the first page of the story.
     * @return {?string}
     * @private
     */

  }, {
    key: "getInitialPageId_",
    value: function getInitialPageId_() {
      var maybePageId = parseQueryString(this.win.location.hash)['page'];

      if (maybePageId && this.isActualPage_(maybePageId)) {
        return maybePageId;
      }

      var pages =
      /**  @type {!Array} */
      getHistoryState(this.win, HistoryState.NAVIGATION_PATH) || [];
      var historyPage = lastItem(pages);

      if (historyPage && this.isActualPage_(historyPage)) {
        return historyPage;
      }

      var firstPageEl = this.element.querySelector('amp-story-page');
      return firstPageEl ? firstPageEl.id : null;
    }
    /**
     * Checks if the amp-story-page for a given ID exists.
     * Note: the `this.pages_` array might not be defined yet.
     * @param {string} pageId
     * @return {boolean}
     * @private
     */

  }, {
    key: "isActualPage_",
    value: function isActualPage_(pageId) {
      if (this.pages_.length > 0) {
        return this.pages_.some(function (page) {
          return page.element.id === pageId;
        });
      }

      return !!this.element.querySelector("#" + escapeCssSelectorIdent(pageId));
    }
    /**
     * @param {number} timeoutMs The maximum amount of time to wait, in
     *     milliseconds.
     * @return {!Promise} A promise that is resolved when the initial content is
     *     loaded or the timeout has been exceeded, whichever happens first.
     * @private
     */

  }, {
    key: "whenInitialContentLoaded_",
    value: function whenInitialContentLoaded_(timeoutMs) {
      if (timeoutMs === void 0) {
        timeoutMs = 0;
      }

      var pagesToWaitFor = this.storeService_.get(StateProperty.UI_STATE) === UIType.DESKTOP_PANELS ? [this.pages_[0], this.pages_[1]] : [this.pages_[0]];
      var storyLoadPromise = Promise.all(pagesToWaitFor.filter(Boolean).map(function (page) {
        return page.element.signals().whenSignal(CommonSignals.LOAD_END);
      }));
      return this.timer_.timeoutPromise(timeoutMs, storyLoadPromise).catch(function () {});
    }
    /** @private */

  }, {
    key: "markStoryAsLoaded_",
    value: function markStoryAsLoaded_() {
      var _this10 = this;

      dispatch(this.win, this.element, EventType.STORY_LOADED,
      /* payload */
      undefined, {
        bubbles: true
      });
      this.viewerMessagingHandler_ && this.viewerMessagingHandler_.send('storyContentLoaded', dict({}));
      this.analyticsService_.triggerEvent(StoryAnalyticsEvent.STORY_CONTENT_LOADED);
      this.signals().signal(CommonSignals.INI_LOAD);
      this.mutateElement(function () {
        _this10.element.classList.add(STORY_LOADED_CLASS_NAME);
      });
    }
    /**
     * Handles the story consent extension.
     * @private
     */

  }, {
    key: "handleConsentExtension_",
    value: function handleConsentExtension_() {
      var consentEl = this.element.querySelector('amp-consent');

      if (!consentEl) {
        return;
      }

      this.pauseStoryUntilConsentIsResolved_();
      this.validateConsent_(consentEl);
    }
    /**
     * Pauses the story until the consent is resolved (accepted or rejected).
     * @private
     */

  }, {
    key: "pauseStoryUntilConsentIsResolved_",
    value: function pauseStoryUntilConsentIsResolved_() {
      var _this11 = this;

      var policyId = this.getConsentPolicy() || 'default';
      var consentPromise = getConsentPolicyState(this.element, policyId);

      if (!consentPromise) {
        return;
      }

      this.storeService_.dispatch(Action.TOGGLE_PAUSED, true);
      consentPromise.then(function () {
        _this11.storeService_.dispatch(Action.TOGGLE_PAUSED, false);
      });
    }
    /**
     * Ensures publishers using amp-consent use amp-story-consent.
     * @param {!Element} consentEl
     * @private
     */

  }, {
    key: "validateConsent_",
    value: function validateConsent_(consentEl) {
      if (!childElementByTag(consentEl, 'amp-story-consent')) {
        user().error(TAG, 'amp-consent must have an amp-story-consent child');
      }

      var allowedTags = ['SCRIPT', 'AMP-STORY-CONSENT'];
      var toRemoveChildren = childElements(consentEl, function (el) {
        return allowedTags.indexOf(el.tagName) === -1;
      });

      if (toRemoveChildren.length === 0) {
        return;
      }

      user().error(TAG, 'amp-consent only allows tags: %s', allowedTags);
      toRemoveChildren.forEach(function (el) {
        return consentEl.removeChild(el);
      });
    }
    /**
     * @private
     */

  }, {
    key: "initializeStoryAccess_",
    value: function initializeStoryAccess_() {
      var _this12 = this;

      Services.accessServiceForDocOrNull(this.element).then(function (accessService) {
        if (!accessService) {
          return;
        }

        _this12.areAccessAuthorizationsCompleted_ = accessService.areFirstAuthorizationsCompleted();
        accessService.onApplyAuthorizations(function () {
          return _this12.onAccessApplyAuthorizations_();
        });
        var firstPage = _this12.pages_[0].element;

        // First amp-story-page can't be paywall protected.
        // Removes the access attributes, and throws an error during development.
        if (firstPage.hasAttribute('amp-access') || firstPage.hasAttribute('amp-access-hide')) {
          firstPage.removeAttribute('amp-access');
          firstPage.removeAttribute('amp-access-hide');
          user().error(TAG, 'First amp-story-page cannot have amp-access ' + 'or amp-access-hide attributes');
        }
      });
    }
    /**
     * On amp-access document reauthorization, maybe hide the access UI, and maybe
     * perform navigation.
     * @private
     */

  }, {
    key: "onAccessApplyAuthorizations_",
    value: function onAccessApplyAuthorizations_() {
      this.areAccessAuthorizationsCompleted_ = true;
      var nextPage = this.navigateToPageAfterAccess_;

      // Step out if the next page is still hidden by the access extension.
      if (nextPage && nextPage.element.hasAttribute('amp-access-hide')) {
        return;
      }

      if (nextPage) {
        this.navigateToPageAfterAccess_ = null;
        this.switchTo_(nextPage.element.id, NavigationDirection.NEXT);
      }

      this.storeService_.dispatch(Action.TOGGLE_ACCESS, false);
    }
    /** @override */

  }, {
    key: "isLayoutSupported",
    value: function isLayoutSupported(layout) {
      return layout == Layout.CONTAINER;
    }
    /** @private */

  }, {
    key: "initializePages_",
    value: function initializePages_() {
      var _this13 = this;

      var pageImplPromises = Array.prototype.map.call(this.element.querySelectorAll('amp-story-page'), function (pageEl) {
        return pageEl.getImpl();
      });
      return Promise.all(pageImplPromises).then(function (pages) {
        _this13.pages_ = pages;

        if (isExperimentOn(_this13.win, 'amp-story-branching')) {
          _this13.storeService_.dispatch(Action.ADD_TO_ACTIONS_ALLOWLIST, [{
            tagOrTarget: 'AMP-STORY',
            method: 'goToPage'
          }]);
        }
      });
    }
    /**
     * Advance to the next screen in the story, if there is one.
     * @param {boolean=} opt_isAutomaticAdvance Whether this navigation was caused
     *     by an automatic advancement after a timeout.
     * @private
     */

  }, {
    key: "next_",
    value: function next_(opt_isAutomaticAdvance) {
      var activePage = devAssert(this.activePage_, 'No active page set when navigating to next page.');
      activePage.next(opt_isAutomaticAdvance);
    }
    /**
     * Installs amp-viewer-integration script in case story is inside an
     * amp-story-player.
     * @private
     */

  }, {
    key: "initializeStoryPlayer_",
    value: function initializeStoryPlayer_() {
      if (this.viewer_.getParam('storyPlayer') !== 'v0') {
        return;
      }

      Services.extensionsFor(this.win).installExtensionForDoc(this.getAmpDoc(), 'amp-viewer-integration');
    }
    /**
     * Handles EventType.NO_NEXT_PAGE events.
     * @private
     */

  }, {
    key: "onNoNextPage_",
    value: function onNoNextPage_() {
      if (this.viewer_.hasCapability('swipe') && this.viewerMessagingHandler_) {
        var advancementMode = this.storeService_.get(StateProperty.ADVANCEMENT_MODE);
        this.viewerMessagingHandler_.send('selectDocument', dict({
          'next': true,
          'advancementMode': advancementMode
        }));
        return;
      }
    }
    /**
     * Go back to the previous screen in the story, if there is one.
     * @private
     */

  }, {
    key: "previous_",
    value: function previous_() {
      var activePage = devAssert(this.activePage_, 'No active page set when navigating to previous page.');
      activePage.previous();
    }
    /**
     * Handles EventType.NO_PREVIOUS_PAGE events.
     * @private
     */

  }, {
    key: "onNoPreviousPage_",
    value: function onNoPreviousPage_() {
      if (this.viewer_.hasCapability('swipe') && this.viewerMessagingHandler_) {
        var advancementMode = this.storeService_.get(StateProperty.ADVANCEMENT_MODE);
        this.viewerMessagingHandler_.send('selectDocument', dict({
          'previous': true,
          'advancementMode': advancementMode
        }));
        return;
      }

      if (this.storeService_.get(StateProperty.CAN_SHOW_PREVIOUS_PAGE_HELP)) {
        this.ampStoryHint_.showFirstPageHintOverlay();
      }
    }
    /**
     * @param {number} direction The direction to navigate.
     * @private
     */

  }, {
    key: "performTapNavigation_",
    value: function performTapNavigation_(direction) {
      this.storeService_.dispatch(Action.SET_ADVANCEMENT_MODE, AdvancementMode.MANUAL_ADVANCE);

      if (this.storeService_.get(StateProperty.UI_STATE) === UIType.DESKTOP_PANELS) {
        this.next_();
        return;
      }

      if (direction === TapNavigationDirection.NEXT) {
        this.next_();
      } else if (direction === TapNavigationDirection.PREVIOUS) {
        this.previous_();
      }
    }
    /**
     * Switches to a particular page.
     * @param {string} targetPageId
     * @param {!NavigationDirection} direction
     * @return {!Promise}
     * @private
     */

  }, {
    key: "switchTo_",
    value: function switchTo_(targetPageId, direction) {
      var _this$backgroundBlur_,
          _this14 = this;

      var targetPage = this.getPageById(targetPageId);
      var pageIndex = this.getPageIndex(targetPage);

      // Step out if trying to navigate to the currently active page.
      if (this.activePage_ && this.activePage_.element.id === targetPageId) {
        return _resolvedPromise3();
      }

      // If the next page might be paywall protected, and the access
      // authorizations did not resolve yet, wait before navigating.
      // TODO(gmajoulet): implement a loading state.
      if (targetPage.element.hasAttribute('amp-access') && !this.areAccessAuthorizationsCompleted_) {
        this.navigateToPageAfterAccess_ = targetPage;
        return _resolvedPromise4();
      }

      // If the next page is paywall protected, display the access UI and wait for
      // the document to be reauthorized.
      if (targetPage.element.hasAttribute('amp-access-hide')) {
        this.storeService_.dispatch(Action.TOGGLE_ACCESS, true);
        this.navigateToPageAfterAccess_ = targetPage;
        return _resolvedPromise5();
      }

      var oldPage = this.activePage_;
      this.activePage_ = targetPage;

      if (!targetPage.isAd()) {
        this.updateNavigationPath_(targetPageId, direction);
      }

      (_this$backgroundBlur_ = this.backgroundBlur_) == null ? void 0 : _this$backgroundBlur_.update(targetPage.element);
      // Each step will run in a requestAnimationFrame, and wait for the next
      // frame before executing the following step.
      var steps = [// First step contains the minimum amount of code to display and play the
      // target page as fast as possible.
      function () {
        oldPage && oldPage.element.removeAttribute('active');

        if (_this14.storeService_.get(StateProperty.UI_STATE) === UIType.DESKTOP_PANELS) {
          _this14.setDesktopPositionAttributes_(targetPage);
        }

        // Starts playing the page, if the story is not paused.
        // Note: navigation is prevented when the story is paused, this test
        // covers the case where the story is rendered paused (eg: consent).
        if (!_this14.storeService_.get(StateProperty.PAUSED_STATE)) {
          targetPage.setState(PageState.PLAYING);
        } else {
          // Even if the page won't be playing, setting the active attribute
          // ensures it gets visible.
          targetPage.element.setAttribute('active', '');
        }

        _this14.forceRepaintForSafari_();
      }, // Second step does all the operations that impact the UI/UX: media sound,
      // progress bar, ...
      function () {
        if (oldPage) {
          oldPage.setState(PageState.NOT_ACTIVE);
          // Indication to know where to display the page on the desktop
          // ribbon-like animation.
          _this14.getPageIndex(oldPage) < pageIndex ? setAttributeInMutate(oldPage, Attributes.VISITED) : removeAttributeInMutate(oldPage, Attributes.VISITED);

          if (oldPage.isAd()) {
            _this14.storeService_.dispatch(Action.SET_ADVANCEMENT_MODE, AdvancementMode.ADVANCE_TO_ADS);
          }
        }

        var storePageIndex = pageIndex;

        if (targetPage.isAd()) {
          _this14.storeService_.dispatch(Action.TOGGLE_AD, true);

          setAttributeInMutate(_this14, Attributes.AD_SHOWING);
          // Keep current page index when an ad is shown. Otherwise it messes
          // up with the progress variable in the VariableService.
          storePageIndex = _this14.storeService_.get(StateProperty.CURRENT_PAGE_INDEX);
        } else {
          _this14.storeService_.dispatch(Action.TOGGLE_AD, false);

          removeAttributeInMutate(_this14, Attributes.AD_SHOWING);

          // Start progress bar update for pages that are not ads or auto-
          // advance.
          if (!targetPage.isAutoAdvance()) {
            _this14.systemLayer_.updateProgress(targetPageId, _this14.advancement_.getProgress());
          }
        }

        _this14.storeService_.dispatch(Action.CHANGE_PAGE, {
          id: targetPageId,
          index: storePageIndex
        });

        // If first navigation.
        if (!oldPage) {
          _this14.registerAndPreloadBackgroundAudio_();
        }
      }, // Third and last step contains all the actions that can be delayed after
      // the navigation happened, like preloading the following pages, or
      // sending analytics events.
      function () {
        _this14.preloadPagesByDistance_(
        /* prioritizeActivePage */
        !oldPage);

        _this14.triggerActiveEventForPage_();

        _this14.systemLayer_.resetDeveloperLogs();

        _this14.systemLayer_.setDeveloperLogContextString(_this14.activePage_.element.id);
      }];
      return new Promise(function (resolve) {
        targetPage.beforeVisible().then(function () {
          // Recursively executes one step per frame.
          var unqueueStepInRAF = function unqueueStepInRAF() {
            steps.shift().call(_this14);

            if (!steps.length) {
              return resolve();
            }

            _this14.win.requestAnimationFrame(function () {
              return unqueueStepInRAF();
            });
          };

          unqueueStepInRAF();
        });
      });
    }
    /**
     * Updates the story navigation stack and checks for navigation adherence to
     * the path a user takes.
     * @param {string} targetPageId
     * @param {!NavigationDirection} direction
     * @private
     */

  }, {
    key: "updateNavigationPath_",
    value: function updateNavigationPath_(targetPageId, direction) {
      var navigationPath =
      /** @type {!Array<string>} */
      this.storeService_.get(StateProperty.NAVIGATION_PATH);

      if (direction === NavigationDirection.PREVIOUS) {
        navigationPath.pop();
      }

      // Ensures the pageId is not at the top of the stack already, which can
      // happen on initial page load (e.g. reloading a page).
      if (direction === NavigationDirection.NEXT && navigationPath[navigationPath.length - 1] !== targetPageId) {
        navigationPath.push(targetPageId);
      }

      this.storeService_.dispatch(Action.SET_NAVIGATION_PATH, navigationPath);
      setHistoryState(this.win, HistoryState.NAVIGATION_PATH, navigationPath);
    }
    /**
     * Clear existing preview attributes, Check to see if there is a next or
     * previous page, set new attributes.
     * @param {?./amp-story-page.AmpStoryPage} targetPage
     * @private
     */

  }, {
    key: "setDesktopPositionAttributes_",
    value: function setDesktopPositionAttributes_(targetPage) {
      var _this15 = this;

      if (!targetPage) {
        return;
      }

      var list = [{
        page: targetPage,
        position: 0
      }];
      var minusOneId = targetPage.getPreviousPageId();

      if (minusOneId) {
        var minusOnePage = this.getPageById(minusOneId);
        list.push({
          page: minusOnePage,
          position: -1
        });
        var minusTwoId = minusOnePage.getPreviousPageId();

        if (minusTwoId) {
          list.push({
            page: this.getPageById(minusTwoId),
            position: -2
          });
        }
      }

      var plusOneId = targetPage.getNextPageId();

      if (plusOneId) {
        var plusOnePage = this.getPageById(plusOneId);
        list.push({
          page: plusOnePage,
          position: 1
        });
        var plusTwoId = plusOnePage.getNextPageId();

        if (plusTwoId) {
          list.push({
            page: this.getPageById(plusTwoId),
            position: 2
          });
        }
      }

      var desktopPositionsToReset;
      this.measureMutateElement(
      /** measurer */
      function () {
        desktopPositionsToReset = scopedQuerySelectorAll(_this15.element, "amp-story-page[\n                      " + escapeCssSelectorIdent(Attributes.DESKTOP_POSITION) + "]");
      },
      /** mutator */
      function () {
        Array.prototype.forEach.call(desktopPositionsToReset, function (el) {
          el.removeAttribute(Attributes.DESKTOP_POSITION);
        });
        list.forEach(function (entry) {
          var page = entry.page,
              position = entry.position;
          page.element.setAttribute(Attributes.DESKTOP_POSITION, position);
        });
      });
    }
    /** @private */

  }, {
    key: "triggerActiveEventForPage_",
    value: function triggerActiveEventForPage_() {
      // TODO(alanorozco): pass event priority once amphtml-story repo is merged
      // with upstream.
      Services.actionServiceForDoc(this.element).trigger(this.activePage_.element, 'active',
      /* event */
      null, ActionTrust.HIGH);
    }
    /**
     * For some reason, Safari has an issue where sometimes when pages become
     * visible, some descendants are not painted.  This is a hack, where we detect
     * that the browser is Safari and force it to repaint, to avoid this case.
     * See newmuis/amphtml-story#106 for details.
     * @private
     */

  }, {
    key: "forceRepaintForSafari_",
    value: function forceRepaintForSafari_() {
      var _this16 = this;

      if (!this.platform_.isSafari() && !this.platform_.isIos()) {
        return;
      }

      if (this.storeService_.get(StateProperty.UI_STATE) === UIType.DESKTOP_PANELS) {
        // Force repaint is only needed when transitioning from invisible to
        // visible
        return;
      }

      this.mutateElement(function () {
        toggle(_this16.element, false);
        // Reading the height is what forces the repaint.  The conditional exists
        // only to workaround the fact that the closure compiler would otherwise
        // think that only reading the height has no effect.  Since the height is
        // always >= 0, this conditional will always be executed.
        var height = _this16.element.
        /*OK*/
        offsetHeight;

        if (height >= 0) {
          toggle(_this16.element, true);
        }
      });
    }
    /**
     * Handles all key presses within the story.
     * @param {!Event} e The keydown event.
     * @private
     */

  }, {
    key: "onKeyDown_",
    value: function onKeyDown_(e) {
      this.storeService_.dispatch(Action.SET_ADVANCEMENT_MODE, AdvancementMode.MANUAL_ADVANCE);
      var rtlState = this.storeService_.get(StateProperty.RTL_STATE);

      switch (e.key) {
        case Keys.LEFT_ARROW:
          rtlState ? this.next_() : this.previous_();
          break;

        case Keys.RIGHT_ARROW:
          rtlState ? this.previous_() : this.next_();
          break;
      }
    }
    /**
     * Handle resize events and set the story's desktop state.
     * @visibleForTesting
     */

  }, {
    key: "onResize",
    value: function onResize() {
      var uiState = this.getUIType_();
      this.storeService_.dispatch(Action.TOGGLE_UI, uiState);
      var isLandscape = this.isLandscape_();
      var isLandscapeSupported = this.isLandscapeSupported_();
      this.setOrientationAttribute_(isLandscape, isLandscapeSupported);

      if (uiState !== UIType.MOBILE || isLandscapeSupported) {
        // Hides the UI that prevents users from using the LANDSCAPE orientation.
        this.storeService_.dispatch(Action.TOGGLE_VIEWPORT_WARNING, false);
        return;
      }

      // Only called when the desktop media query is not matched and the landscape
      // mode is not enabled.
      this.maybeTriggerViewportWarning_(isLandscape);
    }
    /**
     * Adds an orientation=landscape|portrait attribute.
     * If the story doesn't explicitly support landscape via the opt-in attribute,
     * it is always in a portrait orientation.
     * @param {boolean} isLandscape Whether the viewport is landscape or portrait
     * @param {boolean} isLandscapeSupported Whether the story supports landscape
     * @private
     */

  }, {
    key: "setOrientationAttribute_",
    value: function setOrientationAttribute_(isLandscape, isLandscapeSupported) {
      var _this17 = this;

      // TODO(#20832) base this check on the size of the amp-story-page, once it
      // is stored as a store state.
      this.mutateElement(function () {
        _this17.element.setAttribute(Attributes.ORIENTATION, isLandscapeSupported && isLandscape ? 'landscape' : 'portrait');
      });
    }
    /**
     * Maybe triggers the viewport warning overlay.
     * @param {boolean} isLandscape
     * @private
     */

  }, {
    key: "maybeTriggerViewportWarning_",
    value: function maybeTriggerViewportWarning_(isLandscape) {
      var _this18 = this;

      if (isDesktopOnePanelExperimentOn(this.win)) {
        return;
      }

      if (isLandscape === this.storeService_.get(StateProperty.VIEWPORT_WARNING_STATE)) {
        return;
      }

      this.mutateElement(function () {
        if (isLandscape) {
          _this18.pausedStateToRestore_ = !!_this18.storeService_.get(StateProperty.PAUSED_STATE);

          _this18.storeService_.dispatch(Action.TOGGLE_PAUSED, true);

          _this18.storeService_.dispatch(Action.TOGGLE_VIEWPORT_WARNING, true);
        } else {
          _this18.storeService_.dispatch(Action.TOGGLE_PAUSED, _this18.pausedStateToRestore_);

          _this18.pausedStateToRestore_ = null;

          _this18.storeService_.dispatch(Action.TOGGLE_VIEWPORT_WARNING, false);
        }
      });
    }
    /**
     * Reacts to the browser tab becoming active/inactive.
     * @private
     */

  }, {
    key: "onVisibilityChanged_",
    value: function onVisibilityChanged_() {
      this.getAmpDoc().isVisible() ? this.resume_() : this.pause_();
    }
    /**
     * Reacts to the ad state updates, and pauses the background-audio when an ad
     * is displayed.
     * @param {boolean} isAd
     * @private
     */

  }, {
    key: "onAdStateUpdate_",
    value: function onAdStateUpdate_(isAd) {
      if (this.storeService_.get(StateProperty.MUTED_STATE)) {
        return;
      }

      isAd ? this.pauseBackgroundAudio_() : this.playBackgroundAudio_();
    }
    /**
     * Reacts to UI state updates.
     * @param {!UIType} uiState
     * @private
     */

  }, {
    key: "onUIStateUpdate_",
    value: function onUIStateUpdate_(uiState) {
      var _this$backgroundBlur_2,
          _this19 = this;

      (_this$backgroundBlur_2 = this.backgroundBlur_) == null ? void 0 : _this$backgroundBlur_2.detach();
      this.backgroundBlur_ = null;

      switch (uiState) {
        case UIType.MOBILE:
          this.vsync_.mutate(function () {
            _this19.element.removeAttribute('desktop');

            _this19.element.classList.remove('i-amphtml-story-desktop-panels');

            _this19.element.classList.remove('i-amphtml-story-desktop-fullbleed');

            _this19.element.classList.remove('i-amphtml-story-desktop-one-panel');
          });
          break;

        case UIType.DESKTOP_PANELS:
          this.setDesktopPositionAttributes_(this.activePage_);
          this.vsync_.mutate(function () {
            _this19.element.setAttribute('desktop', '');

            _this19.element.classList.add('i-amphtml-story-desktop-panels');

            _this19.element.classList.remove('i-amphtml-story-desktop-fullbleed');

            _this19.element.classList.remove('i-amphtml-story-desktop-one-panel');
          });
          break;

        case UIType.DESKTOP_ONE_PANEL:
          this.setDesktopPositionAttributes_(this.activePage_);

          if (!this.backgroundBlur_) {
            this.backgroundBlur_ = new BackgroundBlur(this.win, this.element);
            this.backgroundBlur_.attach();

            if (this.activePage_) {
              this.backgroundBlur_.update(this.activePage_.element);
            }
          }

          this.vsync_.mutate(function () {
            _this19.element.removeAttribute('desktop');

            _this19.element.classList.add('i-amphtml-story-desktop-one-panel');

            _this19.element.classList.remove('i-amphtml-story-desktop-fullbleed');

            _this19.element.classList.remove('i-amphtml-story-desktop-panels');
          });
          break;

        case UIType.DESKTOP_FULLBLEED:
          this.vsync_.mutate(function () {
            _this19.element.setAttribute('desktop', '');

            _this19.element.classList.add('i-amphtml-story-desktop-fullbleed');

            _this19.element.classList.remove('i-amphtml-story-desktop-panels');

            _this19.element.classList.remove('i-amphtml-story-desktop-one-panel');
          });
          break;
        // Because of the DOM mutations, switching from this mode to another is
        // not allowed, and prevented within the store service.

        case UIType.VERTICAL:
          var pageAttachments = scopedQuerySelectorAll(this.element, 'amp-story-page amp-story-page-attachment');
          this.vsync_.mutate(function () {
            _this19.element.setAttribute('i-amphtml-vertical', '');

            setImportantStyles(_this19.win.document.body, {
              height: 'auto'
            });

            _this19.element.removeAttribute('desktop');

            _this19.element.classList.remove('i-amphtml-story-desktop-fullbleed');

            _this19.element.classList.remove('i-amphtml-story-desktop-panels');

            for (var i = 0; i < pageAttachments.length; i++) {
              _this19.element.insertBefore(pageAttachments[i], // Attachments that are just links are rendered in-line with their
              // story page.
              pageAttachments[i].getAttribute('href') ? pageAttachments[i].parentElement.nextElementSibling : // Other attachments are rendered at the end.
              null);
            }
          });
          this.signals().whenSignal(CommonSignals.LOAD_END).then(function () {
            _this19.vsync_.mutate(function () {
              _this19.pages_.forEach(function (page) {
                return page.element.setAttribute('active', '');
              });
            });
          });
          break;
      }
    }
    /**
     * Retrieves the UI type that should be used to view the story.
     * @return {!UIType}
     * @private
     */

  }, {
    key: "getUIType_",
    value: function getUIType_() {
      if (this.platform_.isBot()) {
        return UIType.VERTICAL;
      }

      if (!this.isDesktop_()) {
        return UIType.MOBILE;
      }

      if (this.isLandscapeSupported_()) {
        return UIType.DESKTOP_FULLBLEED;
      }

      if (isDesktopOnePanelExperimentOn(this.win)) {
        return UIType.DESKTOP_ONE_PANEL;
      }

      // Three panels desktop UI (default).
      return UIType.DESKTOP_PANELS;
    }
    /**
     * @return {boolean} True if the screen size matches the desktop media query.
     * @private
     */

  }, {
    key: "isDesktop_",
    value: function isDesktop_() {
      if (isDesktopOnePanelExperimentOn(this.win)) {
        return this.desktopOnePanelMedia_.matches && !this.platform_.isBot();
      }

      return this.desktopMedia_.matches && !this.platform_.isBot();
    }
    /**
     * @return {boolean} True if the screen orientation is landscape.
     * @private
     */

  }, {
    key: "isLandscape_",
    value: function isLandscape_() {
      return this.landscapeOrientationMedia_.matches;
    }
    /**
     * @return {boolean} true if this is a standalone story (i.e. this story is
     *     the only content of the document).
     * @private
     */

  }, {
    key: "isStandalone_",
    value: function isStandalone_() {
      return this.element.hasAttribute(Attributes.STANDALONE);
    }
    /**
     * Whether the story should support landscape orientation: landscape mobile,
     * or full bleed desktop UI.
     * @return {boolean}
     * @private
     */

  }, {
    key: "isLandscapeSupported_",
    value: function isLandscapeSupported_() {
      return this.element.hasAttribute(Attributes.SUPPORTS_LANDSCAPE);
    }
    /**
     * Reacts to paused state updates.
     * @param {boolean} isPaused
     * @private
     */

  }, {
    key: "onPausedStateUpdate_",
    value: function onPausedStateUpdate_(isPaused) {
      if (!this.activePage_) {
        return;
      }

      var pageState = isPaused ? PageState.PAUSED : PageState.PLAYING;
      this.activePage_.setState(pageState);
    }
    /**
     * Reacts to sidebar state updates.
     * @param {boolean} sidebarState
     * @private
     */

  }, {
    key: "onSidebarStateUpdate_",
    value: function onSidebarStateUpdate_(sidebarState) {
      var _this20 = this;

      this.analyticsService_.triggerEvent(sidebarState ? StoryAnalyticsEvent.OPEN : StoryAnalyticsEvent.CLOSE, this.sidebar_);
      var actions = Services.actionServiceForDoc(this.element);

      if (this.win.MutationObserver) {
        if (!this.sidebarObserver_) {
          this.sidebarObserver_ = new this.win.MutationObserver(function () {
            _this20.storeService_.dispatch(Action.TOGGLE_SIDEBAR, _this20.sidebar_.hasAttribute('open'));
          });
        }

        if (this.sidebar_ && sidebarState) {
          this.sidebarObserver_.observe(this.sidebar_, SIDEBAR_OBSERVER_OPTIONS);
          this.openOpacityMask_();
          actions.execute(this.sidebar_, 'open',
          /* args */
          null,
          /* source */
          null,
          /* caller */
          null,
          /* event */
          null, ActionTrust.HIGH);
        } else {
          this.closeOpacityMask_();
          this.sidebarObserver_.disconnect();
        }
      } else if (this.sidebar_ && sidebarState) {
        this.openOpacityMask_();
        actions.execute(this.sidebar_, 'open',
        /* args */
        null,
        /* source */
        null,
        /* caller */
        null,
        /* event */
        null, ActionTrust.HIGH);
        this.storeService_.dispatch(Action.TOGGLE_SIDEBAR, false);
      }
    }
    /**
     * @private
     */

  }, {
    key: "initializeOpacityMask_",
    value: function initializeOpacityMask_() {
      var _this21 = this;

      if (!this.maskElement_) {
        var maskEl = this.win.document.createElement('div');
        maskEl.classList.add(OPACITY_MASK_CLASS_NAME);
        maskEl.addEventListener('click', function () {
          var actions = Services.actionServiceForDoc(_this21.element);

          if (_this21.sidebar_) {
            _this21.closeOpacityMask_();

            actions.execute(_this21.sidebar_, 'close',
            /* args */
            null,
            /* source */
            null,
            /* caller */
            null,
            /* event */
            null, ActionTrust.HIGH);
          }
        });
        this.maskElement_ = maskEl;
        this.mutateElement(function () {
          _this21.element.appendChild(_this21.maskElement_);

          toggle(dev().assertElement(_this21.maskElement_),
          /* display */
          false);
        });
      }
    }
    /**
     * @private
     */

  }, {
    key: "openOpacityMask_",
    value: function openOpacityMask_() {
      var _this22 = this;

      this.mutateElement(function () {
        toggle(dev().assertElement(_this22.maskElement_),
        /* display */
        true);
      });
    }
    /**
     * @private
     */

  }, {
    key: "closeOpacityMask_",
    value: function closeOpacityMask_() {
      var _this23 = this;

      if (this.maskElement_) {
        this.mutateElement(function () {
          toggle(dev().assertElement(_this23.maskElement_),
          /* display */
          false);
        });
      }
    }
    /**
     * If browser is supported, displays the story. Otherwise, shows either the
     * default unsupported browser layer or the publisher fallback (if provided).
     * @param {boolean} isBrowserSupported
     * @private
     */

  }, {
    key: "onSupportedBrowserStateUpdate_",
    value: function onSupportedBrowserStateUpdate_(isBrowserSupported) {
      var _this24 = this;

      var fallbackEl = this.getFallback();

      if (isBrowserSupported) {
        // Removes the default unsupported browser layer or throws an error
        // if the publisher has provided their own fallback.
        if (fallbackEl) {
          dev().error(TAG, 'No handler to exit unsupported browser state on ' + 'publisher provided fallback.');
        } else {
          this.layoutStory_().then(function () {
            _this24.storeService_.dispatch(Action.TOGGLE_PAUSED, _this24.pausedStateToRestore_);

            _this24.pausedStateToRestore_ = null;

            _this24.mutateElement(function () {
              _this24.unsupportedBrowserLayer_.removeLayer();
            });
          });
        }
      } else {
        this.pausedStateToRestore_ = !!this.storeService_.get(StateProperty.PAUSED_STATE);
        this.storeService_.dispatch(Action.TOGGLE_PAUSED, true);

        // Displays the publisher provided fallback or fallbacks to the default
        // unsupported browser layer.
        if (fallbackEl) {
          this.toggleFallback(true);
        } else {
          this.unsupportedBrowserLayer_.build();
          this.mutateElement(function () {
            _this24.element.appendChild(_this24.unsupportedBrowserLayer_.get());
          });
        }
      }
    }
    /**
     * @return {!Array<!Array<string>>} A 2D array representing lists of pages by
     *     distance.  The outer array index represents the distance from the
     *     active page; the inner array is a list of page IDs at the specified
     *     distance.
     */

  }, {
    key: "getPagesByDistance_",
    value: function getPagesByDistance_() {
      var _this25 = this;

      var distanceMap = this.getPageDistanceMapHelper_(
      /* distance */
      0,
      /* map */
      {}, this.activePage_.element.id);
      // Transpose the map into a 2D array.
      var pagesByDistance = [];
      Object.keys(distanceMap).forEach(function (pageId) {
        var distance = distanceMap[pageId];

        // If on last page, mark first page with distance 1.
        if (pageId === _this25.pages_[0].element.id && _this25.activePage_ === _this25.pages_[_this25.pages_.length - 1] && _this25.pages_.length > 1 && !_this25.viewer_.hasCapability('swipe')) {
          distance = 1;
        }

        if (!pagesByDistance[distance]) {
          pagesByDistance[distance] = [];
        }

        // There may be other 1 skip away pages due to branching.
        if (isExperimentOn(_this25.win, 'amp-story-branching')) {
          var navigationPath = _this25.storeService_.get(StateProperty.NAVIGATION_PATH);

          var indexInStack = navigationPath.indexOf(_this25.activePage_.element.id);
          var maybePrev = navigationPath[indexInStack - 1];

          if (indexInStack > 0 && pageId === _this25.activePage_.element.id) {
            if (!pagesByDistance[1]) {
              pagesByDistance[1] = [];
            }

            pagesByDistance[1].push(maybePrev);
          }

          // Do not overwrite, branching distance always takes precedence.
          if (pageId !== maybePrev) {
            pagesByDistance[distance].push(pageId);
          }
        } else {
          pagesByDistance[distance].push(pageId);
        }
      });
      return pagesByDistance;
    }
    /**
     * Creates a map of a page and all of the pages reachable from that page, by
     * distance.
     *
     * @param {number} distance The distance that the page with the specified
     *     pageId is from the active page.
     * @param {!Object<string, number>} map A mapping from pageId to its distance
     *     from the active page.
     * @param {string} pageId The page to be added to the map.
     * @return {!Object<string, number>} A mapping from page ID to the priority of
     *     that page.
     * @private
     */

  }, {
    key: "getPageDistanceMapHelper_",
    value: function getPageDistanceMapHelper_(distance, map, pageId) {
      var _this26 = this;

      if (map[pageId] !== undefined && map[pageId] <= distance) {
        return map;
      }

      map[pageId] = distance;
      var page = this.getPageById(pageId);
      page.getAdjacentPageIds().forEach(function (adjacentPageId) {
        if (map[adjacentPageId] !== undefined && map[adjacentPageId] <= distance) {
          return;
        }

        // TODO(newmuis): Remove the assignment and return, as they're
        // unnecessary.
        map = _this26.getPageDistanceMapHelper_(distance + 1, map, adjacentPageId);
      });
      return map;
    }
    /**
     * @param {boolean=} prioritizeActivePage
     * @private
     */

  }, {
    key: "preloadPagesByDistance_",
    value: function preloadPagesByDistance_(prioritizeActivePage) {
      var _this27 = this;

      if (prioritizeActivePage === void 0) {
        prioritizeActivePage = false;
      }

      if (this.platform_.isBot()) {
        this.pages_.forEach(function (page) {
          page.setDistance(0);
        });
        return;
      }

      var pagesByDistance = this.getPagesByDistance_();

      var preloadAllPages = function preloadAllPages() {
        pagesByDistance.forEach(function (pageIds, distance) {
          pageIds.forEach(function (pageId) {
            var page = _this27.getPageById(pageId);

            page.setDistance(distance);
          });
        });
      };

      this.mutateElement(function () {
        if (!isExperimentOn(_this27.win, 'story-load-first-page-only') || !prioritizeActivePage) {
          return preloadAllPages();
        }

        var activePageId = devAssert(pagesByDistance[0][0]);
        new Promise(function (res, rej) {
          var page = _this27.getPageById(activePageId);

          page.setDistance(0);
          page.signals().whenSignal(CommonSignals.LOAD_END).then(res);

          // Don't call preload if user navigates before page loads, since the navigation will call preload properly.
          _this27.storeService_.subscribe(StateProperty.CURRENT_PAGE_ID, rej);
        }).then(function () {
          return preloadAllPages();
        }, function () {});
      });
    }
    /**
     * Handles a background-audio attribute set on an <amp-story> tag.
     * @private
     */

  }, {
    key: "registerAndPreloadBackgroundAudio_",
    value: function registerAndPreloadBackgroundAudio_() {
      var _this28 = this;

      var backgroundAudioEl = upgradeBackgroundAudio(this.element);

      if (!backgroundAudioEl) {
        return;
      }

      // Once the media pool is ready, registers and preloads the background
      // audio, and then gets the swapped element from the DOM to mute/unmute/play
      // it programmatically later.
      this.activePage_.element.signals().whenSignal(CommonSignals.LOAD_END).then(function () {
        backgroundAudioEl =
        /** @type {!HTMLMediaElement} */
        backgroundAudioEl;

        _this28.mediaPool_.register(backgroundAudioEl);

        return _this28.mediaPool_.preload(backgroundAudioEl);
      }).then(function () {
        _this28.backgroundAudioEl_ =
        /** @type {!HTMLMediaElement} */
        childElement(_this28.element, function (el) {
          return el.tagName.toLowerCase() === 'audio';
        });
      });
    }
    /**
     * Loads amp-story-education if the viewer capability is provided.
     * @private
     */

  }, {
    key: "maybeLoadStoryEducation_",
    value: function maybeLoadStoryEducation_() {
      var _this29 = this;

      if (!this.viewer_.hasCapability('education')) {
        return;
      }

      this.mutateElement(function () {
        _this29.element.appendChild(_this29.win.document.createElement('amp-story-education'));
      });
      Services.extensionsFor(this.win).installExtensionForDoc(this.getAmpDoc(), 'amp-story-education');
    }
    /**
     * @param {string} id The ID of the page whose index should be retrieved.
     * @return {number} The index of the page.
     */

  }, {
    key: "getPageIndexById",
    value: function getPageIndexById(id) {
      var pageIndex = findIndex(this.pages_, function (page) {
        return page.element.id === id;
      });

      if (pageIndex < 0) {
        user().error(TAG, 'Story refers to page "%s", but no such page exists.', id);
      }

      return pageIndex;
    }
    /**
     * @param {string} id The ID of the page to be retrieved.
     * @return {!./amp-story-page.AmpStoryPage} Retrieves the page with the
     *     specified ID.
     */

  }, {
    key: "getPageById",
    value: function getPageById(id) {
      var pageIndex = this.getPageIndexById(id);
      return devAssert(this.pages_[pageIndex], 'Page at index %s exists, but is missing from the array.', pageIndex);
    }
    /**
     * @return {number}
     */

  }, {
    key: "getPageCount",
    value: function getPageCount() {
      return this.pages_.length - this.adPages_.length;
    }
    /**
     * @param {!./amp-story-page.AmpStoryPage} desiredPage
     * @return {number} The index of the page.
     */

  }, {
    key: "getPageIndex",
    value: function getPageIndex(desiredPage) {
      return findIndex(this.pages_, function (page) {
        return page === desiredPage;
      });
    }
    /**
     * Retrieves the page containing the element, or null. A background audio
     * set on the <amp-story> tag would not be contained in a page.
     * @param {!Element} element The element whose containing AmpStoryPage should
     *     be retrieved
     * @return {?./amp-story-page.AmpStoryPage} The AmpStoryPage containing the
     *     specified element, if any.
     */

  }, {
    key: "getPageContainingElement_",
    value: function getPageContainingElement_(element) {
      var startingElement = element;

      // If the element is inside an iframe (most likely an ad), start from the
      // containing iframe element.
      if (element.ownerDocument !== this.win.document) {
        startingElement = element.ownerDocument.defaultView.frameElement;
      }

      var pageIndex = findIndex(this.pages_, function (page) {
        var pageEl = closest(startingElement, function (el) {
          return el === page.element;
        });
        return !!pageEl;
      });
      return this.pages_[pageIndex] || null;
    }
    /** @override */

  }, {
    key: "getElementDistance",
    value: function getElementDistance(element) {
      var page = this.getPageContainingElement_(element);

      // An element not contained in a page is likely to be global to the story,
      // like a background audio. Setting the distance to -1 ensures it will not
      // get evicted from the media pool.
      if (!page) {
        return -1;
      }

      return page.getDistance();
    }
    /** @override */

  }, {
    key: "getMaxMediaElementCounts",
    value: function getMaxMediaElementCounts() {
      var _ref;

      var audioMediaElementsCount = this.element.querySelectorAll('amp-audio, [background-audio]').length;
      var videoMediaElementsCount = this.element.querySelectorAll('amp-video').length;

      // The root element (amp-story) might have a background-audio as well.
      if (this.element.hasAttribute('background-audio')) {
        audioMediaElementsCount++;
      }

      return _ref = {}, _ref[MediaType.AUDIO] = Math.min(audioMediaElementsCount + MINIMUM_AD_MEDIA_ELEMENTS, MAX_MEDIA_ELEMENT_COUNTS[MediaType.AUDIO]), _ref[MediaType.VIDEO] = Math.min(videoMediaElementsCount + MINIMUM_AD_MEDIA_ELEMENTS, MAX_MEDIA_ELEMENT_COUNTS[MediaType.VIDEO]), _ref;
    }
    /** @override */

  }, {
    key: "getElement",
    value: function getElement() {
      return this.element;
    }
    /**
     * Reacts to muted state updates.
     * @param  {boolean} isMuted Whether the story just got muted.
     * @private
     */

  }, {
    key: "onMutedStateUpdate_",
    value: function onMutedStateUpdate_(isMuted) {
      isMuted ? this.mute_() : this.unmute_();
      isMuted ? this.element.setAttribute(Attributes.MUTED, '') : this.element.removeAttribute(Attributes.MUTED);
    }
    /**
     * Mutes the audio for the story.
     * @private
     */

  }, {
    key: "mute_",
    value: function mute_() {
      this.pauseBackgroundAudio_();

      if (this.activePage_) {
        this.activePage_.muteAllMedia();
      }
    }
    /**
     * Pauses the background audio.
     * @private
     */

  }, {
    key: "pauseBackgroundAudio_",
    value: function pauseBackgroundAudio_() {
      if (!this.backgroundAudioEl_) {
        return;
      }

      this.mediaPool_.pause(this.backgroundAudioEl_);
    }
    /**
     * Unmutes the audio for the story.
     * @private
     */

  }, {
    key: "unmute_",
    value: function unmute_() {
      var _this30 = this;

      var unmuteAllMedia = function unmuteAllMedia() {
        _this30.playBackgroundAudio_();

        if (_this30.activePage_) {
          _this30.activePage_.unmuteAllMedia();
        }
      };

      this.mediaPool_.blessAll().then(unmuteAllMedia, unmuteAllMedia);
    }
    /**
     * Unmutes and plays the background audio.
     * @private
     */

  }, {
    key: "playBackgroundAudio_",
    value: function playBackgroundAudio_() {
      if (!this.backgroundAudioEl_) {
        return;
      }

      this.mediaPool_.unmute(this.backgroundAudioEl_);
      this.mediaPool_.play(this.backgroundAudioEl_);
    }
    /**
     * Shows the audio icon if the story has any media elements containing audio,
     * or background audio at the story or page level.
     * @private
     */

  }, {
    key: "updateAudioIcon_",
    value: function updateAudioIcon_() {
      var containsMediaElementWithAudio = !!this.element.querySelector('amp-audio, amp-video:not([noaudio]), [background-audio]');
      var storyHasBackgroundAudio = this.element.hasAttribute('background-audio');
      this.storeService_.dispatch(Action.TOGGLE_STORY_HAS_AUDIO, containsMediaElementWithAudio || storyHasBackgroundAudio);
      this.storeService_.dispatch(Action.TOGGLE_STORY_HAS_BACKGROUND_AUDIO, storyHasBackgroundAudio);
    }
    /**
     * Shows the play/pause icon if there is an element with playback on the story.
     * @private
     */

  }, {
    key: "updatePausedIcon_",
    value: function updatePausedIcon_() {
      var containsElementsWithPlayback = !!scopedQuerySelector(this.element, 'amp-story-grid-layer amp-audio, amp-story-grid-layer amp-video, amp-story-page[background-audio], amp-story-page[auto-advance-after]');
      var storyHasBackgroundAudio = this.element.hasAttribute('background-audio');
      this.storeService_.dispatch(Action.TOGGLE_STORY_HAS_PLAYBACK_UI, containsElementsWithPlayback || storyHasBackgroundAudio);
    }
    /**
     * Handles the rewind viewer event.
     * @private
     */

  }, {
    key: "onRewind_",
    value: function onRewind_() {
      var _this31 = this;

      this.signals().whenSignal(CommonSignals.LOAD_END).then(function () {
        return _this31.replay_();
      });
    }
    /**
     * Handles the selectPage viewer event.
     * @param {!JsonObject} data
     * @private
     */

  }, {
    key: "onSelectPage_",
    value: function onSelectPage_(data) {
      if (!data) {
        return;
      }

      this.storeService_.dispatch(Action.SET_ADVANCEMENT_MODE, AdvancementMode.VIEWER_SELECT_PAGE);

      if (data['next']) {
        this.next_();
      } else if (data['previous']) {
        this.previous_();
      } else if (data['delta']) {
        this.switchDelta_(data['delta']);
      } else if (data['id']) {
        this.switchTo_(data['id'], this.getPageIndexById(data['id']) > this.getPageIndex(this.activePage_) ? NavigationDirection.NEXT : NavigationDirection.PREVIOUS);
      }
    }
    /**
     * Switches to a page in the story given a delta. If new index is out of
     * bounds, it will go to the last or first page (depending on direction).
     * @param {number} delta
     * @private
     */

  }, {
    key: "switchDelta_",
    value: function switchDelta_(delta) {
      var currentPageIdx = this.storeService_.get(StateProperty.CURRENT_PAGE_INDEX);
      var newPageIdx = delta > 0 ? Math.min(this.pages_.length - 1, currentPageIdx + delta) : Math.max(0, currentPageIdx + delta);
      var targetPage = this.pages_[newPageIdx];

      if (!this.isActualPage_(targetPage && targetPage.element.id) || newPageIdx === currentPageIdx) {
        return;
      }

      var direction = newPageIdx > currentPageIdx ? NavigationDirection.NEXT : NavigationDirection.PREVIOUS;
      this.switchTo_(targetPage.element.id, direction);
    }
    /**
     * Checks for the presence of a sidebar. If a sidebar does exist, then an icon
     * permitting for the opening/closing of the sidebar is shown.
     * @private
     */

  }, {
    key: "initializeSidebar_",
    value: function initializeSidebar_() {
      var _this32 = this;

      this.sidebar_ = this.element.querySelector('amp-sidebar');

      if (!this.sidebar_) {
        return;
      }

      this.mutateElement(function () {
        _this32.sidebar_.classList.add(SIDEBAR_CLASS_NAME);
      });
      this.initializeOpacityMask_();
      this.storeService_.dispatch(Action.TOGGLE_HAS_SIDEBAR, !!this.sidebar_);
      var actions = [{
        tagOrTarget: 'AMP-SIDEBAR',
        method: 'open'
      }, {
        tagOrTarget: 'AMP-SIDEBAR',
        method: 'close'
      }, {
        tagOrTarget: 'AMP-SIDEBAR',
        method: 'toggle'
      }];
      this.storeService_.dispatch(Action.ADD_TO_ACTIONS_ALLOWLIST, actions);
    }
    /**
     * Checks for the the storyNavigationPath stack in the history.
     * @private
     */

  }, {
    key: "initializeStoryNavigationPath_",
    value: function initializeStoryNavigationPath_() {
      var _this33 = this;

      var navigationPath = getHistoryState(this.win, HistoryState.NAVIGATION_PATH);

      if (!navigationPath || !navigationPath.every(function (pageId) {
        return _this33.isActualPage_(pageId);
      })) {
        navigationPath = [];
      }

      this.storeService_.dispatch(Action.SET_NAVIGATION_PATH, navigationPath);
    }
    /** @private */

  }, {
    key: "replay_",
    value: function replay_() {
      var _this34 = this;

      this.storeService_.dispatch(Action.SET_NAVIGATION_PATH, []);
      var switchPromise = this.switchTo_(dev().assertElement(this.pages_[0].element).id, NavigationDirection.NEXT);

      // Restart page media, advancements, etc (#27742).
      if (this.pages_.length === 1) {
        this.pages_[0].setState(PageState.NOT_ACTIVE);
        this.pages_[0].setState(PageState.PLAYING);
      }

      // Reset all pages so that they are offscreen to right instead of left in
      // desktop view.
      switchPromise.then(function () {
        _this34.pages_.forEach(function (page) {
          return removeAttributeInMutate(page, Attributes.VISITED);
        });
      });
    }
    /**
     * @param {!AmpStoryPage} page The page whose CTA anchor tags should be
     *     upgraded.
     * @param {number} pageIndex The index of the page.
     * @private
     */

  }, {
    key: "upgradeCtaAnchorTagsForTracking_",
    value: function upgradeCtaAnchorTagsForTracking_(page, pageIndex) {
      this.mutateElement(function () {
        var pageId = page.element.id;
        var ctaAnchorEls = scopedQuerySelectorAll(page.element, 'amp-story-cta-layer a');
        Array.prototype.forEach.call(ctaAnchorEls, function (ctaAnchorEl) {
          ctaAnchorEl.setAttribute('data-vars-story-page-id', pageId);
          ctaAnchorEl.setAttribute('data-vars-story-page-index', pageIndex);
        });
      });
    }
    /**
     * Add page to back of pages_ array
     * @param {!./amp-story-page.AmpStoryPage} page
     */

  }, {
    key: "addPage",
    value: function addPage(page) {
      this.pages_.push(page);

      if (page.isAd()) {
        this.adPages_.push(page);
      }
    }
    /**
     * Insert a new page in navigation flow by changing the attr pointers
     * on amp-story-page elements
     * @param {string} pageBeforeId
     * @param {string} pageToBeInsertedId
     * @return {boolean} was page inserted
     */

  }, {
    key: "insertPage",
    value: function insertPage(pageBeforeId, pageToBeInsertedId) {
      // TODO(ccordry): make sure this method moves to PageManager when
      // implemented
      var pageToBeInserted = this.getPageById(pageToBeInsertedId);
      var pageToBeInsertedEl = pageToBeInserted.element;

      if (pageToBeInserted.isAd() && !this.storeService_.get(StateProperty.CAN_INSERT_AUTOMATIC_AD)) {
        dev().expectedError(TAG, 'Inserting ads automatically is disallowed.');
        return false;
      }

      var pageBefore = this.getPageById(pageBeforeId);
      var pageBeforeEl = pageBefore.element;
      var nextPage = this.getNextPage(pageBefore);

      if (!nextPage) {
        return false;
      }

      var advanceAttr = isExperimentOn(this.win, 'amp-story-branching') ? Attributes.PUBLIC_ADVANCE_TO : Attributes.ADVANCE_TO;
      pageBeforeEl.setAttribute(advanceAttr, pageToBeInsertedId);
      pageBeforeEl.setAttribute(Attributes.AUTO_ADVANCE_TO, pageToBeInsertedId);
      pageToBeInsertedEl.setAttribute(Attributes.RETURN_TO, pageBeforeId);
      var nextPageEl = nextPage.element;
      var nextPageId = nextPageEl.id;

      // For a live story, nextPage is the same as pageToBeInserted. But not for
      // ads since it's inserted between two pages.
      if (nextPageId !== pageToBeInsertedId) {
        pageToBeInsertedEl.setAttribute(advanceAttr, nextPageId);
        pageToBeInsertedEl.setAttribute(Attributes.AUTO_ADVANCE_TO, nextPageId);
        nextPageEl.setAttribute(Attributes.RETURN_TO, pageToBeInsertedId);
      }

      return true;
    }
    /**
     * Get next page object
     * @param {!./amp-story-page.AmpStoryPage} page
     * @return {?./amp-story-page.AmpStoryPage}
     */

  }, {
    key: "getNextPage",
    value: function getNextPage(page) {
      var nextPageId = page.getNextPageId(true
      /*opt_isAutomaticAdvance */
      );

      if (!nextPageId) {
        return null;
      }

      return this.getPageById(nextPageId);
    }
    /**
     * @param {!Window} win
     * @return {boolean} true if the user's browser supports the features needed
     *     for amp-story.
     */

  }, {
    key: "maybeLoadStoryDevTools_",
    value:
    /**
     * Loads amp-story-dev-tools if it is enabled.
     * @private
     */
    function maybeLoadStoryDevTools_() {
      if (!isModeDevelopment(this.win) || this.element.getAttribute('mode') === 'inspect') {
        return false;
      }

      this.element.setAttribute('mode', 'inspect');
      var devToolsEl = this.win.document.createElement('amp-story-dev-tools');
      this.win.document.body.appendChild(devToolsEl);
      this.element.setAttribute('hide', '');
      Services.extensionsFor(this.win).installExtensionForDoc(this.getAmpDoc(), 'amp-story-dev-tools');
      return true;
    }
    /**
     * Should enable the context menu (long press) on the element passed.
     * @private
     * @param {!Element} element
     * @return {boolean}
     */

  }, {
    key: "allowContextMenuOnMobile_",
    value: function allowContextMenuOnMobile_(element) {
      // Match page attachments with links.
      return !!closest(element, function (e) {
        return matches(e, 'a.i-amphtml-story-page-open-attachment[href]');
      }, this.element);
    }
  }], [{
    key: "prerenderAllowed",
    value:
    /** @override @nocollapse */
    function prerenderAllowed() {
      return true;
    }
  }, {
    key: "isBrowserSupported",
    value: function isBrowserSupported(win) {
      return Boolean(win.CSS && win.CSS.supports && win.CSS.supports('display', 'grid') && win.CSS.supports('color', 'var(--test)'));
    }
  }]);

  return AmpStory;
}(AMP.BaseElement);
AMP.extension('amp-story', '1.0', function (AMP) {
  AMP.registerElement('amp-story', AmpStory, CSS);
  AMP.registerElement('amp-story-access', AmpStoryAccess);
  AMP.registerElement('amp-story-consent', AmpStoryConsent);
  AMP.registerElement('amp-story-cta-layer', AmpStoryCtaLayer);
  AMP.registerElement('amp-story-grid-layer', AmpStoryGridLayer);
  AMP.registerElement('amp-story-page', AmpStoryPage);
  AMP.registerElement('amp-story-page-attachment', AmpStoryPageAttachment);
  AMP.registerElement('amp-story-page-outlink', AmpStoryPageAttachment);
  // Shares codepath with amp-story-page-attachment.
  AMP.registerServiceForDoc('amp-story-render', AmpStoryRenderService);
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFtcC1zdG9yeS5qcyJdLCJuYW1lcyI6WyJBY3Rpb24iLCJFbWJlZGRlZENvbXBvbmVudFN0YXRlIiwiSW50ZXJhY3RpdmVDb21wb25lbnREZWYiLCJTdGF0ZVByb3BlcnR5IiwiVUlUeXBlIiwiZ2V0U3RvcmVTZXJ2aWNlIiwiQWN0aW9uVHJ1c3QiLCJBZHZhbmNlbWVudENvbmZpZyIsIlRhcE5hdmlnYXRpb25EaXJlY3Rpb24iLCJBZHZhbmNlbWVudE1vZGUiLCJTdG9yeUFuYWx5dGljc0V2ZW50IiwiZ2V0QW5hbHl0aWNzU2VydmljZSIsIkFtcEV2ZW50cyIsIkFtcFN0b3J5QWNjZXNzIiwiQW1wU3RvcnlDb25zZW50IiwiQW1wU3RvcnlDdGFMYXllciIsIkFtcFN0b3J5RW1iZWRkZWRDb21wb25lbnQiLCJBbXBTdG9yeUdyaWRMYXllciIsIkFtcFN0b3J5SGludCIsIkFtcFN0b3J5UGFnZSIsIk5hdmlnYXRpb25EaXJlY3Rpb24iLCJQYWdlU3RhdGUiLCJBbXBTdG9yeVBhZ2VBdHRhY2htZW50IiwiQW1wU3RvcnlSZW5kZXJTZXJ2aWNlIiwiQW1wU3RvcnlWaWV3ZXJNZXNzYWdpbmdIYW5kbGVyIiwiQW5hbHl0aWNzVmFyaWFibGUiLCJnZXRWYXJpYWJsZVNlcnZpY2UiLCJCYWNrZ3JvdW5kQmx1ciIsIkNTUyIsIkNvbW1vblNpZ25hbHMiLCJFdmVudFR5cGUiLCJkaXNwYXRjaCIsIkdlc3R1cmVzIiwicHJlZmVyc1JlZHVjZWRNb3Rpb24iLCJIaXN0b3J5U3RhdGUiLCJnZXRIaXN0b3J5U3RhdGUiLCJzZXRIaXN0b3J5U3RhdGUiLCJJbmZvRGlhbG9nIiwiS2V5cyIsIkxheW91dCIsIkxpdmVTdG9yeU1hbmFnZXIiLCJNZWRpYVBvb2wiLCJNZWRpYVR5cGUiLCJQYWdpbmF0aW9uQnV0dG9ucyIsIlNlcnZpY2VzIiwiU2hhcmVNZW51IiwiU3dpcGVYWVJlY29nbml6ZXIiLCJTeXN0ZW1MYXllciIsIlVuc3VwcG9ydGVkQnJvd3NlckxheWVyIiwiVmlld3BvcnRXYXJuaW5nTGF5ZXIiLCJWaXNpYmlsaXR5U3RhdGUiLCJjaGlsZEVsZW1lbnQiLCJjaGlsZEVsZW1lbnRCeVRhZyIsImNoaWxkRWxlbWVudHMiLCJjaGlsZE5vZGVzIiwiY2xvc2VzdCIsIm1hdGNoZXMiLCJzY29wZWRRdWVyeVNlbGVjdG9yIiwic2NvcGVkUXVlcnlTZWxlY3RvckFsbCIsImNvbXB1dGVkU3R5bGUiLCJzZXRJbXBvcnRhbnRTdHlsZXMiLCJ0b2dnbGUiLCJjcmVhdGVQc2V1ZG9Mb2NhbGUiLCJkZWJvdW5jZSIsImRldiIsImRldkFzc2VydCIsInVzZXIiLCJkaWN0IiwibWFwIiwiZW5kc1dpdGgiLCJlc2NhcGVDc3NTZWxlY3RvcklkZW50IiwiZmluZEluZGV4IiwibGFzdEl0ZW0iLCJ0b0FycmF5IiwiZ2V0Q29uc2VudFBvbGljeVN0YXRlIiwiZ2V0RGV0YWlsIiwiZ2V0TG9jYWxpemF0aW9uU2VydmljZSIsImdldE1lZGlhUXVlcnlTZXJ2aWNlIiwiZ2V0TW9kZSIsImlzTW9kZURldmVsb3BtZW50IiwiZ2V0V2luZG93SGlzdG9yeVN0YXRlIiwiaXNEZXNrdG9wT25lUGFuZWxFeHBlcmltZW50T24iLCJpc0V4cGVyaW1lbnRPbiIsImlzUlRMIiwicGFyc2VRdWVyeVN0cmluZyIsInJlbW92ZUF0dHJpYnV0ZUluTXV0YXRlIiwic2V0QXR0cmlidXRlSW5NdXRhdGUiLCJzaG91bGRTaG93U3RvcnlVcmxJbmZvIiwidXBncmFkZUJhY2tncm91bmRBdWRpbyIsIndoZW5VcGdyYWRlZFRvQ3VzdG9tRWxlbWVudCIsIkxvY2FsaXplZFN0cmluZ3NBciIsIkxvY2FsaXplZFN0cmluZ3NEZSIsIkxvY2FsaXplZFN0cmluZ3NEZWZhdWx0IiwiTG9jYWxpemVkU3RyaW5nc0VuIiwiTG9jYWxpemVkU3RyaW5nc0VuR2IiLCJMb2NhbGl6ZWRTdHJpbmdzRXMiLCJMb2NhbGl6ZWRTdHJpbmdzRXM0MTkiLCJMb2NhbGl6ZWRTdHJpbmdzRnIiLCJMb2NhbGl6ZWRTdHJpbmdzSGkiLCJMb2NhbGl6ZWRTdHJpbmdzSWQiLCJMb2NhbGl6ZWRTdHJpbmdzSXQiLCJMb2NhbGl6ZWRTdHJpbmdzSmEiLCJMb2NhbGl6ZWRTdHJpbmdzS28iLCJMb2NhbGl6ZWRTdHJpbmdzTmwiLCJMb2NhbGl6ZWRTdHJpbmdzTm8iLCJMb2NhbGl6ZWRTdHJpbmdzUHRCciIsIkxvY2FsaXplZFN0cmluZ3NQdFB0IiwiTG9jYWxpemVkU3RyaW5nc1J1IiwiTG9jYWxpemVkU3RyaW5nc1RyIiwiTG9jYWxpemVkU3RyaW5nc1ZpIiwiTG9jYWxpemVkU3RyaW5nc1poQ24iLCJMb2NhbGl6ZWRTdHJpbmdzWmhUdyIsIkRFU0tUT1BfV0lEVEhfVEhSRVNIT0xEIiwiREVTS1RPUF9IRUlHSFRfVEhSRVNIT0xEIiwiREVTS1RPUF9PTkVfUEFORUxfQVNQRUNUX1JBVElPX1RIUkVTSE9MRCIsIk1JTl9TV0lQRV9GT1JfSElOVF9PVkVSTEFZX1BYIiwiQXR0cmlidXRlcyIsIkFEX1NIT1dJTkciLCJBRFZBTkNFX1RPIiwiQVVUT19BRFZBTkNFX0FGVEVSIiwiQVVUT19BRFZBTkNFX1RPIiwiREVTS1RPUF9QT1NJVElPTiIsIk1VVEVEIiwiT1JJRU5UQVRJT04iLCJQVUJMSUNfQURWQU5DRV9UTyIsIlJFVFVSTl9UTyIsIlNUQU5EQUxPTkUiLCJTVVBQT1JUU19MQU5EU0NBUEUiLCJWSVNJVEVEIiwiSU5JVElBTF9DT05URU5UX0xPQURfVElNRU9VVF9NUyIsIk1JTklNVU1fQURfTUVESUFfRUxFTUVOVFMiLCJTVE9SWV9MT0FERURfQ0xBU1NfTkFNRSIsIk9QQUNJVFlfTUFTS19DTEFTU19OQU1FIiwiU0lERUJBUl9DTEFTU19OQU1FIiwiTUFYX01FRElBX0VMRU1FTlRfQ09VTlRTIiwiQVVESU8iLCJWSURFTyIsIlRBRyIsIkRFRkFVTFRfVEhFTUVfQ09MT1IiLCJTSURFQkFSX09CU0VSVkVSX09QVElPTlMiLCJhdHRyaWJ1dGVzIiwiYXR0cmlidXRlRmlsdGVyIiwiQW1wU3RvcnkiLCJlbGVtZW50Iiwic3RvcmVTZXJ2aWNlXyIsIndpbiIsImRvY3VtZW50IiwiVE9HR0xFX1JUTCIsImFuYWx5dGljc1NlcnZpY2VfIiwiYWR2YW5jZW1lbnRfIiwiZm9yRWxlbWVudCIsInN0YXJ0IiwidnN5bmNfIiwiZ2V0VnN5bmMiLCJzaGFyZU1lbnVfIiwic3lzdGVtTGF5ZXJfIiwidW5zdXBwb3J0ZWRCcm93c2VyTGF5ZXJfIiwicGFnZXNfIiwiYWRQYWdlc18iLCJ2YXJpYWJsZVNlcnZpY2VfIiwiYWN0aXZlUGFnZV8iLCJkZXNrdG9wTWVkaWFfIiwibWF0Y2hNZWRpYSIsImRlc2t0b3BPbmVQYW5lbE1lZGlhXyIsImNhblJvdGF0ZVRvRGVza3RvcE1lZGlhXyIsImxhbmRzY2FwZU9yaWVudGF0aW9uTWVkaWFfIiwiYmFja2dyb3VuZEF1ZGlvRWxfIiwiYW1wU3RvcnlIaW50XyIsIm1lZGlhUG9vbF8iLCJmb3IiLCJhcmVBY2Nlc3NBdXRob3JpemF0aW9uc0NvbXBsZXRlZF8iLCJuYXZpZ2F0ZVRvUGFnZUFmdGVyQWNjZXNzXyIsInRpbWVyXyIsInRpbWVyRm9yIiwicGxhdGZvcm1fIiwicGxhdGZvcm1Gb3IiLCJ2aWV3ZXJfIiwidmlld2VyTWVzc2FnaW5nSGFuZGxlcl8iLCJsb2NhbGl6YXRpb25TZXJ2aWNlXyIsInBhdXNlZFN0YXRlVG9SZXN0b3JlXyIsInNpZGViYXJfIiwic2lkZWJhck9ic2VydmVyXyIsIm1hc2tFbGVtZW50XyIsImxpdmVTdG9yeU1hbmFnZXJfIiwiYmFja2dyb3VuZEJsdXJfIiwidmlld2VyRm9yRG9jIiwiaXNFbWJlZGRlZCIsInJlZ2lzdGVyTG9jYWxpemVkU3RyaW5nQnVuZGxlIiwiZW5YYVBzZXVkb0xvY2FsZUJ1bmRsZSIsInMiLCJpc1N0YW5kYWxvbmVfIiwiaW5pdGlhbGl6ZVN0YW5kYWxvbmVTdG9yeV8iLCJtdXRhdGVFbGVtZW50IiwicGFnZUlkIiwiZ2V0SW5pdGlhbFBhZ2VJZF8iLCJwYWdlIiwicXVlcnlTZWxlY3RvciIsInNldEF0dHJpYnV0ZSIsImluaXRpYWxpemVTdHlsZXNfIiwiaW5pdGlhbGl6ZUxpc3RlbmVyc18iLCJpbml0aWFsaXplTGlzdGVuZXJzRm9yRGV2XyIsImluaXRpYWxpemVQYWdlSWRzXyIsImluaXRpYWxpemVTdG9yeVBsYXllcl8iLCJUT0dHTEVfVUkiLCJnZXRVSVR5cGVfIiwiaXNCb3QiLCJyZW1vdmVBdHRyaWJ1dGUiLCJ0ZXh0Tm9kZXMiLCJub2RlIiwibm9kZVR5cGUiLCJOb2RlIiwiVEVYVF9OT0RFIiwiZm9yRWFjaCIsInJlbW92ZUNoaWxkIiwicmVnaXN0ZXJBY3Rpb24iLCJpbnZvY2F0aW9uIiwiYXJncyIsIlNFVF9BRFZBTkNFTUVOVF9NT0RFIiwiR09fVE9fUEFHRSIsInByb21pc2UiLCJnZXQiLCJTSURFQkFSX1NUQVRFIiwiaGlzdG9yeUZvckRvYyIsImdldEFtcERvYyIsImdvQmFjayIsInRoZW4iLCJzd2l0Y2hUb18iLCJORVhUIiwicGVyZm9ybWFuY2VGb3IiLCJhZGRFbmFibGVkRXhwZXJpbWVudCIsImNsYXNzTGlzdCIsImFkZCIsIm1heWJlTG9hZFN0b3J5RGV2VG9vbHNfIiwiUEFVU0VEX1NUQVRFIiwiVE9HR0xFX1BBVVNFRCIsIk1VVEVEX1NUQVRFIiwicGF1c2VCYWNrZ3JvdW5kQXVkaW9fIiwiZ2V0VmlzaWJpbGl0eVN0YXRlIiwiSU5BQ1RJVkUiLCJzZXRTdGF0ZSIsIk5PVF9BQ1RJVkUiLCJwbGF5QmFja2dyb3VuZEF1ZGlvXyIsImh0bWwiLCJkb2N1bWVudEVsZW1lbnQiLCJsb2NrQm9keV8iLCJvblJlc2l6ZSIsIm1lZGlhUXVlcnlFbHMiLCJxdWVyeVNlbGVjdG9yQWxsIiwibGVuZ3RoIiwiaW5pdGlhbGl6ZU1lZGlhUXVlcmllc18iLCJzdHlsZUVsIiwicmV3cml0ZVN0eWxlc18iLCJzZXJ2aWNlIiwib25NZWRpYVF1ZXJ5TWF0Y2giLCJjbGFzc05hbWUiLCJlbCIsImdldEF0dHJpYnV0ZSIsIm1lZGlhIiwicGFnZUVscyIsInBhZ2VJZHMiLCJpZCIsImlkc01hcCIsImkiLCJ1bmRlZmluZWQiLCJlcnJvciIsIm5ld0lkIiwiU0VUX1BBR0VfSURTIiwidGV4dENvbnRlbnQiLCJyZXBsYWNlIiwibWV0YSIsImNyZWF0ZUVsZW1lbnQiLCJhbXBTdG9yeVBhZ2VFbCIsIm5hbWUiLCJjb250ZW50IiwiZ2V0UHJvcGVydHlWYWx1ZSIsImFzc2VydEVsZW1lbnQiLCJoZWFkIiwiYXBwZW5kQ2hpbGQiLCJpbml0aWFsUGFnZUlkIiwidXBkYXRlQXVkaW9JY29uXyIsInVwZGF0ZVBhdXNlZEljb25fIiwiYnVpbGQiLCJhZGRFdmVudExpc3RlbmVyIiwiTkVYVF9QQUdFIiwibmV4dF8iLCJQUkVWSU9VU19QQUdFIiwicHJldmlvdXNfIiwic3Vic2NyaWJlIiwiaXNNdXRlZCIsIm9uTXV0ZWRTdGF0ZVVwZGF0ZV8iLCJvblZhcmlhYmxlVXBkYXRlIiwiU1RPUllfSVNfTVVURUQiLCJ0cmlnZ2VyRXZlbnQiLCJTVE9SWV9NVVRFRCIsIlNUT1JZX1VOTVVURUQiLCJTVVBQT1JURURfQlJPV1NFUl9TVEFURSIsImlzQnJvd3NlclN1cHBvcnRlZCIsIm9uU3VwcG9ydGVkQnJvd3NlclN0YXRlVXBkYXRlXyIsIkFEVkFOQ0VNRU5UX01PREUiLCJtb2RlIiwiU1RPUllfQURWQU5DRU1FTlRfTU9ERSIsIkNBTl9TSE9XX0FVRElPX1VJIiwic2hvdyIsIlNXSVRDSF9QQUdFIiwiZSIsImhpZGVBbGxOYXZpZ2F0aW9uSGludCIsIlBBR0VfUFJPR1JFU1MiLCJkZXRhaWwiLCJwcm9ncmVzcyIsImlzQWQiLCJ1cGRhdGVQcm9ncmVzcyIsIlJFUExBWSIsInJlcGxheV8iLCJOT19ORVhUX1BBR0UiLCJvbk5vTmV4dFBhZ2VfIiwiTk9fUFJFVklPVVNfUEFHRSIsIm9uTm9QcmV2aW91c1BhZ2VfIiwiYWRkT25UYXBOYXZpZ2F0aW9uTGlzdGVuZXIiLCJkaXJlY3Rpb24iLCJwZXJmb3JtVGFwTmF2aWdhdGlvbl8iLCJESVNQQVRDSF9BQ1RJT04iLCJ0ZXN0IiwiYWN0aW9uIiwiZGF0YSIsIkFDVElPTlNfQUxMT1dMSVNUIiwiYWN0aW9uc0FsbG93bGlzdCIsImFjdGlvbnMiLCJhY3Rpb25TZXJ2aWNlRm9yRG9jIiwic2V0QWxsb3dsaXN0IiwiQURfU1RBVEUiLCJvbkFkU3RhdGVVcGRhdGVfIiwiaXNQYXVzZWQiLCJvblBhdXNlZFN0YXRlVXBkYXRlXyIsInNpZGViYXJTdGF0ZSIsIm9uU2lkZWJhclN0YXRlVXBkYXRlXyIsIlVJX1NUQVRFIiwidWlTdGF0ZSIsIm9uVUlTdGF0ZVVwZGF0ZV8iLCJvbktleURvd25fIiwiTU9CSUxFIiwiYWxsb3dDb250ZXh0TWVudU9uTW9iaWxlXyIsInRhcmdldCIsInByZXZlbnREZWZhdWx0Iiwic3RvcFByb3BhZ2F0aW9uIiwib25WaXNpYmlsaXR5Q2hhbmdlZCIsIm9uVmlzaWJpbGl0eUNoYW5nZWRfIiwibWF5YmVQYWdlSWQiLCJsb2NhdGlvbiIsImhhc2giLCJpc0FjdHVhbFBhZ2VfIiwiaHJlZiIsIlJlZ0V4cCIsInNsaWNlIiwiaGlzdG9yeSIsInJlcGxhY2VTdGF0ZSIsInRpdGxlIiwiYm9keUVsT2JzZXJ2ZXIiLCJNdXRhdGlvbk9ic2VydmVyIiwibXV0YXRpb25zIiwib25Cb2R5RWxNdXRhdGlvbl8iLCJvYnNlcnZlIiwiYm9keSIsImdldFZpZXdwb3J0IiwiaW5zdGFsbEdlc3R1cmVSZWNvZ25pemVyc18iLCJvbk1lc3NhZ2UiLCJvblNlbGVjdFBhZ2VfIiwib25SZXdpbmRfIiwic3RhcnRMaXN0ZW5pbmciLCJtdXRhdGlvbiIsImJvZHlFbCIsIlRPR0dMRV9LRVlCT0FSRF9BQ1RJVkVfU1RBVEUiLCJjb250YWlucyIsImhhc0NhcGFiaWxpdHkiLCJnZXN0dXJlcyIsIm9uR2VzdHVyZSIsImdlc3R1cmUiLCJkZWx0YVgiLCJkZWx0YVkiLCJlbWJlZENvbXBvbmVudCIsIklOVEVSQUNUSVZFX0NPTVBPTkVOVF9TVEFURSIsInN0YXRlIiwiSElEREVOIiwiQUNDRVNTX1NUQVRFIiwiU1lTVEVNX1VJX0lTX1ZJU0lCTEVfU1RBVEUiLCJDQU5fU0hPV19OQVZJR0FUSU9OX09WRVJMQVlfSElOVCIsImV2ZW50IiwiY2FuY2VsYWJsZSIsImRlZmF1bHRQcmV2ZW50ZWQiLCJpc1N3aXBlTGFyZ2VFbm91Z2hGb3JIaW50XyIsInNob3dOYXZpZ2F0aW9uT3ZlcmxheSIsInNpZGVTd2lwZSIsIk1hdGgiLCJhYnMiLCJ1cFN3aXBlIiwiZGV2ZWxvcG1lbnQiLCJERVZfTE9HX0VOVFJJRVNfQVZBSUxBQkxFIiwibG9nQWxsIiwicmVzZXRUb3VjaFpvb20iLCJkaXNhYmxlVG91Y2hab29tIiwibWF5YmVMb2NrU2NyZWVuT3JpZW50YXRpb25fIiwic2NyZWVuIiwibG9ja09yaWVudGF0aW9uIiwib3JpZW50YXRpb24iLCJsb2NrIiwibW96TG9ja09yaWVudGF0aW9uIiwibXNMb2NrT3JpZW50YXRpb24iLCJ1bnVzZWRPcmllbnRhdGlvbiIsIndhcm4iLCJtZXNzYWdlIiwiVE9HR0xFX1NVUFBPUlRFRF9CUk9XU0VSIiwibGF5b3V0U3RvcnlfIiwiYnVpbGRTeXN0ZW1MYXllcl8iLCJpbml0aWFsaXplU2lkZWJhcl8iLCJzZXRUaGVtZUNvbG9yXyIsInN0b3J5TGF5b3V0UHJvbWlzZSIsIlByb21pc2UiLCJhbGwiLCJ3aGVuRmlyc3RWaXNpYmxlIiwiaW5pdGlhbGl6ZVBhZ2VzXyIsImhhbmRsZUNvbnNlbnRFeHRlbnNpb25fIiwiaW5pdGlhbGl6ZVN0b3J5QWNjZXNzXyIsImluZGV4IiwidXBncmFkZUN0YUFuY2hvclRhZ3NGb3JUcmFja2luZ18iLCJpbml0aWFsaXplU3RvcnlOYXZpZ2F0aW9uUGF0aF8iLCJDQU5fU0hPV19QQUdJTkFUSU9OX0JVVFRPTlMiLCJzaG91bGRSZU9wZW5BdHRhY2htZW50Rm9yUGFnZUlkIiwiQVRUQUNITUVOVF9QQUdFX0lEIiwib3BlbkF0dGFjaG1lbnQiLCJpbmZvRGlhbG9nIiwid2hlbkluaXRpYWxDb250ZW50TG9hZGVkXyIsIm1hcmtTdG9yeUFzTG9hZGVkXyIsImluaXRpYWxpemVMaXZlU3RvcnlfIiwibWF5YmVMb2FkU3RvcnlFZHVjYXRpb25fIiwiaW5pdGlhbFBhZ2VFbCIsImhhc0JlZW5WaXNpYmxlIiwiaGFzQXR0cmlidXRlIiwiQUREX1RPX0FDVElPTlNfQUxMT1dMSVNUIiwidGFnT3JUYXJnZXQiLCJtZXRob2QiLCJET01fVVBEQVRFIiwidXBkYXRlIiwicHJlbG9hZFBhZ2VzQnlEaXN0YW5jZV8iLCJERVNLVE9QX1BBTkVMUyIsInNldERlc2t0b3BQb3NpdGlvbkF0dHJpYnV0ZXNfIiwicGFnZXMiLCJOQVZJR0FUSU9OX1BBVEgiLCJoaXN0b3J5UGFnZSIsImZpcnN0UGFnZUVsIiwic29tZSIsInRpbWVvdXRNcyIsInBhZ2VzVG9XYWl0Rm9yIiwic3RvcnlMb2FkUHJvbWlzZSIsImZpbHRlciIsIkJvb2xlYW4iLCJzaWduYWxzIiwid2hlblNpZ25hbCIsIkxPQURfRU5EIiwidGltZW91dFByb21pc2UiLCJjYXRjaCIsIlNUT1JZX0xPQURFRCIsImJ1YmJsZXMiLCJzZW5kIiwiU1RPUllfQ09OVEVOVF9MT0FERUQiLCJzaWduYWwiLCJJTklfTE9BRCIsImNvbnNlbnRFbCIsInBhdXNlU3RvcnlVbnRpbENvbnNlbnRJc1Jlc29sdmVkXyIsInZhbGlkYXRlQ29uc2VudF8iLCJwb2xpY3lJZCIsImdldENvbnNlbnRQb2xpY3kiLCJjb25zZW50UHJvbWlzZSIsImFsbG93ZWRUYWdzIiwidG9SZW1vdmVDaGlsZHJlbiIsImluZGV4T2YiLCJ0YWdOYW1lIiwiYWNjZXNzU2VydmljZUZvckRvY09yTnVsbCIsImFjY2Vzc1NlcnZpY2UiLCJhcmVGaXJzdEF1dGhvcml6YXRpb25zQ29tcGxldGVkIiwib25BcHBseUF1dGhvcml6YXRpb25zIiwib25BY2Nlc3NBcHBseUF1dGhvcml6YXRpb25zXyIsImZpcnN0UGFnZSIsIm5leHRQYWdlIiwiVE9HR0xFX0FDQ0VTUyIsImxheW91dCIsIkNPTlRBSU5FUiIsInBhZ2VJbXBsUHJvbWlzZXMiLCJBcnJheSIsInByb3RvdHlwZSIsImNhbGwiLCJwYWdlRWwiLCJnZXRJbXBsIiwib3B0X2lzQXV0b21hdGljQWR2YW5jZSIsImFjdGl2ZVBhZ2UiLCJuZXh0IiwiZ2V0UGFyYW0iLCJleHRlbnNpb25zRm9yIiwiaW5zdGFsbEV4dGVuc2lvbkZvckRvYyIsImFkdmFuY2VtZW50TW9kZSIsInByZXZpb3VzIiwiQ0FOX1NIT1dfUFJFVklPVVNfUEFHRV9IRUxQIiwic2hvd0ZpcnN0UGFnZUhpbnRPdmVybGF5IiwiTUFOVUFMX0FEVkFOQ0UiLCJQUkVWSU9VUyIsInRhcmdldFBhZ2VJZCIsInRhcmdldFBhZ2UiLCJnZXRQYWdlQnlJZCIsInBhZ2VJbmRleCIsImdldFBhZ2VJbmRleCIsIm9sZFBhZ2UiLCJ1cGRhdGVOYXZpZ2F0aW9uUGF0aF8iLCJzdGVwcyIsIlBMQVlJTkciLCJmb3JjZVJlcGFpbnRGb3JTYWZhcmlfIiwiQURWQU5DRV9UT19BRFMiLCJzdG9yZVBhZ2VJbmRleCIsIlRPR0dMRV9BRCIsIkNVUlJFTlRfUEFHRV9JTkRFWCIsImlzQXV0b0FkdmFuY2UiLCJnZXRQcm9ncmVzcyIsIkNIQU5HRV9QQUdFIiwicmVnaXN0ZXJBbmRQcmVsb2FkQmFja2dyb3VuZEF1ZGlvXyIsInRyaWdnZXJBY3RpdmVFdmVudEZvclBhZ2VfIiwicmVzZXREZXZlbG9wZXJMb2dzIiwic2V0RGV2ZWxvcGVyTG9nQ29udGV4dFN0cmluZyIsInJlc29sdmUiLCJiZWZvcmVWaXNpYmxlIiwidW5xdWV1ZVN0ZXBJblJBRiIsInNoaWZ0IiwicmVxdWVzdEFuaW1hdGlvbkZyYW1lIiwibmF2aWdhdGlvblBhdGgiLCJwb3AiLCJwdXNoIiwiU0VUX05BVklHQVRJT05fUEFUSCIsImxpc3QiLCJwb3NpdGlvbiIsIm1pbnVzT25lSWQiLCJnZXRQcmV2aW91c1BhZ2VJZCIsIm1pbnVzT25lUGFnZSIsIm1pbnVzVHdvSWQiLCJwbHVzT25lSWQiLCJnZXROZXh0UGFnZUlkIiwicGx1c09uZVBhZ2UiLCJwbHVzVHdvSWQiLCJkZXNrdG9wUG9zaXRpb25zVG9SZXNldCIsIm1lYXN1cmVNdXRhdGVFbGVtZW50IiwiZW50cnkiLCJ0cmlnZ2VyIiwiSElHSCIsImlzU2FmYXJpIiwiaXNJb3MiLCJoZWlnaHQiLCJvZmZzZXRIZWlnaHQiLCJydGxTdGF0ZSIsIlJUTF9TVEFURSIsImtleSIsIkxFRlRfQVJST1ciLCJSSUdIVF9BUlJPVyIsImlzTGFuZHNjYXBlIiwiaXNMYW5kc2NhcGVfIiwiaXNMYW5kc2NhcGVTdXBwb3J0ZWQiLCJpc0xhbmRzY2FwZVN1cHBvcnRlZF8iLCJzZXRPcmllbnRhdGlvbkF0dHJpYnV0ZV8iLCJUT0dHTEVfVklFV1BPUlRfV0FSTklORyIsIm1heWJlVHJpZ2dlclZpZXdwb3J0V2FybmluZ18iLCJWSUVXUE9SVF9XQVJOSU5HX1NUQVRFIiwiaXNWaXNpYmxlIiwicmVzdW1lXyIsInBhdXNlXyIsImRldGFjaCIsIm11dGF0ZSIsInJlbW92ZSIsIkRFU0tUT1BfT05FX1BBTkVMIiwiYXR0YWNoIiwiREVTS1RPUF9GVUxMQkxFRUQiLCJWRVJUSUNBTCIsInBhZ2VBdHRhY2htZW50cyIsImluc2VydEJlZm9yZSIsInBhcmVudEVsZW1lbnQiLCJuZXh0RWxlbWVudFNpYmxpbmciLCJpc0Rlc2t0b3BfIiwicGFnZVN0YXRlIiwiUEFVU0VEIiwiT1BFTiIsIkNMT1NFIiwiVE9HR0xFX1NJREVCQVIiLCJvcGVuT3BhY2l0eU1hc2tfIiwiZXhlY3V0ZSIsImNsb3NlT3BhY2l0eU1hc2tfIiwiZGlzY29ubmVjdCIsIm1hc2tFbCIsImZhbGxiYWNrRWwiLCJnZXRGYWxsYmFjayIsInJlbW92ZUxheWVyIiwidG9nZ2xlRmFsbGJhY2siLCJkaXN0YW5jZU1hcCIsImdldFBhZ2VEaXN0YW5jZU1hcEhlbHBlcl8iLCJwYWdlc0J5RGlzdGFuY2UiLCJPYmplY3QiLCJrZXlzIiwiZGlzdGFuY2UiLCJpbmRleEluU3RhY2siLCJtYXliZVByZXYiLCJnZXRBZGphY2VudFBhZ2VJZHMiLCJhZGphY2VudFBhZ2VJZCIsInByaW9yaXRpemVBY3RpdmVQYWdlIiwic2V0RGlzdGFuY2UiLCJnZXRQYWdlc0J5RGlzdGFuY2VfIiwicHJlbG9hZEFsbFBhZ2VzIiwiYWN0aXZlUGFnZUlkIiwicmVzIiwicmVqIiwiQ1VSUkVOVF9QQUdFX0lEIiwiYmFja2dyb3VuZEF1ZGlvRWwiLCJyZWdpc3RlciIsInByZWxvYWQiLCJ0b0xvd2VyQ2FzZSIsImdldFBhZ2VJbmRleEJ5SWQiLCJkZXNpcmVkUGFnZSIsInN0YXJ0aW5nRWxlbWVudCIsIm93bmVyRG9jdW1lbnQiLCJkZWZhdWx0VmlldyIsImZyYW1lRWxlbWVudCIsImdldFBhZ2VDb250YWluaW5nRWxlbWVudF8iLCJnZXREaXN0YW5jZSIsImF1ZGlvTWVkaWFFbGVtZW50c0NvdW50IiwidmlkZW9NZWRpYUVsZW1lbnRzQ291bnQiLCJtaW4iLCJtdXRlXyIsInVubXV0ZV8iLCJtdXRlQWxsTWVkaWEiLCJwYXVzZSIsInVubXV0ZUFsbE1lZGlhIiwiYmxlc3NBbGwiLCJ1bm11dGUiLCJwbGF5IiwiY29udGFpbnNNZWRpYUVsZW1lbnRXaXRoQXVkaW8iLCJzdG9yeUhhc0JhY2tncm91bmRBdWRpbyIsIlRPR0dMRV9TVE9SWV9IQVNfQVVESU8iLCJUT0dHTEVfU1RPUllfSEFTX0JBQ0tHUk9VTkRfQVVESU8iLCJjb250YWluc0VsZW1lbnRzV2l0aFBsYXliYWNrIiwiVE9HR0xFX1NUT1JZX0hBU19QTEFZQkFDS19VSSIsIlZJRVdFUl9TRUxFQ1RfUEFHRSIsInN3aXRjaERlbHRhXyIsImRlbHRhIiwiY3VycmVudFBhZ2VJZHgiLCJuZXdQYWdlSWR4IiwibWF4IiwiaW5pdGlhbGl6ZU9wYWNpdHlNYXNrXyIsIlRPR0dMRV9IQVNfU0lERUJBUiIsImV2ZXJ5Iiwic3dpdGNoUHJvbWlzZSIsImN0YUFuY2hvckVscyIsImN0YUFuY2hvckVsIiwicGFnZUJlZm9yZUlkIiwicGFnZVRvQmVJbnNlcnRlZElkIiwicGFnZVRvQmVJbnNlcnRlZCIsInBhZ2VUb0JlSW5zZXJ0ZWRFbCIsIkNBTl9JTlNFUlRfQVVUT01BVElDX0FEIiwiZXhwZWN0ZWRFcnJvciIsInBhZ2VCZWZvcmUiLCJwYWdlQmVmb3JlRWwiLCJnZXROZXh0UGFnZSIsImFkdmFuY2VBdHRyIiwibmV4dFBhZ2VFbCIsIm5leHRQYWdlSWQiLCJkZXZUb29sc0VsIiwic3VwcG9ydHMiLCJBTVAiLCJCYXNlRWxlbWVudCIsImV4dGVuc2lvbiIsInJlZ2lzdGVyRWxlbWVudCIsInJlZ2lzdGVyU2VydmljZUZvckRvYyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQ0VBLE1BREYsRUFFRUMsc0JBRkYsRUFHRUMsdUJBSEYsRUFJRUMsYUFKRixFQUtFQyxNQUxGLEVBTUVDLGVBTkY7QUFRQSxTQUFRQyxXQUFSO0FBQ0EsU0FBUUMsaUJBQVIsRUFBMkJDLHNCQUEzQjtBQUNBLFNBQ0VDLGVBREYsRUFFRUMsbUJBRkYsRUFHRUMsbUJBSEY7QUFLQSxTQUFRQyxTQUFSO0FBQ0EsU0FBUUMsY0FBUjtBQUNBLFNBQVFDLGVBQVI7QUFDQSxTQUFRQyxnQkFBUjtBQUNBLFNBQVFDLHlCQUFSO0FBQ0EsU0FBUUMsaUJBQVI7QUFDQSxTQUFRQyxZQUFSO0FBQ0EsU0FBUUMsWUFBUixFQUFzQkMsbUJBQXRCLEVBQTJDQyxTQUEzQztBQUNBLFNBQVFDLHNCQUFSO0FBQ0EsU0FBUUMscUJBQVI7QUFDQSxTQUFRQyw4QkFBUjtBQUNBLFNBQVFDLGlCQUFSLEVBQTJCQyxrQkFBM0I7QUFDQSxTQUFRQyxjQUFSO0FBQ0EsU0FBUUMsR0FBUjtBQUNBLFNBQVFDLGFBQVI7QUFDQSxTQUFRQyxTQUFSLEVBQW1CQyxRQUFuQjtBQUNBLFNBQVFDLFFBQVI7QUFDQSxTQUFRQyxvQkFBUjtBQUNBLFNBQVFDLFlBQVIsRUFBc0JDLGVBQXRCLEVBQXVDQyxlQUF2QztBQUNBLFNBQVFDLFVBQVI7QUFDQSxTQUFRQyxJQUFSO0FBQ0EsU0FBUUMsTUFBUjtBQUNB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SSxxQkFBSixDQUEwQixrQkFBMUIsRUFBOEN4b0IscUJBQTlDO0FBQ0QsQ0FWRCIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IDIwMTcgVGhlIEFNUCBIVE1MIEF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUy1JU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG4vKipcbiAqIEBmaWxlb3ZlcnZpZXcgRW1iZWRzIGEgc3RvcnlcbiAqXG4gKiBFeGFtcGxlOlxuICogPGNvZGU+XG4gKiA8YW1wLXN0b3J5IHN0YW5kYWxvbmU+XG4gKiAgIFsuLi5dXG4gKiA8L2FtcC1zdG9yeT5cbiAqIDwvY29kZT5cbiAqL1xuaW1wb3J0ICcuL2FtcC1zdG9yeS1jdGEtbGF5ZXInO1xuaW1wb3J0ICcuL2FtcC1zdG9yeS1ncmlkLWxheWVyJztcbmltcG9ydCAnLi9hbXAtc3RvcnktcGFnZSc7XG5pbXBvcnQge1xuICBBY3Rpb24sXG4gIEVtYmVkZGVkQ29tcG9uZW50U3RhdGUsXG4gIEludGVyYWN0aXZlQ29tcG9uZW50RGVmLFxuICBTdGF0ZVByb3BlcnR5LFxuICBVSVR5cGUsXG4gIGdldFN0b3JlU2VydmljZSxcbn0gZnJvbSAnLi9hbXAtc3Rvcnktc3RvcmUtc2VydmljZSc7XG5pbXBvcnQge0FjdGlvblRydXN0fSBmcm9tICcjY29yZS9jb25zdGFudHMvYWN0aW9uLWNvbnN0YW50cyc7XG5pbXBvcnQge0FkdmFuY2VtZW50Q29uZmlnLCBUYXBOYXZpZ2F0aW9uRGlyZWN0aW9ufSBmcm9tICcuL3BhZ2UtYWR2YW5jZW1lbnQnO1xuaW1wb3J0IHtcbiAgQWR2YW5jZW1lbnRNb2RlLFxuICBTdG9yeUFuYWx5dGljc0V2ZW50LFxuICBnZXRBbmFseXRpY3NTZXJ2aWNlLFxufSBmcm9tICcuL3N0b3J5LWFuYWx5dGljcyc7XG5pbXBvcnQge0FtcEV2ZW50c30gZnJvbSAnI2NvcmUvY29uc3RhbnRzL2FtcC1ldmVudHMnO1xuaW1wb3J0IHtBbXBTdG9yeUFjY2Vzc30gZnJvbSAnLi9hbXAtc3RvcnktYWNjZXNzJztcbmltcG9ydCB7QW1wU3RvcnlDb25zZW50fSBmcm9tICcuL2FtcC1zdG9yeS1jb25zZW50JztcbmltcG9ydCB7QW1wU3RvcnlDdGFMYXllcn0gZnJvbSAnLi9hbXAtc3RvcnktY3RhLWxheWVyJztcbmltcG9ydCB7QW1wU3RvcnlFbWJlZGRlZENvbXBvbmVudH0gZnJvbSAnLi9hbXAtc3RvcnktZW1iZWRkZWQtY29tcG9uZW50JztcbmltcG9ydCB7QW1wU3RvcnlHcmlkTGF5ZXJ9IGZyb20gJy4vYW1wLXN0b3J5LWdyaWQtbGF5ZXInO1xuaW1wb3J0IHtBbXBTdG9yeUhpbnR9IGZyb20gJy4vYW1wLXN0b3J5LWhpbnQnO1xuaW1wb3J0IHtBbXBTdG9yeVBhZ2UsIE5hdmlnYXRpb25EaXJlY3Rpb24sIFBhZ2VTdGF0ZX0gZnJvbSAnLi9hbXAtc3RvcnktcGFnZSc7XG5pbXBvcnQge0FtcFN0b3J5UGFnZUF0dGFjaG1lbnR9IGZyb20gJy4vYW1wLXN0b3J5LXBhZ2UtYXR0YWNobWVudCc7XG5pbXBvcnQge0FtcFN0b3J5UmVuZGVyU2VydmljZX0gZnJvbSAnLi9hbXAtc3RvcnktcmVuZGVyLXNlcnZpY2UnO1xuaW1wb3J0IHtBbXBTdG9yeVZpZXdlck1lc3NhZ2luZ0hhbmRsZXJ9IGZyb20gJy4vYW1wLXN0b3J5LXZpZXdlci1tZXNzYWdpbmctaGFuZGxlcic7XG5pbXBvcnQge0FuYWx5dGljc1ZhcmlhYmxlLCBnZXRWYXJpYWJsZVNlcnZpY2V9IGZyb20gJy4vdmFyaWFibGUtc2VydmljZSc7XG5pbXBvcnQge0JhY2tncm91bmRCbHVyfSBmcm9tICcuL2JhY2tncm91bmQtYmx1cic7XG5pbXBvcnQge0NTU30gZnJvbSAnLi4vLi4vLi4vYnVpbGQvYW1wLXN0b3J5LTEuMC5jc3MnO1xuaW1wb3J0IHtDb21tb25TaWduYWxzfSBmcm9tICcjY29yZS9jb25zdGFudHMvY29tbW9uLXNpZ25hbHMnO1xuaW1wb3J0IHtFdmVudFR5cGUsIGRpc3BhdGNofSBmcm9tICcuL2V2ZW50cyc7XG5pbXBvcnQge0dlc3R1cmVzfSBmcm9tICcuLi8uLi8uLi9zcmMvZ2VzdHVyZSc7XG5pbXBvcnQge3ByZWZlcnNSZWR1Y2VkTW90aW9ufSBmcm9tICcjY29yZS9kb20vbWVkaWEtcXVlcnktcHJvcHMnO1xuaW1wb3J0IHtIaXN0b3J5U3RhdGUsIGdldEhpc3RvcnlTdGF0ZSwgc2V0SGlzdG9yeVN0YXRlfSBmcm9tICcuL2hpc3RvcnknO1xuaW1wb3J0IHtJbmZvRGlhbG9nfSBmcm9tICcuL2FtcC1zdG9yeS1pbmZvLWRpYWxvZyc7XG5pbXBvcnQge0tleXN9IGZyb20gJyNjb3JlL2NvbnN0YW50cy9rZXktY29kZXMnO1xuaW1wb3J0IHtMYXlvdXR9IGZyb20gJyNjb3JlL2RvbS9sYXlvdXQnO1xuaW1wb3J0IHtMaXZlU3RvcnlNYW5hZ2VyfSBmcm9tICcuL2xpdmUtc3RvcnktbWFuYWdlcic7XG5pbXBvcnQge01lZGlhUG9vbCwgTWVkaWFUeXBlfSBmcm9tICcuL21lZGlhLXBvb2wnO1xuaW1wb3J0IHtQYWdpbmF0aW9uQnV0dG9uc30gZnJvbSAnLi9wYWdpbmF0aW9uLWJ1dHRvbnMnO1xuaW1wb3J0IHtTZXJ2aWNlc30gZnJvbSAnI3NlcnZpY2UnO1xuaW1wb3J0IHtTaGFyZU1lbnV9IGZyb20gJy4vYW1wLXN0b3J5LXNoYXJlLW1lbnUnO1xuaW1wb3J0IHtTd2lwZVhZUmVjb2duaXplcn0gZnJvbSAnLi4vLi4vLi4vc3JjL2dlc3R1cmUtcmVjb2duaXplcnMnO1xuaW1wb3J0IHtTeXN0ZW1MYXllcn0gZnJvbSAnLi9hbXAtc3Rvcnktc3lzdGVtLWxheWVyJztcbmltcG9ydCB7VW5zdXBwb3J0ZWRCcm93c2VyTGF5ZXJ9IGZyb20gJy4vYW1wLXN0b3J5LXVuc3VwcG9ydGVkLWJyb3dzZXItbGF5ZXInO1xuaW1wb3J0IHtWaWV3cG9ydFdhcm5pbmdMYXllcn0gZnJvbSAnLi9hbXAtc3Rvcnktdmlld3BvcnQtd2FybmluZy1sYXllcic7XG5pbXBvcnQge1Zpc2liaWxpdHlTdGF0ZX0gZnJvbSAnI2NvcmUvY29uc3RhbnRzL3Zpc2liaWxpdHktc3RhdGUnO1xuaW1wb3J0IHtcbiAgY2hpbGRFbGVtZW50LFxuICBjaGlsZEVsZW1lbnRCeVRhZyxcbiAgY2hpbGRFbGVtZW50cyxcbiAgY2hpbGROb2RlcyxcbiAgY2xvc2VzdCxcbiAgbWF0Y2hlcyxcbiAgc2NvcGVkUXVlcnlTZWxlY3RvcixcbiAgc2NvcGVkUXVlcnlTZWxlY3RvckFsbCxcbn0gZnJvbSAnI2NvcmUvZG9tL3F1ZXJ5JztcbmltcG9ydCB7Y29tcHV0ZWRTdHlsZSwgc2V0SW1wb3J0YW50U3R5bGVzLCB0b2dnbGV9IGZyb20gJyNjb3JlL2RvbS9zdHlsZSc7XG5pbXBvcnQge2NyZWF0ZVBzZXVkb0xvY2FsZX0gZnJvbSAnI3NlcnZpY2UvbG9jYWxpemF0aW9uL3N0cmluZ3MnO1xuaW1wb3J0IHtkZWJvdW5jZX0gZnJvbSAnI2NvcmUvdHlwZXMvZnVuY3Rpb24nO1xuaW1wb3J0IHtkZXYsIGRldkFzc2VydCwgdXNlcn0gZnJvbSAnLi4vLi4vLi4vc3JjL2xvZyc7XG5pbXBvcnQge2RpY3QsIG1hcH0gZnJvbSAnI2NvcmUvdHlwZXMvb2JqZWN0JztcbmltcG9ydCB7ZW5kc1dpdGh9IGZyb20gJyNjb3JlL3R5cGVzL3N0cmluZyc7XG5pbXBvcnQge2VzY2FwZUNzc1NlbGVjdG9ySWRlbnR9IGZyb20gJyNjb3JlL2RvbS9jc3Mtc2VsZWN0b3JzJztcbmltcG9ydCB7ZmluZEluZGV4LCBsYXN0SXRlbSwgdG9BcnJheX0gZnJvbSAnI2NvcmUvdHlwZXMvYXJyYXknO1xuaW1wb3J0IHtnZXRDb25zZW50UG9saWN5U3RhdGV9IGZyb20gJy4uLy4uLy4uL3NyYy9jb25zZW50JztcbmltcG9ydCB7Z2V0RGV0YWlsfSBmcm9tICcuLi8uLi8uLi9zcmMvZXZlbnQtaGVscGVyJztcbmltcG9ydCB7Z2V0TG9jYWxpemF0aW9uU2VydmljZX0gZnJvbSAnLi9hbXAtc3RvcnktbG9jYWxpemF0aW9uLXNlcnZpY2UnO1xuaW1wb3J0IHtnZXRNZWRpYVF1ZXJ5U2VydmljZX0gZnJvbSAnLi9hbXAtc3RvcnktbWVkaWEtcXVlcnktc2VydmljZSc7XG5pbXBvcnQge2dldE1vZGUsIGlzTW9kZURldmVsb3BtZW50fSBmcm9tICcuLi8uLi8uLi9zcmMvbW9kZSc7XG5pbXBvcnQge2dldEhpc3RvcnlTdGF0ZSBhcyBnZXRXaW5kb3dIaXN0b3J5U3RhdGV9IGZyb20gJyNjb3JlL3dpbmRvdy9oaXN0b3J5JztcbmltcG9ydCB7aXNEZXNrdG9wT25lUGFuZWxFeHBlcmltZW50T259IGZyb20gJy4vYW1wLXN0b3J5LWRlc2t0b3Atb25lLXBhbmVsJztcbmltcG9ydCB7aXNFeHBlcmltZW50T259IGZyb20gJyNleHBlcmltZW50cyc7XG5pbXBvcnQge2lzUlRMfSBmcm9tICcjY29yZS9kb20nO1xuaW1wb3J0IHtwYXJzZVF1ZXJ5U3RyaW5nfSBmcm9tICcjY29yZS90eXBlcy9zdHJpbmcvdXJsJztcbmltcG9ydCB7XG4gIHJlbW92ZUF0dHJpYnV0ZUluTXV0YXRlLFxuICBzZXRBdHRyaWJ1dGVJbk11dGF0ZSxcbiAgc2hvdWxkU2hvd1N0b3J5VXJsSW5mbyxcbn0gZnJvbSAnLi91dGlscyc7XG5pbXBvcnQge3VwZ3JhZGVCYWNrZ3JvdW5kQXVkaW99IGZyb20gJy4vYXVkaW8nO1xuaW1wb3J0IHt3aGVuVXBncmFkZWRUb0N1c3RvbUVsZW1lbnR9IGZyb20gJy4uLy4uLy4uL3NyYy9hbXAtZWxlbWVudC1oZWxwZXJzJztcbmltcG9ydCBMb2NhbGl6ZWRTdHJpbmdzQXIgZnJvbSAnLi9fbG9jYWxlcy9hci5qc29uJyBhc3NlcnQge3R5cGU6ICdqc29uJ307IC8vIGxndG1banMvc3ludGF4LWVycm9yXVxuaW1wb3J0IExvY2FsaXplZFN0cmluZ3NEZSBmcm9tICcuL19sb2NhbGVzL2RlLmpzb24nIGFzc2VydCB7dHlwZTogJ2pzb24nfTsgLy8gbGd0bVtqcy9zeW50YXgtZXJyb3JdXG5pbXBvcnQgTG9jYWxpemVkU3RyaW5nc0RlZmF1bHQgZnJvbSAnLi9fbG9jYWxlcy9kZWZhdWx0Lmpzb24nIGFzc2VydCB7dHlwZTogJ2pzb24nfTsgLy8gbGd0bVtqcy9zeW50YXgtZXJyb3JdXG5pbXBvcnQgTG9jYWxpemVkU3RyaW5nc0VuIGZyb20gJy4vX2xvY2FsZXMvZW4uanNvbicgYXNzZXJ0IHt0eXBlOiAnanNvbid9OyAvLyBsZ3RtW2pzL3N5bnRheC1lcnJvcl1cbmltcG9ydCBMb2NhbGl6ZWRTdHJpbmdzRW5HYiBmcm9tICcuL19sb2NhbGVzL2VuLUdCLmpzb24nIGFzc2VydCB7dHlwZTogJ2pzb24nfTsgLy8gbGd0bVtqcy9zeW50YXgtZXJyb3JdXG5pbXBvcnQgTG9jYWxpemVkU3RyaW5nc0VzIGZyb20gJy4vX2xvY2FsZXMvZXMuanNvbicgYXNzZXJ0IHt0eXBlOiAnanNvbid9OyAvLyBsZ3RtW2pzL3N5bnRheC1lcnJvcl1cbmltcG9ydCBMb2NhbGl6ZWRTdHJpbmdzRXM0MTkgZnJvbSAnLi9fbG9jYWxlcy9lcy00MTkuanNvbicgYXNzZXJ0IHt0eXBlOiAnanNvbid9OyAvLyBsZ3RtW2pzL3N5bnRheC1lcnJvcl1cbmltcG9ydCBMb2NhbGl6ZWRTdHJpbmdzRnIgZnJvbSAnLi9fbG9jYWxlcy9mci5qc29uJyBhc3NlcnQge3R5cGU6ICdqc29uJ307IC8vIGxndG1banMvc3ludGF4LWVycm9yXVxuaW1wb3J0IExvY2FsaXplZFN0cmluZ3NIaSBmcm9tICcuL19sb2NhbGVzL2hpLmpzb24nIGFzc2VydCB7dHlwZTogJ2pzb24nfTsgLy8gbGd0bVtqcy9zeW50YXgtZXJyb3JdXG5pbXBvcnQgTG9jYWxpemVkU3RyaW5nc0lkIGZyb20gJy4vX2xvY2FsZXMvaWQuanNvbicgYXNzZXJ0IHt0eXBlOiAnanNvbid9OyAvLyBsZ3RtW2pzL3N5bnRheC1lcnJvcl1cbmltcG9ydCBMb2NhbGl6ZWRTdHJpbmdzSXQgZnJvbSAnLi9fbG9jYWxlcy9pdC5qc29uJyBhc3NlcnQge3R5cGU6ICdqc29uJ307IC8vIGxndG1banMvc3ludGF4LWVycm9yXVxuaW1wb3J0IExvY2FsaXplZFN0cmluZ3NKYSBmcm9tICcuL19sb2NhbGVzL2phLmpzb24nIGFzc2VydCB7dHlwZTogJ2pzb24nfTsgLy8gbGd0bVtqcy9zeW50YXgtZXJyb3JdXG5pbXBvcnQgTG9jYWxpemVkU3RyaW5nc0tvIGZyb20gJy4vX2xvY2FsZXMva28uanNvbicgYXNzZXJ0IHt0eXBlOiAnanNvbid9OyAvLyBsZ3RtW2pzL3N5bnRheC1lcnJvcl1cbmltcG9ydCBMb2NhbGl6ZWRTdHJpbmdzTmwgZnJvbSAnLi9fbG9jYWxlcy9ubC5qc29uJyBhc3NlcnQge3R5cGU6ICdqc29uJ307IC8vIGxndG1banMvc3ludGF4LWVycm9yXVxuaW1wb3J0IExvY2FsaXplZFN0cmluZ3NObyBmcm9tICcuL19sb2NhbGVzL25vLmpzb24nIGFzc2VydCB7dHlwZTogJ2pzb24nfTsgLy8gbGd0bVtqcy9zeW50YXgtZXJyb3JdXG5pbXBvcnQgTG9jYWxpemVkU3RyaW5nc1B0QnIgZnJvbSAnLi9fbG9jYWxlcy9wdC1CUi5qc29uJyBhc3NlcnQge3R5cGU6ICdqc29uJ307IC8vIGxndG1banMvc3ludGF4LWVycm9yXVxuaW1wb3J0IExvY2FsaXplZFN0cmluZ3NQdFB0IGZyb20gJy4vX2xvY2FsZXMvcHQtUFQuanNvbicgYXNzZXJ0IHt0eXBlOiAnanNvbid9OyAvLyBsZ3RtW2pzL3N5bnRheC1lcnJvcl1cbmltcG9ydCBMb2NhbGl6ZWRTdHJpbmdzUnUgZnJvbSAnLi9fbG9jYWxlcy9ydS5qc29uJyBhc3NlcnQge3R5cGU6ICdqc29uJ307IC8vIGxndG1banMvc3ludGF4LWVycm9yXVxuaW1wb3J0IExvY2FsaXplZFN0cmluZ3NUciBmcm9tICcuL19sb2NhbGVzL3RyLmpzb24nIGFzc2VydCB7dHlwZTogJ2pzb24nfTsgLy8gbGd0bVtqcy9zeW50YXgtZXJyb3JdXG5pbXBvcnQgTG9jYWxpemVkU3RyaW5nc1ZpIGZyb20gJy4vX2xvY2FsZXMvdmkuanNvbicgYXNzZXJ0IHt0eXBlOiAnanNvbid9OyAvLyBsZ3RtW2pzL3N5bnRheC1lcnJvcl1cbmltcG9ydCBMb2NhbGl6ZWRTdHJpbmdzWmhDbiBmcm9tICcuL19sb2NhbGVzL3poLUNOLmpzb24nIGFzc2VydCB7dHlwZTogJ2pzb24nfTsgLy8gbGd0bVtqcy9zeW50YXgtZXJyb3JdXG5pbXBvcnQgTG9jYWxpemVkU3RyaW5nc1poVHcgZnJvbSAnLi9fbG9jYWxlcy96aC1UVy5qc29uJyBhc3NlcnQge3R5cGU6ICdqc29uJ307IC8vIGxndG1banMvc3ludGF4LWVycm9yXVxuXG4vKiogQHByaXZhdGUgQGNvbnN0IHtudW1iZXJ9ICovXG5jb25zdCBERVNLVE9QX1dJRFRIX1RIUkVTSE9MRCA9IDEwMjQ7XG5cbi8qKiBAcHJpdmF0ZSBAY29uc3Qge251bWJlcn0gKi9cbmNvbnN0IERFU0tUT1BfSEVJR0hUX1RIUkVTSE9MRCA9IDU1MDtcblxuLyoqXG4gKiBOT1RFOiBJZiB1ZHBhdGVkIGhlcmUsIHVwZGF0ZSBpbiBhbXAtc3RvcnktcGxheWVyLWltcGwuanNcbiAqIEBwcml2YXRlIEBjb25zdCB7c3RyaW5nfVxuICovXG5jb25zdCBERVNLVE9QX09ORV9QQU5FTF9BU1BFQ1RfUkFUSU9fVEhSRVNIT0xEID0gJzMgLyA0JztcblxuLyoqIEBwcml2YXRlIEBjb25zdCB7bnVtYmVyfSAqL1xuY29uc3QgTUlOX1NXSVBFX0ZPUl9ISU5UX09WRVJMQVlfUFggPSA1MDtcblxuLyoqIEBlbnVtIHtzdHJpbmd9ICovXG5jb25zdCBBdHRyaWJ1dGVzID0ge1xuICBBRF9TSE9XSU5HOiAnYWQtc2hvd2luZycsXG4gIEFEVkFOQ0VfVE86ICdpLWFtcGh0bWwtYWR2YW5jZS10bycsXG4gIEFVVE9fQURWQU5DRV9BRlRFUjogJ2F1dG8tYWR2YW5jZS1hZnRlcicsXG4gIEFVVE9fQURWQU5DRV9UTzogJ2F1dG8tYWR2YW5jZS10bycsXG4gIERFU0tUT1BfUE9TSVRJT046ICdpLWFtcGh0bWwtZGVza3RvcC1wb3NpdGlvbicsXG4gIE1VVEVEOiAnbXV0ZWQnLFxuICBPUklFTlRBVElPTjogJ29yaWVudGF0aW9uJyxcbiAgUFVCTElDX0FEVkFOQ0VfVE86ICdhZHZhbmNlLXRvJyxcbiAgUkVUVVJOX1RPOiAnaS1hbXBodG1sLXJldHVybi10bycsXG4gIFNUQU5EQUxPTkU6ICdzdGFuZGFsb25lJyxcbiAgU1VQUE9SVFNfTEFORFNDQVBFOiAnc3VwcG9ydHMtbGFuZHNjYXBlJyxcbiAgLy8gQXR0cmlidXRlcyB0aGF0IGRlc2t0b3AgY3NzIGxvb2tzIGZvciB0byBkZWNpZGUgd2hlcmUgcGFnZXMgd2lsbCBiZSBwbGFjZWRcbiAgVklTSVRFRDogJ2ktYW1waHRtbC12aXNpdGVkJywgLy8gc3RhY2tlZCBvZmZzY3JlZW4gdG8gbGVmdFxufTtcblxuLyoqXG4gKiBUaGUgZHVyYXRpb24gb2YgdGltZSAoaW4gbWlsbGlzZWNvbmRzKSB0byB3YWl0IGZvciB0aGUgU3RvcnkgaW5pdGlhbCBjb250ZW50XG4gKiB0byBiZSBsb2FkZWQgYmVmb3JlIG1hcmtpbmcgdGhlIHN0b3J5IGFzIGxvYWRlZC5cbiAqIEBjb25zdCB7bnVtYmVyfVxuICovXG5jb25zdCBJTklUSUFMX0NPTlRFTlRfTE9BRF9USU1FT1VUX01TID0gODAwMDtcblxuLyoqXG4gKiBTaW5nbGUgcGFnZSBhZHMgbWF5IGJlIGluamVjdGVkIGxhdGVyLiBJZiB0aGUgb3JpZ2luYWwgc3RvcnkgY29udGFpbnMgMCBtZWRpYVxuICogZWxlbWVudHMgdGhlIG1lZGlhUG9vbCB3aWxsIG5vdCBiZSBhYmxlIHRvIGhhbmRsZSB0aGUgaW5qZWN0ZWQgYXVkaW8vdmlkZW9cbiAqIFRoZXJlZm9yZSB3ZSBwcmVhbGxvY2F0ZSBhIG1pbmltdW0gaGVyZS5cbiAqIEBjb25zdCB7bnVtYmVyfVxuICovXG5jb25zdCBNSU5JTVVNX0FEX01FRElBX0VMRU1FTlRTID0gMjtcblxuLyoqXG4gKiBDU1MgY2xhc3MgZm9yIGFuIGFtcC1zdG9yeSB0aGF0IGluZGljYXRlcyB0aGUgaW5pdGlhbCBsb2FkIGZvciB0aGUgc3RvcnkgaGFzXG4gKiBjb21wbGV0ZWQuXG4gKiBAY29uc3Qge3N0cmluZ31cbiAqL1xuY29uc3QgU1RPUllfTE9BREVEX0NMQVNTX05BTUUgPSAnaS1hbXBodG1sLXN0b3J5LWxvYWRlZCc7XG5cbi8qKlxuICogQ1NTIGNsYXNzIGZvciB0aGUgb3BhY2l0eSBsYXllciB0aGF0IHNlcGFyYXRlcyB0aGUgYW1wLXNpZGViYXIgYW5kIHRoZSByZXN0XG4gKiBvZiB0aGUgc3Rvcnkgd2hlbiB0aGUgYW1wLXNpZGViYXIgaXMgZW50ZXJpbmcgdGhlIHNjcmVlbi5cbiAqIEBjb25zdCB7c3RyaW5nfVxuICovXG5jb25zdCBPUEFDSVRZX01BU0tfQ0xBU1NfTkFNRSA9ICdpLWFtcGh0bWwtc3Rvcnktb3BhY2l0eS1tYXNrJztcblxuLyoqXG4gKiBDU1MgY2xhc3MgZm9yIHNpZGViYXJzIGluIHN0b3JpZXMuXG4gKiBAY29uc3Qge3N0cmluZ31cbiAqL1xuY29uc3QgU0lERUJBUl9DTEFTU19OQU1FID0gJ2ktYW1waHRtbC1zdG9yeS1zaWRlYmFyJztcblxuLyoqIEBjb25zdCB7IU9iamVjdDxzdHJpbmcsIG51bWJlcj59ICovXG5jb25zdCBNQVhfTUVESUFfRUxFTUVOVF9DT1VOVFMgPSB7XG4gIFtNZWRpYVR5cGUuQVVESU9dOiA0LFxuICBbTWVkaWFUeXBlLlZJREVPXTogOCxcbn07XG5cbi8qKiBAdHlwZSB7c3RyaW5nfSAqL1xuY29uc3QgVEFHID0gJ2FtcC1zdG9yeSc7XG5cbi8qKlxuICogVGhlIGRlZmF1bHQgZGFyayBncmF5IGZvciBjaHJvbWUgc3VwcG9ydGVkIHRoZW1lIGNvbG9yLlxuICogQGNvbnN0IHtzdHJpbmd9XG4gKi9cbmNvbnN0IERFRkFVTFRfVEhFTUVfQ09MT1IgPSAnIzIwMjEyNSc7XG5cbi8qKlxuICogTXV0YXRpb25PYnNlcnZlckluaXQgb3B0aW9ucyB0byBsaXN0ZW4gZm9yIGNoYW5nZXMgdG8gdGhlIGBvcGVuYCBhdHRyaWJ1dGUuXG4gKi9cbmNvbnN0IFNJREVCQVJfT0JTRVJWRVJfT1BUSU9OUyA9IHtcbiAgYXR0cmlidXRlczogdHJ1ZSxcbiAgYXR0cmlidXRlRmlsdGVyOiBbJ29wZW4nXSxcbn07XG5cbi8qKlxuICogQGltcGxlbWVudHMgey4vbWVkaWEtcG9vbC5NZWRpYVBvb2xSb290fVxuICovXG5leHBvcnQgY2xhc3MgQW1wU3RvcnkgZXh0ZW5kcyBBTVAuQmFzZUVsZW1lbnQge1xuICAvKiogQG92ZXJyaWRlIEBub2NvbGxhcHNlICovXG4gIHN0YXRpYyBwcmVyZW5kZXJBbGxvd2VkKCkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLyoqIEBwYXJhbSB7IUFtcEVsZW1lbnR9IGVsZW1lbnQgKi9cbiAgY29uc3RydWN0b3IoZWxlbWVudCkge1xuICAgIHN1cGVyKGVsZW1lbnQpO1xuXG4gICAgLyoqIEBwcml2YXRlIEBjb25zdCB7IS4vYW1wLXN0b3J5LXN0b3JlLXNlcnZpY2UuQW1wU3RvcnlTdG9yZVNlcnZpY2V9ICovXG4gICAgdGhpcy5zdG9yZVNlcnZpY2VfID0gZ2V0U3RvcmVTZXJ2aWNlKHRoaXMud2luKTtcblxuICAgIC8vIENoZWNrIGlmIHN0b3J5IGlzIFJUTC5cbiAgICBpZiAoaXNSVEwodGhpcy53aW4uZG9jdW1lbnQpKSB7XG4gICAgICB0aGlzLnN0b3JlU2VydmljZV8uZGlzcGF0Y2goQWN0aW9uLlRPR0dMRV9SVEwsIHRydWUpO1xuICAgIH1cblxuICAgIC8qKiBAcHJpdmF0ZSB7IS4vc3RvcnktYW5hbHl0aWNzLlN0b3J5QW5hbHl0aWNzU2VydmljZX0gKi9cbiAgICB0aGlzLmFuYWx5dGljc1NlcnZpY2VfID0gZ2V0QW5hbHl0aWNzU2VydmljZSh0aGlzLndpbiwgdGhpcy5lbGVtZW50KTtcblxuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3QgeyFBZHZhbmNlbWVudENvbmZpZ30gKi9cbiAgICB0aGlzLmFkdmFuY2VtZW50XyA9IEFkdmFuY2VtZW50Q29uZmlnLmZvckVsZW1lbnQodGhpcy53aW4sIHRoaXMuZWxlbWVudCk7XG4gICAgdGhpcy5hZHZhbmNlbWVudF8uc3RhcnQoKTtcblxuICAgIC8qKiBAY29uc3QgQHByaXZhdGUgeyEuLi8uLi8uLi9zcmMvc2VydmljZS92c3luYy1pbXBsLlZzeW5jfSAqL1xuICAgIHRoaXMudnN5bmNfID0gdGhpcy5nZXRWc3luYygpO1xuXG4gICAgLyoqIEBwcml2YXRlIEBjb25zdCB7IVNoYXJlTWVudX0gUHJlbG9hZHMgYW5kIHByZXJlbmRlcnMgdGhlIHNoYXJlIG1lbnUuICovXG4gICAgdGhpcy5zaGFyZU1lbnVfID0gbmV3IFNoYXJlTWVudSh0aGlzLndpbiwgdGhpcy5lbGVtZW50KTtcblxuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3QgeyFTeXN0ZW1MYXllcn0gKi9cbiAgICB0aGlzLnN5c3RlbUxheWVyXyA9IG5ldyBTeXN0ZW1MYXllcih0aGlzLndpbiwgdGhpcy5lbGVtZW50KTtcblxuICAgIC8qKiBJbnN0YW50aWF0ZSBpbiBjYXNlIHRoZXJlIGFyZSBlbWJlZGRlZCBjb21wb25lbnRzLiAqL1xuICAgIG5ldyBBbXBTdG9yeUVtYmVkZGVkQ29tcG9uZW50KHRoaXMud2luLCB0aGlzLmVsZW1lbnQpO1xuXG4gICAgLyoqIEBwcml2YXRlIEBjb25zdCB7IVVuc3VwcG9ydGVkQnJvd3NlckxheWVyfSAqL1xuICAgIHRoaXMudW5zdXBwb3J0ZWRCcm93c2VyTGF5ZXJfID0gbmV3IFVuc3VwcG9ydGVkQnJvd3NlckxheWVyKHRoaXMud2luKTtcblxuICAgIC8qKiBJbnN0YW50aWF0ZXMgdGhlIHZpZXdwb3J0IHdhcm5pbmcgbGF5ZXIuICovXG4gICAgbmV3IFZpZXdwb3J0V2FybmluZ0xheWVyKFxuICAgICAgdGhpcy53aW4sXG4gICAgICB0aGlzLmVsZW1lbnQsXG4gICAgICBERVNLVE9QX1dJRFRIX1RIUkVTSE9MRCxcbiAgICAgIERFU0tUT1BfSEVJR0hUX1RIUkVTSE9MRFxuICAgICk7XG5cbiAgICAvKiogQHByaXZhdGUgeyFBcnJheTwhLi9hbXAtc3RvcnktcGFnZS5BbXBTdG9yeVBhZ2U+fSAqL1xuICAgIHRoaXMucGFnZXNfID0gW107XG5cbiAgICAvKiogQHByaXZhdGUgQGNvbnN0IHshQXJyYXk8IS4vYW1wLXN0b3J5LXBhZ2UuQW1wU3RvcnlQYWdlPn0gKi9cbiAgICB0aGlzLmFkUGFnZXNfID0gW107XG5cbiAgICAvKiogQGNvbnN0IEBwcml2YXRlIHshLi92YXJpYWJsZS1zZXJ2aWNlLkFtcFN0b3J5VmFyaWFibGVTZXJ2aWNlfSAqL1xuICAgIHRoaXMudmFyaWFibGVTZXJ2aWNlXyA9IGdldFZhcmlhYmxlU2VydmljZSh0aGlzLndpbik7XG5cbiAgICAvKiogQHByaXZhdGUgez8uL2FtcC1zdG9yeS1wYWdlLkFtcFN0b3J5UGFnZX0gKi9cbiAgICB0aGlzLmFjdGl2ZVBhZ2VfID0gbnVsbDtcblxuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3QgKi9cbiAgICB0aGlzLmRlc2t0b3BNZWRpYV8gPSB0aGlzLndpbi5tYXRjaE1lZGlhKFxuICAgICAgYChtaW4td2lkdGg6ICR7REVTS1RPUF9XSURUSF9USFJFU0hPTER9cHgpIGFuZCBgICtcbiAgICAgICAgYChtaW4taGVpZ2h0OiAke0RFU0tUT1BfSEVJR0hUX1RIUkVTSE9MRH1weClgXG4gICAgKTtcblxuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3QgKi9cbiAgICB0aGlzLmRlc2t0b3BPbmVQYW5lbE1lZGlhXyA9IHRoaXMud2luLm1hdGNoTWVkaWEoXG4gICAgICBgKG1pbi1hc3BlY3QtcmF0aW86ICR7REVTS1RPUF9PTkVfUEFORUxfQVNQRUNUX1JBVElPX1RIUkVTSE9MRH0pYFxuICAgICk7XG5cbiAgICAvKiogQHByaXZhdGUgQGNvbnN0ICovXG4gICAgdGhpcy5jYW5Sb3RhdGVUb0Rlc2t0b3BNZWRpYV8gPSB0aGlzLndpbi5tYXRjaE1lZGlhKFxuICAgICAgYChtaW4td2lkdGg6ICR7REVTS1RPUF9IRUlHSFRfVEhSRVNIT0xEfXB4KSBhbmQgYCArXG4gICAgICAgIGAobWluLWhlaWdodDogJHtERVNLVE9QX1dJRFRIX1RIUkVTSE9MRH1weClgXG4gICAgKTtcblxuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3QgKi9cbiAgICB0aGlzLmxhbmRzY2FwZU9yaWVudGF0aW9uTWVkaWFfID0gdGhpcy53aW4ubWF0Y2hNZWRpYShcbiAgICAgICcob3JpZW50YXRpb246IGxhbmRzY2FwZSknXG4gICAgKTtcblxuICAgIC8qKiBAcHJpdmF0ZSB7P0hUTUxNZWRpYUVsZW1lbnR9ICovXG4gICAgdGhpcy5iYWNrZ3JvdW5kQXVkaW9FbF8gPSBudWxsO1xuXG4gICAgLyoqIEBwcml2YXRlIHshQW1wU3RvcnlIaW50fSAqL1xuICAgIHRoaXMuYW1wU3RvcnlIaW50XyA9IG5ldyBBbXBTdG9yeUhpbnQodGhpcy53aW4sIHRoaXMuZWxlbWVudCk7XG5cbiAgICAvKiogQHByaXZhdGUgeyFNZWRpYVBvb2x9ICovXG4gICAgdGhpcy5tZWRpYVBvb2xfID0gTWVkaWFQb29sLmZvcih0aGlzKTtcblxuICAgIC8qKiBAcHJpdmF0ZSB7Ym9vbGVhbn0gKi9cbiAgICB0aGlzLmFyZUFjY2Vzc0F1dGhvcml6YXRpb25zQ29tcGxldGVkXyA9IGZhbHNlO1xuXG4gICAgLyoqIEBwcml2YXRlICovXG4gICAgdGhpcy5uYXZpZ2F0ZVRvUGFnZUFmdGVyQWNjZXNzXyA9IG51bGw7XG5cbiAgICAvKiogQHByaXZhdGUgQGNvbnN0IHshLi4vLi4vLi4vc3JjL3NlcnZpY2UvdGltZXItaW1wbC5UaW1lcn0gKi9cbiAgICB0aGlzLnRpbWVyXyA9IFNlcnZpY2VzLnRpbWVyRm9yKHRoaXMud2luKTtcblxuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3QgeyEuLi8uLi8uLi9zcmMvc2VydmljZS9wbGF0Zm9ybS1pbXBsLlBsYXRmb3JtfSAqL1xuICAgIHRoaXMucGxhdGZvcm1fID0gU2VydmljZXMucGxhdGZvcm1Gb3IodGhpcy53aW4pO1xuXG4gICAgLyoqIEBwcml2YXRlIHs/Li4vLi4vLi4vc3JjL3NlcnZpY2Uvdmlld2VyLWludGVyZmFjZS5WaWV3ZXJJbnRlcmZhY2V9ICovXG4gICAgdGhpcy52aWV3ZXJfID0gbnVsbDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7P0FtcFN0b3J5Vmlld2VyTWVzc2FnaW5nSGFuZGxlcn0gKi9cbiAgICB0aGlzLnZpZXdlck1lc3NhZ2luZ0hhbmRsZXJfID0gbnVsbDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7Py4uLy4uLy4uL3NyYy9zZXJ2aWNlL2xvY2FsaXphdGlvbi5Mb2NhbGl6YXRpb25TZXJ2aWNlfSAqL1xuICAgIHRoaXMubG9jYWxpemF0aW9uU2VydmljZV8gPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogU3RvcmUgdGhlIGN1cnJlbnQgcGF1c2VkIHN0YXRlLCB0byBtYWtlIHN1cmUgdGhlIHN0b3J5IGRvZXMgbm90IHBsYXkgb25cbiAgICAgKiByZXN1bWUgaWYgaXQgd2FzIHByZXZpb3VzbHkgcGF1c2VkLiBudWxsIHdoZW4gbm90aGluZyB0byByZXN0b3JlLlxuICAgICAqIEBwcml2YXRlIHs/Ym9vbGVhbn1cbiAgICAgKi9cbiAgICB0aGlzLnBhdXNlZFN0YXRlVG9SZXN0b3JlXyA9IG51bGw7XG5cbiAgICAvKiogQHByaXZhdGUgez9FbGVtZW50fSAqL1xuICAgIHRoaXMuc2lkZWJhcl8gPSBudWxsO1xuXG4gICAgLyoqIEBwcml2YXRlIHs/TXV0YXRpb25PYnNlcnZlcn0gKi9cbiAgICB0aGlzLnNpZGViYXJPYnNlcnZlcl8gPSBudWxsO1xuXG4gICAgLyoqIEBwcml2YXRlIHs/RWxlbWVudH0gKi9cbiAgICB0aGlzLm1hc2tFbGVtZW50XyA9IG51bGw7XG5cbiAgICAvKiogQHByaXZhdGUgez9MaXZlU3RvcnlNYW5hZ2VyfSAqL1xuICAgIHRoaXMubGl2ZVN0b3J5TWFuYWdlcl8gPSBudWxsO1xuXG4gICAgLyoqIEBwcml2YXRlIHs/QmFja2dyb3VuZEJsdXJ9ICovXG4gICAgdGhpcy5iYWNrZ3JvdW5kQmx1cl8gPSBudWxsO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBidWlsZENhbGxiYWNrKCkge1xuICAgIHRoaXMudmlld2VyXyA9IFNlcnZpY2VzLnZpZXdlckZvckRvYyh0aGlzLmVsZW1lbnQpO1xuXG4gICAgdGhpcy52aWV3ZXJNZXNzYWdpbmdIYW5kbGVyXyA9IHRoaXMudmlld2VyXy5pc0VtYmVkZGVkKClcbiAgICAgID8gbmV3IEFtcFN0b3J5Vmlld2VyTWVzc2FnaW5nSGFuZGxlcih0aGlzLndpbiwgdGhpcy52aWV3ZXJfKVxuICAgICAgOiBudWxsO1xuXG4gICAgdGhpcy5sb2NhbGl6YXRpb25TZXJ2aWNlXyA9IGdldExvY2FsaXphdGlvblNlcnZpY2UodGhpcy5lbGVtZW50KTtcblxuICAgIHRoaXMubG9jYWxpemF0aW9uU2VydmljZV9cbiAgICAgIC5yZWdpc3RlckxvY2FsaXplZFN0cmluZ0J1bmRsZSgnZGVmYXVsdCcsIExvY2FsaXplZFN0cmluZ3NEZWZhdWx0KVxuICAgICAgLnJlZ2lzdGVyTG9jYWxpemVkU3RyaW5nQnVuZGxlKCdhcicsIExvY2FsaXplZFN0cmluZ3NBcilcbiAgICAgIC5yZWdpc3RlckxvY2FsaXplZFN0cmluZ0J1bmRsZSgnZGUnLCBMb2NhbGl6ZWRTdHJpbmdzRGUpXG4gICAgICAucmVnaXN0ZXJMb2NhbGl6ZWRTdHJpbmdCdW5kbGUoJ2VuJywgTG9jYWxpemVkU3RyaW5nc0VuKVxuICAgICAgLnJlZ2lzdGVyTG9jYWxpemVkU3RyaW5nQnVuZGxlKCdlbi1HQicsIExvY2FsaXplZFN0cmluZ3NFbkdiKVxuICAgICAgLnJlZ2lzdGVyTG9jYWxpemVkU3RyaW5nQnVuZGxlKCdlcycsIExvY2FsaXplZFN0cmluZ3NFcylcbiAgICAgIC5yZWdpc3RlckxvY2FsaXplZFN0cmluZ0J1bmRsZSgnZXMtNDE5JywgTG9jYWxpemVkU3RyaW5nc0VzNDE5KVxuICAgICAgLnJlZ2lzdGVyTG9jYWxpemVkU3RyaW5nQnVuZGxlKCdmcicsIExvY2FsaXplZFN0cmluZ3NGcilcbiAgICAgIC5yZWdpc3RlckxvY2FsaXplZFN0cmluZ0J1bmRsZSgnaGknLCBMb2NhbGl6ZWRTdHJpbmdzSGkpXG4gICAgICAucmVnaXN0ZXJMb2NhbGl6ZWRTdHJpbmdCdW5kbGUoJ2lkJywgTG9jYWxpemVkU3RyaW5nc0lkKVxuICAgICAgLnJlZ2lzdGVyTG9jYWxpemVkU3RyaW5nQnVuZGxlKCdpdCcsIExvY2FsaXplZFN0cmluZ3NJdClcbiAgICAgIC5yZWdpc3RlckxvY2FsaXplZFN0cmluZ0J1bmRsZSgnamEnLCBMb2NhbGl6ZWRTdHJpbmdzSmEpXG4gICAgICAucmVnaXN0ZXJMb2NhbGl6ZWRTdHJpbmdCdW5kbGUoJ2tvJywgTG9jYWxpemVkU3RyaW5nc0tvKVxuICAgICAgLnJlZ2lzdGVyTG9jYWxpemVkU3RyaW5nQnVuZGxlKCdubCcsIExvY2FsaXplZFN0cmluZ3NObClcbiAgICAgIC5yZWdpc3RlckxvY2FsaXplZFN0cmluZ0J1bmRsZSgnbm8nLCBMb2NhbGl6ZWRTdHJpbmdzTm8pXG4gICAgICAucmVnaXN0ZXJMb2NhbGl6ZWRTdHJpbmdCdW5kbGUoJ3B0LVBUJywgTG9jYWxpemVkU3RyaW5nc1B0UHQpXG4gICAgICAucmVnaXN0ZXJMb2NhbGl6ZWRTdHJpbmdCdW5kbGUoJ3B0LUJSJywgTG9jYWxpemVkU3RyaW5nc1B0QnIpXG4gICAgICAucmVnaXN0ZXJMb2NhbGl6ZWRTdHJpbmdCdW5kbGUoJ3J1JywgTG9jYWxpemVkU3RyaW5nc1J1KVxuICAgICAgLnJlZ2lzdGVyTG9jYWxpemVkU3RyaW5nQnVuZGxlKCd0cicsIExvY2FsaXplZFN0cmluZ3NUcilcbiAgICAgIC5yZWdpc3RlckxvY2FsaXplZFN0cmluZ0J1bmRsZSgndmknLCBMb2NhbGl6ZWRTdHJpbmdzVmkpXG4gICAgICAucmVnaXN0ZXJMb2NhbGl6ZWRTdHJpbmdCdW5kbGUoJ3poLUNOJywgTG9jYWxpemVkU3RyaW5nc1poQ24pXG4gICAgICAucmVnaXN0ZXJMb2NhbGl6ZWRTdHJpbmdCdW5kbGUoJ3poLVRXJywgTG9jYWxpemVkU3RyaW5nc1poVHcpO1xuXG4gICAgY29uc3QgZW5YYVBzZXVkb0xvY2FsZUJ1bmRsZSA9IGNyZWF0ZVBzZXVkb0xvY2FsZShcbiAgICAgIExvY2FsaXplZFN0cmluZ3NFbixcbiAgICAgIChzKSA9PiBgWyR7c30gb25lIHR3b11gXG4gICAgKTtcbiAgICB0aGlzLmxvY2FsaXphdGlvblNlcnZpY2VfLnJlZ2lzdGVyTG9jYWxpemVkU3RyaW5nQnVuZGxlKFxuICAgICAgJ2VuLXhhJyxcbiAgICAgIGVuWGFQc2V1ZG9Mb2NhbGVCdW5kbGVcbiAgICApO1xuXG4gICAgaWYgKHRoaXMuaXNTdGFuZGFsb25lXygpKSB7XG4gICAgICB0aGlzLmluaXRpYWxpemVTdGFuZGFsb25lU3RvcnlfKCk7XG4gICAgfVxuXG4gICAgLy8gYnVpbGRDYWxsYmFjayBhbHJlYWR5IHJ1bnMgaW4gYSBtdXRhdGUgY29udGV4dC4gQ2FsbGluZyBhbm90aGVyXG4gICAgLy8gbXV0YXRlRWxlbWVudCBleHBsaWNpdGx5IHdpbGwgZm9yY2UgdGhlIHJ1bnRpbWUgdG8gcmVtZWFzdXJlIHRoZVxuICAgIC8vIGFtcC1zdG9yeSBlbGVtZW50LCBmaXhpbmcgcmVuZGVyaW5nIGJ1Z3Mgd2hlcmUgdGhlIHN0b3J5IGlzIGluYWN0aXZlXG4gICAgLy8gKGxheW91dENhbGxiYWNrIG5vdCBjYWxsZWQpIHdoZW4gYWNjZXNzZWQgZnJvbSBhbnkgdmlld2VyIHVzaW5nXG4gICAgLy8gcHJlcmVuZGVyaW5nLCBiZWNhdXNlIG9mIGEgaGVpZ2h0IGluY29ycmVjdGx5IHNldCB0byAwLlxuICAgIHRoaXMubXV0YXRlRWxlbWVudCgoKSA9PiB7fSk7XG5cbiAgICBjb25zdCBwYWdlSWQgPSB0aGlzLmdldEluaXRpYWxQYWdlSWRfKCk7XG4gICAgaWYgKHBhZ2VJZCkge1xuICAgICAgY29uc3QgcGFnZSA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFxuICAgICAgICBgYW1wLXN0b3J5LXBhZ2UjJHtlc2NhcGVDc3NTZWxlY3RvcklkZW50KHBhZ2VJZCl9YFxuICAgICAgKTtcbiAgICAgIHBhZ2Uuc2V0QXR0cmlidXRlKCdhY3RpdmUnLCAnJyk7XG4gICAgfVxuXG4gICAgdGhpcy5pbml0aWFsaXplU3R5bGVzXygpO1xuICAgIHRoaXMuaW5pdGlhbGl6ZUxpc3RlbmVyc18oKTtcbiAgICB0aGlzLmluaXRpYWxpemVMaXN0ZW5lcnNGb3JEZXZfKCk7XG4gICAgdGhpcy5pbml0aWFsaXplUGFnZUlkc18oKTtcbiAgICB0aGlzLmluaXRpYWxpemVTdG9yeVBsYXllcl8oKTtcblxuICAgIHRoaXMuc3RvcmVTZXJ2aWNlXy5kaXNwYXRjaChBY3Rpb24uVE9HR0xFX1VJLCB0aGlzLmdldFVJVHlwZV8oKSk7XG5cbiAgICAvLyBSZW1vdmVzIHRpdGxlIGluIG9yZGVyIHRvIHByZXZlbnQgaW5jb3JyZWN0IHRpdGxlcyBhcHBlYXJpbmcgb24gbGlua1xuICAgIC8vIGhvdmVyLiAoU2VlIDE3NjU0KVxuICAgIGlmICghdGhpcy5wbGF0Zm9ybV8uaXNCb3QoKSkge1xuICAgICAgdGhpcy5lbGVtZW50LnJlbW92ZUF0dHJpYnV0ZSgndGl0bGUnKTtcbiAgICB9XG5cbiAgICAvLyBSZW1vdmUgdGV4dCBub2RlcyB3aGljaCB3b3VsZCBiZSBzaG93biBvdXRzaWRlIG9mIHRoZSBhbXAtc3RvcnlcbiAgICBjb25zdCB0ZXh0Tm9kZXMgPSBjaGlsZE5vZGVzKFxuICAgICAgdGhpcy5lbGVtZW50LFxuICAgICAgKG5vZGUpID0+IG5vZGUubm9kZVR5cGUgPT09IE5vZGUuVEVYVF9OT0RFXG4gICAgKTtcbiAgICB0ZXh0Tm9kZXMuZm9yRWFjaCgobm9kZSkgPT4ge1xuICAgICAgdGhpcy5lbGVtZW50LnJlbW92ZUNoaWxkKG5vZGUpO1xuICAgIH0pO1xuXG4gICAgaWYgKGlzRXhwZXJpbWVudE9uKHRoaXMud2luLCAnYW1wLXN0b3J5LWJyYW5jaGluZycpKSB7XG4gICAgICB0aGlzLnJlZ2lzdGVyQWN0aW9uKCdnb1RvUGFnZScsIChpbnZvY2F0aW9uKSA9PiB7XG4gICAgICAgIGNvbnN0IHthcmdzfSA9IGludm9jYXRpb247XG4gICAgICAgIGlmICghYXJncykge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnN0b3JlU2VydmljZV8uZGlzcGF0Y2goXG4gICAgICAgICAgQWN0aW9uLlNFVF9BRFZBTkNFTUVOVF9NT0RFLFxuICAgICAgICAgIEFkdmFuY2VtZW50TW9kZS5HT19UT19QQUdFXG4gICAgICAgICk7XG4gICAgICAgIC8vIElmIG9wZW4sIGNsb3NlcyB0aGUgc2lkZWJhciBiZWZvcmUgbmF2aWdhdGluZy5cbiAgICAgICAgY29uc3QgcHJvbWlzZSA9IHRoaXMuc3RvcmVTZXJ2aWNlXy5nZXQoU3RhdGVQcm9wZXJ0eS5TSURFQkFSX1NUQVRFKVxuICAgICAgICAgID8gU2VydmljZXMuaGlzdG9yeUZvckRvYyh0aGlzLmdldEFtcERvYygpKS5nb0JhY2soKVxuICAgICAgICAgIDogUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgICAgIHByb21pc2UudGhlbigoKSA9PlxuICAgICAgICAgIHRoaXMuc3dpdGNoVG9fKGFyZ3NbJ2lkJ10sIE5hdmlnYXRpb25EaXJlY3Rpb24uTkVYVClcbiAgICAgICAgKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICBpZiAoaXNFeHBlcmltZW50T24odGhpcy53aW4sICdzdG9yeS1sb2FkLWZpcnN0LXBhZ2Utb25seScpKSB7XG4gICAgICBTZXJ2aWNlcy5wZXJmb3JtYW5jZUZvcih0aGlzLndpbikuYWRkRW5hYmxlZEV4cGVyaW1lbnQoXG4gICAgICAgICdzdG9yeS1sb2FkLWZpcnN0LXBhZ2Utb25seSdcbiAgICAgICk7XG4gICAgfVxuICAgIGlmIChcbiAgICAgIGlzRXhwZXJpbWVudE9uKHRoaXMud2luLCAnc3RvcnktZGlzYWJsZS1hbmltYXRpb25zLWZpcnN0LXBhZ2UnKSB8fFxuICAgICAgcHJlZmVyc1JlZHVjZWRNb3Rpb24odGhpcy53aW4pXG4gICAgKSB7XG4gICAgICBTZXJ2aWNlcy5wZXJmb3JtYW5jZUZvcih0aGlzLndpbikuYWRkRW5hYmxlZEV4cGVyaW1lbnQoXG4gICAgICAgICdzdG9yeS1kaXNhYmxlLWFuaW1hdGlvbnMtZmlyc3QtcGFnZSdcbiAgICAgICk7XG4gICAgfVxuICAgIGlmIChpc0V4cGVyaW1lbnRPbih0aGlzLndpbiwgJ3N0b3J5LWxvYWQtaW5hY3RpdmUtb3V0c2lkZS12aWV3cG9ydCcpKSB7XG4gICAgICBTZXJ2aWNlcy5wZXJmb3JtYW5jZUZvcih0aGlzLndpbikuYWRkRW5hYmxlZEV4cGVyaW1lbnQoXG4gICAgICAgICdzdG9yeS1sb2FkLWluYWN0aXZlLW91dHNpZGUtdmlld3BvcnQnXG4gICAgICApO1xuICAgICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoXG4gICAgICAgICdpLWFtcGh0bWwtZXhwZXJpbWVudC1zdG9yeS1sb2FkLWluYWN0aXZlLW91dHNpZGUtdmlld3BvcnQnXG4gICAgICApO1xuICAgIH1cblxuICAgIGlmICh0aGlzLm1heWJlTG9hZFN0b3J5RGV2VG9vbHNfKCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUGF1c2VzIHRoZSB3aG9sZSBzdG9yeSBvbiB2aWV3ZXIgdmlzaWJpbGl0eVN0YXRlIHVwZGF0ZXMsIG9yIHRhYiB2aXNpYmlsaXR5XG4gICAqIHVwZGF0ZXMuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBwYXVzZV8oKSB7XG4gICAgLy8gUHJlc2VydmUgaWYgcHJldmlvdXNseSBzZXQuIFRoaXMgbWV0aG9kIGNhbiBiZSBjYWxsZWQgc2V2ZXJhbCB0aW1lcyB3aGVuXG4gICAgLy8gc2V0dGluZyB0aGUgdmlzaWJpbGl0eXN0YXRlIHRvIHBhdXNlZCBhbmQgdGhlbiBpbmFjdGl2ZS5cbiAgICBpZiAodGhpcy5wYXVzZWRTdGF0ZVRvUmVzdG9yZV8gPT09IG51bGwpIHtcbiAgICAgIHRoaXMucGF1c2VkU3RhdGVUb1Jlc3RvcmVfID0gISF0aGlzLnN0b3JlU2VydmljZV8uZ2V0KFxuICAgICAgICBTdGF0ZVByb3BlcnR5LlBBVVNFRF9TVEFURVxuICAgICAgKTtcbiAgICB9XG4gICAgdGhpcy5zdG9yZVNlcnZpY2VfLmRpc3BhdGNoKEFjdGlvbi5UT0dHTEVfUEFVU0VELCB0cnVlKTtcbiAgICBpZiAoIXRoaXMuc3RvcmVTZXJ2aWNlXy5nZXQoU3RhdGVQcm9wZXJ0eS5NVVRFRF9TVEFURSkpIHtcbiAgICAgIHRoaXMucGF1c2VCYWNrZ3JvdW5kQXVkaW9fKCk7XG4gICAgfVxuICAgIC8vIElmIHZpZXdlciBoYXMgbmF2aWdhdGVkIHRvIHRoZSBuZXh0IGRvY3VtZW50LCByZXNldCB0aGUgYWN0aXZlIHBhZ2UuXG4gICAgaWYgKHRoaXMuZ2V0QW1wRG9jKCkuZ2V0VmlzaWJpbGl0eVN0YXRlKCkgPT09IFZpc2liaWxpdHlTdGF0ZS5JTkFDVElWRSkge1xuICAgICAgdGhpcy5hY3RpdmVQYWdlXy5zZXRTdGF0ZShQYWdlU3RhdGUuTk9UX0FDVElWRSk7XG4gICAgICB0aGlzLmFjdGl2ZVBhZ2VfLmVsZW1lbnQuc2V0QXR0cmlidXRlKCdhY3RpdmUnLCAnJyk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlc3VtZXMgdGhlIHdob2xlIHN0b3J5IG9uIHZpZXdlciB2aXNpYmlsaXR5U3RhdGUgdXBkYXRlcywgb3IgdGFiXG4gICAqIHZpc2liaWxpdHkgdXBkYXRlcy5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIHJlc3VtZV8oKSB7XG4gICAgdGhpcy5zdG9yZVNlcnZpY2VfLmRpc3BhdGNoKFxuICAgICAgQWN0aW9uLlRPR0dMRV9QQVVTRUQsXG4gICAgICB0aGlzLnBhdXNlZFN0YXRlVG9SZXN0b3JlX1xuICAgICk7XG4gICAgdGhpcy5wYXVzZWRTdGF0ZVRvUmVzdG9yZV8gPSBudWxsO1xuICAgIGlmICghdGhpcy5zdG9yZVNlcnZpY2VfLmdldChTdGF0ZVByb3BlcnR5Lk1VVEVEX1NUQVRFKSkge1xuICAgICAgdGhpcy5wbGF5QmFja2dyb3VuZEF1ZGlvXygpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBOb3RlOiBydW5zIGluIHRoZSBidWlsZENhbGxiYWNrIHZzeW5jIG11dGF0ZSBjb250ZXh0LlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgaW5pdGlhbGl6ZVN0YW5kYWxvbmVTdG9yeV8oKSB7XG4gICAgY29uc3QgaHRtbCA9IHRoaXMud2luLmRvY3VtZW50LmRvY3VtZW50RWxlbWVudDtcbiAgICBodG1sLmNsYXNzTGlzdC5hZGQoJ2ktYW1waHRtbC1zdG9yeS1zdGFuZGFsb25lJyk7XG4gICAgLy8gTG9jayBib2R5IHRvIHByZXZlbnQgb3ZlcmZsb3cuXG4gICAgdGhpcy5sb2NrQm9keV8oKTtcbiAgICAvLyBTdGFuZGFsb25lIENTUyBhZmZlY3RzIHNpemluZyBvZiB0aGUgZW50aXJlIHBhZ2UuXG4gICAgdGhpcy5vblJlc2l6ZSgpO1xuICB9XG5cbiAgLyoqIEBwcml2YXRlICovXG4gIGluaXRpYWxpemVTdHlsZXNfKCkge1xuICAgIGNvbnN0IG1lZGlhUXVlcnlFbHMgPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvckFsbCgnbWVkaWEtcXVlcnknKTtcblxuICAgIGlmIChtZWRpYVF1ZXJ5RWxzLmxlbmd0aCkge1xuICAgICAgdGhpcy5pbml0aWFsaXplTWVkaWFRdWVyaWVzXyhtZWRpYVF1ZXJ5RWxzKTtcbiAgICB9XG5cbiAgICBjb25zdCBzdHlsZUVsID0gdGhpcy53aW4uZG9jdW1lbnQucXVlcnlTZWxlY3Rvcignc3R5bGVbYW1wLWN1c3RvbV0nKTtcblxuICAgIGlmIChzdHlsZUVsKSB7XG4gICAgICB0aGlzLnJld3JpdGVTdHlsZXNfKHN0eWxlRWwpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZWdpc3RlcnMgdGhlIG1lZGlhIHF1ZXJpZXNcbiAgICogQHBhcmFtIHshTm9kZUxpc3Q8IUVsZW1lbnQ+fSBtZWRpYVF1ZXJ5RWxzXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBpbml0aWFsaXplTWVkaWFRdWVyaWVzXyhtZWRpYVF1ZXJ5RWxzKSB7XG4gICAgY29uc3Qgc2VydmljZSA9IGdldE1lZGlhUXVlcnlTZXJ2aWNlKHRoaXMud2luKTtcblxuICAgIGNvbnN0IG9uTWVkaWFRdWVyeU1hdGNoID0gKG1hdGNoZXMsIGNsYXNzTmFtZSkgPT4ge1xuICAgICAgdGhpcy5tdXRhdGVFbGVtZW50KCgpID0+IHtcbiAgICAgICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC50b2dnbGUoY2xhc3NOYW1lLCBtYXRjaGVzKTtcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICB0b0FycmF5KG1lZGlhUXVlcnlFbHMpLmZvckVhY2goKGVsKSA9PiB7XG4gICAgICBjb25zdCBjbGFzc05hbWUgPSBlbC5nZXRBdHRyaWJ1dGUoJ2NsYXNzLW5hbWUnKTtcbiAgICAgIGNvbnN0IG1lZGlhID0gZWwuZ2V0QXR0cmlidXRlKCdtZWRpYScpO1xuXG4gICAgICBpZiAoY2xhc3NOYW1lICYmIG1lZGlhKSB7XG4gICAgICAgIHNlcnZpY2Uub25NZWRpYVF1ZXJ5TWF0Y2gobWVkaWEsIChtYXRjaGVzKSA9PlxuICAgICAgICAgIG9uTWVkaWFRdWVyeU1hdGNoKG1hdGNoZXMsIGNsYXNzTmFtZSlcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplcyBwYWdlIGlkcyBieSBkZWR1cGxpY2F0aW5nIHRoZW0uXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBpbml0aWFsaXplUGFnZUlkc18oKSB7XG4gICAgY29uc3QgcGFnZUVscyA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKCdhbXAtc3RvcnktcGFnZScpO1xuICAgIGNvbnN0IHBhZ2VJZHMgPSB0b0FycmF5KHBhZ2VFbHMpLm1hcCgoZWwpID0+IGVsLmlkIHx8ICdkZWZhdWx0LXBhZ2UnKTtcbiAgICBjb25zdCBpZHNNYXAgPSBtYXAoKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHBhZ2VJZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChpZHNNYXBbcGFnZUlkc1tpXV0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBpZHNNYXBbcGFnZUlkc1tpXV0gPSAwO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIHVzZXIoKS5lcnJvcihUQUcsIGBEdXBsaWNhdGUgYW1wLXN0b3J5LXBhZ2UgSUQgJHtwYWdlSWRzW2ldfWApO1xuICAgICAgY29uc3QgbmV3SWQgPSBgJHtwYWdlSWRzW2ldfV9fJHsrK2lkc01hcFtwYWdlSWRzW2ldXX1gO1xuICAgICAgcGFnZUVsc1tpXS5pZCA9IG5ld0lkO1xuICAgICAgcGFnZUlkc1tpXSA9IG5ld0lkO1xuICAgIH1cbiAgICB0aGlzLnN0b3JlU2VydmljZV8uZGlzcGF0Y2goQWN0aW9uLlNFVF9QQUdFX0lEUywgcGFnZUlkcyk7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHshRWxlbWVudH0gc3R5bGVFbFxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgcmV3cml0ZVN0eWxlc18oc3R5bGVFbCkge1xuICAgIC8vIFRPRE8oIzE1OTU1KTogVXBkYXRlIHRoaXMgdG8gdXNlIENzc0NvbnRleHQgZnJvbVxuICAgIC8vIC4uLy4uLy4uL2V4dGVuc2lvbnMvYW1wLWFuaW1hdGlvbi8wLjEvd2ViLWFuaW1hdGlvbnMuanNcbiAgICB0aGlzLm11dGF0ZUVsZW1lbnQoKCkgPT4ge1xuICAgICAgc3R5bGVFbC50ZXh0Q29udGVudCA9IHN0eWxlRWwudGV4dENvbnRlbnRcbiAgICAgICAgLnJlcGxhY2UoLygtP1tcXGQuXSspdmgvZ2ltLCAnY2FsYygkMSAqIHZhcigtLXN0b3J5LXBhZ2UtdmgpKScpXG4gICAgICAgIC5yZXBsYWNlKC8oLT9bXFxkLl0rKXZ3L2dpbSwgJ2NhbGMoJDEgKiB2YXIoLS1zdG9yeS1wYWdlLXZ3KSknKVxuICAgICAgICAucmVwbGFjZSgvKC0/W1xcZC5dKyl2bWluL2dpbSwgJ2NhbGMoJDEgKiB2YXIoLS1zdG9yeS1wYWdlLXZtaW4pKScpXG4gICAgICAgIC5yZXBsYWNlKC8oLT9bXFxkLl0rKXZtYXgvZ2ltLCAnY2FsYygkMSAqIHZhcigtLXN0b3J5LXBhZ2Utdm1heCkpJyk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQHByaXZhdGVcbiAgICovXG4gIHNldFRoZW1lQ29sb3JfKCkge1xuICAgIC8vIERvbid0IG92ZXJyaWRlIHRoZSBwdWJsaXNoZXIncyB0YWcuXG4gICAgaWYgKHRoaXMud2luLmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ21ldGFbbmFtZT10aGVtZS1jb2xvcl0nKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICAvLyBUaGUgdGhlbWUgY29sb3Igc2hvdWxkIGJlIGNvcGllZCBmcm9tIHRoZSBzdG9yeSdzIHByaW1hcnkgYWNjZW50IGNvbG9yXG4gICAgLy8gaWYgcG9zc2libGUsIHdpdGggdGhlIGZhbGwgYmFjayBiZWluZyBkZWZhdWx0IGRhcmsgZ3JheS5cbiAgICBjb25zdCBtZXRhID0gdGhpcy53aW4uZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbWV0YScpO1xuICAgIGNvbnN0IGFtcFN0b3J5UGFnZUVsID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJ2FtcC1zdG9yeS1wYWdlJyk7XG4gICAgbWV0YS5uYW1lID0gJ3RoZW1lLWNvbG9yJztcbiAgICBtZXRhLmNvbnRlbnQgPVxuICAgICAgY29tcHV0ZWRTdHlsZSh0aGlzLndpbiwgdGhpcy5lbGVtZW50KS5nZXRQcm9wZXJ0eVZhbHVlKFxuICAgICAgICAnLS1wcmltYXJ5LWNvbG9yJ1xuICAgICAgKSB8fFxuICAgICAgY29tcHV0ZWRTdHlsZShcbiAgICAgICAgdGhpcy53aW4sXG4gICAgICAgIGRldigpLmFzc2VydEVsZW1lbnQoYW1wU3RvcnlQYWdlRWwpXG4gICAgICApLmdldFByb3BlcnR5VmFsdWUoJ2JhY2tncm91bmQtY29sb3InKSB8fFxuICAgICAgREVGQVVMVF9USEVNRV9DT0xPUjtcbiAgICB0aGlzLndpbi5kb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKG1ldGEpO1xuICB9XG5cbiAgLyoqXG4gICAqIEJ1aWxkcyB0aGUgc3lzdGVtIGxheWVyIERPTS5cbiAgICogQHBhcmFtIHtzdHJpbmd9IGluaXRpYWxQYWdlSWRcbiAgICogQHByaXZhdGVcbiAgICovXG4gIGJ1aWxkU3lzdGVtTGF5ZXJfKGluaXRpYWxQYWdlSWQpIHtcbiAgICB0aGlzLnVwZGF0ZUF1ZGlvSWNvbl8oKTtcbiAgICB0aGlzLnVwZGF0ZVBhdXNlZEljb25fKCk7XG4gICAgdGhpcy5lbGVtZW50LmFwcGVuZENoaWxkKHRoaXMuc3lzdGVtTGF5ZXJfLmJ1aWxkKGluaXRpYWxQYWdlSWQpKTtcbiAgfVxuXG4gIC8qKiBAcHJpdmF0ZSAqL1xuICBpbml0aWFsaXplTGlzdGVuZXJzXygpIHtcbiAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihFdmVudFR5cGUuTkVYVF9QQUdFLCAoKSA9PiB7XG4gICAgICB0aGlzLm5leHRfKCk7XG4gICAgfSk7XG5cbiAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihFdmVudFR5cGUuUFJFVklPVVNfUEFHRSwgKCkgPT4ge1xuICAgICAgdGhpcy5wcmV2aW91c18oKTtcbiAgICB9KTtcblxuICAgIHRoaXMuc3RvcmVTZXJ2aWNlXy5zdWJzY3JpYmUoXG4gICAgICBTdGF0ZVByb3BlcnR5Lk1VVEVEX1NUQVRFLFxuICAgICAgKGlzTXV0ZWQpID0+IHtcbiAgICAgICAgdGhpcy5vbk11dGVkU3RhdGVVcGRhdGVfKGlzTXV0ZWQpO1xuICAgICAgICB0aGlzLnZhcmlhYmxlU2VydmljZV8ub25WYXJpYWJsZVVwZGF0ZShcbiAgICAgICAgICBBbmFseXRpY3NWYXJpYWJsZS5TVE9SWV9JU19NVVRFRCxcbiAgICAgICAgICBpc011dGVkXG4gICAgICAgICk7XG4gICAgICB9LFxuICAgICAgdHJ1ZSAvKiogY2FsbFRvSW5pdGlhbGl6ZSAqL1xuICAgICk7XG5cbiAgICB0aGlzLnN0b3JlU2VydmljZV8uc3Vic2NyaWJlKFxuICAgICAgU3RhdGVQcm9wZXJ0eS5NVVRFRF9TVEFURSxcbiAgICAgIChpc011dGVkKSA9PiB7XG4gICAgICAgIC8vIFdlIGRvIG5vdCB3YW50IHRvIHRyaWdnZXIgYW4gYW5hbHl0aWNzIGV2ZW50IGZvciB0aGUgaW5pdGlhbGl6YXRpb24gb2ZcbiAgICAgICAgLy8gdGhlIG11dGVkIHN0YXRlLlxuICAgICAgICB0aGlzLmFuYWx5dGljc1NlcnZpY2VfLnRyaWdnZXJFdmVudChcbiAgICAgICAgICBpc011dGVkXG4gICAgICAgICAgICA/IFN0b3J5QW5hbHl0aWNzRXZlbnQuU1RPUllfTVVURURcbiAgICAgICAgICAgIDogU3RvcnlBbmFseXRpY3NFdmVudC5TVE9SWV9VTk1VVEVEXG4gICAgICAgICk7XG4gICAgICB9LFxuICAgICAgZmFsc2UgLyoqIGNhbGxUb0luaXRpYWxpemUgKi9cbiAgICApO1xuXG4gICAgdGhpcy5zdG9yZVNlcnZpY2VfLnN1YnNjcmliZShcbiAgICAgIFN0YXRlUHJvcGVydHkuU1VQUE9SVEVEX0JST1dTRVJfU1RBVEUsXG4gICAgICAoaXNCcm93c2VyU3VwcG9ydGVkKSA9PiB7XG4gICAgICAgIHRoaXMub25TdXBwb3J0ZWRCcm93c2VyU3RhdGVVcGRhdGVfKGlzQnJvd3NlclN1cHBvcnRlZCk7XG4gICAgICB9XG4gICAgKTtcblxuICAgIHRoaXMuc3RvcmVTZXJ2aWNlXy5zdWJzY3JpYmUoU3RhdGVQcm9wZXJ0eS5BRFZBTkNFTUVOVF9NT0RFLCAobW9kZSkgPT4ge1xuICAgICAgdGhpcy52YXJpYWJsZVNlcnZpY2VfLm9uVmFyaWFibGVVcGRhdGUoXG4gICAgICAgIEFuYWx5dGljc1ZhcmlhYmxlLlNUT1JZX0FEVkFOQ0VNRU5UX01PREUsXG4gICAgICAgIG1vZGVcbiAgICAgICk7XG4gICAgfSk7XG5cbiAgICB0aGlzLnN0b3JlU2VydmljZV8uc3Vic2NyaWJlKFxuICAgICAgU3RhdGVQcm9wZXJ0eS5DQU5fU0hPV19BVURJT19VSSxcbiAgICAgIChzaG93KSA9PiB7XG4gICAgICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QudG9nZ2xlKCdpLWFtcGh0bWwtc3Rvcnktbm8tYXVkaW8tdWknLCAhc2hvdyk7XG4gICAgICB9LFxuICAgICAgdHJ1ZSAvKiogY2FsbFRvSW5pdGlhbGl6ZSAqL1xuICAgICk7XG5cbiAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihFdmVudFR5cGUuU1dJVENIX1BBR0UsIChlKSA9PiB7XG4gICAgICB0aGlzLnN3aXRjaFRvXyhnZXREZXRhaWwoZSlbJ3RhcmdldFBhZ2VJZCddLCBnZXREZXRhaWwoZSlbJ2RpcmVjdGlvbiddKTtcbiAgICAgIHRoaXMuYW1wU3RvcnlIaW50Xy5oaWRlQWxsTmF2aWdhdGlvbkhpbnQoKTtcbiAgICB9KTtcblxuICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKEV2ZW50VHlwZS5QQUdFX1BST0dSRVNTLCAoZSkgPT4ge1xuICAgICAgY29uc3QgZGV0YWlsID0gZ2V0RGV0YWlsKGUpO1xuICAgICAgY29uc3QgcGFnZUlkID0gZGV0YWlsWydwYWdlSWQnXTtcbiAgICAgIGNvbnN0IHByb2dyZXNzID0gZGV0YWlsWydwcm9ncmVzcyddO1xuXG4gICAgICBpZiAocGFnZUlkICE9PSB0aGlzLmFjdGl2ZVBhZ2VfLmVsZW1lbnQuaWQpIHtcbiAgICAgICAgLy8gSWdub3JlIHByb2dyZXNzIHVwZGF0ZSBldmVudHMgZnJvbSBpbmFjdGl2ZSBwYWdlcy5cbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAoIXRoaXMuYWN0aXZlUGFnZV8uaXNBZCgpKSB7XG4gICAgICAgIHRoaXMuc3lzdGVtTGF5ZXJfLnVwZGF0ZVByb2dyZXNzKHBhZ2VJZCwgcHJvZ3Jlc3MpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoRXZlbnRUeXBlLlJFUExBWSwgKCkgPT4ge1xuICAgICAgdGhpcy5yZXBsYXlfKCk7XG4gICAgfSk7XG5cbiAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihFdmVudFR5cGUuTk9fTkVYVF9QQUdFLCAoKSA9PiB7XG4gICAgICB0aGlzLm9uTm9OZXh0UGFnZV8oKTtcbiAgICB9KTtcblxuICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKEV2ZW50VHlwZS5OT19QUkVWSU9VU19QQUdFLCAoKSA9PiB7XG4gICAgICB0aGlzLm9uTm9QcmV2aW91c1BhZ2VfKCk7XG4gICAgfSk7XG5cbiAgICB0aGlzLmFkdmFuY2VtZW50Xy5hZGRPblRhcE5hdmlnYXRpb25MaXN0ZW5lcigoZGlyZWN0aW9uKSA9PiB7XG4gICAgICB0aGlzLnBlcmZvcm1UYXBOYXZpZ2F0aW9uXyhkaXJlY3Rpb24pO1xuICAgIH0pO1xuXG4gICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoRXZlbnRUeXBlLkRJU1BBVENIX0FDVElPTiwgKGUpID0+IHtcbiAgICAgIGlmICghZ2V0TW9kZSgpLnRlc3QpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBhY3Rpb24gPSBnZXREZXRhaWwoZSlbJ2FjdGlvbiddO1xuICAgICAgY29uc3QgZGF0YSA9IGdldERldGFpbChlKVsnZGF0YSddO1xuICAgICAgdGhpcy5zdG9yZVNlcnZpY2VfLmRpc3BhdGNoKGFjdGlvbiwgZGF0YSk7XG4gICAgfSk7XG5cbiAgICAvLyBBY3Rpb25zIGFsbG93bGlzdCBjb3VsZCBiZSBpbml0aWFsaXplZCBlbXB0eSwgb3Igd2l0aCBzb21lIGFjdGlvbnMgc29tZVxuICAgIC8vIG90aGVyIGNvbXBvbmVudHMgcmVnaXN0ZXJlZC5cbiAgICB0aGlzLnN0b3JlU2VydmljZV8uc3Vic2NyaWJlKFxuICAgICAgU3RhdGVQcm9wZXJ0eS5BQ1RJT05TX0FMTE9XTElTVCxcbiAgICAgIChhY3Rpb25zQWxsb3dsaXN0KSA9PiB7XG4gICAgICAgIGNvbnN0IGFjdGlvbnMgPSBTZXJ2aWNlcy5hY3Rpb25TZXJ2aWNlRm9yRG9jKHRoaXMuZWxlbWVudCk7XG4gICAgICAgIGFjdGlvbnMuc2V0QWxsb3dsaXN0KGFjdGlvbnNBbGxvd2xpc3QpO1xuICAgICAgfSxcbiAgICAgIHRydWUgLyoqIGNhbGxUb0luaXRpYWxpemUgKi9cbiAgICApO1xuXG4gICAgdGhpcy5zdG9yZVNlcnZpY2VfLnN1YnNjcmliZShTdGF0ZVByb3BlcnR5LkFEX1NUQVRFLCAoaXNBZCkgPT4ge1xuICAgICAgdGhpcy5vbkFkU3RhdGVVcGRhdGVfKGlzQWQpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5zdG9yZVNlcnZpY2VfLnN1YnNjcmliZShTdGF0ZVByb3BlcnR5LlBBVVNFRF9TVEFURSwgKGlzUGF1c2VkKSA9PiB7XG4gICAgICB0aGlzLm9uUGF1c2VkU3RhdGVVcGRhdGVfKGlzUGF1c2VkKTtcbiAgICB9KTtcblxuICAgIHRoaXMuc3RvcmVTZXJ2aWNlXy5zdWJzY3JpYmUoXG4gICAgICBTdGF0ZVByb3BlcnR5LlNJREVCQVJfU1RBVEUsXG4gICAgICAoc2lkZWJhclN0YXRlKSA9PiB7XG4gICAgICAgIHRoaXMub25TaWRlYmFyU3RhdGVVcGRhdGVfKHNpZGViYXJTdGF0ZSk7XG4gICAgICB9XG4gICAgKTtcblxuICAgIHRoaXMuc3RvcmVTZXJ2aWNlXy5zdWJzY3JpYmUoXG4gICAgICBTdGF0ZVByb3BlcnR5LlVJX1NUQVRFLFxuICAgICAgKHVpU3RhdGUpID0+IHtcbiAgICAgICAgdGhpcy5vblVJU3RhdGVVcGRhdGVfKHVpU3RhdGUpO1xuICAgICAgfSxcbiAgICAgIHRydWUgLyoqIGNhbGxUb0luaXRpYWxpemUgKi9cbiAgICApO1xuXG4gICAgdGhpcy53aW4uZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICdrZXlkb3duJyxcbiAgICAgIChlKSA9PiB7XG4gICAgICAgIHRoaXMub25LZXlEb3duXyhlKTtcbiAgICAgIH0sXG4gICAgICB0cnVlXG4gICAgKTtcblxuICAgIHRoaXMud2luLmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NvbnRleHRtZW51JywgKGUpID0+IHtcbiAgICAgIGNvbnN0IHVpU3RhdGUgPSB0aGlzLnN0b3JlU2VydmljZV8uZ2V0KFN0YXRlUHJvcGVydHkuVUlfU1RBVEUpO1xuICAgICAgaWYgKHVpU3RhdGUgPT09IFVJVHlwZS5NT0JJTEUpIHtcbiAgICAgICAgaWYgKCF0aGlzLmFsbG93Q29udGV4dE1lbnVPbk1vYmlsZV8oZS50YXJnZXQpKSB7XG4gICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9XG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB0aGlzLmdldEFtcERvYygpLm9uVmlzaWJpbGl0eUNoYW5nZWQoKCkgPT4gdGhpcy5vblZpc2liaWxpdHlDaGFuZ2VkXygpKTtcblxuICAgIHRoaXMud2luLmFkZEV2ZW50TGlzdGVuZXIoJ2hhc2hjaGFuZ2UnLCAoKSA9PiB7XG4gICAgICBjb25zdCBtYXliZVBhZ2VJZCA9IHBhcnNlUXVlcnlTdHJpbmcodGhpcy53aW4ubG9jYXRpb24uaGFzaClbJ3BhZ2UnXTtcbiAgICAgIGlmICghbWF5YmVQYWdlSWQgfHwgIXRoaXMuaXNBY3R1YWxQYWdlXyhtYXliZVBhZ2VJZCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdGhpcy5zd2l0Y2hUb18obWF5YmVQYWdlSWQsIE5hdmlnYXRpb25EaXJlY3Rpb24uTkVYVCk7XG4gICAgICAvLyBSZW1vdmVzIHRoZSBwYWdlICdoYXNoJyBwYXJhbWV0ZXIgZnJvbSB0aGUgVVJMLlxuICAgICAgbGV0IGhyZWYgPSB0aGlzLndpbi5sb2NhdGlvbi5ocmVmLnJlcGxhY2UoXG4gICAgICAgIG5ldyBSZWdFeHAoYHBhZ2U9JHttYXliZVBhZ2VJZH0mP2ApLFxuICAgICAgICAnJ1xuICAgICAgKTtcbiAgICAgIGlmIChlbmRzV2l0aChocmVmLCAnIycpKSB7XG4gICAgICAgIGhyZWYgPSBocmVmLnNsaWNlKDAsIC0xKTtcbiAgICAgIH1cbiAgICAgIHRoaXMud2luLmhpc3RvcnkucmVwbGFjZVN0YXRlKFxuICAgICAgICAodGhpcy53aW4uaGlzdG9yeSAmJiBnZXRXaW5kb3dIaXN0b3J5U3RhdGUodGhpcy53aW4uaGlzdG9yeSkpIHx8XG4gICAgICAgICAge30gLyoqIGRhdGEgKi8sXG4gICAgICAgIHRoaXMud2luLmRvY3VtZW50LnRpdGxlIC8qKiB0aXRsZSAqLyxcbiAgICAgICAgaHJlZiAvKiogVVJMICovXG4gICAgICApO1xuICAgIH0pO1xuXG4gICAgLy8gTGlzdGVuIGZvciBjbGFzcyBtdXRhdGlvbnMgb24gdGhlIDxib2R5PiBlbGVtZW50LlxuICAgIGNvbnN0IGJvZHlFbE9ic2VydmVyID0gbmV3IHRoaXMud2luLk11dGF0aW9uT2JzZXJ2ZXIoKG11dGF0aW9ucykgPT5cbiAgICAgIHRoaXMub25Cb2R5RWxNdXRhdGlvbl8obXV0YXRpb25zKVxuICAgICk7XG4gICAgYm9keUVsT2JzZXJ2ZXIub2JzZXJ2ZSh0aGlzLndpbi5kb2N1bWVudC5ib2R5LCB7XG4gICAgICBhdHRyaWJ1dGVzOiB0cnVlLFxuICAgICAgYXR0cmlidXRlRmlsdGVyOiBbJ2NsYXNzJ10sXG4gICAgfSk7XG5cbiAgICB0aGlzLmdldFZpZXdwb3J0KCkub25SZXNpemUoZGVib3VuY2UodGhpcy53aW4sICgpID0+IHRoaXMub25SZXNpemUoKSwgMzAwKSk7XG4gICAgdGhpcy5pbnN0YWxsR2VzdHVyZVJlY29nbml6ZXJzXygpO1xuXG4gICAgLy8gVE9ETyhnbWFqb3VsZXQpOiBtaWdyYXRlIHRoaXMgdG8gYW1wLXN0b3J5LXZpZXdlci1tZXNzYWdpbmctaGFuZGxlciBvbmNlXG4gICAgLy8gdGhlcmUgaXMgYSB3YXkgdG8gbmF2aWdhdGUgdG8gcGFnZXMgdGhhdCBkb2VzIG5vdCBpbnZvbHZlIHVzaW5nIHByaXZhdGVcbiAgICAvLyBhbXAtc3RvcnkgbWV0aG9kcy5cbiAgICB0aGlzLnZpZXdlcl8ub25NZXNzYWdlKCdzZWxlY3RQYWdlJywgKGRhdGEpID0+IHRoaXMub25TZWxlY3RQYWdlXyhkYXRhKSk7XG4gICAgdGhpcy52aWV3ZXJfLm9uTWVzc2FnZSgncmV3aW5kJywgKCkgPT4gdGhpcy5vblJld2luZF8oKSk7XG5cbiAgICBpZiAodGhpcy52aWV3ZXJNZXNzYWdpbmdIYW5kbGVyXykge1xuICAgICAgdGhpcy52aWV3ZXJNZXNzYWdpbmdIYW5kbGVyXy5zdGFydExpc3RlbmluZygpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBAcHJpdmF0ZSAqL1xuICBvbkJvZHlFbE11dGF0aW9uXyhtdXRhdGlvbnMpIHtcbiAgICBtdXRhdGlvbnMuZm9yRWFjaCgobXV0YXRpb24pID0+IHtcbiAgICAgIGNvbnN0IGJvZHlFbCA9IGRldigpLmFzc2VydEVsZW1lbnQobXV0YXRpb24udGFyZ2V0KTtcblxuICAgICAgLy8gVXBkYXRlcyBwcmVzZW5jZSBvZiB0aGUgYGFtcC1tb2RlLWtleWJvYXJkLWFjdGl2ZWAgY2xhc3Mgb24gdGhlIHN0b3JlLlxuICAgICAgdGhpcy5zdG9yZVNlcnZpY2VfLmRpc3BhdGNoKFxuICAgICAgICBBY3Rpb24uVE9HR0xFX0tFWUJPQVJEX0FDVElWRV9TVEFURSxcbiAgICAgICAgYm9keUVsLmNsYXNzTGlzdC5jb250YWlucygnYW1wLW1vZGUta2V5Ym9hcmQtYWN0aXZlJylcbiAgICAgICk7XG4gICAgfSk7XG4gIH1cblxuICAvKiogQHByaXZhdGUgKi9cbiAgaW5zdGFsbEdlc3R1cmVSZWNvZ25pemVyc18oKSB7XG4gICAgLy8gSWYgdGhlIHN0b3J5IGlzIHdpdGhpbiBhIHZpZXdlciB0aGF0IGVuYWJsZWQgdGhlIHN3aXBlIGNhcGFiaWxpdHksIHRoaXNcbiAgICAvLyBkaXNhYmxlcyB0aGUgbmF2aWdhdGlvbiBlZHVjYXRpb24gb3ZlcmxheSB0byBlbmFibGU6XG4gICAgLy8gICAtIGhvcml6b250YWwgc3dpcGUgZXZlbnRzIHRvIHRoZSBuZXh0IHN0b3J5XG4gICAgLy8gICAtIHZlcnRpY2FsIHN3aXBlIGV2ZW50cyB0byBjbG9zZSB0aGUgdmlld2VyLCBvciBvcGVuIGEgcGFnZSBhdHRhY2htZW50XG4gICAgaWYgKHRoaXMudmlld2VyXy5oYXNDYXBhYmlsaXR5KCdzd2lwZScpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3Qge2VsZW1lbnR9ID0gdGhpcztcbiAgICBjb25zdCBnZXN0dXJlcyA9IEdlc3R1cmVzLmdldChlbGVtZW50LCAvKiBzaG91bGROb3RQcmV2ZW50RGVmYXVsdCAqLyB0cnVlKTtcblxuICAgIC8vIFNob3dzIFwidGFwIHRvIG5hdmlnYXRlXCIgaGludCB3aGVuIHN3aXBpbmcuXG4gICAgZ2VzdHVyZXMub25HZXN0dXJlKFN3aXBlWFlSZWNvZ25pemVyLCAoZ2VzdHVyZSkgPT4ge1xuICAgICAgY29uc3Qge2RlbHRhWCwgZGVsdGFZfSA9IGdlc3R1cmUuZGF0YTtcbiAgICAgIGNvbnN0IGVtYmVkQ29tcG9uZW50ID0gLyoqIEB0eXBlIHtJbnRlcmFjdGl2ZUNvbXBvbmVudERlZn0gKi8gKFxuICAgICAgICB0aGlzLnN0b3JlU2VydmljZV8uZ2V0KFN0YXRlUHJvcGVydHkuSU5URVJBQ1RJVkVfQ09NUE9ORU5UX1NUQVRFKVxuICAgICAgKTtcbiAgICAgIC8vIFRPRE8oZW5yaXFlKTogTW92ZSB0byBhIHNlcGFyYXRlIGZpbGUgaWYgdGhpcyBrZWVwcyBncm93aW5nLlxuICAgICAgaWYgKFxuICAgICAgICBlbWJlZENvbXBvbmVudC5zdGF0ZSAhPT0gRW1iZWRkZWRDb21wb25lbnRTdGF0ZS5ISURERU4gfHxcbiAgICAgICAgdGhpcy5zdG9yZVNlcnZpY2VfLmdldChTdGF0ZVByb3BlcnR5LkFDQ0VTU19TVEFURSkgfHxcbiAgICAgICAgdGhpcy5zdG9yZVNlcnZpY2VfLmdldChTdGF0ZVByb3BlcnR5LlNJREVCQVJfU1RBVEUpIHx8XG4gICAgICAgICF0aGlzLnN0b3JlU2VydmljZV8uZ2V0KFN0YXRlUHJvcGVydHkuU1lTVEVNX1VJX0lTX1ZJU0lCTEVfU1RBVEUpIHx8XG4gICAgICAgICF0aGlzLnN0b3JlU2VydmljZV8uZ2V0KFN0YXRlUHJvcGVydHkuQ0FOX1NIT1dfTkFWSUdBVElPTl9PVkVSTEFZX0hJTlQpXG4gICAgICApIHtcbiAgICAgICAgLy8gQ2FuY2VscyB0aGUgZXZlbnQgZm9yIHRoaXMgZ2VzdHVyZSBlbnRpcmVseSwgZW5zdXJpbmcgdGhlIGhpbnQgd29uJ3RcbiAgICAgICAgLy8gc2hvdyBldmVuIGlmIHRoZSB1c2VyIGtlZXBzIHN3aXBpbmcgd2l0aG91dCByZWxlYXNpbmcgdGhlIHRvdWNoLlxuICAgICAgICBpZiAoZ2VzdHVyZS5ldmVudCAmJiBnZXN0dXJlLmV2ZW50LmNhbmNlbGFibGUgIT09IGZhbHNlKSB7XG4gICAgICAgICAgZ2VzdHVyZS5ldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGlmIChcbiAgICAgICAgKGdlc3R1cmUuZXZlbnQgJiYgZ2VzdHVyZS5ldmVudC5kZWZhdWx0UHJldmVudGVkKSB8fFxuICAgICAgICAhdGhpcy5pc1N3aXBlTGFyZ2VFbm91Z2hGb3JIaW50XyhkZWx0YVgsIGRlbHRhWSlcbiAgICAgICkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHRoaXMuYW1wU3RvcnlIaW50Xy5zaG93TmF2aWdhdGlvbk92ZXJsYXkoKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge251bWJlcn0gZGVsdGFYXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBkZWx0YVlcbiAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGlzU3dpcGVMYXJnZUVub3VnaEZvckhpbnRfKGRlbHRhWCwgZGVsdGFZKSB7XG4gICAgY29uc3Qgc2lkZVN3aXBlID0gTWF0aC5hYnMoZGVsdGFYKSA+PSBNSU5fU1dJUEVfRk9SX0hJTlRfT1ZFUkxBWV9QWDtcbiAgICBjb25zdCB1cFN3aXBlID0gLTEgKiBkZWx0YVkgPj0gTUlOX1NXSVBFX0ZPUl9ISU5UX09WRVJMQVlfUFg7XG4gICAgcmV0dXJuIHNpZGVTd2lwZSB8fCB1cFN3aXBlO1xuICB9XG5cbiAgLyoqIEBwcml2YXRlICovXG4gIGluaXRpYWxpemVMaXN0ZW5lcnNGb3JEZXZfKCkge1xuICAgIGlmICghZ2V0TW9kZSgpLmRldmVsb3BtZW50KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoRXZlbnRUeXBlLkRFVl9MT0dfRU5UUklFU19BVkFJTEFCTEUsIChlKSA9PiB7XG4gICAgICB0aGlzLnN5c3RlbUxheWVyXy5sb2dBbGwoLyoqIEB0eXBlIHs/fSAqLyAoZ2V0RGV0YWlsKGUpKSk7XG4gICAgfSk7XG4gIH1cblxuICAvKiogQHByaXZhdGUgKi9cbiAgbG9ja0JvZHlfKCkge1xuICAgIGNvbnN0IHtkb2N1bWVudH0gPSB0aGlzLndpbjtcbiAgICBzZXRJbXBvcnRhbnRTdHlsZXMoZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LCB7XG4gICAgICAnb3ZlcmZsb3cnOiAnaGlkZGVuJyxcbiAgICB9KTtcbiAgICBzZXRJbXBvcnRhbnRTdHlsZXMoZG9jdW1lbnQuYm9keSwge1xuICAgICAgJ292ZXJmbG93JzogJ2hpZGRlbicsXG4gICAgfSk7XG5cbiAgICB0aGlzLmdldFZpZXdwb3J0KCkucmVzZXRUb3VjaFpvb20oKTtcbiAgICB0aGlzLmdldFZpZXdwb3J0KCkuZGlzYWJsZVRvdWNoWm9vbSgpO1xuICAgIHRoaXMubWF5YmVMb2NrU2NyZWVuT3JpZW50YXRpb25fKCk7XG4gIH1cblxuICAvKiogQHByaXZhdGUgKi9cbiAgbWF5YmVMb2NrU2NyZWVuT3JpZW50YXRpb25fKCkge1xuICAgIGNvbnN0IHtzY3JlZW59ID0gdGhpcy53aW47XG4gICAgaWYgKCFzY3JlZW4gfHwgIXRoaXMuY2FuUm90YXRlVG9EZXNrdG9wTWVkaWFfLm1hdGNoZXMpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBsb2NrT3JpZW50YXRpb24gPVxuICAgICAgc2NyZWVuLm9yaWVudGF0aW9uLmxvY2sgfHxcbiAgICAgIHNjcmVlbi5sb2NrT3JpZW50YXRpb24gfHxcbiAgICAgIHNjcmVlbi5tb3pMb2NrT3JpZW50YXRpb24gfHxcbiAgICAgIHNjcmVlbi5tc0xvY2tPcmllbnRhdGlvbiB8fFxuICAgICAgKCh1bnVzZWRPcmllbnRhdGlvbikgPT4ge30pO1xuXG4gICAgdHJ5IHtcbiAgICAgIGxvY2tPcmllbnRhdGlvbigncG9ydHJhaXQnKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBkZXYoKS53YXJuKFRBRywgJ0ZhaWxlZCB0byBsb2NrIHNjcmVlbiBvcmllbnRhdGlvbjonLCBlLm1lc3NhZ2UpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgbGF5b3V0Q2FsbGJhY2soKSB7XG4gICAgaWYgKCFBbXBTdG9yeS5pc0Jyb3dzZXJTdXBwb3J0ZWQodGhpcy53aW4pICYmICF0aGlzLnBsYXRmb3JtXy5pc0JvdCgpKSB7XG4gICAgICB0aGlzLnN0b3JlU2VydmljZV8uZGlzcGF0Y2goQWN0aW9uLlRPR0dMRV9TVVBQT1JURURfQlJPV1NFUiwgZmFsc2UpO1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5sYXlvdXRTdG9yeV8oKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW5kZXJzIHRoZSBsYXlvdXQgZm9yIHRoZSBzdG9yeS5cbiAgICogQHJldHVybiB7IVByb21pc2V9IEEgcHJvbWlzZSB0aGF0IGlzIHJlc29sdmVkIHdoZW4gdGhlIHN0b3J5IGxheW91dCBpc1xuICAgKiAgICAgICBsb2FkZWRcbiAgICogQHByaXZhdGVcbiAgICovXG4gIGxheW91dFN0b3J5XygpIHtcbiAgICBjb25zdCBpbml0aWFsUGFnZUlkID0gdGhpcy5nZXRJbml0aWFsUGFnZUlkXygpO1xuXG4gICAgdGhpcy5idWlsZFN5c3RlbUxheWVyXyhpbml0aWFsUGFnZUlkKTtcbiAgICB0aGlzLmluaXRpYWxpemVTaWRlYmFyXygpO1xuICAgIHRoaXMuc2V0VGhlbWVDb2xvcl8oKTtcblxuICAgIGNvbnN0IHN0b3J5TGF5b3V0UHJvbWlzZSA9IFByb21pc2UuYWxsKFtcbiAgICAgIHRoaXMuZ2V0QW1wRG9jKCkud2hlbkZpcnN0VmlzaWJsZSgpLCAvLyBQYXVzZXMgZXhlY3V0aW9uIGR1cmluZyBwcmVyZW5kZXIuXG4gICAgICB0aGlzLmluaXRpYWxpemVQYWdlc18oKSxcbiAgICBdKVxuICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICB0aGlzLmhhbmRsZUNvbnNlbnRFeHRlbnNpb25fKCk7XG4gICAgICAgIHRoaXMuaW5pdGlhbGl6ZVN0b3J5QWNjZXNzXygpO1xuXG4gICAgICAgIHRoaXMucGFnZXNfLmZvckVhY2goKHBhZ2UsIGluZGV4KSA9PiB7XG4gICAgICAgICAgcGFnZS5zZXRTdGF0ZShQYWdlU3RhdGUuTk9UX0FDVElWRSk7XG4gICAgICAgICAgdGhpcy51cGdyYWRlQ3RhQW5jaG9yVGFnc0ZvclRyYWNraW5nXyhwYWdlLCBpbmRleCk7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmluaXRpYWxpemVTdG9yeU5hdmlnYXRpb25QYXRoXygpO1xuXG4gICAgICAgIC8vIEJ1aWxkIHBhZ2luYXRpb24gYnV0dG9ucyBpZiB0aGV5IGNhbiBiZSBkaXNwbGF5ZWQuXG4gICAgICAgIGlmICh0aGlzLnN0b3JlU2VydmljZV8uZ2V0KFN0YXRlUHJvcGVydHkuQ0FOX1NIT1dfUEFHSU5BVElPTl9CVVRUT05TKSkge1xuICAgICAgICAgIG5ldyBQYWdpbmF0aW9uQnV0dG9ucyh0aGlzKTtcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICAgIC50aGVuKCgpID0+XG4gICAgICAgIC8vIFdlIG5lZWQgdG8gY2FsbCB0aGlzLmdldEluaXRpYWxQYWdlSWRfKCkgYWdhaW4gYmVjYXVzZSB0aGUgaW5pdGlhbFxuICAgICAgICAvLyBwYWdlIGNvdWxkJ3ZlIGNoYW5nZWQgYmV0d2VlbiB0aGUgc3RhcnQgb2YgbGF5b3V0U3RvcnlfIGFuZCBoZXJlLlxuICAgICAgICB0aGlzLnN3aXRjaFRvXyh0aGlzLmdldEluaXRpYWxQYWdlSWRfKCksIE5hdmlnYXRpb25EaXJlY3Rpb24uTkVYVClcbiAgICAgIClcbiAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgY29uc3Qgc2hvdWxkUmVPcGVuQXR0YWNobWVudEZvclBhZ2VJZCA9IGdldEhpc3RvcnlTdGF0ZShcbiAgICAgICAgICB0aGlzLndpbixcbiAgICAgICAgICBIaXN0b3J5U3RhdGUuQVRUQUNITUVOVF9QQUdFX0lEXG4gICAgICAgICk7XG5cbiAgICAgICAgaWYgKHNob3VsZFJlT3BlbkF0dGFjaG1lbnRGb3JQYWdlSWQgPT09IHRoaXMuYWN0aXZlUGFnZV8uZWxlbWVudC5pZCkge1xuICAgICAgICAgIHRoaXMuYWN0aXZlUGFnZV8ub3BlbkF0dGFjaG1lbnQoZmFsc2UgLyoqIHNob3VsZEFuaW1hdGUgKi8pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gUHJlbG9hZHMgYW5kIHByZXJlbmRlcnMgdGhlIHNoYXJlIG1lbnUuXG4gICAgICAgIHRoaXMuc2hhcmVNZW51Xy5idWlsZCgpO1xuXG4gICAgICAgIGNvbnN0IGluZm9EaWFsb2cgPSBzaG91bGRTaG93U3RvcnlVcmxJbmZvKGRldkFzc2VydCh0aGlzLnZpZXdlcl8pKVxuICAgICAgICAgID8gbmV3IEluZm9EaWFsb2codGhpcy53aW4sIHRoaXMuZWxlbWVudClcbiAgICAgICAgICA6IG51bGw7XG4gICAgICAgIGlmIChpbmZvRGlhbG9nKSB7XG4gICAgICAgICAgaW5mb0RpYWxvZy5idWlsZCgpO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgIC8vIERvIG5vdCBibG9jayB0aGUgbGF5b3V0IGNhbGxiYWNrIG9uIHRoZSBjb21wbGV0aW9uIG9mIHRoZXNlIHByb21pc2VzLCBhc1xuICAgIC8vIHRoYXQgcHJldmVudHMgZGVzY2VuZGVudHMgZnJvbSBiZWluZyBsYWlkIG91dCAoYW5kIHRoZXJlZm9yZSBsb2FkZWQpLlxuICAgIHN0b3J5TGF5b3V0UHJvbWlzZVxuICAgICAgLnRoZW4oKCkgPT5cbiAgICAgICAgdGhpcy53aGVuSW5pdGlhbENvbnRlbnRMb2FkZWRfKElOSVRJQUxfQ09OVEVOVF9MT0FEX1RJTUVPVVRfTVMpXG4gICAgICApXG4gICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgIHRoaXMubWFya1N0b3J5QXNMb2FkZWRfKCk7XG4gICAgICAgIHRoaXMuaW5pdGlhbGl6ZUxpdmVTdG9yeV8oKTtcbiAgICAgIH0pO1xuXG4gICAgdGhpcy5tYXliZUxvYWRTdG9yeUVkdWNhdGlvbl8oKTtcblxuICAgIC8vIFN0b3J5IGlzIGJlaW5nIHByZXJlbmRlcmVkOiByZXNvbHZlIHRoZSBsYXlvdXRDYWxsYmFjayB3aGVuIHRoZSBhY3RpdmVcbiAgICAvLyBwYWdlIGlzIGJ1aWx0LiBPdGhlciBwYWdlcyB3aWxsIG9ubHkgYnVpbGQgaWYgdGhlIGRvY3VtZW50IGJlY29tZXNcbiAgICAvLyB2aXNpYmxlLlxuICAgIGNvbnN0IGluaXRpYWxQYWdlRWwgPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcbiAgICAgIGBhbXAtc3RvcnktcGFnZSMke2VzY2FwZUNzc1NlbGVjdG9ySWRlbnQoaW5pdGlhbFBhZ2VJZCl9YFxuICAgICk7XG4gICAgaWYgKCF0aGlzLmdldEFtcERvYygpLmhhc0JlZW5WaXNpYmxlKCkpIHtcbiAgICAgIHJldHVybiB3aGVuVXBncmFkZWRUb0N1c3RvbUVsZW1lbnQoaW5pdGlhbFBhZ2VFbCkudGhlbigoKSA9PiB7XG4gICAgICAgIHJldHVybiBpbml0aWFsUGFnZUVsLmJ1aWxkKCk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBXaWxsIHJlc29sdmUgd2hlbiBhbGwgcGFnZXMgYXJlIGJ1aWx0LlxuICAgIHJldHVybiBzdG9yeUxheW91dFByb21pc2U7XG4gIH1cblxuICAvKipcbiAgICogSW5pdGlhbGl6ZSBMaXZlU3RvcnlNYW5hZ2VyIGlmIHRoaXMgaXMgYSBsaXZlIHN0b3J5LlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgaW5pdGlhbGl6ZUxpdmVTdG9yeV8oKSB7XG4gICAgaWYgKHRoaXMuZWxlbWVudC5oYXNBdHRyaWJ1dGUoJ2xpdmUtc3RvcnknKSkge1xuICAgICAgdGhpcy5saXZlU3RvcnlNYW5hZ2VyXyA9IG5ldyBMaXZlU3RvcnlNYW5hZ2VyKHRoaXMpO1xuICAgICAgdGhpcy5saXZlU3RvcnlNYW5hZ2VyXy5idWlsZCgpO1xuXG4gICAgICB0aGlzLnN0b3JlU2VydmljZV8uZGlzcGF0Y2goQWN0aW9uLkFERF9UT19BQ1RJT05TX0FMTE9XTElTVCwgW1xuICAgICAgICB7dGFnT3JUYXJnZXQ6ICdBTVAtTElWRS1MSVNUJywgbWV0aG9kOiAndXBkYXRlJ30sXG4gICAgICBdKTtcblxuICAgICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoQW1wRXZlbnRzLkRPTV9VUERBVEUsICgpID0+IHtcbiAgICAgICAgdGhpcy5saXZlU3RvcnlNYW5hZ2VyXy51cGRhdGUoKTtcbiAgICAgICAgdGhpcy5pbml0aWFsaXplUGFnZXNfKCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgdGhpcy5wcmVsb2FkUGFnZXNCeURpc3RhbmNlXygpO1xuICAgICAgICAgIGlmIChcbiAgICAgICAgICAgIHRoaXMuc3RvcmVTZXJ2aWNlXy5nZXQoU3RhdGVQcm9wZXJ0eS5VSV9TVEFURSkgPT09XG4gICAgICAgICAgICBVSVR5cGUuREVTS1RPUF9QQU5FTFNcbiAgICAgICAgICApIHtcbiAgICAgICAgICAgIHRoaXMuc2V0RGVza3RvcFBvc2l0aW9uQXR0cmlidXRlc18odGhpcy5hY3RpdmVQYWdlXyk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXRyaWV2ZXMgdGhlIGluaXRpYWwgcGFnZUlkIHRvIGJlZ2luIHRoZSBzdG9yeSB3aXRoLiBJbiBvcmRlciwgdGhlXG4gICAqIGluaXRpYWwgcGFnZSBmb3IgYSBzdG9yeSBzaG91bGQgYmUgZWl0aGVyIGEgdmFsaWQgcGFnZSBJRCBpbiB0aGUgVVJMXG4gICAqIGZyYWdtZW50LCB0aGUgcGFnZSBJRCBpbiB0aGUgaGlzdG9yeSwgb3IgdGhlIGZpcnN0IHBhZ2Ugb2YgdGhlIHN0b3J5LlxuICAgKiBAcmV0dXJuIHs/c3RyaW5nfVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgZ2V0SW5pdGlhbFBhZ2VJZF8oKSB7XG4gICAgY29uc3QgbWF5YmVQYWdlSWQgPSBwYXJzZVF1ZXJ5U3RyaW5nKHRoaXMud2luLmxvY2F0aW9uLmhhc2gpWydwYWdlJ107XG4gICAgaWYgKG1heWJlUGFnZUlkICYmIHRoaXMuaXNBY3R1YWxQYWdlXyhtYXliZVBhZ2VJZCkpIHtcbiAgICAgIHJldHVybiBtYXliZVBhZ2VJZDtcbiAgICB9XG5cbiAgICBjb25zdCBwYWdlcyA9IC8qKiAgQHR5cGUgeyFBcnJheX0gKi8gKFxuICAgICAgZ2V0SGlzdG9yeVN0YXRlKHRoaXMud2luLCBIaXN0b3J5U3RhdGUuTkFWSUdBVElPTl9QQVRIKSB8fCBbXVxuICAgICk7XG4gICAgY29uc3QgaGlzdG9yeVBhZ2UgPSBsYXN0SXRlbShwYWdlcyk7XG4gICAgaWYgKGhpc3RvcnlQYWdlICYmIHRoaXMuaXNBY3R1YWxQYWdlXyhoaXN0b3J5UGFnZSkpIHtcbiAgICAgIHJldHVybiBoaXN0b3J5UGFnZTtcbiAgICB9XG5cbiAgICBjb25zdCBmaXJzdFBhZ2VFbCA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKCdhbXAtc3RvcnktcGFnZScpO1xuICAgIHJldHVybiBmaXJzdFBhZ2VFbCA/IGZpcnN0UGFnZUVsLmlkIDogbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3MgaWYgdGhlIGFtcC1zdG9yeS1wYWdlIGZvciBhIGdpdmVuIElEIGV4aXN0cy5cbiAgICogTm90ZTogdGhlIGB0aGlzLnBhZ2VzX2AgYXJyYXkgbWlnaHQgbm90IGJlIGRlZmluZWQgeWV0LlxuICAgKiBAcGFyYW0ge3N0cmluZ30gcGFnZUlkXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBpc0FjdHVhbFBhZ2VfKHBhZ2VJZCkge1xuICAgIGlmICh0aGlzLnBhZ2VzXy5sZW5ndGggPiAwKSB7XG4gICAgICByZXR1cm4gdGhpcy5wYWdlc18uc29tZSgocGFnZSkgPT4gcGFnZS5lbGVtZW50LmlkID09PSBwYWdlSWQpO1xuICAgIH1cbiAgICByZXR1cm4gISF0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihgIyR7ZXNjYXBlQ3NzU2VsZWN0b3JJZGVudChwYWdlSWQpfWApO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB0aW1lb3V0TXMgVGhlIG1heGltdW0gYW1vdW50IG9mIHRpbWUgdG8gd2FpdCwgaW5cbiAgICogICAgIG1pbGxpc2Vjb25kcy5cbiAgICogQHJldHVybiB7IVByb21pc2V9IEEgcHJvbWlzZSB0aGF0IGlzIHJlc29sdmVkIHdoZW4gdGhlIGluaXRpYWwgY29udGVudCBpc1xuICAgKiAgICAgbG9hZGVkIG9yIHRoZSB0aW1lb3V0IGhhcyBiZWVuIGV4Y2VlZGVkLCB3aGljaGV2ZXIgaGFwcGVucyBmaXJzdC5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIHdoZW5Jbml0aWFsQ29udGVudExvYWRlZF8odGltZW91dE1zID0gMCkge1xuICAgIGNvbnN0IHBhZ2VzVG9XYWl0Rm9yID1cbiAgICAgIHRoaXMuc3RvcmVTZXJ2aWNlXy5nZXQoU3RhdGVQcm9wZXJ0eS5VSV9TVEFURSkgPT09IFVJVHlwZS5ERVNLVE9QX1BBTkVMU1xuICAgICAgICA/IFt0aGlzLnBhZ2VzX1swXSwgdGhpcy5wYWdlc19bMV1dXG4gICAgICAgIDogW3RoaXMucGFnZXNfWzBdXTtcblxuICAgIGNvbnN0IHN0b3J5TG9hZFByb21pc2UgPSBQcm9taXNlLmFsbChcbiAgICAgIHBhZ2VzVG9XYWl0Rm9yXG4gICAgICAgIC5maWx0ZXIoQm9vbGVhbilcbiAgICAgICAgLm1hcCgocGFnZSkgPT5cbiAgICAgICAgICBwYWdlLmVsZW1lbnQuc2lnbmFscygpLndoZW5TaWduYWwoQ29tbW9uU2lnbmFscy5MT0FEX0VORClcbiAgICAgICAgKVxuICAgICk7XG5cbiAgICByZXR1cm4gdGhpcy50aW1lcl9cbiAgICAgIC50aW1lb3V0UHJvbWlzZSh0aW1lb3V0TXMsIHN0b3J5TG9hZFByb21pc2UpXG4gICAgICAuY2F0Y2goKCkgPT4ge30pO1xuICB9XG5cbiAgLyoqIEBwcml2YXRlICovXG4gIG1hcmtTdG9yeUFzTG9hZGVkXygpIHtcbiAgICBkaXNwYXRjaChcbiAgICAgIHRoaXMud2luLFxuICAgICAgdGhpcy5lbGVtZW50LFxuICAgICAgRXZlbnRUeXBlLlNUT1JZX0xPQURFRCxcbiAgICAgIC8qIHBheWxvYWQgKi8gdW5kZWZpbmVkLFxuICAgICAge2J1YmJsZXM6IHRydWV9XG4gICAgKTtcbiAgICB0aGlzLnZpZXdlck1lc3NhZ2luZ0hhbmRsZXJfICYmXG4gICAgICB0aGlzLnZpZXdlck1lc3NhZ2luZ0hhbmRsZXJfLnNlbmQoJ3N0b3J5Q29udGVudExvYWRlZCcsIGRpY3Qoe30pKTtcbiAgICB0aGlzLmFuYWx5dGljc1NlcnZpY2VfLnRyaWdnZXJFdmVudChcbiAgICAgIFN0b3J5QW5hbHl0aWNzRXZlbnQuU1RPUllfQ09OVEVOVF9MT0FERURcbiAgICApO1xuICAgIHRoaXMuc2lnbmFscygpLnNpZ25hbChDb21tb25TaWduYWxzLklOSV9MT0FEKTtcbiAgICB0aGlzLm11dGF0ZUVsZW1lbnQoKCkgPT4ge1xuICAgICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoU1RPUllfTE9BREVEX0NMQVNTX05BTUUpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEhhbmRsZXMgdGhlIHN0b3J5IGNvbnNlbnQgZXh0ZW5zaW9uLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgaGFuZGxlQ29uc2VudEV4dGVuc2lvbl8oKSB7XG4gICAgY29uc3QgY29uc2VudEVsID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJ2FtcC1jb25zZW50Jyk7XG4gICAgaWYgKCFjb25zZW50RWwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLnBhdXNlU3RvcnlVbnRpbENvbnNlbnRJc1Jlc29sdmVkXygpO1xuICAgIHRoaXMudmFsaWRhdGVDb25zZW50Xyhjb25zZW50RWwpO1xuICB9XG5cbiAgLyoqXG4gICAqIFBhdXNlcyB0aGUgc3RvcnkgdW50aWwgdGhlIGNvbnNlbnQgaXMgcmVzb2x2ZWQgKGFjY2VwdGVkIG9yIHJlamVjdGVkKS5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIHBhdXNlU3RvcnlVbnRpbENvbnNlbnRJc1Jlc29sdmVkXygpIHtcbiAgICBjb25zdCBwb2xpY3lJZCA9IHRoaXMuZ2V0Q29uc2VudFBvbGljeSgpIHx8ICdkZWZhdWx0JztcbiAgICBjb25zdCBjb25zZW50UHJvbWlzZSA9IGdldENvbnNlbnRQb2xpY3lTdGF0ZSh0aGlzLmVsZW1lbnQsIHBvbGljeUlkKTtcblxuICAgIGlmICghY29uc2VudFByb21pc2UpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLnN0b3JlU2VydmljZV8uZGlzcGF0Y2goQWN0aW9uLlRPR0dMRV9QQVVTRUQsIHRydWUpO1xuXG4gICAgY29uc2VudFByb21pc2UudGhlbigoKSA9PiB7XG4gICAgICB0aGlzLnN0b3JlU2VydmljZV8uZGlzcGF0Y2goQWN0aW9uLlRPR0dMRV9QQVVTRUQsIGZhbHNlKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBFbnN1cmVzIHB1Ymxpc2hlcnMgdXNpbmcgYW1wLWNvbnNlbnQgdXNlIGFtcC1zdG9yeS1jb25zZW50LlxuICAgKiBAcGFyYW0geyFFbGVtZW50fSBjb25zZW50RWxcbiAgICogQHByaXZhdGVcbiAgICovXG4gIHZhbGlkYXRlQ29uc2VudF8oY29uc2VudEVsKSB7XG4gICAgaWYgKCFjaGlsZEVsZW1lbnRCeVRhZyhjb25zZW50RWwsICdhbXAtc3RvcnktY29uc2VudCcpKSB7XG4gICAgICB1c2VyKCkuZXJyb3IoVEFHLCAnYW1wLWNvbnNlbnQgbXVzdCBoYXZlIGFuIGFtcC1zdG9yeS1jb25zZW50IGNoaWxkJyk7XG4gICAgfVxuXG4gICAgY29uc3QgYWxsb3dlZFRhZ3MgPSBbJ1NDUklQVCcsICdBTVAtU1RPUlktQ09OU0VOVCddO1xuICAgIGNvbnN0IHRvUmVtb3ZlQ2hpbGRyZW4gPSBjaGlsZEVsZW1lbnRzKFxuICAgICAgY29uc2VudEVsLFxuICAgICAgKGVsKSA9PiBhbGxvd2VkVGFncy5pbmRleE9mKGVsLnRhZ05hbWUpID09PSAtMVxuICAgICk7XG5cbiAgICBpZiAodG9SZW1vdmVDaGlsZHJlbi5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdXNlcigpLmVycm9yKFRBRywgJ2FtcC1jb25zZW50IG9ubHkgYWxsb3dzIHRhZ3M6ICVzJywgYWxsb3dlZFRhZ3MpO1xuICAgIHRvUmVtb3ZlQ2hpbGRyZW4uZm9yRWFjaCgoZWwpID0+IGNvbnNlbnRFbC5yZW1vdmVDaGlsZChlbCkpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBpbml0aWFsaXplU3RvcnlBY2Nlc3NfKCkge1xuICAgIFNlcnZpY2VzLmFjY2Vzc1NlcnZpY2VGb3JEb2NPck51bGwodGhpcy5lbGVtZW50KS50aGVuKChhY2Nlc3NTZXJ2aWNlKSA9PiB7XG4gICAgICBpZiAoIWFjY2Vzc1NlcnZpY2UpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmFyZUFjY2Vzc0F1dGhvcml6YXRpb25zQ29tcGxldGVkXyA9XG4gICAgICAgIGFjY2Vzc1NlcnZpY2UuYXJlRmlyc3RBdXRob3JpemF0aW9uc0NvbXBsZXRlZCgpO1xuICAgICAgYWNjZXNzU2VydmljZS5vbkFwcGx5QXV0aG9yaXphdGlvbnMoKCkgPT5cbiAgICAgICAgdGhpcy5vbkFjY2Vzc0FwcGx5QXV0aG9yaXphdGlvbnNfKClcbiAgICAgICk7XG5cbiAgICAgIGNvbnN0IGZpcnN0UGFnZSA9IHRoaXMucGFnZXNfWzBdLmVsZW1lbnQ7XG5cbiAgICAgIC8vIEZpcnN0IGFtcC1zdG9yeS1wYWdlIGNhbid0IGJlIHBheXdhbGwgcHJvdGVjdGVkLlxuICAgICAgLy8gUmVtb3ZlcyB0aGUgYWNjZXNzIGF0dHJpYnV0ZXMsIGFuZCB0aHJvd3MgYW4gZXJyb3IgZHVyaW5nIGRldmVsb3BtZW50LlxuICAgICAgaWYgKFxuICAgICAgICBmaXJzdFBhZ2UuaGFzQXR0cmlidXRlKCdhbXAtYWNjZXNzJykgfHxcbiAgICAgICAgZmlyc3RQYWdlLmhhc0F0dHJpYnV0ZSgnYW1wLWFjY2Vzcy1oaWRlJylcbiAgICAgICkge1xuICAgICAgICBmaXJzdFBhZ2UucmVtb3ZlQXR0cmlidXRlKCdhbXAtYWNjZXNzJyk7XG4gICAgICAgIGZpcnN0UGFnZS5yZW1vdmVBdHRyaWJ1dGUoJ2FtcC1hY2Nlc3MtaGlkZScpO1xuICAgICAgICB1c2VyKCkuZXJyb3IoXG4gICAgICAgICAgVEFHLFxuICAgICAgICAgICdGaXJzdCBhbXAtc3RvcnktcGFnZSBjYW5ub3QgaGF2ZSBhbXAtYWNjZXNzICcgK1xuICAgICAgICAgICAgJ29yIGFtcC1hY2Nlc3MtaGlkZSBhdHRyaWJ1dGVzJ1xuICAgICAgICApO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIE9uIGFtcC1hY2Nlc3MgZG9jdW1lbnQgcmVhdXRob3JpemF0aW9uLCBtYXliZSBoaWRlIHRoZSBhY2Nlc3MgVUksIGFuZCBtYXliZVxuICAgKiBwZXJmb3JtIG5hdmlnYXRpb24uXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBvbkFjY2Vzc0FwcGx5QXV0aG9yaXphdGlvbnNfKCkge1xuICAgIHRoaXMuYXJlQWNjZXNzQXV0aG9yaXphdGlvbnNDb21wbGV0ZWRfID0gdHJ1ZTtcblxuICAgIGNvbnN0IG5leHRQYWdlID0gdGhpcy5uYXZpZ2F0ZVRvUGFnZUFmdGVyQWNjZXNzXztcblxuICAgIC8vIFN0ZXAgb3V0IGlmIHRoZSBuZXh0IHBhZ2UgaXMgc3RpbGwgaGlkZGVuIGJ5IHRoZSBhY2Nlc3MgZXh0ZW5zaW9uLlxuICAgIGlmIChuZXh0UGFnZSAmJiBuZXh0UGFnZS5lbGVtZW50Lmhhc0F0dHJpYnV0ZSgnYW1wLWFjY2Vzcy1oaWRlJykpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAobmV4dFBhZ2UpIHtcbiAgICAgIHRoaXMubmF2aWdhdGVUb1BhZ2VBZnRlckFjY2Vzc18gPSBudWxsO1xuICAgICAgdGhpcy5zd2l0Y2hUb18obmV4dFBhZ2UuZWxlbWVudC5pZCwgTmF2aWdhdGlvbkRpcmVjdGlvbi5ORVhUKTtcbiAgICB9XG5cbiAgICB0aGlzLnN0b3JlU2VydmljZV8uZGlzcGF0Y2goQWN0aW9uLlRPR0dMRV9BQ0NFU1MsIGZhbHNlKTtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgaXNMYXlvdXRTdXBwb3J0ZWQobGF5b3V0KSB7XG4gICAgcmV0dXJuIGxheW91dCA9PSBMYXlvdXQuQ09OVEFJTkVSO1xuICB9XG5cbiAgLyoqIEBwcml2YXRlICovXG4gIGluaXRpYWxpemVQYWdlc18oKSB7XG4gICAgY29uc3QgcGFnZUltcGxQcm9taXNlcyA9IEFycmF5LnByb3RvdHlwZS5tYXAuY2FsbChcbiAgICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKCdhbXAtc3RvcnktcGFnZScpLFxuICAgICAgKHBhZ2VFbCkgPT4gcGFnZUVsLmdldEltcGwoKVxuICAgICk7XG5cbiAgICByZXR1cm4gUHJvbWlzZS5hbGwocGFnZUltcGxQcm9taXNlcykudGhlbigocGFnZXMpID0+IHtcbiAgICAgIHRoaXMucGFnZXNfID0gcGFnZXM7XG4gICAgICBpZiAoaXNFeHBlcmltZW50T24odGhpcy53aW4sICdhbXAtc3RvcnktYnJhbmNoaW5nJykpIHtcbiAgICAgICAgdGhpcy5zdG9yZVNlcnZpY2VfLmRpc3BhdGNoKEFjdGlvbi5BRERfVE9fQUNUSU9OU19BTExPV0xJU1QsIFtcbiAgICAgICAgICB7dGFnT3JUYXJnZXQ6ICdBTVAtU1RPUlknLCBtZXRob2Q6ICdnb1RvUGFnZSd9LFxuICAgICAgICBdKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZHZhbmNlIHRvIHRoZSBuZXh0IHNjcmVlbiBpbiB0aGUgc3RvcnksIGlmIHRoZXJlIGlzIG9uZS5cbiAgICogQHBhcmFtIHtib29sZWFuPX0gb3B0X2lzQXV0b21hdGljQWR2YW5jZSBXaGV0aGVyIHRoaXMgbmF2aWdhdGlvbiB3YXMgY2F1c2VkXG4gICAqICAgICBieSBhbiBhdXRvbWF0aWMgYWR2YW5jZW1lbnQgYWZ0ZXIgYSB0aW1lb3V0LlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgbmV4dF8ob3B0X2lzQXV0b21hdGljQWR2YW5jZSkge1xuICAgIGNvbnN0IGFjdGl2ZVBhZ2UgPSBkZXZBc3NlcnQoXG4gICAgICB0aGlzLmFjdGl2ZVBhZ2VfLFxuICAgICAgJ05vIGFjdGl2ZSBwYWdlIHNldCB3aGVuIG5hdmlnYXRpbmcgdG8gbmV4dCBwYWdlLidcbiAgICApO1xuICAgIGFjdGl2ZVBhZ2UubmV4dChvcHRfaXNBdXRvbWF0aWNBZHZhbmNlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbnN0YWxscyBhbXAtdmlld2VyLWludGVncmF0aW9uIHNjcmlwdCBpbiBjYXNlIHN0b3J5IGlzIGluc2lkZSBhblxuICAgKiBhbXAtc3RvcnktcGxheWVyLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgaW5pdGlhbGl6ZVN0b3J5UGxheWVyXygpIHtcbiAgICBpZiAodGhpcy52aWV3ZXJfLmdldFBhcmFtKCdzdG9yeVBsYXllcicpICE9PSAndjAnKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIFNlcnZpY2VzLmV4dGVuc2lvbnNGb3IodGhpcy53aW4pLmluc3RhbGxFeHRlbnNpb25Gb3JEb2MoXG4gICAgICB0aGlzLmdldEFtcERvYygpLFxuICAgICAgJ2FtcC12aWV3ZXItaW50ZWdyYXRpb24nXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBIYW5kbGVzIEV2ZW50VHlwZS5OT19ORVhUX1BBR0UgZXZlbnRzLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgb25Ob05leHRQYWdlXygpIHtcbiAgICBpZiAodGhpcy52aWV3ZXJfLmhhc0NhcGFiaWxpdHkoJ3N3aXBlJykgJiYgdGhpcy52aWV3ZXJNZXNzYWdpbmdIYW5kbGVyXykge1xuICAgICAgY29uc3QgYWR2YW5jZW1lbnRNb2RlID0gdGhpcy5zdG9yZVNlcnZpY2VfLmdldChcbiAgICAgICAgU3RhdGVQcm9wZXJ0eS5BRFZBTkNFTUVOVF9NT0RFXG4gICAgICApO1xuICAgICAgdGhpcy52aWV3ZXJNZXNzYWdpbmdIYW5kbGVyXy5zZW5kKFxuICAgICAgICAnc2VsZWN0RG9jdW1lbnQnLFxuICAgICAgICBkaWN0KHsnbmV4dCc6IHRydWUsICdhZHZhbmNlbWVudE1vZGUnOiBhZHZhbmNlbWVudE1vZGV9KVxuICAgICAgKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogR28gYmFjayB0byB0aGUgcHJldmlvdXMgc2NyZWVuIGluIHRoZSBzdG9yeSwgaWYgdGhlcmUgaXMgb25lLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgcHJldmlvdXNfKCkge1xuICAgIGNvbnN0IGFjdGl2ZVBhZ2UgPSBkZXZBc3NlcnQoXG4gICAgICB0aGlzLmFjdGl2ZVBhZ2VfLFxuICAgICAgJ05vIGFjdGl2ZSBwYWdlIHNldCB3aGVuIG5hdmlnYXRpbmcgdG8gcHJldmlvdXMgcGFnZS4nXG4gICAgKTtcbiAgICBhY3RpdmVQYWdlLnByZXZpb3VzKCk7XG4gIH1cblxuICAvKipcbiAgICogSGFuZGxlcyBFdmVudFR5cGUuTk9fUFJFVklPVVNfUEFHRSBldmVudHMuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBvbk5vUHJldmlvdXNQYWdlXygpIHtcbiAgICBpZiAodGhpcy52aWV3ZXJfLmhhc0NhcGFiaWxpdHkoJ3N3aXBlJykgJiYgdGhpcy52aWV3ZXJNZXNzYWdpbmdIYW5kbGVyXykge1xuICAgICAgY29uc3QgYWR2YW5jZW1lbnRNb2RlID0gdGhpcy5zdG9yZVNlcnZpY2VfLmdldChcbiAgICAgICAgU3RhdGVQcm9wZXJ0eS5BRFZBTkNFTUVOVF9NT0RFXG4gICAgICApO1xuICAgICAgdGhpcy52aWV3ZXJNZXNzYWdpbmdIYW5kbGVyXy5zZW5kKFxuICAgICAgICAnc2VsZWN0RG9jdW1lbnQnLFxuICAgICAgICBkaWN0KHsncHJldmlvdXMnOiB0cnVlLCAnYWR2YW5jZW1lbnRNb2RlJzogYWR2YW5jZW1lbnRNb2RlfSlcbiAgICAgICk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuc3RvcmVTZXJ2aWNlXy5nZXQoU3RhdGVQcm9wZXJ0eS5DQU5fU0hPV19QUkVWSU9VU19QQUdFX0hFTFApKSB7XG4gICAgICB0aGlzLmFtcFN0b3J5SGludF8uc2hvd0ZpcnN0UGFnZUhpbnRPdmVybGF5KCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBkaXJlY3Rpb24gVGhlIGRpcmVjdGlvbiB0byBuYXZpZ2F0ZS5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIHBlcmZvcm1UYXBOYXZpZ2F0aW9uXyhkaXJlY3Rpb24pIHtcbiAgICB0aGlzLnN0b3JlU2VydmljZV8uZGlzcGF0Y2goXG4gICAgICBBY3Rpb24uU0VUX0FEVkFOQ0VNRU5UX01PREUsXG4gICAgICBBZHZhbmNlbWVudE1vZGUuTUFOVUFMX0FEVkFOQ0VcbiAgICApO1xuXG4gICAgaWYgKFxuICAgICAgdGhpcy5zdG9yZVNlcnZpY2VfLmdldChTdGF0ZVByb3BlcnR5LlVJX1NUQVRFKSA9PT0gVUlUeXBlLkRFU0tUT1BfUEFORUxTXG4gICAgKSB7XG4gICAgICB0aGlzLm5leHRfKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKGRpcmVjdGlvbiA9PT0gVGFwTmF2aWdhdGlvbkRpcmVjdGlvbi5ORVhUKSB7XG4gICAgICB0aGlzLm5leHRfKCk7XG4gICAgfSBlbHNlIGlmIChkaXJlY3Rpb24gPT09IFRhcE5hdmlnYXRpb25EaXJlY3Rpb24uUFJFVklPVVMpIHtcbiAgICAgIHRoaXMucHJldmlvdXNfKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFN3aXRjaGVzIHRvIGEgcGFydGljdWxhciBwYWdlLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdGFyZ2V0UGFnZUlkXG4gICAqIEBwYXJhbSB7IU5hdmlnYXRpb25EaXJlY3Rpb259IGRpcmVjdGlvblxuICAgKiBAcmV0dXJuIHshUHJvbWlzZX1cbiAgICogQHByaXZhdGVcbiAgICovXG4gIHN3aXRjaFRvXyh0YXJnZXRQYWdlSWQsIGRpcmVjdGlvbikge1xuICAgIGNvbnN0IHRhcmdldFBhZ2UgPSB0aGlzLmdldFBhZ2VCeUlkKHRhcmdldFBhZ2VJZCk7XG4gICAgY29uc3QgcGFnZUluZGV4ID0gdGhpcy5nZXRQYWdlSW5kZXgodGFyZ2V0UGFnZSk7XG5cbiAgICAvLyBTdGVwIG91dCBpZiB0cnlpbmcgdG8gbmF2aWdhdGUgdG8gdGhlIGN1cnJlbnRseSBhY3RpdmUgcGFnZS5cbiAgICBpZiAodGhpcy5hY3RpdmVQYWdlXyAmJiB0aGlzLmFjdGl2ZVBhZ2VfLmVsZW1lbnQuaWQgPT09IHRhcmdldFBhZ2VJZCkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgIH1cblxuICAgIC8vIElmIHRoZSBuZXh0IHBhZ2UgbWlnaHQgYmUgcGF5d2FsbCBwcm90ZWN0ZWQsIGFuZCB0aGUgYWNjZXNzXG4gICAgLy8gYXV0aG9yaXphdGlvbnMgZGlkIG5vdCByZXNvbHZlIHlldCwgd2FpdCBiZWZvcmUgbmF2aWdhdGluZy5cbiAgICAvLyBUT0RPKGdtYWpvdWxldCk6IGltcGxlbWVudCBhIGxvYWRpbmcgc3RhdGUuXG4gICAgaWYgKFxuICAgICAgdGFyZ2V0UGFnZS5lbGVtZW50Lmhhc0F0dHJpYnV0ZSgnYW1wLWFjY2VzcycpICYmXG4gICAgICAhdGhpcy5hcmVBY2Nlc3NBdXRob3JpemF0aW9uc0NvbXBsZXRlZF9cbiAgICApIHtcbiAgICAgIHRoaXMubmF2aWdhdGVUb1BhZ2VBZnRlckFjY2Vzc18gPSB0YXJnZXRQYWdlO1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgIH1cblxuICAgIC8vIElmIHRoZSBuZXh0IHBhZ2UgaXMgcGF5d2FsbCBwcm90ZWN0ZWQsIGRpc3BsYXkgdGhlIGFjY2VzcyBVSSBhbmQgd2FpdCBmb3JcbiAgICAvLyB0aGUgZG9jdW1lbnQgdG8gYmUgcmVhdXRob3JpemVkLlxuICAgIGlmICh0YXJnZXRQYWdlLmVsZW1lbnQuaGFzQXR0cmlidXRlKCdhbXAtYWNjZXNzLWhpZGUnKSkge1xuICAgICAgdGhpcy5zdG9yZVNlcnZpY2VfLmRpc3BhdGNoKEFjdGlvbi5UT0dHTEVfQUNDRVNTLCB0cnVlKTtcbiAgICAgIHRoaXMubmF2aWdhdGVUb1BhZ2VBZnRlckFjY2Vzc18gPSB0YXJnZXRQYWdlO1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgIH1cblxuICAgIGNvbnN0IG9sZFBhZ2UgPSB0aGlzLmFjdGl2ZVBhZ2VfO1xuICAgIHRoaXMuYWN0aXZlUGFnZV8gPSB0YXJnZXRQYWdlO1xuICAgIGlmICghdGFyZ2V0UGFnZS5pc0FkKCkpIHtcbiAgICAgIHRoaXMudXBkYXRlTmF2aWdhdGlvblBhdGhfKHRhcmdldFBhZ2VJZCwgZGlyZWN0aW9uKTtcbiAgICB9XG5cbiAgICB0aGlzLmJhY2tncm91bmRCbHVyXz8udXBkYXRlKHRhcmdldFBhZ2UuZWxlbWVudCk7XG5cbiAgICAvLyBFYWNoIHN0ZXAgd2lsbCBydW4gaW4gYSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUsIGFuZCB3YWl0IGZvciB0aGUgbmV4dFxuICAgIC8vIGZyYW1lIGJlZm9yZSBleGVjdXRpbmcgdGhlIGZvbGxvd2luZyBzdGVwLlxuICAgIGNvbnN0IHN0ZXBzID0gW1xuICAgICAgLy8gRmlyc3Qgc3RlcCBjb250YWlucyB0aGUgbWluaW11bSBhbW91bnQgb2YgY29kZSB0byBkaXNwbGF5IGFuZCBwbGF5IHRoZVxuICAgICAgLy8gdGFyZ2V0IHBhZ2UgYXMgZmFzdCBhcyBwb3NzaWJsZS5cbiAgICAgICgpID0+IHtcbiAgICAgICAgb2xkUGFnZSAmJiBvbGRQYWdlLmVsZW1lbnQucmVtb3ZlQXR0cmlidXRlKCdhY3RpdmUnKTtcblxuICAgICAgICBpZiAoXG4gICAgICAgICAgdGhpcy5zdG9yZVNlcnZpY2VfLmdldChTdGF0ZVByb3BlcnR5LlVJX1NUQVRFKSA9PT1cbiAgICAgICAgICBVSVR5cGUuREVTS1RPUF9QQU5FTFNcbiAgICAgICAgKSB7XG4gICAgICAgICAgdGhpcy5zZXREZXNrdG9wUG9zaXRpb25BdHRyaWJ1dGVzXyh0YXJnZXRQYWdlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFN0YXJ0cyBwbGF5aW5nIHRoZSBwYWdlLCBpZiB0aGUgc3RvcnkgaXMgbm90IHBhdXNlZC5cbiAgICAgICAgLy8gTm90ZTogbmF2aWdhdGlvbiBpcyBwcmV2ZW50ZWQgd2hlbiB0aGUgc3RvcnkgaXMgcGF1c2VkLCB0aGlzIHRlc3RcbiAgICAgICAgLy8gY292ZXJzIHRoZSBjYXNlIHdoZXJlIHRoZSBzdG9yeSBpcyByZW5kZXJlZCBwYXVzZWQgKGVnOiBjb25zZW50KS5cbiAgICAgICAgaWYgKCF0aGlzLnN0b3JlU2VydmljZV8uZ2V0KFN0YXRlUHJvcGVydHkuUEFVU0VEX1NUQVRFKSkge1xuICAgICAgICAgIHRhcmdldFBhZ2Uuc2V0U3RhdGUoUGFnZVN0YXRlLlBMQVlJTkcpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIEV2ZW4gaWYgdGhlIHBhZ2Ugd29uJ3QgYmUgcGxheWluZywgc2V0dGluZyB0aGUgYWN0aXZlIGF0dHJpYnV0ZVxuICAgICAgICAgIC8vIGVuc3VyZXMgaXQgZ2V0cyB2aXNpYmxlLlxuICAgICAgICAgIHRhcmdldFBhZ2UuZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2FjdGl2ZScsICcnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZm9yY2VSZXBhaW50Rm9yU2FmYXJpXygpO1xuICAgICAgfSxcbiAgICAgIC8vIFNlY29uZCBzdGVwIGRvZXMgYWxsIHRoZSBvcGVyYXRpb25zIHRoYXQgaW1wYWN0IHRoZSBVSS9VWDogbWVkaWEgc291bmQsXG4gICAgICAvLyBwcm9ncmVzcyBiYXIsIC4uLlxuICAgICAgKCkgPT4ge1xuICAgICAgICBpZiAob2xkUGFnZSkge1xuICAgICAgICAgIG9sZFBhZ2Uuc2V0U3RhdGUoUGFnZVN0YXRlLk5PVF9BQ1RJVkUpO1xuXG4gICAgICAgICAgLy8gSW5kaWNhdGlvbiB0byBrbm93IHdoZXJlIHRvIGRpc3BsYXkgdGhlIHBhZ2Ugb24gdGhlIGRlc2t0b3BcbiAgICAgICAgICAvLyByaWJib24tbGlrZSBhbmltYXRpb24uXG4gICAgICAgICAgdGhpcy5nZXRQYWdlSW5kZXgob2xkUGFnZSkgPCBwYWdlSW5kZXhcbiAgICAgICAgICAgID8gc2V0QXR0cmlidXRlSW5NdXRhdGUob2xkUGFnZSwgQXR0cmlidXRlcy5WSVNJVEVEKVxuICAgICAgICAgICAgOiByZW1vdmVBdHRyaWJ1dGVJbk11dGF0ZShvbGRQYWdlLCBBdHRyaWJ1dGVzLlZJU0lURUQpO1xuXG4gICAgICAgICAgaWYgKG9sZFBhZ2UuaXNBZCgpKSB7XG4gICAgICAgICAgICB0aGlzLnN0b3JlU2VydmljZV8uZGlzcGF0Y2goXG4gICAgICAgICAgICAgIEFjdGlvbi5TRVRfQURWQU5DRU1FTlRfTU9ERSxcbiAgICAgICAgICAgICAgQWR2YW5jZW1lbnRNb2RlLkFEVkFOQ0VfVE9fQURTXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBzdG9yZVBhZ2VJbmRleCA9IHBhZ2VJbmRleDtcbiAgICAgICAgaWYgKHRhcmdldFBhZ2UuaXNBZCgpKSB7XG4gICAgICAgICAgdGhpcy5zdG9yZVNlcnZpY2VfLmRpc3BhdGNoKEFjdGlvbi5UT0dHTEVfQUQsIHRydWUpO1xuICAgICAgICAgIHNldEF0dHJpYnV0ZUluTXV0YXRlKHRoaXMsIEF0dHJpYnV0ZXMuQURfU0hPV0lORyk7XG5cbiAgICAgICAgICAvLyBLZWVwIGN1cnJlbnQgcGFnZSBpbmRleCB3aGVuIGFuIGFkIGlzIHNob3duLiBPdGhlcndpc2UgaXQgbWVzc2VzXG4gICAgICAgICAgLy8gdXAgd2l0aCB0aGUgcHJvZ3Jlc3MgdmFyaWFibGUgaW4gdGhlIFZhcmlhYmxlU2VydmljZS5cbiAgICAgICAgICBzdG9yZVBhZ2VJbmRleCA9IHRoaXMuc3RvcmVTZXJ2aWNlXy5nZXQoXG4gICAgICAgICAgICBTdGF0ZVByb3BlcnR5LkNVUlJFTlRfUEFHRV9JTkRFWFxuICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5zdG9yZVNlcnZpY2VfLmRpc3BhdGNoKEFjdGlvbi5UT0dHTEVfQUQsIGZhbHNlKTtcbiAgICAgICAgICByZW1vdmVBdHRyaWJ1dGVJbk11dGF0ZSh0aGlzLCBBdHRyaWJ1dGVzLkFEX1NIT1dJTkcpO1xuXG4gICAgICAgICAgLy8gU3RhcnQgcHJvZ3Jlc3MgYmFyIHVwZGF0ZSBmb3IgcGFnZXMgdGhhdCBhcmUgbm90IGFkcyBvciBhdXRvLVxuICAgICAgICAgIC8vIGFkdmFuY2UuXG4gICAgICAgICAgaWYgKCF0YXJnZXRQYWdlLmlzQXV0b0FkdmFuY2UoKSkge1xuICAgICAgICAgICAgdGhpcy5zeXN0ZW1MYXllcl8udXBkYXRlUHJvZ3Jlc3MoXG4gICAgICAgICAgICAgIHRhcmdldFBhZ2VJZCxcbiAgICAgICAgICAgICAgdGhpcy5hZHZhbmNlbWVudF8uZ2V0UHJvZ3Jlc3MoKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnN0b3JlU2VydmljZV8uZGlzcGF0Y2goQWN0aW9uLkNIQU5HRV9QQUdFLCB7XG4gICAgICAgICAgaWQ6IHRhcmdldFBhZ2VJZCxcbiAgICAgICAgICBpbmRleDogc3RvcmVQYWdlSW5kZXgsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIElmIGZpcnN0IG5hdmlnYXRpb24uXG4gICAgICAgIGlmICghb2xkUGFnZSkge1xuICAgICAgICAgIHRoaXMucmVnaXN0ZXJBbmRQcmVsb2FkQmFja2dyb3VuZEF1ZGlvXygpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgLy8gVGhpcmQgYW5kIGxhc3Qgc3RlcCBjb250YWlucyBhbGwgdGhlIGFjdGlvbnMgdGhhdCBjYW4gYmUgZGVsYXllZCBhZnRlclxuICAgICAgLy8gdGhlIG5hdmlnYXRpb24gaGFwcGVuZWQsIGxpa2UgcHJlbG9hZGluZyB0aGUgZm9sbG93aW5nIHBhZ2VzLCBvclxuICAgICAgLy8gc2VuZGluZyBhbmFseXRpY3MgZXZlbnRzLlxuICAgICAgKCkgPT4ge1xuICAgICAgICB0aGlzLnByZWxvYWRQYWdlc0J5RGlzdGFuY2VfKC8qIHByaW9yaXRpemVBY3RpdmVQYWdlICovICFvbGRQYWdlKTtcbiAgICAgICAgdGhpcy50cmlnZ2VyQWN0aXZlRXZlbnRGb3JQYWdlXygpO1xuXG4gICAgICAgIHRoaXMuc3lzdGVtTGF5ZXJfLnJlc2V0RGV2ZWxvcGVyTG9ncygpO1xuICAgICAgICB0aGlzLnN5c3RlbUxheWVyXy5zZXREZXZlbG9wZXJMb2dDb250ZXh0U3RyaW5nKFxuICAgICAgICAgIHRoaXMuYWN0aXZlUGFnZV8uZWxlbWVudC5pZFxuICAgICAgICApO1xuICAgICAgfSxcbiAgICBdO1xuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICB0YXJnZXRQYWdlLmJlZm9yZVZpc2libGUoKS50aGVuKCgpID0+IHtcbiAgICAgICAgLy8gUmVjdXJzaXZlbHkgZXhlY3V0ZXMgb25lIHN0ZXAgcGVyIGZyYW1lLlxuICAgICAgICBjb25zdCB1bnF1ZXVlU3RlcEluUkFGID0gKCkgPT4ge1xuICAgICAgICAgIHN0ZXBzLnNoaWZ0KCkuY2FsbCh0aGlzKTtcbiAgICAgICAgICBpZiAoIXN0ZXBzLmxlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuIHJlc29sdmUoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy53aW4ucmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHVucXVldWVTdGVwSW5SQUYoKSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgdW5xdWV1ZVN0ZXBJblJBRigpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlcyB0aGUgc3RvcnkgbmF2aWdhdGlvbiBzdGFjayBhbmQgY2hlY2tzIGZvciBuYXZpZ2F0aW9uIGFkaGVyZW5jZSB0b1xuICAgKiB0aGUgcGF0aCBhIHVzZXIgdGFrZXMuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0YXJnZXRQYWdlSWRcbiAgICogQHBhcmFtIHshTmF2aWdhdGlvbkRpcmVjdGlvbn0gZGlyZWN0aW9uXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICB1cGRhdGVOYXZpZ2F0aW9uUGF0aF8odGFyZ2V0UGFnZUlkLCBkaXJlY3Rpb24pIHtcbiAgICBjb25zdCBuYXZpZ2F0aW9uUGF0aCA9IC8qKiBAdHlwZSB7IUFycmF5PHN0cmluZz59ICovIChcbiAgICAgIHRoaXMuc3RvcmVTZXJ2aWNlXy5nZXQoU3RhdGVQcm9wZXJ0eS5OQVZJR0FUSU9OX1BBVEgpXG4gICAgKTtcblxuICAgIGlmIChkaXJlY3Rpb24gPT09IE5hdmlnYXRpb25EaXJlY3Rpb24uUFJFVklPVVMpIHtcbiAgICAgIG5hdmlnYXRpb25QYXRoLnBvcCgpO1xuICAgIH1cblxuICAgIC8vIEVuc3VyZXMgdGhlIHBhZ2VJZCBpcyBub3QgYXQgdGhlIHRvcCBvZiB0aGUgc3RhY2sgYWxyZWFkeSwgd2hpY2ggY2FuXG4gICAgLy8gaGFwcGVuIG9uIGluaXRpYWwgcGFnZSBsb2FkIChlLmcuIHJlbG9hZGluZyBhIHBhZ2UpLlxuICAgIGlmIChcbiAgICAgIGRpcmVjdGlvbiA9PT0gTmF2aWdhdGlvbkRpcmVjdGlvbi5ORVhUICYmXG4gICAgICBuYXZpZ2F0aW9uUGF0aFtuYXZpZ2F0aW9uUGF0aC5sZW5ndGggLSAxXSAhPT0gdGFyZ2V0UGFnZUlkXG4gICAgKSB7XG4gICAgICBuYXZpZ2F0aW9uUGF0aC5wdXNoKHRhcmdldFBhZ2VJZCk7XG4gICAgfVxuXG4gICAgdGhpcy5zdG9yZVNlcnZpY2VfLmRpc3BhdGNoKEFjdGlvbi5TRVRfTkFWSUdBVElPTl9QQVRILCBuYXZpZ2F0aW9uUGF0aCk7XG4gICAgc2V0SGlzdG9yeVN0YXRlKHRoaXMud2luLCBIaXN0b3J5U3RhdGUuTkFWSUdBVElPTl9QQVRILCBuYXZpZ2F0aW9uUGF0aCk7XG4gIH1cblxuICAvKipcbiAgICogQ2xlYXIgZXhpc3RpbmcgcHJldmlldyBhdHRyaWJ1dGVzLCBDaGVjayB0byBzZWUgaWYgdGhlcmUgaXMgYSBuZXh0IG9yXG4gICAqIHByZXZpb3VzIHBhZ2UsIHNldCBuZXcgYXR0cmlidXRlcy5cbiAgICogQHBhcmFtIHs/Li9hbXAtc3RvcnktcGFnZS5BbXBTdG9yeVBhZ2V9IHRhcmdldFBhZ2VcbiAgICogQHByaXZhdGVcbiAgICovXG4gIHNldERlc2t0b3BQb3NpdGlvbkF0dHJpYnV0ZXNfKHRhcmdldFBhZ2UpIHtcbiAgICBpZiAoIXRhcmdldFBhZ2UpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBsaXN0ID0gW3twYWdlOiB0YXJnZXRQYWdlLCBwb3NpdGlvbjogMH1dO1xuXG4gICAgY29uc3QgbWludXNPbmVJZCA9IHRhcmdldFBhZ2UuZ2V0UHJldmlvdXNQYWdlSWQoKTtcbiAgICBpZiAobWludXNPbmVJZCkge1xuICAgICAgY29uc3QgbWludXNPbmVQYWdlID0gdGhpcy5nZXRQYWdlQnlJZChtaW51c09uZUlkKTtcbiAgICAgIGxpc3QucHVzaCh7cGFnZTogbWludXNPbmVQYWdlLCBwb3NpdGlvbjogLTF9KTtcblxuICAgICAgY29uc3QgbWludXNUd29JZCA9IG1pbnVzT25lUGFnZS5nZXRQcmV2aW91c1BhZ2VJZCgpO1xuICAgICAgaWYgKG1pbnVzVHdvSWQpIHtcbiAgICAgICAgbGlzdC5wdXNoKHtwYWdlOiB0aGlzLmdldFBhZ2VCeUlkKG1pbnVzVHdvSWQpLCBwb3NpdGlvbjogLTJ9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBwbHVzT25lSWQgPSB0YXJnZXRQYWdlLmdldE5leHRQYWdlSWQoKTtcbiAgICBpZiAocGx1c09uZUlkKSB7XG4gICAgICBjb25zdCBwbHVzT25lUGFnZSA9IHRoaXMuZ2V0UGFnZUJ5SWQocGx1c09uZUlkKTtcbiAgICAgIGxpc3QucHVzaCh7cGFnZTogcGx1c09uZVBhZ2UsIHBvc2l0aW9uOiAxfSk7XG5cbiAgICAgIGNvbnN0IHBsdXNUd29JZCA9IHBsdXNPbmVQYWdlLmdldE5leHRQYWdlSWQoKTtcbiAgICAgIGlmIChwbHVzVHdvSWQpIHtcbiAgICAgICAgbGlzdC5wdXNoKHtwYWdlOiB0aGlzLmdldFBhZ2VCeUlkKHBsdXNUd29JZCksIHBvc2l0aW9uOiAyfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgbGV0IGRlc2t0b3BQb3NpdGlvbnNUb1Jlc2V0O1xuXG4gICAgdGhpcy5tZWFzdXJlTXV0YXRlRWxlbWVudChcbiAgICAgIC8qKiBtZWFzdXJlciAqL1xuICAgICAgKCkgPT4ge1xuICAgICAgICBkZXNrdG9wUG9zaXRpb25zVG9SZXNldCA9IHNjb3BlZFF1ZXJ5U2VsZWN0b3JBbGwoXG4gICAgICAgICAgdGhpcy5lbGVtZW50LFxuICAgICAgICAgIGBhbXAtc3RvcnktcGFnZVtcbiAgICAgICAgICAgICAgICAgICAgICAke2VzY2FwZUNzc1NlbGVjdG9ySWRlbnQoQXR0cmlidXRlcy5ERVNLVE9QX1BPU0lUSU9OKX1dYFxuICAgICAgICApO1xuICAgICAgfSxcbiAgICAgIC8qKiBtdXRhdG9yICovXG4gICAgICAoKSA9PiB7XG4gICAgICAgIEFycmF5LnByb3RvdHlwZS5mb3JFYWNoLmNhbGwoZGVza3RvcFBvc2l0aW9uc1RvUmVzZXQsIChlbCkgPT4ge1xuICAgICAgICAgIGVsLnJlbW92ZUF0dHJpYnV0ZShBdHRyaWJ1dGVzLkRFU0tUT1BfUE9TSVRJT04pO1xuICAgICAgICB9KTtcblxuICAgICAgICBsaXN0LmZvckVhY2goKGVudHJ5KSA9PiB7XG4gICAgICAgICAgY29uc3Qge3BhZ2UsIHBvc2l0aW9ufSA9IGVudHJ5O1xuICAgICAgICAgIHBhZ2UuZWxlbWVudC5zZXRBdHRyaWJ1dGUoQXR0cmlidXRlcy5ERVNLVE9QX1BPU0lUSU9OLCBwb3NpdGlvbik7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICk7XG4gIH1cblxuICAvKiogQHByaXZhdGUgKi9cbiAgdHJpZ2dlckFjdGl2ZUV2ZW50Rm9yUGFnZV8oKSB7XG4gICAgLy8gVE9ETyhhbGFub3JvemNvKTogcGFzcyBldmVudCBwcmlvcml0eSBvbmNlIGFtcGh0bWwtc3RvcnkgcmVwbyBpcyBtZXJnZWRcbiAgICAvLyB3aXRoIHVwc3RyZWFtLlxuICAgIFNlcnZpY2VzLmFjdGlvblNlcnZpY2VGb3JEb2ModGhpcy5lbGVtZW50KS50cmlnZ2VyKFxuICAgICAgdGhpcy5hY3RpdmVQYWdlXy5lbGVtZW50LFxuICAgICAgJ2FjdGl2ZScsXG4gICAgICAvKiBldmVudCAqLyBudWxsLFxuICAgICAgQWN0aW9uVHJ1c3QuSElHSFxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogRm9yIHNvbWUgcmVhc29uLCBTYWZhcmkgaGFzIGFuIGlzc3VlIHdoZXJlIHNvbWV0aW1lcyB3aGVuIHBhZ2VzIGJlY29tZVxuICAgKiB2aXNpYmxlLCBzb21lIGRlc2NlbmRhbnRzIGFyZSBub3QgcGFpbnRlZC4gIFRoaXMgaXMgYSBoYWNrLCB3aGVyZSB3ZSBkZXRlY3RcbiAgICogdGhhdCB0aGUgYnJvd3NlciBpcyBTYWZhcmkgYW5kIGZvcmNlIGl0IHRvIHJlcGFpbnQsIHRvIGF2b2lkIHRoaXMgY2FzZS5cbiAgICogU2VlIG5ld211aXMvYW1waHRtbC1zdG9yeSMxMDYgZm9yIGRldGFpbHMuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBmb3JjZVJlcGFpbnRGb3JTYWZhcmlfKCkge1xuICAgIGlmICghdGhpcy5wbGF0Zm9ybV8uaXNTYWZhcmkoKSAmJiAhdGhpcy5wbGF0Zm9ybV8uaXNJb3MoKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoXG4gICAgICB0aGlzLnN0b3JlU2VydmljZV8uZ2V0KFN0YXRlUHJvcGVydHkuVUlfU1RBVEUpID09PSBVSVR5cGUuREVTS1RPUF9QQU5FTFNcbiAgICApIHtcbiAgICAgIC8vIEZvcmNlIHJlcGFpbnQgaXMgb25seSBuZWVkZWQgd2hlbiB0cmFuc2l0aW9uaW5nIGZyb20gaW52aXNpYmxlIHRvXG4gICAgICAvLyB2aXNpYmxlXG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5tdXRhdGVFbGVtZW50KCgpID0+IHtcbiAgICAgIHRvZ2dsZSh0aGlzLmVsZW1lbnQsIGZhbHNlKTtcblxuICAgICAgLy8gUmVhZGluZyB0aGUgaGVpZ2h0IGlzIHdoYXQgZm9yY2VzIHRoZSByZXBhaW50LiAgVGhlIGNvbmRpdGlvbmFsIGV4aXN0c1xuICAgICAgLy8gb25seSB0byB3b3JrYXJvdW5kIHRoZSBmYWN0IHRoYXQgdGhlIGNsb3N1cmUgY29tcGlsZXIgd291bGQgb3RoZXJ3aXNlXG4gICAgICAvLyB0aGluayB0aGF0IG9ubHkgcmVhZGluZyB0aGUgaGVpZ2h0IGhhcyBubyBlZmZlY3QuICBTaW5jZSB0aGUgaGVpZ2h0IGlzXG4gICAgICAvLyBhbHdheXMgPj0gMCwgdGhpcyBjb25kaXRpb25hbCB3aWxsIGFsd2F5cyBiZSBleGVjdXRlZC5cbiAgICAgIGNvbnN0IGhlaWdodCA9IHRoaXMuZWxlbWVudC4vKk9LKi8gb2Zmc2V0SGVpZ2h0O1xuICAgICAgaWYgKGhlaWdodCA+PSAwKSB7XG4gICAgICAgIHRvZ2dsZSh0aGlzLmVsZW1lbnQsIHRydWUpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEhhbmRsZXMgYWxsIGtleSBwcmVzc2VzIHdpdGhpbiB0aGUgc3RvcnkuXG4gICAqIEBwYXJhbSB7IUV2ZW50fSBlIFRoZSBrZXlkb3duIGV2ZW50LlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgb25LZXlEb3duXyhlKSB7XG4gICAgdGhpcy5zdG9yZVNlcnZpY2VfLmRpc3BhdGNoKFxuICAgICAgQWN0aW9uLlNFVF9BRFZBTkNFTUVOVF9NT0RFLFxuICAgICAgQWR2YW5jZW1lbnRNb2RlLk1BTlVBTF9BRFZBTkNFXG4gICAgKTtcblxuICAgIGNvbnN0IHJ0bFN0YXRlID0gdGhpcy5zdG9yZVNlcnZpY2VfLmdldChTdGF0ZVByb3BlcnR5LlJUTF9TVEFURSk7XG5cbiAgICBzd2l0Y2ggKGUua2V5KSB7XG4gICAgICBjYXNlIEtleXMuTEVGVF9BUlJPVzpcbiAgICAgICAgcnRsU3RhdGUgPyB0aGlzLm5leHRfKCkgOiB0aGlzLnByZXZpb3VzXygpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgS2V5cy5SSUdIVF9BUlJPVzpcbiAgICAgICAgcnRsU3RhdGUgPyB0aGlzLnByZXZpb3VzXygpIDogdGhpcy5uZXh0XygpO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogSGFuZGxlIHJlc2l6ZSBldmVudHMgYW5kIHNldCB0aGUgc3RvcnkncyBkZXNrdG9wIHN0YXRlLlxuICAgKiBAdmlzaWJsZUZvclRlc3RpbmdcbiAgICovXG4gIG9uUmVzaXplKCkge1xuICAgIGNvbnN0IHVpU3RhdGUgPSB0aGlzLmdldFVJVHlwZV8oKTtcbiAgICB0aGlzLnN0b3JlU2VydmljZV8uZGlzcGF0Y2goQWN0aW9uLlRPR0dMRV9VSSwgdWlTdGF0ZSk7XG5cbiAgICBjb25zdCBpc0xhbmRzY2FwZSA9IHRoaXMuaXNMYW5kc2NhcGVfKCk7XG4gICAgY29uc3QgaXNMYW5kc2NhcGVTdXBwb3J0ZWQgPSB0aGlzLmlzTGFuZHNjYXBlU3VwcG9ydGVkXygpO1xuXG4gICAgdGhpcy5zZXRPcmllbnRhdGlvbkF0dHJpYnV0ZV8oaXNMYW5kc2NhcGUsIGlzTGFuZHNjYXBlU3VwcG9ydGVkKTtcblxuICAgIGlmICh1aVN0YXRlICE9PSBVSVR5cGUuTU9CSUxFIHx8IGlzTGFuZHNjYXBlU3VwcG9ydGVkKSB7XG4gICAgICAvLyBIaWRlcyB0aGUgVUkgdGhhdCBwcmV2ZW50cyB1c2VycyBmcm9tIHVzaW5nIHRoZSBMQU5EU0NBUEUgb3JpZW50YXRpb24uXG4gICAgICB0aGlzLnN0b3JlU2VydmljZV8uZGlzcGF0Y2goQWN0aW9uLlRPR0dMRV9WSUVXUE9SVF9XQVJOSU5HLCBmYWxzZSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gT25seSBjYWxsZWQgd2hlbiB0aGUgZGVza3RvcCBtZWRpYSBxdWVyeSBpcyBub3QgbWF0Y2hlZCBhbmQgdGhlIGxhbmRzY2FwZVxuICAgIC8vIG1vZGUgaXMgbm90IGVuYWJsZWQuXG4gICAgdGhpcy5tYXliZVRyaWdnZXJWaWV3cG9ydFdhcm5pbmdfKGlzTGFuZHNjYXBlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGFuIG9yaWVudGF0aW9uPWxhbmRzY2FwZXxwb3J0cmFpdCBhdHRyaWJ1dGUuXG4gICAqIElmIHRoZSBzdG9yeSBkb2Vzbid0IGV4cGxpY2l0bHkgc3VwcG9ydCBsYW5kc2NhcGUgdmlhIHRoZSBvcHQtaW4gYXR0cmlidXRlLFxuICAgKiBpdCBpcyBhbHdheXMgaW4gYSBwb3J0cmFpdCBvcmllbnRhdGlvbi5cbiAgICogQHBhcmFtIHtib29sZWFufSBpc0xhbmRzY2FwZSBXaGV0aGVyIHRoZSB2aWV3cG9ydCBpcyBsYW5kc2NhcGUgb3IgcG9ydHJhaXRcbiAgICogQHBhcmFtIHtib29sZWFufSBpc0xhbmRzY2FwZVN1cHBvcnRlZCBXaGV0aGVyIHRoZSBzdG9yeSBzdXBwb3J0cyBsYW5kc2NhcGVcbiAgICogQHByaXZhdGVcbiAgICovXG4gIHNldE9yaWVudGF0aW9uQXR0cmlidXRlXyhpc0xhbmRzY2FwZSwgaXNMYW5kc2NhcGVTdXBwb3J0ZWQpIHtcbiAgICAvLyBUT0RPKCMyMDgzMikgYmFzZSB0aGlzIGNoZWNrIG9uIHRoZSBzaXplIG9mIHRoZSBhbXAtc3RvcnktcGFnZSwgb25jZSBpdFxuICAgIC8vIGlzIHN0b3JlZCBhcyBhIHN0b3JlIHN0YXRlLlxuICAgIHRoaXMubXV0YXRlRWxlbWVudCgoKSA9PiB7XG4gICAgICB0aGlzLmVsZW1lbnQuc2V0QXR0cmlidXRlKFxuICAgICAgICBBdHRyaWJ1dGVzLk9SSUVOVEFUSU9OLFxuICAgICAgICBpc0xhbmRzY2FwZVN1cHBvcnRlZCAmJiBpc0xhbmRzY2FwZSA/ICdsYW5kc2NhcGUnIDogJ3BvcnRyYWl0J1xuICAgICAgKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNYXliZSB0cmlnZ2VycyB0aGUgdmlld3BvcnQgd2FybmluZyBvdmVybGF5LlxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGlzTGFuZHNjYXBlXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBtYXliZVRyaWdnZXJWaWV3cG9ydFdhcm5pbmdfKGlzTGFuZHNjYXBlKSB7XG4gICAgaWYgKGlzRGVza3RvcE9uZVBhbmVsRXhwZXJpbWVudE9uKHRoaXMud2luKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoXG4gICAgICBpc0xhbmRzY2FwZSA9PT1cbiAgICAgIHRoaXMuc3RvcmVTZXJ2aWNlXy5nZXQoU3RhdGVQcm9wZXJ0eS5WSUVXUE9SVF9XQVJOSU5HX1NUQVRFKVxuICAgICkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMubXV0YXRlRWxlbWVudCgoKSA9PiB7XG4gICAgICBpZiAoaXNMYW5kc2NhcGUpIHtcbiAgICAgICAgdGhpcy5wYXVzZWRTdGF0ZVRvUmVzdG9yZV8gPSAhIXRoaXMuc3RvcmVTZXJ2aWNlXy5nZXQoXG4gICAgICAgICAgU3RhdGVQcm9wZXJ0eS5QQVVTRURfU1RBVEVcbiAgICAgICAgKTtcbiAgICAgICAgdGhpcy5zdG9yZVNlcnZpY2VfLmRpc3BhdGNoKEFjdGlvbi5UT0dHTEVfUEFVU0VELCB0cnVlKTtcbiAgICAgICAgdGhpcy5zdG9yZVNlcnZpY2VfLmRpc3BhdGNoKEFjdGlvbi5UT0dHTEVfVklFV1BPUlRfV0FSTklORywgdHJ1ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnN0b3JlU2VydmljZV8uZGlzcGF0Y2goXG4gICAgICAgICAgQWN0aW9uLlRPR0dMRV9QQVVTRUQsXG4gICAgICAgICAgdGhpcy5wYXVzZWRTdGF0ZVRvUmVzdG9yZV9cbiAgICAgICAgKTtcbiAgICAgICAgdGhpcy5wYXVzZWRTdGF0ZVRvUmVzdG9yZV8gPSBudWxsO1xuICAgICAgICB0aGlzLnN0b3JlU2VydmljZV8uZGlzcGF0Y2goQWN0aW9uLlRPR0dMRV9WSUVXUE9SVF9XQVJOSU5HLCBmYWxzZSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogUmVhY3RzIHRvIHRoZSBicm93c2VyIHRhYiBiZWNvbWluZyBhY3RpdmUvaW5hY3RpdmUuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBvblZpc2liaWxpdHlDaGFuZ2VkXygpIHtcbiAgICB0aGlzLmdldEFtcERvYygpLmlzVmlzaWJsZSgpID8gdGhpcy5yZXN1bWVfKCkgOiB0aGlzLnBhdXNlXygpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlYWN0cyB0byB0aGUgYWQgc3RhdGUgdXBkYXRlcywgYW5kIHBhdXNlcyB0aGUgYmFja2dyb3VuZC1hdWRpbyB3aGVuIGFuIGFkXG4gICAqIGlzIGRpc3BsYXllZC5cbiAgICogQHBhcmFtIHtib29sZWFufSBpc0FkXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBvbkFkU3RhdGVVcGRhdGVfKGlzQWQpIHtcbiAgICBpZiAodGhpcy5zdG9yZVNlcnZpY2VfLmdldChTdGF0ZVByb3BlcnR5Lk1VVEVEX1NUQVRFKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlzQWQgPyB0aGlzLnBhdXNlQmFja2dyb3VuZEF1ZGlvXygpIDogdGhpcy5wbGF5QmFja2dyb3VuZEF1ZGlvXygpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlYWN0cyB0byBVSSBzdGF0ZSB1cGRhdGVzLlxuICAgKiBAcGFyYW0geyFVSVR5cGV9IHVpU3RhdGVcbiAgICogQHByaXZhdGVcbiAgICovXG4gIG9uVUlTdGF0ZVVwZGF0ZV8odWlTdGF0ZSkge1xuICAgIHRoaXMuYmFja2dyb3VuZEJsdXJfPy5kZXRhY2goKTtcbiAgICB0aGlzLmJhY2tncm91bmRCbHVyXyA9IG51bGw7XG4gICAgc3dpdGNoICh1aVN0YXRlKSB7XG4gICAgICBjYXNlIFVJVHlwZS5NT0JJTEU6XG4gICAgICAgIHRoaXMudnN5bmNfLm11dGF0ZSgoKSA9PiB7XG4gICAgICAgICAgdGhpcy5lbGVtZW50LnJlbW92ZUF0dHJpYnV0ZSgnZGVza3RvcCcpO1xuICAgICAgICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdpLWFtcGh0bWwtc3RvcnktZGVza3RvcC1wYW5lbHMnKTtcbiAgICAgICAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnaS1hbXBodG1sLXN0b3J5LWRlc2t0b3AtZnVsbGJsZWVkJyk7XG4gICAgICAgICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2ktYW1waHRtbC1zdG9yeS1kZXNrdG9wLW9uZS1wYW5lbCcpO1xuICAgICAgICB9KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFVJVHlwZS5ERVNLVE9QX1BBTkVMUzpcbiAgICAgICAgdGhpcy5zZXREZXNrdG9wUG9zaXRpb25BdHRyaWJ1dGVzXyh0aGlzLmFjdGl2ZVBhZ2VfKTtcbiAgICAgICAgdGhpcy52c3luY18ubXV0YXRlKCgpID0+IHtcbiAgICAgICAgICB0aGlzLmVsZW1lbnQuc2V0QXR0cmlidXRlKCdkZXNrdG9wJywgJycpO1xuICAgICAgICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdpLWFtcGh0bWwtc3RvcnktZGVza3RvcC1wYW5lbHMnKTtcbiAgICAgICAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnaS1hbXBodG1sLXN0b3J5LWRlc2t0b3AtZnVsbGJsZWVkJyk7XG4gICAgICAgICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2ktYW1waHRtbC1zdG9yeS1kZXNrdG9wLW9uZS1wYW5lbCcpO1xuICAgICAgICB9KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFVJVHlwZS5ERVNLVE9QX09ORV9QQU5FTDpcbiAgICAgICAgdGhpcy5zZXREZXNrdG9wUG9zaXRpb25BdHRyaWJ1dGVzXyh0aGlzLmFjdGl2ZVBhZ2VfKTtcbiAgICAgICAgaWYgKCF0aGlzLmJhY2tncm91bmRCbHVyXykge1xuICAgICAgICAgIHRoaXMuYmFja2dyb3VuZEJsdXJfID0gbmV3IEJhY2tncm91bmRCbHVyKHRoaXMud2luLCB0aGlzLmVsZW1lbnQpO1xuICAgICAgICAgIHRoaXMuYmFja2dyb3VuZEJsdXJfLmF0dGFjaCgpO1xuICAgICAgICAgIGlmICh0aGlzLmFjdGl2ZVBhZ2VfKSB7XG4gICAgICAgICAgICB0aGlzLmJhY2tncm91bmRCbHVyXy51cGRhdGUodGhpcy5hY3RpdmVQYWdlXy5lbGVtZW50KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy52c3luY18ubXV0YXRlKCgpID0+IHtcbiAgICAgICAgICB0aGlzLmVsZW1lbnQucmVtb3ZlQXR0cmlidXRlKCdkZXNrdG9wJyk7XG4gICAgICAgICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2ktYW1waHRtbC1zdG9yeS1kZXNrdG9wLW9uZS1wYW5lbCcpO1xuICAgICAgICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdpLWFtcGh0bWwtc3RvcnktZGVza3RvcC1mdWxsYmxlZWQnKTtcbiAgICAgICAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnaS1hbXBodG1sLXN0b3J5LWRlc2t0b3AtcGFuZWxzJyk7XG4gICAgICAgIH0pO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgVUlUeXBlLkRFU0tUT1BfRlVMTEJMRUVEOlxuICAgICAgICB0aGlzLnZzeW5jXy5tdXRhdGUoKCkgPT4ge1xuICAgICAgICAgIHRoaXMuZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2Rlc2t0b3AnLCAnJyk7XG4gICAgICAgICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2ktYW1waHRtbC1zdG9yeS1kZXNrdG9wLWZ1bGxibGVlZCcpO1xuICAgICAgICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdpLWFtcGh0bWwtc3RvcnktZGVza3RvcC1wYW5lbHMnKTtcbiAgICAgICAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnaS1hbXBodG1sLXN0b3J5LWRlc2t0b3Atb25lLXBhbmVsJyk7XG4gICAgICAgIH0pO1xuICAgICAgICBicmVhaztcbiAgICAgIC8vIEJlY2F1c2Ugb2YgdGhlIERPTSBtdXRhdGlvbnMsIHN3aXRjaGluZyBmcm9tIHRoaXMgbW9kZSB0byBhbm90aGVyIGlzXG4gICAgICAvLyBub3QgYWxsb3dlZCwgYW5kIHByZXZlbnRlZCB3aXRoaW4gdGhlIHN0b3JlIHNlcnZpY2UuXG4gICAgICBjYXNlIFVJVHlwZS5WRVJUSUNBTDpcbiAgICAgICAgY29uc3QgcGFnZUF0dGFjaG1lbnRzID0gc2NvcGVkUXVlcnlTZWxlY3RvckFsbChcbiAgICAgICAgICB0aGlzLmVsZW1lbnQsXG4gICAgICAgICAgJ2FtcC1zdG9yeS1wYWdlIGFtcC1zdG9yeS1wYWdlLWF0dGFjaG1lbnQnXG4gICAgICAgICk7XG5cbiAgICAgICAgdGhpcy52c3luY18ubXV0YXRlKCgpID0+IHtcbiAgICAgICAgICB0aGlzLmVsZW1lbnQuc2V0QXR0cmlidXRlKCdpLWFtcGh0bWwtdmVydGljYWwnLCAnJyk7XG4gICAgICAgICAgc2V0SW1wb3J0YW50U3R5bGVzKHRoaXMud2luLmRvY3VtZW50LmJvZHksIHtoZWlnaHQ6ICdhdXRvJ30pO1xuICAgICAgICAgIHRoaXMuZWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUoJ2Rlc2t0b3AnKTtcbiAgICAgICAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnaS1hbXBodG1sLXN0b3J5LWRlc2t0b3AtZnVsbGJsZWVkJyk7XG4gICAgICAgICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2ktYW1waHRtbC1zdG9yeS1kZXNrdG9wLXBhbmVscycpO1xuICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcGFnZUF0dGFjaG1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQuaW5zZXJ0QmVmb3JlKFxuICAgICAgICAgICAgICBwYWdlQXR0YWNobWVudHNbaV0sXG4gICAgICAgICAgICAgIC8vIEF0dGFjaG1lbnRzIHRoYXQgYXJlIGp1c3QgbGlua3MgYXJlIHJlbmRlcmVkIGluLWxpbmUgd2l0aCB0aGVpclxuICAgICAgICAgICAgICAvLyBzdG9yeSBwYWdlLlxuICAgICAgICAgICAgICBwYWdlQXR0YWNobWVudHNbaV0uZ2V0QXR0cmlidXRlKCdocmVmJylcbiAgICAgICAgICAgICAgICA/IHBhZ2VBdHRhY2htZW50c1tpXS5wYXJlbnRFbGVtZW50Lm5leHRFbGVtZW50U2libGluZ1xuICAgICAgICAgICAgICAgIDogLy8gT3RoZXIgYXR0YWNobWVudHMgYXJlIHJlbmRlcmVkIGF0IHRoZSBlbmQuXG4gICAgICAgICAgICAgICAgICBudWxsXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5zaWduYWxzKClcbiAgICAgICAgICAud2hlblNpZ25hbChDb21tb25TaWduYWxzLkxPQURfRU5EKVxuICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMudnN5bmNfLm11dGF0ZSgoKSA9PiB7XG4gICAgICAgICAgICAgIHRoaXMucGFnZXNfLmZvckVhY2goKHBhZ2UpID0+XG4gICAgICAgICAgICAgICAgcGFnZS5lbGVtZW50LnNldEF0dHJpYnV0ZSgnYWN0aXZlJywgJycpXG4gICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHJpZXZlcyB0aGUgVUkgdHlwZSB0aGF0IHNob3VsZCBiZSB1c2VkIHRvIHZpZXcgdGhlIHN0b3J5LlxuICAgKiBAcmV0dXJuIHshVUlUeXBlfVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgZ2V0VUlUeXBlXygpIHtcbiAgICBpZiAodGhpcy5wbGF0Zm9ybV8uaXNCb3QoKSkge1xuICAgICAgcmV0dXJuIFVJVHlwZS5WRVJUSUNBTDtcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMuaXNEZXNrdG9wXygpKSB7XG4gICAgICByZXR1cm4gVUlUeXBlLk1PQklMRTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5pc0xhbmRzY2FwZVN1cHBvcnRlZF8oKSkge1xuICAgICAgcmV0dXJuIFVJVHlwZS5ERVNLVE9QX0ZVTExCTEVFRDtcbiAgICB9XG5cbiAgICBpZiAoaXNEZXNrdG9wT25lUGFuZWxFeHBlcmltZW50T24odGhpcy53aW4pKSB7XG4gICAgICByZXR1cm4gVUlUeXBlLkRFU0tUT1BfT05FX1BBTkVMO1xuICAgIH1cbiAgICAvLyBUaHJlZSBwYW5lbHMgZGVza3RvcCBVSSAoZGVmYXVsdCkuXG4gICAgcmV0dXJuIFVJVHlwZS5ERVNLVE9QX1BBTkVMUztcbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJuIHtib29sZWFufSBUcnVlIGlmIHRoZSBzY3JlZW4gc2l6ZSBtYXRjaGVzIHRoZSBkZXNrdG9wIG1lZGlhIHF1ZXJ5LlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgaXNEZXNrdG9wXygpIHtcbiAgICBpZiAoaXNEZXNrdG9wT25lUGFuZWxFeHBlcmltZW50T24odGhpcy53aW4pKSB7XG4gICAgICByZXR1cm4gdGhpcy5kZXNrdG9wT25lUGFuZWxNZWRpYV8ubWF0Y2hlcyAmJiAhdGhpcy5wbGF0Zm9ybV8uaXNCb3QoKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZGVza3RvcE1lZGlhXy5tYXRjaGVzICYmICF0aGlzLnBsYXRmb3JtXy5pc0JvdCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59IFRydWUgaWYgdGhlIHNjcmVlbiBvcmllbnRhdGlvbiBpcyBsYW5kc2NhcGUuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBpc0xhbmRzY2FwZV8oKSB7XG4gICAgcmV0dXJuIHRoaXMubGFuZHNjYXBlT3JpZW50YXRpb25NZWRpYV8ubWF0Y2hlcztcbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJuIHtib29sZWFufSB0cnVlIGlmIHRoaXMgaXMgYSBzdGFuZGFsb25lIHN0b3J5IChpLmUuIHRoaXMgc3RvcnkgaXNcbiAgICogICAgIHRoZSBvbmx5IGNvbnRlbnQgb2YgdGhlIGRvY3VtZW50KS5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGlzU3RhbmRhbG9uZV8oKSB7XG4gICAgcmV0dXJuIHRoaXMuZWxlbWVudC5oYXNBdHRyaWJ1dGUoQXR0cmlidXRlcy5TVEFOREFMT05FKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBXaGV0aGVyIHRoZSBzdG9yeSBzaG91bGQgc3VwcG9ydCBsYW5kc2NhcGUgb3JpZW50YXRpb246IGxhbmRzY2FwZSBtb2JpbGUsXG4gICAqIG9yIGZ1bGwgYmxlZWQgZGVza3RvcCBVSS5cbiAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGlzTGFuZHNjYXBlU3VwcG9ydGVkXygpIHtcbiAgICByZXR1cm4gdGhpcy5lbGVtZW50Lmhhc0F0dHJpYnV0ZShBdHRyaWJ1dGVzLlNVUFBPUlRTX0xBTkRTQ0FQRSk7XG4gIH1cblxuICAvKipcbiAgICogUmVhY3RzIHRvIHBhdXNlZCBzdGF0ZSB1cGRhdGVzLlxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGlzUGF1c2VkXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBvblBhdXNlZFN0YXRlVXBkYXRlXyhpc1BhdXNlZCkge1xuICAgIGlmICghdGhpcy5hY3RpdmVQYWdlXykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHBhZ2VTdGF0ZSA9IGlzUGF1c2VkID8gUGFnZVN0YXRlLlBBVVNFRCA6IFBhZ2VTdGF0ZS5QTEFZSU5HO1xuXG4gICAgdGhpcy5hY3RpdmVQYWdlXy5zZXRTdGF0ZShwYWdlU3RhdGUpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlYWN0cyB0byBzaWRlYmFyIHN0YXRlIHVwZGF0ZXMuXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gc2lkZWJhclN0YXRlXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBvblNpZGViYXJTdGF0ZVVwZGF0ZV8oc2lkZWJhclN0YXRlKSB7XG4gICAgdGhpcy5hbmFseXRpY3NTZXJ2aWNlXy50cmlnZ2VyRXZlbnQoXG4gICAgICBzaWRlYmFyU3RhdGUgPyBTdG9yeUFuYWx5dGljc0V2ZW50Lk9QRU4gOiBTdG9yeUFuYWx5dGljc0V2ZW50LkNMT1NFLFxuICAgICAgdGhpcy5zaWRlYmFyX1xuICAgICk7XG5cbiAgICBjb25zdCBhY3Rpb25zID0gU2VydmljZXMuYWN0aW9uU2VydmljZUZvckRvYyh0aGlzLmVsZW1lbnQpO1xuICAgIGlmICh0aGlzLndpbi5NdXRhdGlvbk9ic2VydmVyKSB7XG4gICAgICBpZiAoIXRoaXMuc2lkZWJhck9ic2VydmVyXykge1xuICAgICAgICB0aGlzLnNpZGViYXJPYnNlcnZlcl8gPSBuZXcgdGhpcy53aW4uTXV0YXRpb25PYnNlcnZlcigoKSA9PiB7XG4gICAgICAgICAgdGhpcy5zdG9yZVNlcnZpY2VfLmRpc3BhdGNoKFxuICAgICAgICAgICAgQWN0aW9uLlRPR0dMRV9TSURFQkFSLFxuICAgICAgICAgICAgdGhpcy5zaWRlYmFyXy5oYXNBdHRyaWJ1dGUoJ29wZW4nKVxuICAgICAgICAgICk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMuc2lkZWJhcl8gJiYgc2lkZWJhclN0YXRlKSB7XG4gICAgICAgIHRoaXMuc2lkZWJhck9ic2VydmVyXy5vYnNlcnZlKHRoaXMuc2lkZWJhcl8sIFNJREVCQVJfT0JTRVJWRVJfT1BUSU9OUyk7XG4gICAgICAgIHRoaXMub3Blbk9wYWNpdHlNYXNrXygpO1xuICAgICAgICBhY3Rpb25zLmV4ZWN1dGUoXG4gICAgICAgICAgdGhpcy5zaWRlYmFyXyxcbiAgICAgICAgICAnb3BlbicsXG4gICAgICAgICAgLyogYXJncyAqLyBudWxsLFxuICAgICAgICAgIC8qIHNvdXJjZSAqLyBudWxsLFxuICAgICAgICAgIC8qIGNhbGxlciAqLyBudWxsLFxuICAgICAgICAgIC8qIGV2ZW50ICovIG51bGwsXG4gICAgICAgICAgQWN0aW9uVHJ1c3QuSElHSFxuICAgICAgICApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5jbG9zZU9wYWNpdHlNYXNrXygpO1xuICAgICAgICB0aGlzLnNpZGViYXJPYnNlcnZlcl8uZGlzY29ubmVjdCgpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAodGhpcy5zaWRlYmFyXyAmJiBzaWRlYmFyU3RhdGUpIHtcbiAgICAgIHRoaXMub3Blbk9wYWNpdHlNYXNrXygpO1xuICAgICAgYWN0aW9ucy5leGVjdXRlKFxuICAgICAgICB0aGlzLnNpZGViYXJfLFxuICAgICAgICAnb3BlbicsXG4gICAgICAgIC8qIGFyZ3MgKi8gbnVsbCxcbiAgICAgICAgLyogc291cmNlICovIG51bGwsXG4gICAgICAgIC8qIGNhbGxlciAqLyBudWxsLFxuICAgICAgICAvKiBldmVudCAqLyBudWxsLFxuICAgICAgICBBY3Rpb25UcnVzdC5ISUdIXG4gICAgICApO1xuICAgICAgdGhpcy5zdG9yZVNlcnZpY2VfLmRpc3BhdGNoKEFjdGlvbi5UT0dHTEVfU0lERUJBUiwgZmFsc2UpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgaW5pdGlhbGl6ZU9wYWNpdHlNYXNrXygpIHtcbiAgICBpZiAoIXRoaXMubWFza0VsZW1lbnRfKSB7XG4gICAgICBjb25zdCBtYXNrRWwgPSB0aGlzLndpbi5kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgIG1hc2tFbC5jbGFzc0xpc3QuYWRkKE9QQUNJVFlfTUFTS19DTEFTU19OQU1FKTtcbiAgICAgIG1hc2tFbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgY29uc3QgYWN0aW9ucyA9IFNlcnZpY2VzLmFjdGlvblNlcnZpY2VGb3JEb2ModGhpcy5lbGVtZW50KTtcbiAgICAgICAgaWYgKHRoaXMuc2lkZWJhcl8pIHtcbiAgICAgICAgICB0aGlzLmNsb3NlT3BhY2l0eU1hc2tfKCk7XG4gICAgICAgICAgYWN0aW9ucy5leGVjdXRlKFxuICAgICAgICAgICAgdGhpcy5zaWRlYmFyXyxcbiAgICAgICAgICAgICdjbG9zZScsXG4gICAgICAgICAgICAvKiBhcmdzICovIG51bGwsXG4gICAgICAgICAgICAvKiBzb3VyY2UgKi8gbnVsbCxcbiAgICAgICAgICAgIC8qIGNhbGxlciAqLyBudWxsLFxuICAgICAgICAgICAgLyogZXZlbnQgKi8gbnVsbCxcbiAgICAgICAgICAgIEFjdGlvblRydXN0LkhJR0hcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHRoaXMubWFza0VsZW1lbnRfID0gbWFza0VsO1xuICAgICAgdGhpcy5tdXRhdGVFbGVtZW50KCgpID0+IHtcbiAgICAgICAgdGhpcy5lbGVtZW50LmFwcGVuZENoaWxkKHRoaXMubWFza0VsZW1lbnRfKTtcbiAgICAgICAgdG9nZ2xlKGRldigpLmFzc2VydEVsZW1lbnQodGhpcy5tYXNrRWxlbWVudF8pLCAvKiBkaXNwbGF5ICovIGZhbHNlKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgb3Blbk9wYWNpdHlNYXNrXygpIHtcbiAgICB0aGlzLm11dGF0ZUVsZW1lbnQoKCkgPT4ge1xuICAgICAgdG9nZ2xlKGRldigpLmFzc2VydEVsZW1lbnQodGhpcy5tYXNrRWxlbWVudF8pLCAvKiBkaXNwbGF5ICovIHRydWUpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBjbG9zZU9wYWNpdHlNYXNrXygpIHtcbiAgICBpZiAodGhpcy5tYXNrRWxlbWVudF8pIHtcbiAgICAgIHRoaXMubXV0YXRlRWxlbWVudCgoKSA9PiB7XG4gICAgICAgIHRvZ2dsZShkZXYoKS5hc3NlcnRFbGVtZW50KHRoaXMubWFza0VsZW1lbnRfKSwgLyogZGlzcGxheSAqLyBmYWxzZSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogSWYgYnJvd3NlciBpcyBzdXBwb3J0ZWQsIGRpc3BsYXlzIHRoZSBzdG9yeS4gT3RoZXJ3aXNlLCBzaG93cyBlaXRoZXIgdGhlXG4gICAqIGRlZmF1bHQgdW5zdXBwb3J0ZWQgYnJvd3NlciBsYXllciBvciB0aGUgcHVibGlzaGVyIGZhbGxiYWNrIChpZiBwcm92aWRlZCkuXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gaXNCcm93c2VyU3VwcG9ydGVkXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBvblN1cHBvcnRlZEJyb3dzZXJTdGF0ZVVwZGF0ZV8oaXNCcm93c2VyU3VwcG9ydGVkKSB7XG4gICAgY29uc3QgZmFsbGJhY2tFbCA9IHRoaXMuZ2V0RmFsbGJhY2soKTtcbiAgICBpZiAoaXNCcm93c2VyU3VwcG9ydGVkKSB7XG4gICAgICAvLyBSZW1vdmVzIHRoZSBkZWZhdWx0IHVuc3VwcG9ydGVkIGJyb3dzZXIgbGF5ZXIgb3IgdGhyb3dzIGFuIGVycm9yXG4gICAgICAvLyBpZiB0aGUgcHVibGlzaGVyIGhhcyBwcm92aWRlZCB0aGVpciBvd24gZmFsbGJhY2suXG4gICAgICBpZiAoZmFsbGJhY2tFbCkge1xuICAgICAgICBkZXYoKS5lcnJvcihcbiAgICAgICAgICBUQUcsXG4gICAgICAgICAgJ05vIGhhbmRsZXIgdG8gZXhpdCB1bnN1cHBvcnRlZCBicm93c2VyIHN0YXRlIG9uICcgK1xuICAgICAgICAgICAgJ3B1Ymxpc2hlciBwcm92aWRlZCBmYWxsYmFjay4nXG4gICAgICAgICk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmxheW91dFN0b3J5XygpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgIHRoaXMuc3RvcmVTZXJ2aWNlXy5kaXNwYXRjaChcbiAgICAgICAgICAgIEFjdGlvbi5UT0dHTEVfUEFVU0VELFxuICAgICAgICAgICAgdGhpcy5wYXVzZWRTdGF0ZVRvUmVzdG9yZV9cbiAgICAgICAgICApO1xuICAgICAgICAgIHRoaXMucGF1c2VkU3RhdGVUb1Jlc3RvcmVfID0gbnVsbDtcbiAgICAgICAgICB0aGlzLm11dGF0ZUVsZW1lbnQoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy51bnN1cHBvcnRlZEJyb3dzZXJMYXllcl8ucmVtb3ZlTGF5ZXIoKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucGF1c2VkU3RhdGVUb1Jlc3RvcmVfID0gISF0aGlzLnN0b3JlU2VydmljZV8uZ2V0KFxuICAgICAgICBTdGF0ZVByb3BlcnR5LlBBVVNFRF9TVEFURVxuICAgICAgKTtcbiAgICAgIHRoaXMuc3RvcmVTZXJ2aWNlXy5kaXNwYXRjaChBY3Rpb24uVE9HR0xFX1BBVVNFRCwgdHJ1ZSk7XG4gICAgICAvLyBEaXNwbGF5cyB0aGUgcHVibGlzaGVyIHByb3ZpZGVkIGZhbGxiYWNrIG9yIGZhbGxiYWNrcyB0byB0aGUgZGVmYXVsdFxuICAgICAgLy8gdW5zdXBwb3J0ZWQgYnJvd3NlciBsYXllci5cbiAgICAgIGlmIChmYWxsYmFja0VsKSB7XG4gICAgICAgIHRoaXMudG9nZ2xlRmFsbGJhY2sodHJ1ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnVuc3VwcG9ydGVkQnJvd3NlckxheWVyXy5idWlsZCgpO1xuICAgICAgICB0aGlzLm11dGF0ZUVsZW1lbnQoKCkgPT4ge1xuICAgICAgICAgIHRoaXMuZWxlbWVudC5hcHBlbmRDaGlsZCh0aGlzLnVuc3VwcG9ydGVkQnJvd3NlckxheWVyXy5nZXQoKSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJuIHshQXJyYXk8IUFycmF5PHN0cmluZz4+fSBBIDJEIGFycmF5IHJlcHJlc2VudGluZyBsaXN0cyBvZiBwYWdlcyBieVxuICAgKiAgICAgZGlzdGFuY2UuICBUaGUgb3V0ZXIgYXJyYXkgaW5kZXggcmVwcmVzZW50cyB0aGUgZGlzdGFuY2UgZnJvbSB0aGVcbiAgICogICAgIGFjdGl2ZSBwYWdlOyB0aGUgaW5uZXIgYXJyYXkgaXMgYSBsaXN0IG9mIHBhZ2UgSURzIGF0IHRoZSBzcGVjaWZpZWRcbiAgICogICAgIGRpc3RhbmNlLlxuICAgKi9cbiAgZ2V0UGFnZXNCeURpc3RhbmNlXygpIHtcbiAgICBjb25zdCBkaXN0YW5jZU1hcCA9IHRoaXMuZ2V0UGFnZURpc3RhbmNlTWFwSGVscGVyXyhcbiAgICAgIC8qIGRpc3RhbmNlICovIDAsXG4gICAgICAvKiBtYXAgKi8ge30sXG4gICAgICB0aGlzLmFjdGl2ZVBhZ2VfLmVsZW1lbnQuaWRcbiAgICApO1xuXG4gICAgLy8gVHJhbnNwb3NlIHRoZSBtYXAgaW50byBhIDJEIGFycmF5LlxuICAgIGNvbnN0IHBhZ2VzQnlEaXN0YW5jZSA9IFtdO1xuICAgIE9iamVjdC5rZXlzKGRpc3RhbmNlTWFwKS5mb3JFYWNoKChwYWdlSWQpID0+IHtcbiAgICAgIGxldCBkaXN0YW5jZSA9IGRpc3RhbmNlTWFwW3BhZ2VJZF07XG4gICAgICAvLyBJZiBvbiBsYXN0IHBhZ2UsIG1hcmsgZmlyc3QgcGFnZSB3aXRoIGRpc3RhbmNlIDEuXG4gICAgICBpZiAoXG4gICAgICAgIHBhZ2VJZCA9PT0gdGhpcy5wYWdlc19bMF0uZWxlbWVudC5pZCAmJlxuICAgICAgICB0aGlzLmFjdGl2ZVBhZ2VfID09PSB0aGlzLnBhZ2VzX1t0aGlzLnBhZ2VzXy5sZW5ndGggLSAxXSAmJlxuICAgICAgICB0aGlzLnBhZ2VzXy5sZW5ndGggPiAxICYmXG4gICAgICAgICF0aGlzLnZpZXdlcl8uaGFzQ2FwYWJpbGl0eSgnc3dpcGUnKVxuICAgICAgKSB7XG4gICAgICAgIGRpc3RhbmNlID0gMTtcbiAgICAgIH1cbiAgICAgIGlmICghcGFnZXNCeURpc3RhbmNlW2Rpc3RhbmNlXSkge1xuICAgICAgICBwYWdlc0J5RGlzdGFuY2VbZGlzdGFuY2VdID0gW107XG4gICAgICB9XG4gICAgICAvLyBUaGVyZSBtYXkgYmUgb3RoZXIgMSBza2lwIGF3YXkgcGFnZXMgZHVlIHRvIGJyYW5jaGluZy5cbiAgICAgIGlmIChpc0V4cGVyaW1lbnRPbih0aGlzLndpbiwgJ2FtcC1zdG9yeS1icmFuY2hpbmcnKSkge1xuICAgICAgICBjb25zdCBuYXZpZ2F0aW9uUGF0aCA9IHRoaXMuc3RvcmVTZXJ2aWNlXy5nZXQoXG4gICAgICAgICAgU3RhdGVQcm9wZXJ0eS5OQVZJR0FUSU9OX1BBVEhcbiAgICAgICAgKTtcbiAgICAgICAgY29uc3QgaW5kZXhJblN0YWNrID0gbmF2aWdhdGlvblBhdGguaW5kZXhPZihcbiAgICAgICAgICB0aGlzLmFjdGl2ZVBhZ2VfLmVsZW1lbnQuaWRcbiAgICAgICAgKTtcbiAgICAgICAgY29uc3QgbWF5YmVQcmV2ID0gbmF2aWdhdGlvblBhdGhbaW5kZXhJblN0YWNrIC0gMV07XG4gICAgICAgIGlmIChpbmRleEluU3RhY2sgPiAwICYmIHBhZ2VJZCA9PT0gdGhpcy5hY3RpdmVQYWdlXy5lbGVtZW50LmlkKSB7XG4gICAgICAgICAgaWYgKCFwYWdlc0J5RGlzdGFuY2VbMV0pIHtcbiAgICAgICAgICAgIHBhZ2VzQnlEaXN0YW5jZVsxXSA9IFtdO1xuICAgICAgICAgIH1cbiAgICAgICAgICBwYWdlc0J5RGlzdGFuY2VbMV0ucHVzaChtYXliZVByZXYpO1xuICAgICAgICB9XG4gICAgICAgIC8vIERvIG5vdCBvdmVyd3JpdGUsIGJyYW5jaGluZyBkaXN0YW5jZSBhbHdheXMgdGFrZXMgcHJlY2VkZW5jZS5cbiAgICAgICAgaWYgKHBhZ2VJZCAhPT0gbWF5YmVQcmV2KSB7XG4gICAgICAgICAgcGFnZXNCeURpc3RhbmNlW2Rpc3RhbmNlXS5wdXNoKHBhZ2VJZCk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHBhZ2VzQnlEaXN0YW5jZVtkaXN0YW5jZV0ucHVzaChwYWdlSWQpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHBhZ2VzQnlEaXN0YW5jZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbWFwIG9mIGEgcGFnZSBhbmQgYWxsIG9mIHRoZSBwYWdlcyByZWFjaGFibGUgZnJvbSB0aGF0IHBhZ2UsIGJ5XG4gICAqIGRpc3RhbmNlLlxuICAgKlxuICAgKiBAcGFyYW0ge251bWJlcn0gZGlzdGFuY2UgVGhlIGRpc3RhbmNlIHRoYXQgdGhlIHBhZ2Ugd2l0aCB0aGUgc3BlY2lmaWVkXG4gICAqICAgICBwYWdlSWQgaXMgZnJvbSB0aGUgYWN0aXZlIHBhZ2UuXG4gICAqIEBwYXJhbSB7IU9iamVjdDxzdHJpbmcsIG51bWJlcj59IG1hcCBBIG1hcHBpbmcgZnJvbSBwYWdlSWQgdG8gaXRzIGRpc3RhbmNlXG4gICAqICAgICBmcm9tIHRoZSBhY3RpdmUgcGFnZS5cbiAgICogQHBhcmFtIHtzdHJpbmd9IHBhZ2VJZCBUaGUgcGFnZSB0byBiZSBhZGRlZCB0byB0aGUgbWFwLlxuICAgKiBAcmV0dXJuIHshT2JqZWN0PHN0cmluZywgbnVtYmVyPn0gQSBtYXBwaW5nIGZyb20gcGFnZSBJRCB0byB0aGUgcHJpb3JpdHkgb2ZcbiAgICogICAgIHRoYXQgcGFnZS5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGdldFBhZ2VEaXN0YW5jZU1hcEhlbHBlcl8oZGlzdGFuY2UsIG1hcCwgcGFnZUlkKSB7XG4gICAgaWYgKG1hcFtwYWdlSWRdICE9PSB1bmRlZmluZWQgJiYgbWFwW3BhZ2VJZF0gPD0gZGlzdGFuY2UpIHtcbiAgICAgIHJldHVybiBtYXA7XG4gICAgfVxuXG4gICAgbWFwW3BhZ2VJZF0gPSBkaXN0YW5jZTtcbiAgICBjb25zdCBwYWdlID0gdGhpcy5nZXRQYWdlQnlJZChwYWdlSWQpO1xuICAgIHBhZ2UuZ2V0QWRqYWNlbnRQYWdlSWRzKCkuZm9yRWFjaCgoYWRqYWNlbnRQYWdlSWQpID0+IHtcbiAgICAgIGlmIChcbiAgICAgICAgbWFwW2FkamFjZW50UGFnZUlkXSAhPT0gdW5kZWZpbmVkICYmXG4gICAgICAgIG1hcFthZGphY2VudFBhZ2VJZF0gPD0gZGlzdGFuY2VcbiAgICAgICkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIFRPRE8obmV3bXVpcyk6IFJlbW92ZSB0aGUgYXNzaWdubWVudCBhbmQgcmV0dXJuLCBhcyB0aGV5J3JlXG4gICAgICAvLyB1bm5lY2Vzc2FyeS5cbiAgICAgIG1hcCA9IHRoaXMuZ2V0UGFnZURpc3RhbmNlTWFwSGVscGVyXyhkaXN0YW5jZSArIDEsIG1hcCwgYWRqYWNlbnRQYWdlSWQpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIG1hcDtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge2Jvb2xlYW49fSBwcmlvcml0aXplQWN0aXZlUGFnZVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgcHJlbG9hZFBhZ2VzQnlEaXN0YW5jZV8ocHJpb3JpdGl6ZUFjdGl2ZVBhZ2UgPSBmYWxzZSkge1xuICAgIGlmICh0aGlzLnBsYXRmb3JtXy5pc0JvdCgpKSB7XG4gICAgICB0aGlzLnBhZ2VzXy5mb3JFYWNoKChwYWdlKSA9PiB7XG4gICAgICAgIHBhZ2Uuc2V0RGlzdGFuY2UoMCk7XG4gICAgICB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBwYWdlc0J5RGlzdGFuY2UgPSB0aGlzLmdldFBhZ2VzQnlEaXN0YW5jZV8oKTtcblxuICAgIGNvbnN0IHByZWxvYWRBbGxQYWdlcyA9ICgpID0+IHtcbiAgICAgIHBhZ2VzQnlEaXN0YW5jZS5mb3JFYWNoKChwYWdlSWRzLCBkaXN0YW5jZSkgPT4ge1xuICAgICAgICBwYWdlSWRzLmZvckVhY2goKHBhZ2VJZCkgPT4ge1xuICAgICAgICAgIGNvbnN0IHBhZ2UgPSB0aGlzLmdldFBhZ2VCeUlkKHBhZ2VJZCk7XG4gICAgICAgICAgcGFnZS5zZXREaXN0YW5jZShkaXN0YW5jZSk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfTtcblxuICAgIHRoaXMubXV0YXRlRWxlbWVudCgoKSA9PiB7XG4gICAgICBpZiAoXG4gICAgICAgICFpc0V4cGVyaW1lbnRPbih0aGlzLndpbiwgJ3N0b3J5LWxvYWQtZmlyc3QtcGFnZS1vbmx5JykgfHxcbiAgICAgICAgIXByaW9yaXRpemVBY3RpdmVQYWdlXG4gICAgICApIHtcbiAgICAgICAgcmV0dXJuIHByZWxvYWRBbGxQYWdlcygpO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBhY3RpdmVQYWdlSWQgPSBkZXZBc3NlcnQocGFnZXNCeURpc3RhbmNlWzBdWzBdKTtcbiAgICAgIG5ldyBQcm9taXNlKChyZXMsIHJlaikgPT4ge1xuICAgICAgICBjb25zdCBwYWdlID0gdGhpcy5nZXRQYWdlQnlJZChhY3RpdmVQYWdlSWQpO1xuICAgICAgICBwYWdlLnNldERpc3RhbmNlKDApO1xuICAgICAgICBwYWdlLnNpZ25hbHMoKS53aGVuU2lnbmFsKENvbW1vblNpZ25hbHMuTE9BRF9FTkQpLnRoZW4ocmVzKTtcbiAgICAgICAgLy8gRG9uJ3QgY2FsbCBwcmVsb2FkIGlmIHVzZXIgbmF2aWdhdGVzIGJlZm9yZSBwYWdlIGxvYWRzLCBzaW5jZSB0aGUgbmF2aWdhdGlvbiB3aWxsIGNhbGwgcHJlbG9hZCBwcm9wZXJseS5cbiAgICAgICAgdGhpcy5zdG9yZVNlcnZpY2VfLnN1YnNjcmliZShTdGF0ZVByb3BlcnR5LkNVUlJFTlRfUEFHRV9JRCwgcmVqKTtcbiAgICAgIH0pLnRoZW4oXG4gICAgICAgICgpID0+IHByZWxvYWRBbGxQYWdlcygpLFxuICAgICAgICAoKSA9PiB7fVxuICAgICAgKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBIYW5kbGVzIGEgYmFja2dyb3VuZC1hdWRpbyBhdHRyaWJ1dGUgc2V0IG9uIGFuIDxhbXAtc3Rvcnk+IHRhZy5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIHJlZ2lzdGVyQW5kUHJlbG9hZEJhY2tncm91bmRBdWRpb18oKSB7XG4gICAgbGV0IGJhY2tncm91bmRBdWRpb0VsID0gdXBncmFkZUJhY2tncm91bmRBdWRpbyh0aGlzLmVsZW1lbnQpO1xuXG4gICAgaWYgKCFiYWNrZ3JvdW5kQXVkaW9FbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIE9uY2UgdGhlIG1lZGlhIHBvb2wgaXMgcmVhZHksIHJlZ2lzdGVycyBhbmQgcHJlbG9hZHMgdGhlIGJhY2tncm91bmRcbiAgICAvLyBhdWRpbywgYW5kIHRoZW4gZ2V0cyB0aGUgc3dhcHBlZCBlbGVtZW50IGZyb20gdGhlIERPTSB0byBtdXRlL3VubXV0ZS9wbGF5XG4gICAgLy8gaXQgcHJvZ3JhbW1hdGljYWxseSBsYXRlci5cbiAgICB0aGlzLmFjdGl2ZVBhZ2VfLmVsZW1lbnRcbiAgICAgIC5zaWduYWxzKClcbiAgICAgIC53aGVuU2lnbmFsKENvbW1vblNpZ25hbHMuTE9BRF9FTkQpXG4gICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgIGJhY2tncm91bmRBdWRpb0VsID0gLyoqIEB0eXBlIHshSFRNTE1lZGlhRWxlbWVudH0gKi8gKFxuICAgICAgICAgIGJhY2tncm91bmRBdWRpb0VsXG4gICAgICAgICk7XG4gICAgICAgIHRoaXMubWVkaWFQb29sXy5yZWdpc3RlcihiYWNrZ3JvdW5kQXVkaW9FbCk7XG4gICAgICAgIHJldHVybiB0aGlzLm1lZGlhUG9vbF8ucHJlbG9hZChiYWNrZ3JvdW5kQXVkaW9FbCk7XG4gICAgICB9KVxuICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICB0aGlzLmJhY2tncm91bmRBdWRpb0VsXyA9IC8qKiBAdHlwZSB7IUhUTUxNZWRpYUVsZW1lbnR9ICovIChcbiAgICAgICAgICBjaGlsZEVsZW1lbnQodGhpcy5lbGVtZW50LCAoZWwpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBlbC50YWdOYW1lLnRvTG93ZXJDYXNlKCkgPT09ICdhdWRpbyc7XG4gICAgICAgICAgfSlcbiAgICAgICAgKTtcbiAgICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIExvYWRzIGFtcC1zdG9yeS1lZHVjYXRpb24gaWYgdGhlIHZpZXdlciBjYXBhYmlsaXR5IGlzIHByb3ZpZGVkLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgbWF5YmVMb2FkU3RvcnlFZHVjYXRpb25fKCkge1xuICAgIGlmICghdGhpcy52aWV3ZXJfLmhhc0NhcGFiaWxpdHkoJ2VkdWNhdGlvbicpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5tdXRhdGVFbGVtZW50KCgpID0+IHtcbiAgICAgIHRoaXMuZWxlbWVudC5hcHBlbmRDaGlsZChcbiAgICAgICAgdGhpcy53aW4uZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYW1wLXN0b3J5LWVkdWNhdGlvbicpXG4gICAgICApO1xuICAgIH0pO1xuXG4gICAgU2VydmljZXMuZXh0ZW5zaW9uc0Zvcih0aGlzLndpbikuaW5zdGFsbEV4dGVuc2lvbkZvckRvYyhcbiAgICAgIHRoaXMuZ2V0QW1wRG9jKCksXG4gICAgICAnYW1wLXN0b3J5LWVkdWNhdGlvbidcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBpZCBUaGUgSUQgb2YgdGhlIHBhZ2Ugd2hvc2UgaW5kZXggc2hvdWxkIGJlIHJldHJpZXZlZC5cbiAgICogQHJldHVybiB7bnVtYmVyfSBUaGUgaW5kZXggb2YgdGhlIHBhZ2UuXG4gICAqL1xuICBnZXRQYWdlSW5kZXhCeUlkKGlkKSB7XG4gICAgY29uc3QgcGFnZUluZGV4ID0gZmluZEluZGV4KHRoaXMucGFnZXNfLCAocGFnZSkgPT4gcGFnZS5lbGVtZW50LmlkID09PSBpZCk7XG4gICAgaWYgKHBhZ2VJbmRleCA8IDApIHtcbiAgICAgIHVzZXIoKS5lcnJvcihcbiAgICAgICAgVEFHLFxuICAgICAgICAnU3RvcnkgcmVmZXJzIHRvIHBhZ2UgXCIlc1wiLCBidXQgbm8gc3VjaCBwYWdlIGV4aXN0cy4nLFxuICAgICAgICBpZFxuICAgICAgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcGFnZUluZGV4O1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBpZCBUaGUgSUQgb2YgdGhlIHBhZ2UgdG8gYmUgcmV0cmlldmVkLlxuICAgKiBAcmV0dXJuIHshLi9hbXAtc3RvcnktcGFnZS5BbXBTdG9yeVBhZ2V9IFJldHJpZXZlcyB0aGUgcGFnZSB3aXRoIHRoZVxuICAgKiAgICAgc3BlY2lmaWVkIElELlxuICAgKi9cbiAgZ2V0UGFnZUJ5SWQoaWQpIHtcbiAgICBjb25zdCBwYWdlSW5kZXggPSB0aGlzLmdldFBhZ2VJbmRleEJ5SWQoaWQpO1xuICAgIHJldHVybiBkZXZBc3NlcnQoXG4gICAgICB0aGlzLnBhZ2VzX1twYWdlSW5kZXhdLFxuICAgICAgJ1BhZ2UgYXQgaW5kZXggJXMgZXhpc3RzLCBidXQgaXMgbWlzc2luZyBmcm9tIHRoZSBhcnJheS4nLFxuICAgICAgcGFnZUluZGV4XG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJuIHtudW1iZXJ9XG4gICAqL1xuICBnZXRQYWdlQ291bnQoKSB7XG4gICAgcmV0dXJuIHRoaXMucGFnZXNfLmxlbmd0aCAtIHRoaXMuYWRQYWdlc18ubGVuZ3RoO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7IS4vYW1wLXN0b3J5LXBhZ2UuQW1wU3RvcnlQYWdlfSBkZXNpcmVkUGFnZVxuICAgKiBAcmV0dXJuIHtudW1iZXJ9IFRoZSBpbmRleCBvZiB0aGUgcGFnZS5cbiAgICovXG4gIGdldFBhZ2VJbmRleChkZXNpcmVkUGFnZSkge1xuICAgIHJldHVybiBmaW5kSW5kZXgodGhpcy5wYWdlc18sIChwYWdlKSA9PiBwYWdlID09PSBkZXNpcmVkUGFnZSk7XG4gIH1cblxuICAvKipcbiAgICogUmV0cmlldmVzIHRoZSBwYWdlIGNvbnRhaW5pbmcgdGhlIGVsZW1lbnQsIG9yIG51bGwuIEEgYmFja2dyb3VuZCBhdWRpb1xuICAgKiBzZXQgb24gdGhlIDxhbXAtc3Rvcnk+IHRhZyB3b3VsZCBub3QgYmUgY29udGFpbmVkIGluIGEgcGFnZS5cbiAgICogQHBhcmFtIHshRWxlbWVudH0gZWxlbWVudCBUaGUgZWxlbWVudCB3aG9zZSBjb250YWluaW5nIEFtcFN0b3J5UGFnZSBzaG91bGRcbiAgICogICAgIGJlIHJldHJpZXZlZFxuICAgKiBAcmV0dXJuIHs/Li9hbXAtc3RvcnktcGFnZS5BbXBTdG9yeVBhZ2V9IFRoZSBBbXBTdG9yeVBhZ2UgY29udGFpbmluZyB0aGVcbiAgICogICAgIHNwZWNpZmllZCBlbGVtZW50LCBpZiBhbnkuXG4gICAqL1xuICBnZXRQYWdlQ29udGFpbmluZ0VsZW1lbnRfKGVsZW1lbnQpIHtcbiAgICBsZXQgc3RhcnRpbmdFbGVtZW50ID0gZWxlbWVudDtcbiAgICAvLyBJZiB0aGUgZWxlbWVudCBpcyBpbnNpZGUgYW4gaWZyYW1lIChtb3N0IGxpa2VseSBhbiBhZCksIHN0YXJ0IGZyb20gdGhlXG4gICAgLy8gY29udGFpbmluZyBpZnJhbWUgZWxlbWVudC5cbiAgICBpZiAoZWxlbWVudC5vd25lckRvY3VtZW50ICE9PSB0aGlzLndpbi5kb2N1bWVudCkge1xuICAgICAgc3RhcnRpbmdFbGVtZW50ID0gZWxlbWVudC5vd25lckRvY3VtZW50LmRlZmF1bHRWaWV3LmZyYW1lRWxlbWVudDtcbiAgICB9XG5cbiAgICBjb25zdCBwYWdlSW5kZXggPSBmaW5kSW5kZXgodGhpcy5wYWdlc18sIChwYWdlKSA9PiB7XG4gICAgICBjb25zdCBwYWdlRWwgPSBjbG9zZXN0KHN0YXJ0aW5nRWxlbWVudCwgKGVsKSA9PiB7XG4gICAgICAgIHJldHVybiBlbCA9PT0gcGFnZS5lbGVtZW50O1xuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiAhIXBhZ2VFbDtcbiAgICB9KTtcblxuICAgIHJldHVybiB0aGlzLnBhZ2VzX1twYWdlSW5kZXhdIHx8IG51bGw7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGdldEVsZW1lbnREaXN0YW5jZShlbGVtZW50KSB7XG4gICAgY29uc3QgcGFnZSA9IHRoaXMuZ2V0UGFnZUNvbnRhaW5pbmdFbGVtZW50XyhlbGVtZW50KTtcblxuICAgIC8vIEFuIGVsZW1lbnQgbm90IGNvbnRhaW5lZCBpbiBhIHBhZ2UgaXMgbGlrZWx5IHRvIGJlIGdsb2JhbCB0byB0aGUgc3RvcnksXG4gICAgLy8gbGlrZSBhIGJhY2tncm91bmQgYXVkaW8uIFNldHRpbmcgdGhlIGRpc3RhbmNlIHRvIC0xIGVuc3VyZXMgaXQgd2lsbCBub3RcbiAgICAvLyBnZXQgZXZpY3RlZCBmcm9tIHRoZSBtZWRpYSBwb29sLlxuICAgIGlmICghcGFnZSkge1xuICAgICAgcmV0dXJuIC0xO1xuICAgIH1cblxuICAgIHJldHVybiBwYWdlLmdldERpc3RhbmNlKCk7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGdldE1heE1lZGlhRWxlbWVudENvdW50cygpIHtcbiAgICBsZXQgYXVkaW9NZWRpYUVsZW1lbnRzQ291bnQgPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvckFsbChcbiAgICAgICdhbXAtYXVkaW8sIFtiYWNrZ3JvdW5kLWF1ZGlvXSdcbiAgICApLmxlbmd0aDtcbiAgICBjb25zdCB2aWRlb01lZGlhRWxlbWVudHNDb3VudCA9XG4gICAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvckFsbCgnYW1wLXZpZGVvJykubGVuZ3RoO1xuXG4gICAgLy8gVGhlIHJvb3QgZWxlbWVudCAoYW1wLXN0b3J5KSBtaWdodCBoYXZlIGEgYmFja2dyb3VuZC1hdWRpbyBhcyB3ZWxsLlxuICAgIGlmICh0aGlzLmVsZW1lbnQuaGFzQXR0cmlidXRlKCdiYWNrZ3JvdW5kLWF1ZGlvJykpIHtcbiAgICAgIGF1ZGlvTWVkaWFFbGVtZW50c0NvdW50Kys7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIFtNZWRpYVR5cGUuQVVESU9dOiBNYXRoLm1pbihcbiAgICAgICAgYXVkaW9NZWRpYUVsZW1lbnRzQ291bnQgKyBNSU5JTVVNX0FEX01FRElBX0VMRU1FTlRTLFxuICAgICAgICBNQVhfTUVESUFfRUxFTUVOVF9DT1VOVFNbTWVkaWFUeXBlLkFVRElPXVxuICAgICAgKSxcbiAgICAgIFtNZWRpYVR5cGUuVklERU9dOiBNYXRoLm1pbihcbiAgICAgICAgdmlkZW9NZWRpYUVsZW1lbnRzQ291bnQgKyBNSU5JTVVNX0FEX01FRElBX0VMRU1FTlRTLFxuICAgICAgICBNQVhfTUVESUFfRUxFTUVOVF9DT1VOVFNbTWVkaWFUeXBlLlZJREVPXVxuICAgICAgKSxcbiAgICB9O1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBnZXRFbGVtZW50KCkge1xuICAgIHJldHVybiB0aGlzLmVsZW1lbnQ7XG4gIH1cblxuICAvKipcbiAgICogUmVhY3RzIHRvIG11dGVkIHN0YXRlIHVwZGF0ZXMuXG4gICAqIEBwYXJhbSAge2Jvb2xlYW59IGlzTXV0ZWQgV2hldGhlciB0aGUgc3RvcnkganVzdCBnb3QgbXV0ZWQuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBvbk11dGVkU3RhdGVVcGRhdGVfKGlzTXV0ZWQpIHtcbiAgICBpc011dGVkID8gdGhpcy5tdXRlXygpIDogdGhpcy51bm11dGVfKCk7XG4gICAgaXNNdXRlZFxuICAgICAgPyB0aGlzLmVsZW1lbnQuc2V0QXR0cmlidXRlKEF0dHJpYnV0ZXMuTVVURUQsICcnKVxuICAgICAgOiB0aGlzLmVsZW1lbnQucmVtb3ZlQXR0cmlidXRlKEF0dHJpYnV0ZXMuTVVURUQpO1xuICB9XG5cbiAgLyoqXG4gICAqIE11dGVzIHRoZSBhdWRpbyBmb3IgdGhlIHN0b3J5LlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgbXV0ZV8oKSB7XG4gICAgdGhpcy5wYXVzZUJhY2tncm91bmRBdWRpb18oKTtcbiAgICBpZiAodGhpcy5hY3RpdmVQYWdlXykge1xuICAgICAgdGhpcy5hY3RpdmVQYWdlXy5tdXRlQWxsTWVkaWEoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUGF1c2VzIHRoZSBiYWNrZ3JvdW5kIGF1ZGlvLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgcGF1c2VCYWNrZ3JvdW5kQXVkaW9fKCkge1xuICAgIGlmICghdGhpcy5iYWNrZ3JvdW5kQXVkaW9FbF8pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5tZWRpYVBvb2xfLnBhdXNlKHRoaXMuYmFja2dyb3VuZEF1ZGlvRWxfKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVbm11dGVzIHRoZSBhdWRpbyBmb3IgdGhlIHN0b3J5LlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgdW5tdXRlXygpIHtcbiAgICBjb25zdCB1bm11dGVBbGxNZWRpYSA9ICgpID0+IHtcbiAgICAgIHRoaXMucGxheUJhY2tncm91bmRBdWRpb18oKTtcbiAgICAgIGlmICh0aGlzLmFjdGl2ZVBhZ2VfKSB7XG4gICAgICAgIHRoaXMuYWN0aXZlUGFnZV8udW5tdXRlQWxsTWVkaWEoKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgdGhpcy5tZWRpYVBvb2xfLmJsZXNzQWxsKCkudGhlbih1bm11dGVBbGxNZWRpYSwgdW5tdXRlQWxsTWVkaWEpO1xuICB9XG5cbiAgLyoqXG4gICAqIFVubXV0ZXMgYW5kIHBsYXlzIHRoZSBiYWNrZ3JvdW5kIGF1ZGlvLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgcGxheUJhY2tncm91bmRBdWRpb18oKSB7XG4gICAgaWYgKCF0aGlzLmJhY2tncm91bmRBdWRpb0VsXykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLm1lZGlhUG9vbF8udW5tdXRlKHRoaXMuYmFja2dyb3VuZEF1ZGlvRWxfKTtcbiAgICB0aGlzLm1lZGlhUG9vbF8ucGxheSh0aGlzLmJhY2tncm91bmRBdWRpb0VsXyk7XG4gIH1cblxuICAvKipcbiAgICogU2hvd3MgdGhlIGF1ZGlvIGljb24gaWYgdGhlIHN0b3J5IGhhcyBhbnkgbWVkaWEgZWxlbWVudHMgY29udGFpbmluZyBhdWRpbyxcbiAgICogb3IgYmFja2dyb3VuZCBhdWRpbyBhdCB0aGUgc3Rvcnkgb3IgcGFnZSBsZXZlbC5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIHVwZGF0ZUF1ZGlvSWNvbl8oKSB7XG4gICAgY29uc3QgY29udGFpbnNNZWRpYUVsZW1lbnRXaXRoQXVkaW8gPSAhIXRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFxuICAgICAgJ2FtcC1hdWRpbywgYW1wLXZpZGVvOm5vdChbbm9hdWRpb10pLCBbYmFja2dyb3VuZC1hdWRpb10nXG4gICAgKTtcbiAgICBjb25zdCBzdG9yeUhhc0JhY2tncm91bmRBdWRpbyA9XG4gICAgICB0aGlzLmVsZW1lbnQuaGFzQXR0cmlidXRlKCdiYWNrZ3JvdW5kLWF1ZGlvJyk7XG5cbiAgICB0aGlzLnN0b3JlU2VydmljZV8uZGlzcGF0Y2goXG4gICAgICBBY3Rpb24uVE9HR0xFX1NUT1JZX0hBU19BVURJTyxcbiAgICAgIGNvbnRhaW5zTWVkaWFFbGVtZW50V2l0aEF1ZGlvIHx8IHN0b3J5SGFzQmFja2dyb3VuZEF1ZGlvXG4gICAgKTtcbiAgICB0aGlzLnN0b3JlU2VydmljZV8uZGlzcGF0Y2goXG4gICAgICBBY3Rpb24uVE9HR0xFX1NUT1JZX0hBU19CQUNLR1JPVU5EX0FVRElPLFxuICAgICAgc3RvcnlIYXNCYWNrZ3JvdW5kQXVkaW9cbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIFNob3dzIHRoZSBwbGF5L3BhdXNlIGljb24gaWYgdGhlcmUgaXMgYW4gZWxlbWVudCB3aXRoIHBsYXliYWNrIG9uIHRoZSBzdG9yeS5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIHVwZGF0ZVBhdXNlZEljb25fKCkge1xuICAgIGNvbnN0IGNvbnRhaW5zRWxlbWVudHNXaXRoUGxheWJhY2sgPSAhIXNjb3BlZFF1ZXJ5U2VsZWN0b3IoXG4gICAgICB0aGlzLmVsZW1lbnQsXG4gICAgICAnYW1wLXN0b3J5LWdyaWQtbGF5ZXIgYW1wLWF1ZGlvLCBhbXAtc3RvcnktZ3JpZC1sYXllciBhbXAtdmlkZW8sIGFtcC1zdG9yeS1wYWdlW2JhY2tncm91bmQtYXVkaW9dLCBhbXAtc3RvcnktcGFnZVthdXRvLWFkdmFuY2UtYWZ0ZXJdJ1xuICAgICk7XG5cbiAgICBjb25zdCBzdG9yeUhhc0JhY2tncm91bmRBdWRpbyA9XG4gICAgICB0aGlzLmVsZW1lbnQuaGFzQXR0cmlidXRlKCdiYWNrZ3JvdW5kLWF1ZGlvJyk7XG5cbiAgICB0aGlzLnN0b3JlU2VydmljZV8uZGlzcGF0Y2goXG4gICAgICBBY3Rpb24uVE9HR0xFX1NUT1JZX0hBU19QTEFZQkFDS19VSSxcbiAgICAgIGNvbnRhaW5zRWxlbWVudHNXaXRoUGxheWJhY2sgfHwgc3RvcnlIYXNCYWNrZ3JvdW5kQXVkaW9cbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIEhhbmRsZXMgdGhlIHJld2luZCB2aWV3ZXIgZXZlbnQuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBvblJld2luZF8oKSB7XG4gICAgdGhpcy5zaWduYWxzKClcbiAgICAgIC53aGVuU2lnbmFsKENvbW1vblNpZ25hbHMuTE9BRF9FTkQpXG4gICAgICAudGhlbigoKSA9PiB0aGlzLnJlcGxheV8oKSk7XG4gIH1cblxuICAvKipcbiAgICogSGFuZGxlcyB0aGUgc2VsZWN0UGFnZSB2aWV3ZXIgZXZlbnQuXG4gICAqIEBwYXJhbSB7IUpzb25PYmplY3R9IGRhdGFcbiAgICogQHByaXZhdGVcbiAgICovXG4gIG9uU2VsZWN0UGFnZV8oZGF0YSkge1xuICAgIGlmICghZGF0YSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuc3RvcmVTZXJ2aWNlXy5kaXNwYXRjaChcbiAgICAgIEFjdGlvbi5TRVRfQURWQU5DRU1FTlRfTU9ERSxcbiAgICAgIEFkdmFuY2VtZW50TW9kZS5WSUVXRVJfU0VMRUNUX1BBR0VcbiAgICApO1xuXG4gICAgaWYgKGRhdGFbJ25leHQnXSkge1xuICAgICAgdGhpcy5uZXh0XygpO1xuICAgIH0gZWxzZSBpZiAoZGF0YVsncHJldmlvdXMnXSkge1xuICAgICAgdGhpcy5wcmV2aW91c18oKTtcbiAgICB9IGVsc2UgaWYgKGRhdGFbJ2RlbHRhJ10pIHtcbiAgICAgIHRoaXMuc3dpdGNoRGVsdGFfKGRhdGFbJ2RlbHRhJ10pO1xuICAgIH0gZWxzZSBpZiAoZGF0YVsnaWQnXSkge1xuICAgICAgdGhpcy5zd2l0Y2hUb18oXG4gICAgICAgIGRhdGFbJ2lkJ10sXG4gICAgICAgIHRoaXMuZ2V0UGFnZUluZGV4QnlJZChkYXRhWydpZCddKSA+IHRoaXMuZ2V0UGFnZUluZGV4KHRoaXMuYWN0aXZlUGFnZV8pXG4gICAgICAgICAgPyBOYXZpZ2F0aW9uRGlyZWN0aW9uLk5FWFRcbiAgICAgICAgICA6IE5hdmlnYXRpb25EaXJlY3Rpb24uUFJFVklPVVNcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFN3aXRjaGVzIHRvIGEgcGFnZSBpbiB0aGUgc3RvcnkgZ2l2ZW4gYSBkZWx0YS4gSWYgbmV3IGluZGV4IGlzIG91dCBvZlxuICAgKiBib3VuZHMsIGl0IHdpbGwgZ28gdG8gdGhlIGxhc3Qgb3IgZmlyc3QgcGFnZSAoZGVwZW5kaW5nIG9uIGRpcmVjdGlvbikuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBkZWx0YVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgc3dpdGNoRGVsdGFfKGRlbHRhKSB7XG4gICAgY29uc3QgY3VycmVudFBhZ2VJZHggPSB0aGlzLnN0b3JlU2VydmljZV8uZ2V0KFxuICAgICAgU3RhdGVQcm9wZXJ0eS5DVVJSRU5UX1BBR0VfSU5ERVhcbiAgICApO1xuXG4gICAgY29uc3QgbmV3UGFnZUlkeCA9XG4gICAgICBkZWx0YSA+IDBcbiAgICAgICAgPyBNYXRoLm1pbih0aGlzLnBhZ2VzXy5sZW5ndGggLSAxLCBjdXJyZW50UGFnZUlkeCArIGRlbHRhKVxuICAgICAgICA6IE1hdGgubWF4KDAsIGN1cnJlbnRQYWdlSWR4ICsgZGVsdGEpO1xuICAgIGNvbnN0IHRhcmdldFBhZ2UgPSB0aGlzLnBhZ2VzX1tuZXdQYWdlSWR4XTtcblxuICAgIGlmIChcbiAgICAgICF0aGlzLmlzQWN0dWFsUGFnZV8odGFyZ2V0UGFnZSAmJiB0YXJnZXRQYWdlLmVsZW1lbnQuaWQpIHx8XG4gICAgICBuZXdQYWdlSWR4ID09PSBjdXJyZW50UGFnZUlkeFxuICAgICkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGRpcmVjdGlvbiA9XG4gICAgICBuZXdQYWdlSWR4ID4gY3VycmVudFBhZ2VJZHhcbiAgICAgICAgPyBOYXZpZ2F0aW9uRGlyZWN0aW9uLk5FWFRcbiAgICAgICAgOiBOYXZpZ2F0aW9uRGlyZWN0aW9uLlBSRVZJT1VTO1xuXG4gICAgdGhpcy5zd2l0Y2hUb18odGFyZ2V0UGFnZS5lbGVtZW50LmlkLCBkaXJlY3Rpb24pO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyBmb3IgdGhlIHByZXNlbmNlIG9mIGEgc2lkZWJhci4gSWYgYSBzaWRlYmFyIGRvZXMgZXhpc3QsIHRoZW4gYW4gaWNvblxuICAgKiBwZXJtaXR0aW5nIGZvciB0aGUgb3BlbmluZy9jbG9zaW5nIG9mIHRoZSBzaWRlYmFyIGlzIHNob3duLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgaW5pdGlhbGl6ZVNpZGViYXJfKCkge1xuICAgIHRoaXMuc2lkZWJhcl8gPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcignYW1wLXNpZGViYXInKTtcbiAgICBpZiAoIXRoaXMuc2lkZWJhcl8pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLm11dGF0ZUVsZW1lbnQoKCkgPT4ge1xuICAgICAgdGhpcy5zaWRlYmFyXy5jbGFzc0xpc3QuYWRkKFNJREVCQVJfQ0xBU1NfTkFNRSk7XG4gICAgfSk7XG5cbiAgICB0aGlzLmluaXRpYWxpemVPcGFjaXR5TWFza18oKTtcbiAgICB0aGlzLnN0b3JlU2VydmljZV8uZGlzcGF0Y2goQWN0aW9uLlRPR0dMRV9IQVNfU0lERUJBUiwgISF0aGlzLnNpZGViYXJfKTtcblxuICAgIGNvbnN0IGFjdGlvbnMgPSBbXG4gICAgICB7dGFnT3JUYXJnZXQ6ICdBTVAtU0lERUJBUicsIG1ldGhvZDogJ29wZW4nfSxcbiAgICAgIHt0YWdPclRhcmdldDogJ0FNUC1TSURFQkFSJywgbWV0aG9kOiAnY2xvc2UnfSxcbiAgICAgIHt0YWdPclRhcmdldDogJ0FNUC1TSURFQkFSJywgbWV0aG9kOiAndG9nZ2xlJ30sXG4gICAgXTtcbiAgICB0aGlzLnN0b3JlU2VydmljZV8uZGlzcGF0Y2goQWN0aW9uLkFERF9UT19BQ1RJT05TX0FMTE9XTElTVCwgYWN0aW9ucyk7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tzIGZvciB0aGUgdGhlIHN0b3J5TmF2aWdhdGlvblBhdGggc3RhY2sgaW4gdGhlIGhpc3RvcnkuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBpbml0aWFsaXplU3RvcnlOYXZpZ2F0aW9uUGF0aF8oKSB7XG4gICAgbGV0IG5hdmlnYXRpb25QYXRoID0gZ2V0SGlzdG9yeVN0YXRlKFxuICAgICAgdGhpcy53aW4sXG4gICAgICBIaXN0b3J5U3RhdGUuTkFWSUdBVElPTl9QQVRIXG4gICAgKTtcbiAgICBpZiAoXG4gICAgICAhbmF2aWdhdGlvblBhdGggfHxcbiAgICAgICFuYXZpZ2F0aW9uUGF0aC5ldmVyeSgocGFnZUlkKSA9PiB0aGlzLmlzQWN0dWFsUGFnZV8ocGFnZUlkKSlcbiAgICApIHtcbiAgICAgIG5hdmlnYXRpb25QYXRoID0gW107XG4gICAgfVxuICAgIHRoaXMuc3RvcmVTZXJ2aWNlXy5kaXNwYXRjaChBY3Rpb24uU0VUX05BVklHQVRJT05fUEFUSCwgbmF2aWdhdGlvblBhdGgpO1xuICB9XG5cbiAgLyoqIEBwcml2YXRlICovXG4gIHJlcGxheV8oKSB7XG4gICAgdGhpcy5zdG9yZVNlcnZpY2VfLmRpc3BhdGNoKEFjdGlvbi5TRVRfTkFWSUdBVElPTl9QQVRILCBbXSk7XG4gICAgY29uc3Qgc3dpdGNoUHJvbWlzZSA9IHRoaXMuc3dpdGNoVG9fKFxuICAgICAgZGV2KCkuYXNzZXJ0RWxlbWVudCh0aGlzLnBhZ2VzX1swXS5lbGVtZW50KS5pZCxcbiAgICAgIE5hdmlnYXRpb25EaXJlY3Rpb24uTkVYVFxuICAgICk7XG4gICAgLy8gUmVzdGFydCBwYWdlIG1lZGlhLCBhZHZhbmNlbWVudHMsIGV0YyAoIzI3NzQyKS5cbiAgICBpZiAodGhpcy5wYWdlc18ubGVuZ3RoID09PSAxKSB7XG4gICAgICB0aGlzLnBhZ2VzX1swXS5zZXRTdGF0ZShQYWdlU3RhdGUuTk9UX0FDVElWRSk7XG4gICAgICB0aGlzLnBhZ2VzX1swXS5zZXRTdGF0ZShQYWdlU3RhdGUuUExBWUlORyk7XG4gICAgfVxuXG4gICAgLy8gUmVzZXQgYWxsIHBhZ2VzIHNvIHRoYXQgdGhleSBhcmUgb2Zmc2NyZWVuIHRvIHJpZ2h0IGluc3RlYWQgb2YgbGVmdCBpblxuICAgIC8vIGRlc2t0b3Agdmlldy5cbiAgICBzd2l0Y2hQcm9taXNlLnRoZW4oKCkgPT4ge1xuICAgICAgdGhpcy5wYWdlc18uZm9yRWFjaCgocGFnZSkgPT5cbiAgICAgICAgcmVtb3ZlQXR0cmlidXRlSW5NdXRhdGUocGFnZSwgQXR0cmlidXRlcy5WSVNJVEVEKVxuICAgICAgKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0geyFBbXBTdG9yeVBhZ2V9IHBhZ2UgVGhlIHBhZ2Ugd2hvc2UgQ1RBIGFuY2hvciB0YWdzIHNob3VsZCBiZVxuICAgKiAgICAgdXBncmFkZWQuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBwYWdlSW5kZXggVGhlIGluZGV4IG9mIHRoZSBwYWdlLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgdXBncmFkZUN0YUFuY2hvclRhZ3NGb3JUcmFja2luZ18ocGFnZSwgcGFnZUluZGV4KSB7XG4gICAgdGhpcy5tdXRhdGVFbGVtZW50KCgpID0+IHtcbiAgICAgIGNvbnN0IHBhZ2VJZCA9IHBhZ2UuZWxlbWVudC5pZDtcbiAgICAgIGNvbnN0IGN0YUFuY2hvckVscyA9IHNjb3BlZFF1ZXJ5U2VsZWN0b3JBbGwoXG4gICAgICAgIHBhZ2UuZWxlbWVudCxcbiAgICAgICAgJ2FtcC1zdG9yeS1jdGEtbGF5ZXIgYSdcbiAgICAgICk7XG5cbiAgICAgIEFycmF5LnByb3RvdHlwZS5mb3JFYWNoLmNhbGwoY3RhQW5jaG9yRWxzLCAoY3RhQW5jaG9yRWwpID0+IHtcbiAgICAgICAgY3RhQW5jaG9yRWwuc2V0QXR0cmlidXRlKCdkYXRhLXZhcnMtc3RvcnktcGFnZS1pZCcsIHBhZ2VJZCk7XG4gICAgICAgIGN0YUFuY2hvckVsLnNldEF0dHJpYnV0ZSgnZGF0YS12YXJzLXN0b3J5LXBhZ2UtaW5kZXgnLCBwYWdlSW5kZXgpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQWRkIHBhZ2UgdG8gYmFjayBvZiBwYWdlc18gYXJyYXlcbiAgICogQHBhcmFtIHshLi9hbXAtc3RvcnktcGFnZS5BbXBTdG9yeVBhZ2V9IHBhZ2VcbiAgICovXG4gIGFkZFBhZ2UocGFnZSkge1xuICAgIHRoaXMucGFnZXNfLnB1c2gocGFnZSk7XG5cbiAgICBpZiAocGFnZS5pc0FkKCkpIHtcbiAgICAgIHRoaXMuYWRQYWdlc18ucHVzaChwYWdlKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogSW5zZXJ0IGEgbmV3IHBhZ2UgaW4gbmF2aWdhdGlvbiBmbG93IGJ5IGNoYW5naW5nIHRoZSBhdHRyIHBvaW50ZXJzXG4gICAqIG9uIGFtcC1zdG9yeS1wYWdlIGVsZW1lbnRzXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBwYWdlQmVmb3JlSWRcbiAgICogQHBhcmFtIHtzdHJpbmd9IHBhZ2VUb0JlSW5zZXJ0ZWRJZFxuICAgKiBAcmV0dXJuIHtib29sZWFufSB3YXMgcGFnZSBpbnNlcnRlZFxuICAgKi9cbiAgaW5zZXJ0UGFnZShwYWdlQmVmb3JlSWQsIHBhZ2VUb0JlSW5zZXJ0ZWRJZCkge1xuICAgIC8vIFRPRE8oY2NvcmRyeSk6IG1ha2Ugc3VyZSB0aGlzIG1ldGhvZCBtb3ZlcyB0byBQYWdlTWFuYWdlciB3aGVuXG4gICAgLy8gaW1wbGVtZW50ZWRcbiAgICBjb25zdCBwYWdlVG9CZUluc2VydGVkID0gdGhpcy5nZXRQYWdlQnlJZChwYWdlVG9CZUluc2VydGVkSWQpO1xuICAgIGNvbnN0IHBhZ2VUb0JlSW5zZXJ0ZWRFbCA9IHBhZ2VUb0JlSW5zZXJ0ZWQuZWxlbWVudDtcblxuICAgIGlmIChcbiAgICAgIHBhZ2VUb0JlSW5zZXJ0ZWQuaXNBZCgpICYmXG4gICAgICAhdGhpcy5zdG9yZVNlcnZpY2VfLmdldChTdGF0ZVByb3BlcnR5LkNBTl9JTlNFUlRfQVVUT01BVElDX0FEKVxuICAgICkge1xuICAgICAgZGV2KCkuZXhwZWN0ZWRFcnJvcihUQUcsICdJbnNlcnRpbmcgYWRzIGF1dG9tYXRpY2FsbHkgaXMgZGlzYWxsb3dlZC4nKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBjb25zdCBwYWdlQmVmb3JlID0gdGhpcy5nZXRQYWdlQnlJZChwYWdlQmVmb3JlSWQpO1xuICAgIGNvbnN0IHBhZ2VCZWZvcmVFbCA9IHBhZ2VCZWZvcmUuZWxlbWVudDtcblxuICAgIGNvbnN0IG5leHRQYWdlID0gdGhpcy5nZXROZXh0UGFnZShwYWdlQmVmb3JlKTtcblxuICAgIGlmICghbmV4dFBhZ2UpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBjb25zdCBhZHZhbmNlQXR0ciA9IGlzRXhwZXJpbWVudE9uKHRoaXMud2luLCAnYW1wLXN0b3J5LWJyYW5jaGluZycpXG4gICAgICA/IEF0dHJpYnV0ZXMuUFVCTElDX0FEVkFOQ0VfVE9cbiAgICAgIDogQXR0cmlidXRlcy5BRFZBTkNFX1RPO1xuXG4gICAgcGFnZUJlZm9yZUVsLnNldEF0dHJpYnV0ZShhZHZhbmNlQXR0ciwgcGFnZVRvQmVJbnNlcnRlZElkKTtcbiAgICBwYWdlQmVmb3JlRWwuc2V0QXR0cmlidXRlKEF0dHJpYnV0ZXMuQVVUT19BRFZBTkNFX1RPLCBwYWdlVG9CZUluc2VydGVkSWQpO1xuICAgIHBhZ2VUb0JlSW5zZXJ0ZWRFbC5zZXRBdHRyaWJ1dGUoQXR0cmlidXRlcy5SRVRVUk5fVE8sIHBhZ2VCZWZvcmVJZCk7XG5cbiAgICBjb25zdCBuZXh0UGFnZUVsID0gbmV4dFBhZ2UuZWxlbWVudDtcbiAgICBjb25zdCBuZXh0UGFnZUlkID0gbmV4dFBhZ2VFbC5pZDtcbiAgICAvLyBGb3IgYSBsaXZlIHN0b3J5LCBuZXh0UGFnZSBpcyB0aGUgc2FtZSBhcyBwYWdlVG9CZUluc2VydGVkLiBCdXQgbm90IGZvclxuICAgIC8vIGFkcyBzaW5jZSBpdCdzIGluc2VydGVkIGJldHdlZW4gdHdvIHBhZ2VzLlxuICAgIGlmIChuZXh0UGFnZUlkICE9PSBwYWdlVG9CZUluc2VydGVkSWQpIHtcbiAgICAgIHBhZ2VUb0JlSW5zZXJ0ZWRFbC5zZXRBdHRyaWJ1dGUoYWR2YW5jZUF0dHIsIG5leHRQYWdlSWQpO1xuICAgICAgcGFnZVRvQmVJbnNlcnRlZEVsLnNldEF0dHJpYnV0ZShBdHRyaWJ1dGVzLkFVVE9fQURWQU5DRV9UTywgbmV4dFBhZ2VJZCk7XG4gICAgICBuZXh0UGFnZUVsLnNldEF0dHJpYnV0ZShBdHRyaWJ1dGVzLlJFVFVSTl9UTywgcGFnZVRvQmVJbnNlcnRlZElkKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgbmV4dCBwYWdlIG9iamVjdFxuICAgKiBAcGFyYW0geyEuL2FtcC1zdG9yeS1wYWdlLkFtcFN0b3J5UGFnZX0gcGFnZVxuICAgKiBAcmV0dXJuIHs/Li9hbXAtc3RvcnktcGFnZS5BbXBTdG9yeVBhZ2V9XG4gICAqL1xuICBnZXROZXh0UGFnZShwYWdlKSB7XG4gICAgY29uc3QgbmV4dFBhZ2VJZCA9IHBhZ2UuZ2V0TmV4dFBhZ2VJZCh0cnVlIC8qb3B0X2lzQXV0b21hdGljQWR2YW5jZSAqLyk7XG4gICAgaWYgKCFuZXh0UGFnZUlkKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZ2V0UGFnZUJ5SWQobmV4dFBhZ2VJZCk7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHshV2luZG93fSB3aW5cbiAgICogQHJldHVybiB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGUgdXNlcidzIGJyb3dzZXIgc3VwcG9ydHMgdGhlIGZlYXR1cmVzIG5lZWRlZFxuICAgKiAgICAgZm9yIGFtcC1zdG9yeS5cbiAgICovXG4gIHN0YXRpYyBpc0Jyb3dzZXJTdXBwb3J0ZWQod2luKSB7XG4gICAgcmV0dXJuIEJvb2xlYW4oXG4gICAgICB3aW4uQ1NTICYmXG4gICAgICAgIHdpbi5DU1Muc3VwcG9ydHMgJiZcbiAgICAgICAgd2luLkNTUy5zdXBwb3J0cygnZGlzcGxheScsICdncmlkJykgJiZcbiAgICAgICAgd2luLkNTUy5zdXBwb3J0cygnY29sb3InLCAndmFyKC0tdGVzdCknKVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogTG9hZHMgYW1wLXN0b3J5LWRldi10b29scyBpZiBpdCBpcyBlbmFibGVkLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgbWF5YmVMb2FkU3RvcnlEZXZUb29sc18oKSB7XG4gICAgaWYgKFxuICAgICAgIWlzTW9kZURldmVsb3BtZW50KHRoaXMud2luKSB8fFxuICAgICAgdGhpcy5lbGVtZW50LmdldEF0dHJpYnV0ZSgnbW9kZScpID09PSAnaW5zcGVjdCdcbiAgICApIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICB0aGlzLmVsZW1lbnQuc2V0QXR0cmlidXRlKCdtb2RlJywgJ2luc3BlY3QnKTtcblxuICAgIGNvbnN0IGRldlRvb2xzRWwgPSB0aGlzLndpbi5kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhbXAtc3RvcnktZGV2LXRvb2xzJyk7XG4gICAgdGhpcy53aW4uZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChkZXZUb29sc0VsKTtcbiAgICB0aGlzLmVsZW1lbnQuc2V0QXR0cmlidXRlKCdoaWRlJywgJycpO1xuXG4gICAgU2VydmljZXMuZXh0ZW5zaW9uc0Zvcih0aGlzLndpbikuaW5zdGFsbEV4dGVuc2lvbkZvckRvYyhcbiAgICAgIHRoaXMuZ2V0QW1wRG9jKCksXG4gICAgICAnYW1wLXN0b3J5LWRldi10b29scydcbiAgICApO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIFNob3VsZCBlbmFibGUgdGhlIGNvbnRleHQgbWVudSAobG9uZyBwcmVzcykgb24gdGhlIGVsZW1lbnQgcGFzc2VkLlxuICAgKiBAcHJpdmF0ZVxuICAgKiBAcGFyYW0geyFFbGVtZW50fSBlbGVtZW50XG4gICAqIEByZXR1cm4ge2Jvb2xlYW59XG4gICAqL1xuICBhbGxvd0NvbnRleHRNZW51T25Nb2JpbGVfKGVsZW1lbnQpIHtcbiAgICAvLyBNYXRjaCBwYWdlIGF0dGFjaG1lbnRzIHdpdGggbGlua3MuXG4gICAgcmV0dXJuICEhY2xvc2VzdChcbiAgICAgIGVsZW1lbnQsXG4gICAgICAoZSkgPT4gbWF0Y2hlcyhlLCAnYS5pLWFtcGh0bWwtc3RvcnktcGFnZS1vcGVuLWF0dGFjaG1lbnRbaHJlZl0nKSxcbiAgICAgIHRoaXMuZWxlbWVudFxuICAgICk7XG4gIH1cbn1cblxuQU1QLmV4dGVuc2lvbignYW1wLXN0b3J5JywgJzEuMCcsIChBTVApID0+IHtcbiAgQU1QLnJlZ2lzdGVyRWxlbWVudCgnYW1wLXN0b3J5JywgQW1wU3RvcnksIENTUyk7XG4gIEFNUC5yZWdpc3RlckVsZW1lbnQoJ2FtcC1zdG9yeS1hY2Nlc3MnLCBBbXBTdG9yeUFjY2Vzcyk7XG4gIEFNUC5yZWdpc3RlckVsZW1lbnQoJ2FtcC1zdG9yeS1jb25zZW50JywgQW1wU3RvcnlDb25zZW50KTtcbiAgQU1QLnJlZ2lzdGVyRWxlbWVudCgnYW1wLXN0b3J5LWN0YS1sYXllcicsIEFtcFN0b3J5Q3RhTGF5ZXIpO1xuICBBTVAucmVnaXN0ZXJFbGVtZW50KCdhbXAtc3RvcnktZ3JpZC1sYXllcicsIEFtcFN0b3J5R3JpZExheWVyKTtcbiAgQU1QLnJlZ2lzdGVyRWxlbWVudCgnYW1wLXN0b3J5LXBhZ2UnLCBBbXBTdG9yeVBhZ2UpO1xuICBBTVAucmVnaXN0ZXJFbGVtZW50KCdhbXAtc3RvcnktcGFnZS1hdHRhY2htZW50JywgQW1wU3RvcnlQYWdlQXR0YWNobWVudCk7XG4gIEFNUC5yZWdpc3RlckVsZW1lbnQoJ2FtcC1zdG9yeS1wYWdlLW91dGxpbmsnLCBBbXBTdG9yeVBhZ2VBdHRhY2htZW50KTsgLy8gU2hhcmVzIGNvZGVwYXRoIHdpdGggYW1wLXN0b3J5LXBhZ2UtYXR0YWNobWVudC5cbiAgQU1QLnJlZ2lzdGVyU2VydmljZUZvckRvYygnYW1wLXN0b3J5LXJlbmRlcicsIEFtcFN0b3J5UmVuZGVyU2VydmljZSk7XG59KTtcbiJdfQ==
// /Users/mszylkowski/src/amphtml/extensions/amp-story/1.0/amp-story.js