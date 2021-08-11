function _typeof(obj) {"@babel/helpers - typeof";if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {_typeof = function _typeof(obj) {return typeof obj;};} else {_typeof = function _typeof(obj) {return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;};}return _typeof(obj);}import { resolvedPromise as _resolvedPromise5 } from "./../../../src/core/data-structures/promise";import { resolvedPromise as _resolvedPromise4 } from "./../../../src/core/data-structures/promise";import { resolvedPromise as _resolvedPromise3 } from "./../../../src/core/data-structures/promise";import { resolvedPromise as _resolvedPromise2 } from "./../../../src/core/data-structures/promise";import { resolvedPromise as _resolvedPromise } from "./../../../src/core/data-structures/promise";var _MAX_MEDIA_ELEMENT_CO;function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;}function _inherits(subClass, superClass) {if (typeof superClass !== "function" && superClass !== null) {throw new TypeError("Super expression must either be null or a function");}subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } });if (superClass) _setPrototypeOf(subClass, superClass);}function _setPrototypeOf(o, p) {_setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {o.__proto__ = p;return o;};return _setPrototypeOf(o, p);}function _createSuper(Derived) {var hasNativeReflectConstruct = _isNativeReflectConstruct();return function _createSuperInternal() {var Super = _getPrototypeOf(Derived),result;if (hasNativeReflectConstruct) {var NewTarget = _getPrototypeOf(this).constructor;result = Reflect.construct(Super, arguments, NewTarget);} else {result = Super.apply(this, arguments);}return _possibleConstructorReturn(this, result);};}function _possibleConstructorReturn(self, call) {if (call && (_typeof(call) === "object" || typeof call === "function")) {return call;}return _assertThisInitialized(self);}function _assertThisInitialized(self) {if (self === void 0) {throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return self;}function _isNativeReflectConstruct() {if (typeof Reflect === "undefined" || !Reflect.construct) return false;if (Reflect.construct.sham) return false;if (typeof Proxy === "function") return true;try {Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));return true;} catch (e) {return false;}}function _getPrototypeOf(o) {_getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {return o.__proto__ || Object.getPrototypeOf(o);};return _getPrototypeOf(o);}function _defineProperty(obj, key, value) {if (key in obj) {Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });} else {obj[key] = value;}return obj;} /**
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
import {
Action,
EmbeddedComponentState,
InteractiveComponentDef,
StateProperty,
UIType,
getStoreService } from "./amp-story-store-service";

import { ActionTrust } from "../../../src/core/constants/action-constants";
import { AdvancementConfig, TapNavigationDirection } from "./page-advancement";
import {
AdvancementMode,
StoryAnalyticsEvent,
getAnalyticsService } from "./story-analytics";

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
import {
childElement,
childElementByTag,
childElements,
childNodes,
closest,
matches,
scopedQuerySelector,
scopedQuerySelectorAll } from "../../../src/core/dom/query";

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
import {
removeAttributeInMutate,
setAttributeInMutate,
shouldShowStoryUrlInfo } from "./utils";

import { upgradeBackgroundAudio } from "./audio";
import { whenUpgradedToCustomElement } from "../../../src/amp-element-helpers";var
LocalizedStringsAr = JSON.parse("{\"2\":{\"string\":\"\u0627\u0646\u0642\u0631 \u0639\u0644\u0649 \\\"\u0627\u0644\u062A\u0627\u0644\u064A\\\"\"},\"3\":{\"string\":\"\u0627\u0646\u0642\u0631 \u0639\u0644\u0649 \\\"\u0631\u062C\u0648\u0639\\\"\"},\"4\":{\"string\":\"\u062A\u0639\u0630\u0651\u0631 \u0646\u0633\u062E \u0627\u0644\u0631\u0627\u0628\u0637 \u0625\u0644\u0649 \u0627\u0644\u062D\u0627\u0641\u0638\u0629 :(\"},\"5\":{\"string\":\"\u062A\u0645\u0651 \u0646\u0633\u062E \u0627\u0644\u0631\u0627\u0628\u0637.\"},\"6\":{\"string\":\"\u0627\u0644\u0628\u0631\u064A\u062F \u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A\"},\"7\":{\"string\":\"Facebook\"},\"8\":{\"string\":\"+Google\"},\"9\":{\"string\":\"\u0627\u0644\u062D\u0635\u0648\u0644 \u0639\u0644\u0649 \u0627\u0644\u0631\u0627\u0628\u0637\"},\"10\":{\"string\":\"LinkedIn\"},\"11\":{\"string\":\"Pinterest\"},\"12\":{\"string\":\"SMS\"},\"14\":{\"string\":\"Tumblr\"},\"15\":{\"string\":\"Twitter\"},\"16\":{\"string\":\"WhatsApp\"},\"18\":{\"string\":\"\u064A\u0645\u0643\u0646\u0643 \u062A\u0648\u0633\u064A\u0639 \u0627\u0644\u0646\u0627\u0641\u0630\u0629 \u0637\u0648\u0644\u0627\u064B \u0648\u0639\u0631\u0636\u064B\u0627 \u0644\u0627\u0633\u062A\u0639\u0631\u0627\u0636 \u0647\u0630\u0647 \u0627\u0644\u062A\u062C\u0631\u0628\u0629.\"},\"19\":{\"string\":\"\u064A\u062C\u0628 \u062A\u0641\u0639\u064A\u0644 \u062A\u062C\u0631\u0628\u0629 \u0633\u062C\u0644\u0651 AMP \u0644\u0639\u0631\u0636 \u0647\u0630\u0627 \u0627\u0644\u0645\u062D\u062A\u0648\u0649.\"},\"20\":{\"string\":\"\u0644\u0644\u062D\u0635\u0648\u0644 \u0639\u0644\u0649 \u0623\u0641\u0636\u0644 \u0639\u0631\u0636\u060C \u064A\u0645\u0643\u0646 \u0627\u0633\u062A\u0639\u0631\u0627\u0636 \u0627\u0644\u0635\u0641\u062D\u0629 \u0641\u064A \u0627\u0644\u0648\u0636\u0639 \u0627\u0644\u0631\u0623\u0633\u064A.\"},\"21\":{\"string\":\"\u0639\u0630\u0631\u064B\u0627\u060C \u064A\u0628\u062F\u0648 \u0623\u0646 \u0645\u062A\u0635\u0641\u0651\u062D\u0643 \u0644\u0627 \u064A\u0648\u0641\u0651\u0631 \u0647\u0630\u0647 \u0627\u0644\u062A\u062C\u0631\u0628\u0629.\"},\"22\":{\"string\":\"\u0642\u0628\u0648\u0644\"},\"23\":{\"string\":\"\u0631\u0641\u0636\"},\"25\":{\"string\":\"\u0627\u0644\u0639\u0631\u0636 \u0639\u0644\u0649 \u0627\u0644\u0646\u0637\u0627\u0642 \u0627\u0644\u0623\u0635\u0644\u064A:\"},\"26\":{\"string\":\"\u0627\u0644\u0645\u0632\u064A\u062F \u0639\u0646 \u0646\u062A\u0627\u0626\u062C AMP\"},\"27\":{\"string\":\"\u0627\u0644\u0645\u062A\u0627\u0628\u0639\u0629 \u0639\u0644\u0649 \u0623\u064A \u062D\u0627\u0644\"},\"31\":{\"string\":\"\u0625\u064A\u0642\u0627\u0641 \u0627\u0644\u0635\u0648\u062A\"},\"32\":{\"string\":\"\u062A\u0645 \u062A\u0641\u0639\u064A\u0644 \u0627\u0644\u0635\u0648\u062A\"},\"33\":{\"string\":\"\u0644\u0627 \u062A\u062D\u062A\u0648\u064A \u0647\u0630\u0647 \u0627\u0644\u0635\u0641\u062D\u0629 \u0639\u0644\u0649 \u0623\u064A \u0645\u062D\u062A\u0648\u0649 \u0635\u0648\u062A\u064A\"},\"34\":{\"string\":\"\u062A\u0634\u063A\u064A\u0644 \u0627\u0644\u0641\u064A\u062F\u064A\u0648\"},\"35\":{\"string\":\"\u0627\u0644\u062A\u0645\u0631\u064A\u0631 \u0633\u0631\u064A\u0639\u064B\u0627 \u0644\u0623\u0639\u0644\u0649\"},\"36\":{\"string\":\"\u062A\u0648\u0633\u064A\u0639 \u0627\u0644\u062A\u063A\u0631\u064A\u062F\u0629\"},\"37\":{\"string\":\"\u064A\u0645\u0643\u0646\u0643 \u062A\u0648\u0633\u064A\u0639 \u0627\u0644\u0646\u0627\u0641\u0630\u0629 \u0637\u0648\u0644\u0627\u064B \u0644\u0627\u0633\u062A\u0639\u0631\u0627\u0636 \u0647\u0630\u0647 \u0627\u0644\u062A\u062C\u0631\u0628\u0629.\"},\"38\":{\"string\":\"\u064A\u0645\u0643\u0646\u0643 \u062A\u0648\u0633\u064A\u0639 \u0627\u0644\u0646\u0627\u0641\u0630\u0629 \u0639\u0631\u0636\u064B\u0627 \u0644\u0627\u0633\u062A\u0639\u0631\u0627\u0636 \u0647\u0630\u0647 \u0627\u0644\u062A\u062C\u0631\u0628\u0629.\"},\"63\":{\"string\":\"Line\"}}"); // lgtm[js/syntax-error]
var LocalizedStringsDe = JSON.parse("{\"2\":{\"string\":\"Auf \\\"Weiter\\\" tippen\"},\"3\":{\"string\":\"Auf \\\"Zur\xFCck\\\" tippen\"},\"4\":{\"string\":\"Der Link konnte nicht in die Zwischenablage kopiert werden\"},\"5\":{\"string\":\"Link kopiert.\"},\"6\":{\"string\":\"E-Mail\"},\"7\":{\"string\":\"Facebook\"},\"8\":{\"string\":\"Google+\"},\"9\":{\"string\":\"Link abrufen\"},\"10\":{\"string\":\"LinkedIn\"},\"11\":{\"string\":\"Pinterest\"},\"12\":{\"string\":\"SMS\"},\"14\":{\"string\":\"Tumblr\"},\"15\":{\"string\":\"Twitter\"},\"16\":{\"string\":\"WhatsApp\"},\"18\":{\"string\":\"Maximiere die H\xF6he und Breite deines Fensters, um diese Funktion nutzen zu k\xF6nnen\"},\"19\":{\"string\":\"Wenn du diesen Inhalt aufrufen m\xF6chtest, musst du den amp-story-Test aktivieren.\"},\"20\":{\"string\":\"Diese Seite l\xE4sst sich am besten im Hochformat ansehen\"},\"21\":{\"string\":\"Dein aktueller Browser unterst\xFCtzt diese Funktion leider nicht.\"},\"22\":{\"string\":\"Annehmen\"},\"23\":{\"string\":\"Ablehnen\"},\"25\":{\"string\":\"In urspr\xFCnglicher Domain ansehen:\"},\"26\":{\"string\":\"Weitere Informationen zu AMP-Ergebnissen\"},\"27\":{\"string\":\"Trotzdem fortfahren\"},\"31\":{\"string\":\"Ton aus\"},\"32\":{\"string\":\"Ton an\"},\"33\":{\"string\":\"Diese Seite hat keinen Ton\"},\"34\":{\"string\":\"Video abspielen\"},\"35\":{\"string\":\"Nach oben wischen\"},\"36\":{\"string\":\"Tweet maximieren\"},\"37\":{\"string\":\"Maximiere die H\xF6he deines Fensters, um diese Funktion nutzen zu k\xF6nnen\"},\"38\":{\"string\":\"Maximiere die Breite deines Fensters, um diese Funktion nutzen zu k\xF6nnen\"},\"63\":{\"string\":\"Line\"}}"); // lgtm[js/syntax-error]
var LocalizedStringsDefault = JSON.parse("{\"4\":{\"string\":\":(\"},\"18\":{\"string\":\"Expand both the height and width of your window to view this experience\"},\"19\":{\"string\":\"You must enable the amp-story experiment to view this content.\"},\"20\":{\"string\":\"The page is best viewed in portrait mode\"},\"21\":{\"string\":\"We're sorry, it looks like your browser doesn't support this experience\"},\"22\":{\"string\":\"Accept\"},\"23\":{\"string\":\"Decline\"},\"25\":{\"string\":\"View on original domain:\"},\"26\":{\"string\":\"More about AMP results\"},\"27\":{\"string\":\"Continue Anyway\"},\"31\":{\"string\":\"Sound off\"},\"32\":{\"string\":\"Sound on\"},\"33\":{\"string\":\"This page has no sound\"},\"37\":{\"string\":\"Expand the height of your window to view this experience\"},\"38\":{\"string\":\"Expand the width of your window to view this experience\"},\"64\":{\"string\":\"Updated\"},\"71\":{\"string\":\"A\"},\"72\":{\"string\":\"B\"},\"73\":{\"string\":\"C\"},\"74\":{\"string\":\"D\"},\"75\":{\"string\":\"Tip 1 of 2\"},\"76\":{\"string\":\"Tap to go to the next screen\"},\"77\":{\"string\":\"Next\"},\"78\":{\"string\":\"Tip 2 of 2\"},\"79\":{\"string\":\"Swipe to go to the next story\"},\"80\":{\"string\":\"Got it\"},\"81\":{\"string\":\"Tip\"},\"84\":{\"string\":\"SCORE:\"},\"85\":{\"string\":\"Pause\"},\"86\":{\"string\":\"Play\"},\"89\":{\"string\":\"Your response will be sent to\"},\"96\":{\"string\":\"Move device to explore\"}}"); // lgtm[js/syntax-error]
var LocalizedStringsEn = JSON.parse("{\"2\":{\"string\":\"Tap Next\",\"description\":\"Label indicating that users can navigate to the next page, in the amp-story hint UI.\"},\"3\":{\"string\":\"Tap Back\",\"description\":\"Label indicating that users can navigate to the previous page, in the amp-story hint UI.\"},\"4\":{\"string\":\"Could not copy link to clipboard :(\",\"description\":\"String shown in a failure message to inform the user that a link could not be successfully copied to their clipboard.\"},\"5\":{\"string\":\"Link copied!\",\"description\":\"String shown in a confirmation message to inform the user that a link was successfully copied to their clipboard.\"},\"6\":{\"string\":\"Email\",\"description\":\"Button label for the share target that shares a link via email.\"},\"7\":{\"string\":\"Facebook\",\"description\":\"Button label for the share target that shares a link via Facebook.\"},\"8\":{\"string\":\"Google+\",\"description\":\"Button label for the share target that shares a link via Google+.\"},\"9\":{\"string\":\"Get Link\",\"description\":\"Button label for the share target that shares a link via by copying it to the user's clipboard.\"},\"10\":{\"string\":\"LinkedIn\",\"description\":\"Button label for the share target that shares a link via LinkedIn.\"},\"11\":{\"string\":\"Pinterest\",\"description\":\"Button label for the share target that shares a link via Pinterest.\"},\"12\":{\"string\":\"SMS\",\"description\":\"Button label for the share target that shares a link via SMS.\"},\"13\":{\"string\":\"More\",\"description\":\"Button label for the share target that shares a link via deferral to the operating system's native sharing handler.\"},\"14\":{\"string\":\"Tumblr\",\"description\":\"Button label for the share target that shares a link via Tumblr.\"},\"15\":{\"string\":\"Twitter\",\"description\":\"Button label for the share target that shares a link via Twitter.\"},\"16\":{\"string\":\"WhatsApp\",\"description\":\"Button label for the share target that shares a link via WhatsApp.\"},\"18\":{\"string\":\"Expand both the height and width of your window to view this experience\",\"description\":\"Text for a warning screen that informs the user that stories are only supported in larger browser windows.\"},\"19\":{\"string\":\"You must enable the amp-story experiment to view this content.\",\"description\":\"Text for a warning screen that informs the user that they must enable an experiment to use stories.\"},\"20\":{\"string\":\"The page is best viewed in portrait mode\",\"description\":\"Text for a warning screen that informs the user that stories are only supported in portrait orientation.\"},\"21\":{\"string\":\"We're sorry, it looks like your browser doesn't support this experience\",\"description\":\"Text for a warning screen that informs the user that their browser does not support stories.\"},\"22\":{\"string\":\"Accept\",\"description\":\"Label for a button that allows the user to consent to providing their cookie access.\"},\"23\":{\"string\":\"Decline\",\"description\":\"Label for a button that allows the user to disconsent to providing their cookie access.\"},\"25\":{\"string\":\"View on original domain:\",\"description\":\"Label for a heading of a dialog that shows the user the domain from which the story is served.\"},\"26\":{\"string\":\"More about AMP results\",\"description\":\"Label for a link to documentation on how AMP links are handled.\"},\"27\":{\"string\":\"Continue Anyway\",\"description\":\"Button label to allow the user to continue even if they are not using a supportive browser.\"},\"31\":{\"string\":\"Sound off\",\"description\":\"Text that informs users that the sound is off after they click the mute button\"},\"32\":{\"string\":\"Sound on\",\"description\":\"Text that informs users that the sound is on after they click the unmute button on a page with sound\"},\"33\":{\"string\":\"This page has no sound\",\"description\":\"Text that informs users that the sound is on after they click the unmute button on a page without sound\"},\"34\":{\"string\":\"Play video\",\"description\":\"Label for a button to play the video visible on the page.\"},\"35\":{\"string\":\"Swipe up\",\"description\":\"Label for a button to open a drawer containing additional content via a \\\"swipe up\\\" user gesture.\"},\"36\":{\"string\":\"Expand Tweet\",\"description\":\"Label in the tooltip text for when a Twitter embed is expandable.\"},\"37\":{\"string\":\"Expand the height of your window to view this experience\",\"description\":\"Text for a warning screen that informs the user that stories are only supported in taller browser windows.\"},\"38\":{\"string\":\"Expand the width of your window to view this experience\",\"description\":\"Text for a warning screen that informs the user that stories are only supported in wider browser windows.\"},\"62\":{\"string\":\"Share starting from this page\",\"description\":\"Checkbox label when the branching experiment is turned on  and the story is in landscape mode; checking the checkbox lets the user share the story from the current page.\"},\"63\":{\"string\":\"Line\",\"description\":\"Button label for the share target that shares a link via Line.\"},\"64\":{\"string\":\"Updated\",\"description\":\"Label that indicates that additional content has been added to a story\"},\"65\":{\"string\":\"Video failed to play\",\"description\":\"Label indicating that the video visible on the page failed to play.\"},\"66\":{\"string\":\"Mute story\",\"description\":\"Label for the mute button that turns off the sound in the story\"},\"67\":{\"string\":\"Unmute story\",\"description\":\"Label for the unmute button that turns the sound in the story back on\"},\"68\":{\"string\":\"Story information\",\"description\":\"Label for the information button that pulls up relevant information about the story content\"},\"69\":{\"string\":\"Share story\",\"description\":\"Label for the share button that pulls up a panel of options for sharing the story\"},\"70\":{\"string\":\"Toggle story menu\",\"description\":\"Label for the sidebar button that pulls up a menu of options for interacting with the story\"},\"71\":{\"string\":\"A\",\"description\":\"Label for the first answer choice from a multiple choice quiz (e.g. A in A/B/C/D)\"},\"72\":{\"string\":\"B\",\"description\":\"Label for the second answer choice from a multiple choice quiz (e.g. B in A/B/C/D)\"},\"73\":{\"string\":\"C\",\"description\":\"Label for the third answer choice from a multiple choice quiz (e.g. C in A/B/C/D)\"},\"74\":{\"string\":\"D\",\"description\":\"Label for the fourth answer choice from a multiple choice quiz (e.g. D in A/B/C/D)\"},\"75\":{\"string\":\"Tip 1 of 2\",\"description\":\"Label for a hint indicating progress on a multistep onboarding user education tutorial.\"},\"76\":{\"string\":\"Tap to go to the next screen\",\"description\":\"Instruction on how to use the product, within an onboarding user education tutorial.\"},\"77\":{\"string\":\"Next\",\"description\":\"Label for a button dismissing or advancing to the next step of an onboarding user education tutorial.\"},\"78\":{\"string\":\"Tip 2 of 2\",\"description\":\"Label for a hint indicating progress on a multistep onboarding user education tutorial.\"},\"79\":{\"string\":\"Swipe to go to the next story\",\"description\":\"Instruction on how to use the product, within an onboarding user education tutorial.\"},\"80\":{\"string\":\"Got it\",\"description\":\"Label for a button dismissing or advancing to the next step of an onboarding user education tutorial.\"},\"81\":{\"string\":\"Tip\",\"description\":\"Label for a hint in the context of an onboarding user education tutorial.\"},\"82\":{\"string\":\"Previous page\",\"description\":\"Label indicating that users can navigate to the previous page.\"},\"83\":{\"string\":\"Activate\",\"description\":\"Label for the activate button to ask for device orientation permission\"},\"84\":{\"string\":\"SCORE:\",\"description\":\"Label for the results component preceding the score in percentages\"},\"85\":{\"string\":\"Pause story\",\"description\":\"Label for a button that pauses the media content on the story\"},\"86\":{\"string\":\"Play story\",\"description\":\"Label for a button that plays the media content on the story\"},\"87\":{\"string\":\"Close\",\"description\":\"Label for a button that closes the full page experience and takes the user back to where they were originally\"},\"88\":{\"string\":\"Skip next\",\"description\":\"Label for a button that advances to the next element in the carousel\"},\"89\":{\"string\":\"Your response will be sent to\",\"description\":\"Text displayed to users after clicking a button that reveals a disclaimer, telling them more about where their user data will be stored, after they interact with a poll or quiz.\"},\"90\":{\"string\":\"Next story\",\"description\":\"Label for a button that advances to the next element in the carousel.\"},\"91\":{\"string\":\"Next page\",\"description\":\"Label for a button that advances to the next page of the story.\"},\"92\":{\"string\":\"Replay\",\"description\":\"Label for a button that replays the story.\"},\"93\":{\"string\":\"Previous page\",\"description\":\"Label for a button that returns the user to the previous page of the story.\"},\"96\":{\"string\":\"Move device to explore\",\"description\":\"Text displayed to users on gyroscope activation of an amp-story-360 component, telling them to move their device to experience the gyroscope effect.\"},\"97\":{\"string\":\"Opening\",\"description\":\"Text displayed to users on tap of outlink button.\"}}"); // lgtm[js/syntax-error]
var LocalizedStringsEnGb = JSON.parse("{\"2\":{\"string\":\"Tap Next\"},\"3\":{\"string\":\"Tap Back\"},\"4\":{\"string\":\"Could not copy link to clipboard :(\"},\"5\":{\"string\":\"Link copied!\"},\"6\":{\"string\":\"Email\"},\"7\":{\"string\":\"Facebook\"},\"8\":{\"string\":\"Google+\"},\"9\":{\"string\":\"Get Link\"},\"10\":{\"string\":\"LinkedIn\"},\"11\":{\"string\":\"Pinterest\"},\"12\":{\"string\":\"SMS\"},\"14\":{\"string\":\"Tumblr\"},\"15\":{\"string\":\"Twitter\"},\"16\":{\"string\":\"WhatsApp\"},\"18\":{\"string\":\"Expand both the height and width of your window to view this experience\"},\"19\":{\"string\":\"You must enable the amp-story experiment to view this content.\"},\"20\":{\"string\":\"The page is best viewed in portrait mode\"},\"21\":{\"string\":\"We're sorry, it looks like your browser doesn't support this experience\"},\"22\":{\"string\":\"Accept\"},\"23\":{\"string\":\"Decline\"},\"25\":{\"string\":\"View on original domain:\"},\"26\":{\"string\":\"More about AMP results\"},\"27\":{\"string\":\"Continue Anyway\"},\"31\":{\"string\":\"Sound off\"},\"32\":{\"string\":\"Sound on\"},\"33\":{\"string\":\"This page has no sound\"},\"34\":{\"string\":\"Play video\"},\"35\":{\"string\":\"Swipe up\"},\"36\":{\"string\":\"Expand Tweet\"},\"37\":{\"string\":\"Expand the height of your window to view this experience\"},\"38\":{\"string\":\"Expand the width of your window to view this experience\"},\"63\":{\"string\":\"Line\"}}"); // lgtm[js/syntax-error]
var LocalizedStringsEs = JSON.parse("{\"2\":{\"string\":\"Toca Siguiente\"},\"3\":{\"string\":\"Toca Atr\xE1s\"},\"4\":{\"string\":\"No se ha podido copiar el enlace en el portapapeles\xA0:(\"},\"5\":{\"string\":\"Se ha copiado el enlace.\"},\"6\":{\"string\":\"Correo electr\xF3nico\"},\"7\":{\"string\":\"Facebook\"},\"8\":{\"string\":\"Google+\"},\"9\":{\"string\":\"Obtener enlace\"},\"10\":{\"string\":\"LinkedIn\"},\"11\":{\"string\":\"Pinterest\"},\"12\":{\"string\":\"SMS\"},\"14\":{\"string\":\"Tumblr\"},\"15\":{\"string\":\"Twitter\"},\"16\":{\"string\":\"WhatsApp\"},\"18\":{\"string\":\"Ampl\xEDa el alto y el ancho de la ventana para ver esta experiencia\"},\"19\":{\"string\":\"Para ver este contenido, debes habilitar el experimento de historia\xA0AMP.\"},\"20\":{\"string\":\"La p\xE1gina se visualiza mejor en modo vertical\"},\"21\":{\"string\":\"Parece que este servicio no est\xE1 disponible para tu navegador\"},\"22\":{\"string\":\"Aceptar\"},\"23\":{\"string\":\"Rechazar\"},\"25\":{\"string\":\"Ver en dominio original:\"},\"26\":{\"string\":\"M\xE1s informaci\xF3n sobre los resultados de AMP\"},\"27\":{\"string\":\"Continuar de todos modos\"},\"31\":{\"string\":\"Sonido desactivado\"},\"32\":{\"string\":\"Sonido activado\"},\"33\":{\"string\":\"Esta p\xE1gina no tiene sonido\"},\"34\":{\"string\":\"Reproducir v\xEDdeo\"},\"35\":{\"string\":\"Deslizar el dedo hacia arriba\"},\"36\":{\"string\":\"Mostrar tuit\"},\"37\":{\"string\":\"Ampl\xEDa el alto de la ventana para ver esta experiencia\"},\"38\":{\"string\":\"Ampl\xEDa el ancho de la ventana para ver esta experiencia\"},\"63\":{\"string\":\"Line\"}}"); // lgtm[js/syntax-error]
var LocalizedStringsEs419 = JSON.parse("{\"2\":{\"string\":\"Presiona Siguiente\"},\"3\":{\"string\":\"Presiona Atr\xE1s\"},\"4\":{\"string\":\"No se pudo copiar el v\xEDnculo en el portapapeles :(\"},\"5\":{\"string\":\"Se copi\xF3 el v\xEDnculo.\"},\"6\":{\"string\":\"Correo electr\xF3nico\"},\"7\":{\"string\":\"Facebook\"},\"8\":{\"string\":\"Google+\"},\"9\":{\"string\":\"Obtener v\xEDnculo\"},\"10\":{\"string\":\"LinkedIn\"},\"11\":{\"string\":\"Pinterest\"},\"12\":{\"string\":\"SMS\"},\"14\":{\"string\":\"Tumblr\"},\"15\":{\"string\":\"Twitter\"},\"16\":{\"string\":\"WhatsApp\"},\"18\":{\"string\":\"Expande el ancho y la altura de la ventana para ver esta experiencia\"},\"19\":{\"string\":\"Debes habilitar el experimento de historia en formato AMP para ver este contenido.\"},\"20\":{\"string\":\"La p\xE1gina est\xE1 optimizada para verse en orientaci\xF3n vertical.\"},\"21\":{\"string\":\"Parece que el navegador no es compatible con esta experiencia\"},\"22\":{\"string\":\"Aceptar\"},\"23\":{\"string\":\"Rechazar\"},\"25\":{\"string\":\"Ver en el dominio original:\"},\"26\":{\"string\":\"M\xE1s informaci\xF3n sobre los resultados de AMP\"},\"27\":{\"string\":\"Continuar de todos modos\"},\"31\":{\"string\":\"Sonido desactivado\"},\"32\":{\"string\":\"Sonido activado\"},\"33\":{\"string\":\"Esta p\xE1gina no tiene sonido\"},\"34\":{\"string\":\"Reproducir video\"},\"35\":{\"string\":\"Deslizar el dedo hacia arriba\"},\"36\":{\"string\":\"Expandir tweet\"},\"37\":{\"string\":\"Expande la altura de la ventana para ver esta experiencia\"},\"38\":{\"string\":\"Expande el ancho de la ventana para ver esta experiencia\"},\"63\":{\"string\":\"Line\"}}"); // lgtm[js/syntax-error]
var LocalizedStringsFr = JSON.parse("{\"2\":{\"string\":\"Appuyer sur Suivant\"},\"3\":{\"string\":\"Appuyer sur Retour\"},\"4\":{\"string\":\"Impossible de copier le lien dans le presse-papiers :(\"},\"5\":{\"string\":\"Lien copi\xE9.\"},\"6\":{\"string\":\"E-mail\"},\"7\":{\"string\":\"Facebook\"},\"8\":{\"string\":\"Google+\"},\"9\":{\"string\":\"Obtenir le lien\"},\"10\":{\"string\":\"LinkedIn\"},\"11\":{\"string\":\"Pinterest\"},\"12\":{\"string\":\"SMS\"},\"14\":{\"string\":\"Tumblr\"},\"15\":{\"string\":\"Twitter\"},\"16\":{\"string\":\"WhatsApp\"},\"18\":{\"string\":\"Modifiez la hauteur et la largeur de la fen\xEAtre pour voir cette exp\xE9rience\"},\"19\":{\"string\":\"Vous devez activer l'exp\xE9rience story\xA0AMP pour voir ce contenu.\"},\"20\":{\"string\":\"La page s'affiche mieux en mode Portrait\"},\"21\":{\"string\":\"Nous sommes d\xE9sol\xE9s, mais votre navigateur n'est pas compatible avec cette exp\xE9rience\"},\"22\":{\"string\":\"Accepter\"},\"23\":{\"string\":\"Refuser\"},\"25\":{\"string\":\"Afficher sur le domaine d'origine\xA0:\"},\"26\":{\"string\":\"En savoir plus sur les r\xE9sultats AMP\"},\"27\":{\"string\":\"Continuer quand m\xEAme\"},\"31\":{\"string\":\"Son d\xE9sactiv\xE9\"},\"32\":{\"string\":\"Son activ\xE9\"},\"33\":{\"string\":\"Cette page n'a pas de son\"},\"34\":{\"string\":\"Regarder la vid\xE9o\"},\"35\":{\"string\":\"Balayer l'\xE9cran vers le haut\"},\"36\":{\"string\":\"D\xE9velopper le tweet\"},\"37\":{\"string\":\"Augmentez la hauteur de votre fen\xEAtre pour voir cette exp\xE9rience\"},\"38\":{\"string\":\"\xC9largissez la fen\xEAtre pour voir cette exp\xE9rience\"},\"63\":{\"string\":\"Line\"}}"); // lgtm[js/syntax-error]
var LocalizedStringsHi = JSON.parse("{\"2\":{\"string\":\"'\u0905\u0917\u0932\u093E' \u092A\u0930 \u091F\u0948\u092A \u0915\u0930\u0947\u0902\"},\"3\":{\"string\":\"'\u0935\u093E\u092A\u0938 \u091C\u093E\u090F\u0902' \u092A\u0930 \u091F\u0948\u092A \u0915\u0930\u0947\u0902\"},\"4\":{\"string\":\"\u0932\u093F\u0902\u0915 \u0915\u094D\u0932\u093F\u092A\u092C\u094B\u0930\u094D\u0921 \u092A\u0930 \u0915\u0949\u092A\u0940 \u0928\u0939\u0940\u0902 \u0915\u093F\u092F\u093E \u091C\u093E \u0938\u0915\u093E :(\"},\"5\":{\"string\":\"\u0932\u093F\u0902\u0915 \u0915\u0949\u092A\u0940 \u0915\u093F\u092F\u093E \u0917\u092F\u093E!\"},\"6\":{\"string\":\"\u0908\u092E\u0947\u0932\"},\"7\":{\"string\":\"Facebook\"},\"8\":{\"string\":\"Google+\"},\"9\":{\"string\":\"\u0932\u093F\u0902\u0915 \u092A\u093E\u090F\u0902\"},\"10\":{\"string\":\"LinkedIn\"},\"11\":{\"string\":\"Pinterest\"},\"12\":{\"string\":\"\u092E\u0948\u0938\u0947\u091C (\u090F\u0938\u090F\u092E\u090F\u0938)\"},\"14\":{\"string\":\"Tumblr\"},\"15\":{\"string\":\"Twitter\"},\"16\":{\"string\":\"WhatsApp\"},\"18\":{\"string\":\"\u092F\u0939 \u0935\u0930\u094D\u0936\u0928 \u0926\u0947\u0916\u0928\u0947 \u0915\u0947 \u0932\u093F\u090F \u0905\u092A\u0928\u0940 \u0935\u093F\u0902\u0921\u094B \u0915\u0940 \u0932\u0902\u092C\u093E\u0908 \u0914\u0930 \u091A\u094C\u0921\u093C\u093E\u0908, \u0926\u094B\u0928\u094B\u0902 \u0915\u094B \u092C\u0922\u093C\u093E\u090F\u0902\"},\"19\":{\"string\":\"\u092F\u0939 \u0938\u093E\u092E\u0917\u094D\u0930\u0940 \u0926\u0947\u0916\u0928\u0947 \u0915\u0947 \u0932\u093F\u090F \u0906\u092A\u0915\u094B \u090F\u090F\u092E\u092A\u0940-\u0915\u0939\u093E\u0928\u0940 \u0915\u0940 \u092A\u0930\u092B\u093C\u0949\u0930\u094D\u092E\u0947\u0902\u0938 \u091C\u093E\u0901\u091A \u091A\u093E\u0932\u0942 \u0915\u0930\u0928\u0940 \u0939\u094B\u0917\u0940.\"},\"20\":{\"string\":\"\u092F\u0939 \u092A\u0947\u091C \u092A\u094B\u0930\u094D\u091F\u094D\u0930\u0947\u091F \u092E\u094B\u0921 \u092E\u0947\u0902 \u0938\u092C\u0938\u0947 \u0905\u091A\u094D\u091B\u093E \u0926\u093F\u0916\u093E\u0908 \u0926\u0947\u0924\u093E \u0939\u0948\"},\"21\":{\"string\":\"\u092E\u093E\u092B\u093C \u0915\u0930\u0947\u0902, \u0932\u0917\u0924\u093E \u0939\u0948 \u0915\u093F \u0906\u092A\u0915\u093E \u092C\u094D\u0930\u093E\u0909\u091C\u093C\u0930 \u0907\u0938 \u0935\u0930\u094D\u0936\u0928 \u092A\u0930 \u0915\u093E\u092E \u0928\u0939\u0940\u0902 \u0915\u0930\u0924\u093E\"},\"22\":{\"string\":\"\u0938\u094D\u0935\u0940\u0915\u093E\u0930 \u0915\u0930\u0947\u0902\"},\"23\":{\"string\":\"\u0905\u0938\u094D\u0935\u0940\u0915\u093E\u0930 \u0915\u0930\u0947\u0902\"},\"25\":{\"string\":\"\u092E\u0942\u0932 \u0921\u094B\u092E\u0947\u0928 \u092A\u0930 \u0926\u0947\u0916\u0947\u0902:\"},\"26\":{\"string\":\"\u090F\u090F\u092E\u092A\u0940 \u0928\u0924\u0940\u091C\u094B\u0902 \u0915\u0947 \u092C\u093E\u0930\u0947 \u092E\u0947\u0902 \u091C\u093C\u094D\u092F\u093E\u0926\u093E \u091C\u093E\u0928\u0947\u0902\"},\"27\":{\"string\":\"\u092B\u093F\u0930 \u092D\u0940 \u091C\u093E\u0930\u0940 \u0930\u0916\u0947\u0902\"},\"31\":{\"string\":\"\u0906\u0935\u093E\u095B \u092C\u0902\u0926 \u0939\u0948\"},\"32\":{\"string\":\"\u0906\u0935\u093E\u095B \u091A\u093E\u0932\u0942 \u0939\u0948\"},\"33\":{\"string\":\"\u0907\u0938 \u092A\u0947\u091C \u092E\u0947\u0902 \u0915\u094B\u0908 \u0906\u0935\u093E\u091C\u093C \u0928\u0939\u0940\u0902 \u0939\u0948\"},\"34\":{\"string\":\"\u0935\u0940\u0921\u093F\u092F\u094B \u091A\u0932\u093E\u090F\u0902\"},\"35\":{\"string\":\"\u090A\u092A\u0930 \u0915\u0940 \u0913\u0930 \u0938\u094D\u0935\u093E\u0907\u092A \u0915\u0930\u0947\u0902\"},\"36\":{\"string\":\"\u091F\u094D\u0935\u0940\u091F \u0915\u094B \u092C\u0921\u093C\u093E \u0915\u0930\u0915\u0947 \u0926\u0947\u0916\u0947\u0902\"},\"37\":{\"string\":\"\u0907\u0938 \u0935\u0930\u094D\u0936\u0928 \u0915\u094B \u0926\u0947\u0916\u0928\u0947 \u0915\u0947 \u0932\u093F\u090F \u0905\u092A\u0928\u0940 \u0935\u093F\u0902\u0921\u094B \u0915\u0940 \u0932\u0902\u092C\u093E\u0908 \u092C\u0922\u093C\u093E\u090F\u0902\"},\"38\":{\"string\":\"\u092F\u0939 \u0935\u0930\u094D\u0936\u0928 \u0926\u0947\u0916\u0928\u0947 \u0915\u0947 \u0932\u093F\u090F \u0905\u092A\u0928\u0940 \u0935\u093F\u0902\u0921\u094B \u0915\u0940 \u091A\u094C\u0921\u093C\u093E\u0908 \u092C\u0922\u093C\u093E\u090F\u0902\"},\"63\":{\"string\":\"Line\"}}"); // lgtm[js/syntax-error]
var LocalizedStringsId = JSON.parse("{\"2\":{\"string\":\"Tap Berikutnya\"},\"3\":{\"string\":\"Tap Kembali.\"},\"4\":{\"string\":\"Tidak dapat menyalin link ke papan klip :(\"},\"5\":{\"string\":\"Link disalin!\"},\"6\":{\"string\":\"Email\"},\"7\":{\"string\":\"Facebook\"},\"8\":{\"string\":\"Google+\"},\"9\":{\"string\":\"Dapatkan Link\"},\"10\":{\"string\":\"LinkedIn\"},\"11\":{\"string\":\"Pinterest\"},\"12\":{\"string\":\"SMS\"},\"14\":{\"string\":\"Tumblr\"},\"15\":{\"string\":\"Twitter\"},\"16\":{\"string\":\"WhatsApp\"},\"18\":{\"string\":\"Luaskan tinggi dan lebar jendela untuk menampilkan pengalaman ini\"},\"19\":{\"string\":\"Anda harus mengaktifkan eksperimen cerita AMP untuk melihat konten ini.\"},\"20\":{\"string\":\"Halaman ini ditampilkan paling baik dalam mode potret\"},\"21\":{\"string\":\"Maaf, sepertinya browser Anda tidak mendukung pengalaman ini\"},\"22\":{\"string\":\"Setuju\"},\"23\":{\"string\":\"Tolak\"},\"25\":{\"string\":\"Lihat di domain asal:\"},\"26\":{\"string\":\"Lebih lanjut tentang hasil AMP\"},\"27\":{\"string\":\"Tetap Lanjutkan\"},\"31\":{\"string\":\"Suara nonaktif\"},\"32\":{\"string\":\"Suara aktif\"},\"33\":{\"string\":\"Suara tidak aktif di halaman ini\"},\"34\":{\"string\":\"Putar video\"},\"35\":{\"string\":\"Geser ke atas\"},\"36\":{\"string\":\"Luaskan Tweet\"},\"37\":{\"string\":\"Luaskan tinggi jendela untuk menampilkan pengalaman ini\"},\"38\":{\"string\":\"Luaskan lebar jendela untuk menampilkan pengalaman ini\"},\"63\":{\"string\":\"Line\"}}"); // lgtm[js/syntax-error]
var LocalizedStringsIt = JSON.parse("{\"2\":{\"string\":\"Tocca Avanti\"},\"3\":{\"string\":\"Tocca Indietro\"},\"4\":{\"string\":\"Impossibile copiare il link negli appunti :(\"},\"5\":{\"string\":\"Link copiato.\"},\"6\":{\"string\":\"Email\"},\"7\":{\"string\":\"Facebook\"},\"8\":{\"string\":\"Google+\"},\"9\":{\"string\":\"Ottieni link\"},\"10\":{\"string\":\"LinkedIn\"},\"11\":{\"string\":\"Pinterest\"},\"12\":{\"string\":\"SMS\"},\"14\":{\"string\":\"Tumblr\"},\"15\":{\"string\":\"Twitter\"},\"16\":{\"string\":\"WhatsApp\"},\"18\":{\"string\":\"Espandi sia l'altezza che la larghezza della finestra per visualizzare questa esperienza\"},\"19\":{\"string\":\"Devi attivare l'esperimento di storia AMP per visualizzare questi contenuti.\"},\"20\":{\"string\":\"La pagina viene visualizzata in modo ottimale in orientamento verticale\"},\"21\":{\"string\":\"Spiacenti, sembra che il tuo browser non supporti questa esperienza\"},\"22\":{\"string\":\"Accetta\"},\"23\":{\"string\":\"Rifiuta\"},\"25\":{\"string\":\"Visualizza sul dominio originale:\"},\"26\":{\"string\":\"Ulteriori informazioni sui risultati AMP\"},\"27\":{\"string\":\"Continua comunque\"},\"31\":{\"string\":\"Audio disattivato\"},\"32\":{\"string\":\"Audio attivo\"},\"33\":{\"string\":\"Questa pagina non ha audio\"},\"34\":{\"string\":\"Riproduci video\"},\"35\":{\"string\":\"Scorri verso l'alto\"},\"36\":{\"string\":\"Espandi tweet\"},\"37\":{\"string\":\"Espandi l'altezza della finestra per visualizzare questa esperienza\"},\"38\":{\"string\":\"Espandi la larghezza della finestra per visualizzare questa esperienza\"},\"63\":{\"string\":\"Line\"}}"); // lgtm[js/syntax-error]
var LocalizedStringsJa = JSON.parse("{\"2\":{\"string\":\"[\u6B21\u3078] \u3092\u30BF\u30C3\u30D7\"},\"3\":{\"string\":\"\u623B\u308B\u30A2\u30A4\u30B3\u30F3\u3092\u30BF\u30C3\u30D7\"},\"4\":{\"string\":\"\u30EA\u30F3\u30AF\u3092\u30AF\u30EA\u30C3\u30D7\u30DC\u30FC\u30C9\u306B\u30B3\u30D4\u30FC\u3067\u304D\u307E\u305B\u3093\u3067\u3057\u305F\u3002\"},\"5\":{\"string\":\"\u30EA\u30F3\u30AF\u3092\u30B3\u30D4\u30FC\u3057\u307E\u3057\u305F\"},\"6\":{\"string\":\"\u30E1\u30FC\u30EB\"},\"7\":{\"string\":\"Facebook\"},\"8\":{\"string\":\"Google+\"},\"9\":{\"string\":\"\u30EA\u30F3\u30AF\u3092\u53D6\u5F97\"},\"10\":{\"string\":\"LinkedIn\"},\"11\":{\"string\":\"Pinterest\"},\"12\":{\"string\":\"SMS\"},\"14\":{\"string\":\"Tumblr\"},\"15\":{\"string\":\"Twitter\"},\"16\":{\"string\":\"WhatsApp\"},\"18\":{\"string\":\"\u3053\u306E\u8A18\u4E8B\u3092\u8868\u793A\u3059\u308B\u306B\u306F\u3001\u30A6\u30A3\u30F3\u30C9\u30A6\u306E\u9AD8\u3055\u3068\u5E45\u306E\u4E21\u65B9\u3092\u62E1\u5927\u3057\u3066\u304F\u3060\u3055\u3044\"},\"19\":{\"string\":\"\u3053\u306E\u30B3\u30F3\u30C6\u30F3\u30C4\u3092\u8868\u793A\u3059\u308B\u306B\u306F amp-story \u30C6\u30B9\u30C8\u3092\u6709\u52B9\u306B\u3059\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059\u3002\"},\"20\":{\"string\":\"\u3053\u306E\u30DA\u30FC\u30B8\u306F\u30DD\u30FC\u30C8\u30EC\u30FC\u30C8 \u30E2\u30FC\u30C9\u3067\u6700\u9069\u306B\u8868\u793A\u3055\u308C\u307E\u3059\"},\"21\":{\"string\":\"\u3054\u5229\u7528\u306E\u30D6\u30E9\u30A6\u30B6\u306F\u3053\u306E\u8A18\u4E8B\u306B\u5BFE\u5FDC\u3057\u3066\u3044\u307E\u305B\u3093\"},\"22\":{\"string\":\"\u540C\u610F\u3059\u308B\"},\"23\":{\"string\":\"\u540C\u610F\u3057\u306A\u3044\"},\"25\":{\"string\":\"\u5143\u306E\u30C9\u30E1\u30A4\u30F3\u3067\u8868\u793A:\"},\"26\":{\"string\":\"AMP \u306E\u7D50\u679C\u306B\u95A2\u3059\u308B\u8A73\u7D30\"},\"27\":{\"string\":\"\u7D9A\u884C\u3059\u308B\"},\"31\":{\"string\":\"\u30B5\u30A6\u30F3\u30C9\u306F\u30AA\u30D5\u3067\u3059\"},\"32\":{\"string\":\"\u30B5\u30A6\u30F3\u30C9\u30AA\u30F3\"},\"33\":{\"string\":\"\u3053\u306E\u30DA\u30FC\u30B8\u306B\u306F\u97F3\u58F0\u304C\u3042\u308A\u307E\u305B\u3093\"},\"34\":{\"string\":\"\u52D5\u753B\u3092\u518D\u751F\"},\"35\":{\"string\":\"\u4E0A\u306B\u30B9\u30EF\u30A4\u30D7\"},\"36\":{\"string\":\"\u30C4\u30A4\u30FC\u30C8\u3092\u5C55\u958B\"},\"37\":{\"string\":\"\u3053\u306E\u8A18\u4E8B\u3092\u8868\u793A\u3059\u308B\u306B\u306F\u3001\u30A6\u30A3\u30F3\u30C9\u30A6\u306E\u9AD8\u3055\u3092\u62E1\u5927\u3057\u3066\u304F\u3060\u3055\u3044\"},\"38\":{\"string\":\"\u3053\u306E\u8A18\u4E8B\u3092\u8868\u793A\u3059\u308B\u306B\u306F\u3001\u30A6\u30A3\u30F3\u30C9\u30A6\u306E\u5E45\u3092\u62E1\u5927\u3057\u3066\u304F\u3060\u3055\u3044\"},\"63\":{\"string\":\"Line\"}}"); // lgtm[js/syntax-error]
var LocalizedStringsKo = JSON.parse("{\"2\":{\"string\":\"\uB2E4\uC74C\uC744 \uD0ED\uD558\uC138\uC694.\"},\"3\":{\"string\":\"\uB4A4\uB85C\uB97C \uD0ED\uD558\uC138\uC694.\"},\"4\":{\"string\":\"\uB9C1\uD06C\uB97C \uD074\uB9BD\uBCF4\uB4DC\uC5D0 \uBCF5\uC0AC\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.\"},\"5\":{\"string\":\"\uB9C1\uD06C\uAC00 \uBCF5\uC0AC\uB418\uC5C8\uC2B5\uB2C8\uB2E4.\"},\"6\":{\"string\":\"\uC774\uBA54\uC77C\"},\"7\":{\"string\":\"Facebook\"},\"8\":{\"string\":\"Google+\"},\"9\":{\"string\":\"\uB9C1\uD06C \uBC1B\uAE30\"},\"10\":{\"string\":\"LinkedIn\"},\"11\":{\"string\":\"Pinterest\"},\"12\":{\"string\":\"SMS\"},\"14\":{\"string\":\"Tumblr\"},\"15\":{\"string\":\"Twitter\"},\"16\":{\"string\":\"WhatsApp\"},\"18\":{\"string\":\"\uC774 \uD658\uACBD\uC744 \uBCF4\uB824\uBA74 \uCC3D \uB192\uC774\uC640 \uB108\uBE44\uB97C \uB298\uB9AC\uC138\uC694.\"},\"19\":{\"string\":\"\uC774 \uCF58\uD150\uCE20\uB97C \uBCF4\uB824\uBA74 amp-story \uC2E4\uD5D8\uC744 \uC0AC\uC6A9\uD558\uB3C4\uB85D \uC124\uC815\uD574\uC57C \uD569\uB2C8\uB2E4.\"},\"20\":{\"string\":\"\uC774 \uD398\uC774\uC9C0\uB294 \uC138\uB85C \uBAA8\uB4DC\uC5D0\uC11C \uAC00\uC7A5 \uC798 \uD45C\uC2DC\uB429\uB2C8\uB2E4.\"},\"21\":{\"string\":\"\uC0AC\uC6A9 \uC911\uC778 \uBE0C\uB77C\uC6B0\uC800\uC5D0\uC11C \uC774 \uD658\uACBD\uC744 \uC9C0\uC6D0\uD558\uC9C0 \uC54A\uB294 \uAC83 \uAC19\uC2B5\uB2C8\uB2E4.\"},\"22\":{\"string\":\"\uC218\uB77D\"},\"23\":{\"string\":\"\uAC70\uBD80\"},\"25\":{\"string\":\"\uC6D0\uB798 \uB3C4\uBA54\uC778\uC5D0\uC11C \uBCF4\uAE30:\"},\"26\":{\"string\":\"AMP \uACB0\uACFC \uC790\uC138\uD788 \uC54C\uC544\uBCF4\uAE30\"},\"27\":{\"string\":\"\uACC4\uC18D\uD558\uAE30\"},\"31\":{\"string\":\"\uC0AC\uC6B4\uB4DC \uAEBC\uC9D0\"},\"32\":{\"string\":\"\uC0AC\uC6B4\uB4DC \uCF1C\uC9D0\"},\"33\":{\"string\":\"\uC774 \uD398\uC774\uC9C0\uC5D0\uB294 \uC0AC\uC6B4\uB4DC\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.\"},\"34\":{\"string\":\"\uB3D9\uC601\uC0C1 \uC7AC\uC0DD\"},\"35\":{\"string\":\"\uC704\uB85C \uC2A4\uC640\uC774\uD504\"},\"36\":{\"string\":\"\uD2B8\uC717 \uD3BC\uCE58\uAE30\"},\"37\":{\"string\":\"\uC774 \uD658\uACBD\uC744 \uBCF4\uB824\uBA74 \uCC3D \uB192\uC774\uB97C \uB298\uB9AC\uC138\uC694.\"},\"38\":{\"string\":\"\uC774 \uD658\uACBD\uC744 \uBCF4\uB824\uBA74 \uCC3D \uB108\uBE44\uB97C \uB298\uB9AC\uC138\uC694.\"},\"63\":{\"string\":\"Line\"}}"); // lgtm[js/syntax-error]
var LocalizedStringsNl = JSON.parse("{\"2\":{\"string\":\"Tik op Volgende\"},\"3\":{\"string\":\"Tik op Terug\"},\"4\":{\"string\":\"Kan link niet kopi\xEBren naar klembord :(\"},\"5\":{\"string\":\"Link gekopieerd\"},\"6\":{\"string\":\"E-mail\"},\"7\":{\"string\":\"Facebook\"},\"8\":{\"string\":\"Google+\"},\"9\":{\"string\":\"Link ophalen\"},\"10\":{\"string\":\"LinkedIn\"},\"11\":{\"string\":\"Pinterest\"},\"12\":{\"string\":\"Sms\"},\"14\":{\"string\":\"Tumblr\"},\"15\":{\"string\":\"Twitter\"},\"16\":{\"string\":\"WhatsApp\"},\"18\":{\"string\":\"Maak je venster hoger en breder om deze functionaliteit te bekijken\"},\"19\":{\"string\":\"Je moet het amp-story-experiment inschakelen om deze content te bekijken.\"},\"20\":{\"string\":\"De pagina kan het beste worden bekeken in de staande modus\"},\"21\":{\"string\":\"Je browser ondersteunt deze functionaliteit niet\"},\"22\":{\"string\":\"Accepteren\"},\"23\":{\"string\":\"Weigeren\"},\"25\":{\"string\":\"Bekijken op oorspronkelijk domein:\"},\"26\":{\"string\":\"Meer over AMP-resultaten\"},\"27\":{\"string\":\"Toch doorgaan\"},\"31\":{\"string\":\"Geluid uit\"},\"32\":{\"string\":\"Geluid aan\"},\"33\":{\"string\":\"Deze pagina heeft geen geluid\"},\"34\":{\"string\":\"Video afspelen\"},\"35\":{\"string\":\"Omhoog vegen\"},\"36\":{\"string\":\"Tweet uitvouwen\"},\"37\":{\"string\":\"Maak je venster hoger om deze functionaliteit te bekijken\"},\"38\":{\"string\":\"Maak je venster breder om deze functionaliteit te bekijken\"},\"63\":{\"string\":\"Line\"}}"); // lgtm[js/syntax-error]
var LocalizedStringsNo = JSON.parse("{\"2\":{\"string\":\"Trykk p\xE5 Neste\"},\"3\":{\"string\":\"Trykk p\xE5 Tilbake\"},\"4\":{\"string\":\"Kunne ikke kopiere linken til utklippstavlen :(\"},\"5\":{\"string\":\"Linken er kopiert.\"},\"6\":{\"string\":\"E-post\"},\"7\":{\"string\":\"Facebook\"},\"8\":{\"string\":\"Google+\"},\"9\":{\"string\":\"Hent linken\"},\"10\":{\"string\":\"LinkedIn\"},\"11\":{\"string\":\"Pinterest\"},\"12\":{\"string\":\"SMS\"},\"14\":{\"string\":\"Tumblr\"},\"15\":{\"string\":\"Twitter\"},\"16\":{\"string\":\"WhatsApp\"},\"18\":{\"string\":\"Gj\xF8r vinduet ditt st\xF8rre for \xE5 se denne opplevelsen\"},\"19\":{\"string\":\"Du m\xE5 aktivere eksperimentet med AMP-snuttsamlinger for \xE5 se dette innholdet.\"},\"20\":{\"string\":\"Den beste visningen av siden er i st\xE5ende retning\"},\"21\":{\"string\":\"Beklager, men det ser ut til at nettleseren din ikke st\xF8tter denne opplevelsen\"},\"22\":{\"string\":\"Godta\"},\"23\":{\"string\":\"Avsl\xE5\"},\"25\":{\"string\":\"Se p\xE5 det opprinnelige domenet:\"},\"26\":{\"string\":\"Mer om AMP-resultater\"},\"27\":{\"string\":\"Fortsett likevel\"},\"31\":{\"string\":\"Lyd av\"},\"32\":{\"string\":\"Lyd p\xE5\"},\"33\":{\"string\":\"Denne siden har ikke noe lyd\"},\"34\":{\"string\":\"Spill av videoen\"},\"35\":{\"string\":\"Sveip opp\"},\"36\":{\"string\":\"Vis Twitter-meldingen\"},\"37\":{\"string\":\"Gj\xF8r vinduet ditt st\xF8rre for \xE5 se denne opplevelsen\"},\"38\":{\"string\":\"Gj\xF8r vinduet ditt bredere for \xE5 se denne opplevelsen\"},\"63\":{\"string\":\"Line\"}}"); // lgtm[js/syntax-error]
var LocalizedStringsPtBr = JSON.parse("{\"2\":{\"string\":\"Toque em \\\"Pr\xF3xima\\\"\"},\"3\":{\"string\":\"Toque em \\\"Voltar\\\"\"},\"4\":{\"string\":\"N\xE3o foi poss\xEDvel copiar o link para a \xE1rea de transfer\xEAncia :(\"},\"5\":{\"string\":\"Link copiado\"},\"6\":{\"string\":\"E-mail\"},\"7\":{\"string\":\"Facebook\"},\"8\":{\"string\":\"Google+\"},\"9\":{\"string\":\"Copiar link\"},\"10\":{\"string\":\"LinkedIn\"},\"11\":{\"string\":\"Pinterest\"},\"12\":{\"string\":\"SMS\"},\"14\":{\"string\":\"Tumblr\"},\"15\":{\"string\":\"Twitter\"},\"16\":{\"string\":\"WhatsApp\"},\"18\":{\"string\":\"Aumente a altura e largura da janela para ver esta experi\xEAncia\"},\"19\":{\"string\":\"Voc\xEA precisa ativar o experimento amp-story para ver este conte\xFAdo.\"},\"20\":{\"string\":\"Melhor visualiza\xE7\xE3o da p\xE1gina no modo retrato\"},\"21\":{\"string\":\"Parece que o navegador n\xE3o \xE9 compat\xEDvel com esta experi\xEAncia\"},\"22\":{\"string\":\"Aceitar\"},\"23\":{\"string\":\"Recusar\"},\"25\":{\"string\":\"Ver no dom\xEDnio original:\"},\"26\":{\"string\":\"Mais sobre resultados de AMP\"},\"27\":{\"string\":\"Continuar mesmo assim\"},\"31\":{\"string\":\"Som desativado\"},\"32\":{\"string\":\"Som ativado\"},\"33\":{\"string\":\"Esta p\xE1gina n\xE3o tem som\"},\"34\":{\"string\":\"Assistir v\xEDdeo\"},\"35\":{\"string\":\"Deslizar para cima\"},\"36\":{\"string\":\"Expandir tweet\"},\"37\":{\"string\":\"Aumente a altura da janela para ver esta experi\xEAncia\"},\"38\":{\"string\":\"Aumente a largura da janela para ver esta experi\xEAncia\"},\"63\":{\"string\":\"Line\"}}"); // lgtm[js/syntax-error]
var LocalizedStringsPtPt = JSON.parse("{\"2\":{\"string\":\"Toque em Seguinte.\"},\"3\":{\"string\":\"Toque em Anterior\"},\"4\":{\"string\":\"N\xE3o foi poss\xEDvel copiar o link para a \xE1rea de transfer\xEAncia :(\"},\"5\":{\"string\":\"Link copiado!\"},\"6\":{\"string\":\"Email\"},\"7\":{\"string\":\"Facebook\"},\"8\":{\"string\":\"Google+\"},\"9\":{\"string\":\"Obter link\"},\"10\":{\"string\":\"LinkedIn\"},\"11\":{\"string\":\"Pinterest\"},\"12\":{\"string\":\"SMS\"},\"14\":{\"string\":\"Tumblr\"},\"15\":{\"string\":\"Twitter\"},\"16\":{\"string\":\"WhatsApp\"},\"18\":{\"string\":\"Expanda a altura e a largura da sua janela para ver esta experi\xEAncia.\"},\"19\":{\"string\":\"Tem de ativar a experi\xEAncia da hist\xF3ria AMP para ver este conte\xFAdo.\"},\"20\":{\"string\":\"Conseguir\xE1 visualizar melhor esta p\xE1gina no modo retrato.\"},\"21\":{\"string\":\"Lamentamos, mas parece que o seu navegador n\xE3o suporta esta experi\xEAncia.\"},\"22\":{\"string\":\"Aceitar\"},\"23\":{\"string\":\"Recusar\"},\"25\":{\"string\":\"Veja no dom\xEDnio original:\"},\"26\":{\"string\":\"Mais acerca dos resultados AMP\"},\"27\":{\"string\":\"Continuar mesmo assim\"},\"31\":{\"string\":\"Som desativado\"},\"32\":{\"string\":\"Som ativado\"},\"33\":{\"string\":\"Esta p\xE1gina n\xE3o tem som.\"},\"34\":{\"string\":\"Reproduzir v\xEDdeo\"},\"35\":{\"string\":\"Deslizar rapidamente para cima\"},\"36\":{\"string\":\"Expandir twit\"},\"37\":{\"string\":\"Expanda a altura da janela para ver esta experi\xEAncia.\"},\"38\":{\"string\":\"Expanda a largura da janela para ver esta experi\xEAncia.\"},\"63\":{\"string\":\"Line\"}}"); // lgtm[js/syntax-error]
var LocalizedStringsRu = JSON.parse("{\"2\":{\"string\":\"\u041D\u0430\u0436\u043C\u0438\u0442\u0435 \\\"\u0414\u0430\u043B\u0435\u0435\\\"\"},\"3\":{\"string\":\"\u041D\u0430\u0436\u043C\u0438\u0442\u0435 \\\"\u041D\u0430\u0437\u0430\u0434\\\"\"},\"4\":{\"string\":\"\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0441\u043A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u0441\u0441\u044B\u043B\u043A\u0443 \u0432 \u0431\u0443\u0444\u0435\u0440 \u043E\u0431\u043C\u0435\u043D\u0430.\"},\"5\":{\"string\":\"\u0421\u0441\u044B\u043B\u043A\u0430 \u0441\u043A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u043D\u0430\"},\"6\":{\"string\":\"\u041F\u043E \u044D\u043B\u0435\u043A\u0442\u0440\u043E\u043D\u043D\u043E\u0439 \u043F\u043E\u0447\u0442\u0435\"},\"7\":{\"string\":\"Facebook\"},\"8\":{\"string\":\"Google+\"},\"9\":{\"string\":\"\u041F\u043E\u043B\u0443\u0447\u0438\u0442\u044C \u0441\u0441\u044B\u043B\u043A\u0443\"},\"10\":{\"string\":\"LinkedIn\"},\"11\":{\"string\":\"Pinterest\"},\"12\":{\"string\":\"SMS\"},\"14\":{\"string\":\"Tumblr\"},\"15\":{\"string\":\"\u0422\u0432\u0438\u0442\u0442\u0435\u0440\"},\"16\":{\"string\":\"WhatsApp\"},\"18\":{\"string\":\"\u0423\u0432\u0435\u043B\u0438\u0447\u044C\u0442\u0435 \u0432\u044B\u0441\u043E\u0442\u0443 \u0438 \u0448\u0438\u0440\u0438\u043D\u0443 \u043E\u043A\u043D\u0430 \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u0430, \u0447\u0442\u043E\u0431\u044B \u043F\u043E\u0441\u043C\u043E\u0442\u0440\u0435\u0442\u044C \u043A\u043E\u043D\u0442\u0435\u043D\u0442.\"},\"19\":{\"string\":\"\u0414\u043B\u044F \u0434\u043E\u0441\u0442\u0443\u043F\u0430 \u043A \u044D\u0442\u043E\u043C\u0443 \u043A\u043E\u043D\u0442\u0435\u043D\u0442\u0443 \u043D\u0443\u0436\u043D\u043E \u0432\u043A\u043B\u044E\u0447\u0438\u0442\u044C \u044D\u043A\u0441\u043F\u0435\u0440\u0438\u043C\u0435\u043D\u0442 \u0441 AMP-\u0438\u0441\u0442\u043E\u0440\u0438\u044F\u043C\u0438.\"},\"20\":{\"string\":\"\u0421\u0442\u0440\u0430\u043D\u0438\u0446\u0430 \u0434\u043E\u0441\u0442\u0443\u043F\u043D\u0430 \u0442\u043E\u043B\u044C\u043A\u043E \u0432 \u0432\u0435\u0440\u0442\u0438\u043A\u0430\u043B\u044C\u043D\u043E\u0439 \u043E\u0440\u0438\u0435\u043D\u0442\u0430\u0446\u0438\u0438.\"},\"21\":{\"string\":\"\u0412\u0430\u0448 \u0431\u0440\u0430\u0443\u0437\u0435\u0440 \u043D\u0435 \u043F\u043E\u0434\u0434\u0435\u0440\u0436\u0438\u0432\u0430\u0435\u0442 \u044D\u0442\u0443 \u0444\u0443\u043D\u043A\u0446\u0438\u044E.\"},\"22\":{\"string\":\"\u041F\u0440\u0438\u043D\u044F\u0442\u044C\"},\"23\":{\"string\":\"\u041E\u0442\u043A\u043B\u043E\u043D\u0438\u0442\u044C\"},\"25\":{\"string\":\"\u0418\u0441\u0445\u043E\u0434\u043D\u044B\u0439 \u0434\u043E\u043C\u0435\u043D:\"},\"26\":{\"string\":\"\u0421\u0432\u0435\u0434\u0435\u043D\u0438\u044F \u043E AMP-\u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442\u0430\u0445\"},\"27\":{\"string\":\"\u0412\u0441\u0435 \u0440\u0430\u0432\u043D\u043E \u043F\u0440\u043E\u0434\u043E\u043B\u0436\u0438\u0442\u044C\"},\"31\":{\"string\":\"\u0417\u0432\u0443\u043A \u043E\u0442\u043A\u043B\u044E\u0447\u0435\u043D\"},\"32\":{\"string\":\"\u0417\u0432\u0443\u043A \u0432\u043A\u043B\u044E\u0447\u0435\u043D\"},\"33\":{\"string\":\"\u0412 \u043A\u043E\u043D\u0442\u0435\u043D\u0442\u0435 \u043D\u0430 \u0441\u0442\u0440\u0430\u043D\u0438\u0446\u0435 \u043D\u0435\u0442 \u0437\u0432\u0443\u043A\u0430.\"},\"34\":{\"string\":\"\u0412\u043E\u0441\u043F\u0440\u043E\u0438\u0437\u0432\u0435\u0441\u0442\u0438 \u0432\u0438\u0434\u0435\u043E\"},\"35\":{\"string\":\"\u041F\u0440\u043E\u0432\u0435\u0441\u0442\u0438 \u0432\u0432\u0435\u0440\u0445\"},\"36\":{\"string\":\"\u0420\u0430\u0437\u0432\u0435\u0440\u043D\u0443\u0442\u044C \u0442\u0432\u0438\u0442\"},\"37\":{\"string\":\"\u0423\u0432\u0435\u043B\u0438\u0447\u044C\u0442\u0435 \u0432\u044B\u0441\u043E\u0442\u0443 \u043E\u043A\u043D\u0430 \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u0430, \u0447\u0442\u043E\u0431\u044B \u043F\u043E\u0441\u043C\u043E\u0442\u0440\u0435\u0442\u044C \u043A\u043E\u043D\u0442\u0435\u043D\u0442.\"},\"38\":{\"string\":\"\u0423\u0432\u0435\u043B\u0438\u0447\u044C\u0442\u0435 \u0448\u0438\u0440\u0438\u043D\u0443 \u043E\u043A\u043D\u0430 \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u0430, \u0447\u0442\u043E\u0431\u044B \u043F\u043E\u0441\u043C\u043E\u0442\u0440\u0435\u0442\u044C \u043A\u043E\u043D\u0442\u0435\u043D\u0442.\"},\"63\":{\"string\":\"Line\"}}"); // lgtm[js/syntax-error]
var LocalizedStringsTr = JSON.parse("{\"2\":{\"string\":\"Sonraki'ye dokunun\"},\"3\":{\"string\":\"Geri'ye dokunun\"},\"4\":{\"string\":\"Ba\u011Flant\u0131 panoya kopyalanamad\u0131 :(\"},\"5\":{\"string\":\"Ba\u011Flant\u0131 kopyaland\u0131!\"},\"6\":{\"string\":\"E-posta\"},\"7\":{\"string\":\"Facebook\"},\"8\":{\"string\":\"Google+\"},\"9\":{\"string\":\"Ba\u011Flant\u0131y\u0131 Al\"},\"10\":{\"string\":\"LinkedIn\"},\"11\":{\"string\":\"Pinterest\"},\"12\":{\"string\":\"SMS\"},\"14\":{\"string\":\"Tumblr\"},\"15\":{\"string\":\"Twitter\"},\"16\":{\"string\":\"WhatsApp\"},\"18\":{\"string\":\"Bu deneyimi g\xF6rebilmek i\xE7in pencerenizin hem y\xFCksekli\u011Fini hem de geni\u015Fli\u011Fini art\u0131r\u0131n\"},\"19\":{\"string\":\"Bu i\xE7eri\u011Fi g\xF6rebilmek i\xE7in amp hikayesi deneyimini etkinle\u015Ftirmeniz gerekir.\"},\"20\":{\"string\":\"Sayfa en iyi dikey modda g\xF6r\xFCnt\xFClenir\"},\"21\":{\"string\":\"Maalesef taray\u0131c\u0131n\u0131z bu deneyimi desteklemiyor gibi g\xF6r\xFCn\xFCyor\"},\"22\":{\"string\":\"Kabul et\"},\"23\":{\"string\":\"Reddet\"},\"25\":{\"string\":\"Orijinal alanda g\xF6r\xFCnt\xFCle:\"},\"26\":{\"string\":\"AMP sonu\xE7lar\u0131 hakk\u0131nda daha fazla bilgi\"},\"27\":{\"string\":\"Yine de Devam Et\"},\"31\":{\"string\":\"Ses kapal\u0131\"},\"32\":{\"string\":\"Ses a\xE7\u0131k\"},\"33\":{\"string\":\"Bu sayfada ses yok\"},\"34\":{\"string\":\"Videoyu oynat\"},\"35\":{\"string\":\"Yukar\u0131 kayd\u0131r\"},\"36\":{\"string\":\"Tweet'i geni\u015Flet\"},\"37\":{\"string\":\"Bu deneyimi g\xF6rebilmek i\xE7in pencerenizin y\xFCksekli\u011Fini art\u0131r\u0131n\"},\"38\":{\"string\":\"Bu deneyimi g\xF6rebilmek i\xE7in pencerenizin geni\u015Fli\u011Fini art\u0131r\u0131n\"},\"63\":{\"string\":\"Line\"}}"); // lgtm[js/syntax-error]
var LocalizedStringsVi = JSON.parse("{\"2\":{\"string\":\"Nh\u1EA5n v\xE0o Ti\u1EBFp theo\"},\"3\":{\"string\":\"Nh\u1EA5n v\xE0o Quay l\u1EA1i\"},\"4\":{\"string\":\"Kh\xF4ng th\u1EC3 sao ch\xE9p li\xEAn k\u1EBFt v\xE0o khay nh\u1EDB t\u1EA1m :(\"},\"5\":{\"string\":\"\u0110\xE3 sao ch\xE9p li\xEAn k\u1EBFt!\"},\"6\":{\"string\":\"Email\"},\"7\":{\"string\":\"Facebook\"},\"8\":{\"string\":\"Google+\"},\"9\":{\"string\":\"L\u1EA5y li\xEAn k\u1EBFt\"},\"10\":{\"string\":\"LinkedIn\"},\"11\":{\"string\":\"Pinterest\"},\"12\":{\"string\":\"SMS\"},\"14\":{\"string\":\"Tumblr\"},\"15\":{\"string\":\"Twitter\"},\"16\":{\"string\":\"WhatsApp\"},\"18\":{\"string\":\"M\u1EDF r\u1ED9ng c\u1EA3 chi\u1EC1u cao v\xE0 chi\u1EC1u r\u1ED9ng c\u1EEDa s\u1ED5 \u0111\u1EC3 xem tr\u1EA3i nghi\u1EC7m n\xE0y\"},\"19\":{\"string\":\"B\u1EA1n c\u1EA7n ph\u1EA3i b\u1EADt th\u1EED nghi\u1EC7m c\xE2u chuy\u1EC7n amp \u0111\u1EC3 xem n\u1ED9i dung n\xE0y.\"},\"20\":{\"string\":\"Trang n\xE0y \u0111\u01B0\u1EE3c xem t\u1ED1t nh\u1EA5t \u1EDF ch\u1EBF \u0111\u1ED9 ch\xE2n dung\"},\"21\":{\"string\":\"R\u1EA5t ti\u1EBFc, c\xF3 v\u1EBB nh\u01B0 tr\xECnh duy\u1EC7t c\u1EE7a b\u1EA1n kh\xF4ng h\u1ED7 tr\u1EE3 tr\u1EA3i nghi\u1EC7m n\xE0y\"},\"22\":{\"string\":\"Ch\u1EA5p nh\u1EADn\"},\"23\":{\"string\":\"T\u1EEB ch\u1ED1i\"},\"25\":{\"string\":\"Xem tr\xEAn mi\u1EC1n g\u1ED1c:\"},\"26\":{\"string\":\"Th\xEAm th\xF4ng tin v\u1EC1 k\u1EBFt qu\u1EA3 AMP\"},\"27\":{\"string\":\"V\u1EABn ti\u1EBFp t\u1EE5c\"},\"31\":{\"string\":\"T\u1EAFt \xE2m thanh\"},\"32\":{\"string\":\"B\u1EADt \xE2m thanh\"},\"33\":{\"string\":\"Trang n\xE0y kh\xF4ng c\xF3 \xE2m thanh\"},\"34\":{\"string\":\"Ph\xE1t video\"},\"35\":{\"string\":\"Vu\u1ED1t l\xEAn\"},\"36\":{\"string\":\"M\u1EDF r\u1ED9ng Tweet\"},\"37\":{\"string\":\"M\u1EDF r\u1ED9ng chi\u1EC1u cao c\u1EEDa s\u1ED5 \u0111\u1EC3 xem tr\u1EA3i nghi\u1EC7m n\xE0y\"},\"38\":{\"string\":\"M\u1EDF r\u1ED9ng chi\u1EC1u r\u1ED9ng c\u1EEDa s\u1ED5 \u0111\u1EC3 xem tr\u1EA3i nghi\u1EC7m n\xE0y\"},\"63\":{\"string\":\"Line\"}}"); // lgtm[js/syntax-error]
var LocalizedStringsZhCn = JSON.parse("{\"2\":{\"string\":\"\u70B9\u6309\u201C\u4E0B\u4E00\u9875\u201D\"},\"3\":{\"string\":\"\u70B9\u6309\u201C\u8FD4\u56DE\u201D\"},\"4\":{\"string\":\"\u65E0\u6CD5\u5C06\u94FE\u63A5\u590D\u5236\u5230\u526A\u8D34\u677F :(\"},\"5\":{\"string\":\"\u5DF2\u590D\u5236\u94FE\u63A5\uFF01\"},\"6\":{\"string\":\"\u7535\u5B50\u90AE\u4EF6\"},\"7\":{\"string\":\"Facebook\"},\"8\":{\"string\":\"Google+\"},\"9\":{\"string\":\"\u83B7\u53D6\u94FE\u63A5\"},\"10\":{\"string\":\"LinkedIn\"},\"11\":{\"string\":\"Pinterest\"},\"12\":{\"string\":\"\u77ED\u4FE1\"},\"14\":{\"string\":\"Tumblr\"},\"15\":{\"string\":\"Twitter\"},\"16\":{\"string\":\"WhatsApp\"},\"18\":{\"string\":\"\u8981\u67E5\u770B\u8FD9\u79CD\u4F53\u9A8C\uFF0C\u8BF7\u540C\u65F6\u52A0\u5927\u7A97\u53E3\u9AD8\u5EA6\u548C\u5BBD\u5EA6\"},\"19\":{\"string\":\"\u60A8\u5FC5\u987B\u542F\u7528 amp-story \u5B9E\u9A8C\u6027\u529F\u80FD\uFF0C\u624D\u80FD\u67E5\u770B\u6B64\u5185\u5BB9\u3002\"},\"20\":{\"string\":\"\u6700\u597D\u4EE5\u7EB5\u5411\u6A21\u5F0F\u67E5\u770B\u6B64\u9875\u9762\"},\"21\":{\"string\":\"\u62B1\u6B49\uFF0C\u60A8\u7684\u6D4F\u89C8\u5668\u597D\u50CF\u4E0D\u652F\u6301\u8FD9\u79CD\u4F53\u9A8C\"},\"22\":{\"string\":\"\u63A5\u53D7\"},\"23\":{\"string\":\"\u62D2\u7EDD\"},\"25\":{\"string\":\"\u5728\u539F\u59CB\u7F51\u57DF\u4E2D\u67E5\u770B\uFF1A\"},\"26\":{\"string\":\"\u5173\u4E8E AMP \u7ED3\u679C\u7684\u66F4\u591A\u5185\u5BB9\"},\"27\":{\"string\":\"\u4ECD\u7136\u7EE7\u7EED\"},\"31\":{\"string\":\"\u58F0\u97F3\u5DF2\u5173\u95ED\"},\"32\":{\"string\":\"\u58F0\u97F3\u5DF2\u5F00\u542F\"},\"33\":{\"string\":\"\u6B64\u9875\u6CA1\u6709\u58F0\u97F3\"},\"34\":{\"string\":\"\u64AD\u653E\u89C6\u9891\"},\"35\":{\"string\":\"\u5411\u4E0A\u6ED1\u52A8\"},\"36\":{\"string\":\"\u5C55\u5F00 Twitter \u5FAE\u535A\"},\"37\":{\"string\":\"\u8981\u67E5\u770B\u8FD9\u79CD\u4F53\u9A8C\uFF0C\u8BF7\u52A0\u5927\u7A97\u53E3\u9AD8\u5EA6\"},\"38\":{\"string\":\"\u8981\u67E5\u770B\u8FD9\u79CD\u4F53\u9A8C\uFF0C\u8BF7\u52A0\u5927\u7A97\u53E3\u5BBD\u5EA6\"},\"63\":{\"string\":\"Line\"}}"); // lgtm[js/syntax-error]
var LocalizedStringsZhTw = JSON.parse("{\"2\":{\"string\":\"\u8F15\u89F8 [\u4E0B\u4E00\u9801]\"},\"3\":{\"string\":\"\u8F15\u89F8 [\u4E0A\u4E00\u9801]\"},\"4\":{\"string\":\"\u7121\u6CD5\u5C07\u9023\u7D50\u8907\u88FD\u5230\u526A\u8CBC\u7C3F :(\"},\"5\":{\"string\":\"\u5DF2\u8907\u88FD\u9023\u7D50\uFF01\"},\"6\":{\"string\":\"\u96FB\u5B50\u90F5\u4EF6\"},\"7\":{\"string\":\"Facebook\"},\"8\":{\"string\":\"Google+\"},\"9\":{\"string\":\"\u53D6\u5F97\u9023\u7D50\"},\"10\":{\"string\":\"LinkedIn\"},\"11\":{\"string\":\"Pinterest\"},\"12\":{\"string\":\"\u7C21\u8A0A\"},\"14\":{\"string\":\"Tumblr\"},\"15\":{\"string\":\"Twitter\"},\"16\":{\"string\":\"WhatsApp\"},\"18\":{\"string\":\"\u5982\u8981\u67E5\u770B\u6545\u4E8B\uFF0C\u8ACB\u5C07\u8996\u7A97\u8ABF\u9AD8\u4E26\u8ABF\u5BEC\"},\"19\":{\"string\":\"\u4F60\u5FC5\u9808\u555F\u7528 AMP \u6545\u4E8B\u5BE6\u9A57\u624D\u80FD\u67E5\u770B\u6B64\u5167\u5BB9\u3002\"},\"20\":{\"string\":\"\u4F60\u53EA\u80FD\u7E31\u5411\u67E5\u770B\u9019\u500B\u9801\u9762\"},\"21\":{\"string\":\"\u5F88\u62B1\u6B49\uFF0C\u4F60\u7684\u700F\u89BD\u5668\u4E0D\u652F\u63F4\u9019\u9805\u670D\u52D9\"},\"22\":{\"string\":\"\u63A5\u53D7\"},\"23\":{\"string\":\"\u62D2\u7D55\"},\"25\":{\"string\":\"\u5728\u539F\u59CB\u7DB2\u57DF\u4E2D\u67E5\u770B\uFF1A\"},\"26\":{\"string\":\"\u66F4\u591A\u8207 AMP \u7D50\u679C\u76F8\u95DC\u7684\u8CC7\u8A0A\"},\"27\":{\"string\":\"\u4ECD\u8981\u7E7C\u7E8C\"},\"31\":{\"string\":\"\u5DF2\u95DC\u9589\u97F3\u6548\"},\"32\":{\"string\":\"\u5DF2\u958B\u555F\u97F3\u6548\"},\"33\":{\"string\":\"\u9019\u500B\u9801\u9762\u6C92\u6709\u97F3\u6548\"},\"34\":{\"string\":\"\u64AD\u653E\u5F71\u7247\"},\"35\":{\"string\":\"\u5411\u4E0A\u6ED1\u52D5\"},\"36\":{\"string\":\"\u5C55\u958B Tweet\"},\"37\":{\"string\":\"\u5982\u8981\u67E5\u770B\u6545\u4E8B\uFF0C\u8ACB\u5C07\u8996\u7A97\u9AD8\u5EA6\u8ABF\u9AD8\"},\"38\":{\"string\":\"\u5982\u8981\u67E5\u770B\u6545\u4E8B\uFF0C\u8ACB\u5C07\u8996\u7A97\u5BEC\u5EA6\u8ABF\u5BEC\"},\"63\":{\"string\":\"Line\"}}"); // lgtm[js/syntax-error]

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
var MAX_MEDIA_ELEMENT_COUNTS = (_MAX_MEDIA_ELEMENT_CO = {}, _defineProperty(_MAX_MEDIA_ELEMENT_CO,
MediaType.AUDIO, 4), _defineProperty(_MAX_MEDIA_ELEMENT_CO,
MediaType.VIDEO, 8), _MAX_MEDIA_ELEMENT_CO);


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
  attributeFilter: ['open'] };


/**
 * @implements {./media-pool.MediaPoolRoot}
 */
export var AmpStory = /*#__PURE__*/function (_AMP$BaseElement) {_inherits(AmpStory, _AMP$BaseElement);var _super = _createSuper(AmpStory);





  /** @param {!AmpElement} element */
  function AmpStory(element) {var _this;_classCallCheck(this, AmpStory);
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
    new ViewportWarningLayer(
    _this.win,
    _this.element,
    DESKTOP_WIDTH_THRESHOLD,
    DESKTOP_HEIGHT_THRESHOLD);


    /** @private {!Array<!./amp-story-page.AmpStoryPage>} */
    _this.pages_ = [];

    /** @private @const {!Array<!./amp-story-page.AmpStoryPage>} */
    _this.adPages_ = [];

    /** @const @private {!./variable-service.AmpStoryVariableService} */
    _this.variableService_ = getVariableService(_this.win);

    /** @private {?./amp-story-page.AmpStoryPage} */
    _this.activePage_ = null;

    /** @private @const */
    _this.desktopMedia_ = _this.win.matchMedia(
    "(min-width: ".concat(DESKTOP_WIDTH_THRESHOLD, "px) and ") + "(min-height: ".concat(
    DESKTOP_HEIGHT_THRESHOLD, "px)"));


    /** @private @const */
    _this.desktopOnePanelMedia_ = _this.win.matchMedia("(min-aspect-ratio: ".concat(
    DESKTOP_ONE_PANEL_ASPECT_RATIO_THRESHOLD, ")"));


    /** @private @const */
    _this.canRotateToDesktopMedia_ = _this.win.matchMedia(
    "(min-width: ".concat(DESKTOP_HEIGHT_THRESHOLD, "px) and ") + "(min-height: ".concat(
    DESKTOP_WIDTH_THRESHOLD, "px)"));


    /** @private @const */
    _this.landscapeOrientationMedia_ = _this.win.matchMedia(
    '(orientation: landscape)');


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
    _this.backgroundBlur_ = null;return _this;
  }

  /** @override */_createClass(AmpStory, [{ key: "buildCallback", value:
    function buildCallback() {var _this2 = this;
      this.viewer_ = Services.viewerForDoc(this.element);

      this.viewerMessagingHandler_ = this.viewer_.isEmbedded() ?
      new AmpStoryViewerMessagingHandler(this.win, this.viewer_) :
      null;

      this.localizationService_ = getLocalizationService(this.element);

      this.localizationService_.
      registerLocalizedStringBundle('default', LocalizedStringsDefault).
      registerLocalizedStringBundle('ar', LocalizedStringsAr).
      registerLocalizedStringBundle('de', LocalizedStringsDe).
      registerLocalizedStringBundle('en', LocalizedStringsEn).
      registerLocalizedStringBundle('en-GB', LocalizedStringsEnGb).
      registerLocalizedStringBundle('es', LocalizedStringsEs).
      registerLocalizedStringBundle('es-419', LocalizedStringsEs419).
      registerLocalizedStringBundle('fr', LocalizedStringsFr).
      registerLocalizedStringBundle('hi', LocalizedStringsHi).
      registerLocalizedStringBundle('id', LocalizedStringsId).
      registerLocalizedStringBundle('it', LocalizedStringsIt).
      registerLocalizedStringBundle('ja', LocalizedStringsJa).
      registerLocalizedStringBundle('ko', LocalizedStringsKo).
      registerLocalizedStringBundle('nl', LocalizedStringsNl).
      registerLocalizedStringBundle('no', LocalizedStringsNo).
      registerLocalizedStringBundle('pt-PT', LocalizedStringsPtPt).
      registerLocalizedStringBundle('pt-BR', LocalizedStringsPtBr).
      registerLocalizedStringBundle('ru', LocalizedStringsRu).
      registerLocalizedStringBundle('tr', LocalizedStringsTr).
      registerLocalizedStringBundle('vi', LocalizedStringsVi).
      registerLocalizedStringBundle('zh-CN', LocalizedStringsZhCn).
      registerLocalizedStringBundle('zh-TW', LocalizedStringsZhTw);

      var enXaPseudoLocaleBundle = createPseudoLocale(
      LocalizedStringsEn,
      function (s) {return "[".concat(s, " one two]");});

      this.localizationService_.registerLocalizedStringBundle(
      'en-xa',
      enXaPseudoLocaleBundle);


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
        var page = this.element.querySelector("amp-story-page#".concat(
        escapeCssSelectorIdent(pageId)));

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
      var textNodes = childNodes(
      this.element,
      function (node) {return node.nodeType === Node.TEXT_NODE;});

      textNodes.forEach(function (node) {
        _this2.element.removeChild(node);
      });

      if (isExperimentOn(this.win, 'amp-story-branching')) {
        this.registerAction('goToPage', function (invocation) {
          var args = invocation.args;
          if (!args) {
            return;
          }
          _this2.storeService_.dispatch(
          Action.SET_ADVANCEMENT_MODE,
          AdvancementMode.GO_TO_PAGE);

          // If open, closes the sidebar before navigating.
          var promise = _this2.storeService_.get(StateProperty.SIDEBAR_STATE) ?
          Services.historyForDoc(_this2.getAmpDoc()).goBack() :
          _resolvedPromise();
          promise.then(function () {return (
              _this2.switchTo_(args['id'], NavigationDirection.NEXT));});

        });
      }
      if (isExperimentOn(this.win, 'story-load-first-page-only')) {
        Services.performanceFor(this.win).addEnabledExperiment(
        'story-load-first-page-only');

      }
      if (
      isExperimentOn(this.win, 'story-disable-animations-first-page') ||
      prefersReducedMotion(this.win))
      {
        Services.performanceFor(this.win).addEnabledExperiment(
        'story-disable-animations-first-page');

      }
      if (isExperimentOn(this.win, 'story-load-inactive-outside-viewport')) {
        Services.performanceFor(this.win).addEnabledExperiment(
        'story-load-inactive-outside-viewport');

        this.element.classList.add(
        'i-amphtml-experiment-story-load-inactive-outside-viewport');

      }

      if (this.maybeLoadStoryDevTools_()) {
        return;
      }
    }

    /**
     * Pauses the whole story on viewer visibilityState updates, or tab visibility
     * updates.
     * @private
     */ }, { key: "pause_", value:
    function pause_() {
      // Preserve if previously set. This method can be called several times when
      // setting the visibilitystate to paused and then inactive.
      if (this.pausedStateToRestore_ === null) {
        this.pausedStateToRestore_ = !!this.storeService_.get(
        StateProperty.PAUSED_STATE);

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
     */ }, { key: "resume_", value:
    function resume_() {
      this.storeService_.dispatch(
      Action.TOGGLE_PAUSED,
      this.pausedStateToRestore_);

      this.pausedStateToRestore_ = null;
      if (!this.storeService_.get(StateProperty.MUTED_STATE)) {
        this.playBackgroundAudio_();
      }
    }

    /**
     * Note: runs in the buildCallback vsync mutate context.
     * @private
     */ }, { key: "initializeStandaloneStory_", value:
    function initializeStandaloneStory_() {
      var html = this.win.document.documentElement;
      html.classList.add('i-amphtml-story-standalone');
      // Lock body to prevent overflow.
      this.lockBody_();
      // Standalone CSS affects sizing of the entire page.
      this.onResize();
    }

    /** @private */ }, { key: "initializeStyles_", value:
    function initializeStyles_() {
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
     */ }, { key: "initializeMediaQueries_", value:
    function initializeMediaQueries_(mediaQueryEls) {var _this3 = this;
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
          service.onMediaQueryMatch(media, function (matches) {return (
              onMediaQueryMatch(matches, className));});

        }
      });
    }

    /**
     * Initializes page ids by deduplicating them.
     * @private
     */ }, { key: "initializePageIds_", value:
    function initializePageIds_() {
      var pageEls = this.element.querySelectorAll('amp-story-page');
      var pageIds = toArray(pageEls).map(function (el) {return el.id || 'default-page';});
      var idsMap = map();
      for (var i = 0; i < pageIds.length; i++) {
        if (idsMap[pageIds[i]] === undefined) {
          idsMap[pageIds[i]] = 0;
          continue;
        }
        user().error(TAG, "Duplicate amp-story-page ID ".concat(pageIds[i]));
        var newId = "".concat(pageIds[i], "__").concat(++idsMap[pageIds[i]]);
        pageEls[i].id = newId;
        pageIds[i] = newId;
      }
      this.storeService_.dispatch(Action.SET_PAGE_IDS, pageIds);
    }

    /**
     * @param {!Element} styleEl
     * @private
     */ }, { key: "rewriteStyles_", value:
    function rewriteStyles_(styleEl) {
      // TODO(#15955): Update this to use CssContext from
      // ../../../extensions/amp-animation/0.1/web-animations.js
      this.mutateElement(function () {
        styleEl.textContent = styleEl.textContent.
        replace(/(-?[\d.]+)vh/gim, 'calc($1 * var(--story-page-vh))').
        replace(/(-?[\d.]+)vw/gim, 'calc($1 * var(--story-page-vw))').
        replace(/(-?[\d.]+)vmin/gim, 'calc($1 * var(--story-page-vmin))').
        replace(/(-?[\d.]+)vmax/gim, 'calc($1 * var(--story-page-vmax))');
      });
    }

    /**
     * @private
     */ }, { key: "setThemeColor_", value:
    function setThemeColor_() {
      // Don't override the publisher's tag.
      if (this.win.document.querySelector('meta[name=theme-color]')) {
        return;
      }
      // The theme color should be copied from the story's primary accent color
      // if possible, with the fall back being default dark gray.
      var meta = this.win.document.createElement('meta');
      var ampStoryPageEl = this.element.querySelector('amp-story-page');
      meta.name = 'theme-color';
      meta.content =
      computedStyle(this.win, this.element).getPropertyValue(
      '--primary-color') ||

      computedStyle(
      this.win, /** @type {!Element} */(
      ampStoryPageEl)).
      getPropertyValue('background-color') ||
      DEFAULT_THEME_COLOR;
      this.win.document.head.appendChild(meta);
    }

    /**
     * Builds the system layer DOM.
     * @param {string} initialPageId
     * @private
     */ }, { key: "buildSystemLayer_", value:
    function buildSystemLayer_(initialPageId) {
      this.updateAudioIcon_();
      this.updatePausedIcon_();
      this.element.appendChild(this.systemLayer_.build(initialPageId));
    }

    /** @private */ }, { key: "initializeListeners_", value:
    function initializeListeners_() {var _this4 = this;
      this.element.addEventListener(EventType.NEXT_PAGE, function () {
        _this4.next_();
      });

      this.element.addEventListener(EventType.PREVIOUS_PAGE, function () {
        _this4.previous_();
      });

      this.storeService_.subscribe(
      StateProperty.MUTED_STATE,
      function (isMuted) {
        _this4.onMutedStateUpdate_(isMuted);
        _this4.variableService_.onVariableUpdate(
        AnalyticsVariable.STORY_IS_MUTED,
        isMuted);

      },
      true /** callToInitialize */);


      this.storeService_.subscribe(
      StateProperty.MUTED_STATE,
      function (isMuted) {
        // We do not want to trigger an analytics event for the initialization of
        // the muted state.
        _this4.analyticsService_.triggerEvent(
        isMuted ?
        StoryAnalyticsEvent.STORY_MUTED :
        StoryAnalyticsEvent.STORY_UNMUTED);

      },
      false /** callToInitialize */);


      this.storeService_.subscribe(
      StateProperty.SUPPORTED_BROWSER_STATE,
      function (isBrowserSupported) {
        _this4.onSupportedBrowserStateUpdate_(isBrowserSupported);
      });


      this.storeService_.subscribe(StateProperty.ADVANCEMENT_MODE, function (mode) {
        _this4.variableService_.onVariableUpdate(
        AnalyticsVariable.STORY_ADVANCEMENT_MODE,
        mode);

      });

      this.storeService_.subscribe(
      StateProperty.CAN_SHOW_AUDIO_UI,
      function (show) {
        _this4.element.classList.toggle('i-amphtml-story-no-audio-ui', !show);
      },
      true /** callToInitialize */);


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
        if (!false) {
          return;
        }

        var action = getDetail(e)['action'];
        var data = getDetail(e)['data'];
        _this4.storeService_.dispatch(action, data);
      });

      // Actions allowlist could be initialized empty, or with some actions some
      // other components registered.
      this.storeService_.subscribe(
      StateProperty.ACTIONS_ALLOWLIST,
      function (actionsAllowlist) {
        var actions = Services.actionServiceForDoc(_this4.element);
        actions.setAllowlist(actionsAllowlist);
      },
      true /** callToInitialize */);


      this.storeService_.subscribe(StateProperty.AD_STATE, function (isAd) {
        _this4.onAdStateUpdate_(isAd);
      });

      this.storeService_.subscribe(StateProperty.PAUSED_STATE, function (isPaused) {
        _this4.onPausedStateUpdate_(isPaused);
      });

      this.storeService_.subscribe(
      StateProperty.SIDEBAR_STATE,
      function (sidebarState) {
        _this4.onSidebarStateUpdate_(sidebarState);
      });


      this.storeService_.subscribe(
      StateProperty.UI_STATE,
      function (uiState) {
        _this4.onUIStateUpdate_(uiState);
      },
      true /** callToInitialize */);


      this.win.document.addEventListener(
      'keydown',
      function (e) {
        _this4.onKeyDown_(e);
      },
      true);


      this.win.document.addEventListener('contextmenu', function (e) {
        var uiState = _this4.storeService_.get(StateProperty.UI_STATE);
        if (uiState === UIType.MOBILE) {
          if (!_this4.allowContextMenuOnMobile_(e.target)) {
            e.preventDefault();
          }
          e.stopPropagation();
        }
      });

      this.getAmpDoc().onVisibilityChanged(function () {return _this4.onVisibilityChanged_();});

      this.win.addEventListener('hashchange', function () {
        var maybePageId = parseQueryString(_this4.win.location.hash)['page'];
        if (!maybePageId || !_this4.isActualPage_(maybePageId)) {
          return;
        }
        _this4.switchTo_(maybePageId, NavigationDirection.NEXT);
        // Removes the page 'hash' parameter from the URL.
        var href = _this4.win.location.href.replace(
        new RegExp("page=".concat(maybePageId, "&?")),
        '');

        if (endsWith(href, '#')) {
          href = href.slice(0, -1);
        }
        _this4.win.history.replaceState(
        (_this4.win.history && getWindowHistoryState(_this4.win.history)) ||
        {} /** data */,
        _this4.win.document.title /** title */,
        href /** URL */);

      });

      // Listen for class mutations on the <body> element.
      var bodyElObserver = new this.win.MutationObserver(function (mutations) {return (
          _this4.onBodyElMutation_(mutations));});

      bodyElObserver.observe(this.win.document.body, {
        attributes: true,
        attributeFilter: ['class'] });


      this.getViewport().onResize(debounce(this.win, function () {return _this4.onResize();}, 300));
      this.installGestureRecognizers_();

      // TODO(gmajoulet): migrate this to amp-story-viewer-messaging-handler once
      // there is a way to navigate to pages that does not involve using private
      // amp-story methods.
      this.viewer_.onMessage('selectPage', function (data) {return _this4.onSelectPage_(data);});
      this.viewer_.onMessage('rewind', function () {return _this4.onRewind_();});

      if (this.viewerMessagingHandler_) {
        this.viewerMessagingHandler_.startListening();
      }
    }

    /** @private */ }, { key: "onBodyElMutation_", value:
    function onBodyElMutation_(mutations) {var _this5 = this;
      mutations.forEach(function (mutation) {
        var bodyEl = /** @type {!Element} */(mutation.target);

        // Updates presence of the `amp-mode-keyboard-active` class on the store.
        _this5.storeService_.dispatch(
        Action.TOGGLE_KEYBOARD_ACTIVE_STATE,
        bodyEl.classList.contains('amp-mode-keyboard-active'));

      });
    }

    /** @private */ }, { key: "installGestureRecognizers_", value:
    function installGestureRecognizers_() {var _this6 = this;
      // If the story is within a viewer that enabled the swipe capability, this
      // disables the navigation education overlay to enable:
      //   - horizontal swipe events to the next story
      //   - vertical swipe events to close the viewer, or open a page attachment
      if (this.viewer_.hasCapability('swipe')) {
        return;
      }

      var element = this.element;
      var gestures = Gestures.get(element, /* shouldNotPreventDefault */true);

      // Shows "tap to navigate" hint when swiping.
      gestures.onGesture(SwipeXYRecognizer, function (gesture) {
        var _gesture$data = gesture.data,deltaX = _gesture$data.deltaX,deltaY = _gesture$data.deltaY;
        var embedComponent = /** @type {InteractiveComponentDef} */(
        _this6.storeService_.get(StateProperty.INTERACTIVE_COMPONENT_STATE));

        // TODO(enriqe): Move to a separate file if this keeps growing.
        if (
        embedComponent.state !== EmbeddedComponentState.HIDDEN ||
        _this6.storeService_.get(StateProperty.ACCESS_STATE) ||
        _this6.storeService_.get(StateProperty.SIDEBAR_STATE) ||
        !_this6.storeService_.get(StateProperty.SYSTEM_UI_IS_VISIBLE_STATE) ||
        !_this6.storeService_.get(StateProperty.CAN_SHOW_NAVIGATION_OVERLAY_HINT))
        {
          // Cancels the event for this gesture entirely, ensuring the hint won't
          // show even if the user keeps swiping without releasing the touch.
          if (gesture.event && gesture.event.cancelable !== false) {
            gesture.event.preventDefault();
          }
          return;
        }
        if (
        (gesture.event && gesture.event.defaultPrevented) ||
        !_this6.isSwipeLargeEnoughForHint_(deltaX, deltaY))
        {
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
     */ }, { key: "isSwipeLargeEnoughForHint_", value:
    function isSwipeLargeEnoughForHint_(deltaX, deltaY) {
      var sideSwipe = Math.abs(deltaX) >= MIN_SWIPE_FOR_HINT_OVERLAY_PX;
      var upSwipe = -1 * deltaY >= MIN_SWIPE_FOR_HINT_OVERLAY_PX;
      return sideSwipe || upSwipe;
    }

    /** @private */ }, { key: "initializeListenersForDev_", value:
    function initializeListenersForDev_() {var _this7 = this;
      if (!false) {
        return;
      }

      this.element.addEventListener(EventType.DEV_LOG_ENTRIES_AVAILABLE, function (e) {
        _this7.systemLayer_.logAll( /** @type {?} */(getDetail(e)));
      });
    }

    /** @private */ }, { key: "lockBody_", value:
    function lockBody_() {
      var document = this.win.document;
      setImportantStyles(document.documentElement, {
        'overflow': 'hidden' });

      setImportantStyles(document.body, {
        'overflow': 'hidden' });


      this.getViewport().resetTouchZoom();
      this.getViewport().disableTouchZoom();
      this.maybeLockScreenOrientation_();
    }

    /** @private */ }, { key: "maybeLockScreenOrientation_", value:
    function maybeLockScreenOrientation_() {
      var screen = this.win.screen;
      if (!screen || !this.canRotateToDesktopMedia_.matches) {
        return;
      }

      var lockOrientation =
      screen.orientation.lock ||
      screen.lockOrientation ||
      screen.mozLockOrientation ||
      screen.msLockOrientation || (
      function (unusedOrientation) {});

      try {
        lockOrientation('portrait');
      } catch (e) {
        dev().warn(TAG, 'Failed to lock screen orientation:', e.message);
      }
    }

    /** @override */ }, { key: "layoutCallback", value:
    function layoutCallback() {
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
     */ }, { key: "layoutStory_", value:
    function layoutStory_() {var _this8 = this;
      var initialPageId = this.getInitialPageId_();

      this.buildSystemLayer_(initialPageId);
      this.initializeSidebar_();
      this.setThemeColor_();

      var storyLayoutPromise = Promise.all([
      this.getAmpDoc().whenFirstVisible(), // Pauses execution during prerender.
      this.initializePages_()]).

      then(function () {
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
      }).
      then(function () {return (
          // We need to call this.getInitialPageId_() again because the initial
          // page could've changed between the start of layoutStory_ and here.
          _this8.switchTo_(_this8.getInitialPageId_(), NavigationDirection.NEXT));}).

      then(function () {
        var shouldReOpenAttachmentForPageId = getHistoryState(
        _this8.win,
        HistoryState.ATTACHMENT_PAGE_ID);


        if (shouldReOpenAttachmentForPageId === _this8.activePage_.element.id) {
          _this8.activePage_.openAttachment(false /** shouldAnimate */);
        }

        // Preloads and prerenders the share menu.
        _this8.shareMenu_.build();

        var infoDialog = shouldShowStoryUrlInfo(devAssert(_this8.viewer_)) ?
        new InfoDialog(_this8.win, _this8.element) :
        null;
        if (infoDialog) {
          infoDialog.build();
        }
      });

      // Do not block the layout callback on the completion of these promises, as
      // that prevents descendents from being laid out (and therefore loaded).
      storyLayoutPromise.
      then(function () {return (
          _this8.whenInitialContentLoaded_(INITIAL_CONTENT_LOAD_TIMEOUT_MS));}).

      then(function () {
        _this8.markStoryAsLoaded_();
        _this8.initializeLiveStory_();
      });

      this.maybeLoadStoryEducation_();

      // Story is being prerendered: resolve the layoutCallback when the active
      // page is built. Other pages will only build if the document becomes
      // visible.
      var initialPageEl = this.element.querySelector("amp-story-page#".concat(
      escapeCssSelectorIdent(initialPageId)));

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
     */ }, { key: "initializeLiveStory_", value:
    function initializeLiveStory_() {var _this9 = this;
      if (this.element.hasAttribute('live-story')) {
        this.liveStoryManager_ = new LiveStoryManager(this);
        this.liveStoryManager_.build();

        this.storeService_.dispatch(Action.ADD_TO_ACTIONS_ALLOWLIST, [
        { tagOrTarget: 'AMP-LIVE-LIST', method: 'update' }]);


        this.element.addEventListener(AmpEvents.DOM_UPDATE, function () {
          _this9.liveStoryManager_.update();
          _this9.initializePages_().then(function () {
            _this9.preloadPagesByDistance_();
            if (
            _this9.storeService_.get(StateProperty.UI_STATE) ===
            UIType.DESKTOP_PANELS)
            {
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
     */ }, { key: "getInitialPageId_", value:
    function getInitialPageId_() {
      var maybePageId = parseQueryString(this.win.location.hash)['page'];
      if (maybePageId && this.isActualPage_(maybePageId)) {
        return maybePageId;
      }

      var pages = /**  @type {!Array} */(
      getHistoryState(this.win, HistoryState.NAVIGATION_PATH) || []);

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
     */ }, { key: "isActualPage_", value:
    function isActualPage_(pageId) {
      if (this.pages_.length > 0) {
        return this.pages_.some(function (page) {return page.element.id === pageId;});
      }
      return !!this.element.querySelector("#".concat(escapeCssSelectorIdent(pageId)));
    }

    /**
     * @param {number} timeoutMs The maximum amount of time to wait, in
     *     milliseconds.
     * @return {!Promise} A promise that is resolved when the initial content is
     *     loaded or the timeout has been exceeded, whichever happens first.
     * @private
     */ }, { key: "whenInitialContentLoaded_", value:
    function whenInitialContentLoaded_() {var timeoutMs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      var pagesToWaitFor =
      this.storeService_.get(StateProperty.UI_STATE) === UIType.DESKTOP_PANELS ?
      [this.pages_[0], this.pages_[1]] :
      [this.pages_[0]];

      var storyLoadPromise = Promise.all(
      pagesToWaitFor.
      filter(Boolean).
      map(function (page) {return (
          page.element.signals().whenSignal(CommonSignals.LOAD_END));}));



      return this.timer_.
      timeoutPromise(timeoutMs, storyLoadPromise).
      catch(function () {});
    }

    /** @private */ }, { key: "markStoryAsLoaded_", value:
    function markStoryAsLoaded_() {var _this10 = this;
      dispatch(
      this.win,
      this.element,
      EventType.STORY_LOADED,
      /* payload */undefined,
      { bubbles: true });

      this.viewerMessagingHandler_ &&
      this.viewerMessagingHandler_.send('storyContentLoaded', dict({}));
      this.analyticsService_.triggerEvent(
      StoryAnalyticsEvent.STORY_CONTENT_LOADED);

      this.signals().signal(CommonSignals.INI_LOAD);
      this.mutateElement(function () {
        _this10.element.classList.add(STORY_LOADED_CLASS_NAME);
      });
    }

    /**
     * Handles the story consent extension.
     * @private
     */ }, { key: "handleConsentExtension_", value:
    function handleConsentExtension_() {
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
     */ }, { key: "pauseStoryUntilConsentIsResolved_", value:
    function pauseStoryUntilConsentIsResolved_() {var _this11 = this;
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
     */ }, { key: "validateConsent_", value:
    function validateConsent_(consentEl) {
      if (!childElementByTag(consentEl, 'amp-story-consent')) {
        user().error(TAG, 'amp-consent must have an amp-story-consent child');
      }

      var allowedTags = ['SCRIPT', 'AMP-STORY-CONSENT'];
      var toRemoveChildren = childElements(
      consentEl,
      function (el) {return allowedTags.indexOf(el.tagName) === -1;});


      if (toRemoveChildren.length === 0) {
        return;
      }
      user().error(TAG, 'amp-consent only allows tags: %s', allowedTags);
      toRemoveChildren.forEach(function (el) {return consentEl.removeChild(el);});
    }

    /**
     * @private
     */ }, { key: "initializeStoryAccess_", value:
    function initializeStoryAccess_() {var _this12 = this;
      Services.accessServiceForDocOrNull(this.element).then(function (accessService) {
        if (!accessService) {
          return;
        }

        _this12.areAccessAuthorizationsCompleted_ =
        accessService.areFirstAuthorizationsCompleted();
        accessService.onApplyAuthorizations(function () {return (
            _this12.onAccessApplyAuthorizations_());});


        var firstPage = _this12.pages_[0].element;

        // First amp-story-page can't be paywall protected.
        // Removes the access attributes, and throws an error during development.
        if (
        firstPage.hasAttribute('amp-access') ||
        firstPage.hasAttribute('amp-access-hide'))
        {
          firstPage.removeAttribute('amp-access');
          firstPage.removeAttribute('amp-access-hide');
          user().error(
          TAG,
          'First amp-story-page cannot have amp-access ' +
          'or amp-access-hide attributes');

        }
      });
    }

    /**
     * On amp-access document reauthorization, maybe hide the access UI, and maybe
     * perform navigation.
     * @private
     */ }, { key: "onAccessApplyAuthorizations_", value:
    function onAccessApplyAuthorizations_() {
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

    /** @override */ }, { key: "isLayoutSupported", value:
    function isLayoutSupported(layout) {
      return layout == Layout.CONTAINER;
    }

    /** @private */ }, { key: "initializePages_", value:
    function initializePages_() {var _this13 = this;
      var pageImplPromises = Array.prototype.map.call(
      this.element.querySelectorAll('amp-story-page'),
      function (pageEl) {return pageEl.getImpl();});


      return Promise.all(pageImplPromises).then(function (pages) {
        _this13.pages_ = pages;
        if (isExperimentOn(_this13.win, 'amp-story-branching')) {
          _this13.storeService_.dispatch(Action.ADD_TO_ACTIONS_ALLOWLIST, [
          { tagOrTarget: 'AMP-STORY', method: 'goToPage' }]);

        }
      });
    }

    /**
     * Advance to the next screen in the story, if there is one.
     * @param {boolean=} opt_isAutomaticAdvance Whether this navigation was caused
     *     by an automatic advancement after a timeout.
     * @private
     */ }, { key: "next_", value:
    function next_(opt_isAutomaticAdvance) {
      var activePage = devAssert(
      this.activePage_);


      activePage.next(opt_isAutomaticAdvance);
    }

    /**
     * Installs amp-viewer-integration script in case story is inside an
     * amp-story-player.
     * @private
     */ }, { key: "initializeStoryPlayer_", value:
    function initializeStoryPlayer_() {
      if (this.viewer_.getParam('storyPlayer') !== 'v0') {
        return;
      }
      Services.extensionsFor(this.win).installExtensionForDoc(
      this.getAmpDoc(),
      'amp-viewer-integration');

    }

    /**
     * Handles EventType.NO_NEXT_PAGE events.
     * @private
     */ }, { key: "onNoNextPage_", value:
    function onNoNextPage_() {
      if (this.viewer_.hasCapability('swipe') && this.viewerMessagingHandler_) {
        var advancementMode = this.storeService_.get(
        StateProperty.ADVANCEMENT_MODE);

        this.viewerMessagingHandler_.send(
        'selectDocument',
        dict({ 'next': true, 'advancementMode': advancementMode }));

        return;
      }
    }

    /**
     * Go back to the previous screen in the story, if there is one.
     * @private
     */ }, { key: "previous_", value:
    function previous_() {
      var activePage = devAssert(
      this.activePage_);


      activePage.previous();
    }

    /**
     * Handles EventType.NO_PREVIOUS_PAGE events.
     * @private
     */ }, { key: "onNoPreviousPage_", value:
    function onNoPreviousPage_() {
      if (this.viewer_.hasCapability('swipe') && this.viewerMessagingHandler_) {
        var advancementMode = this.storeService_.get(
        StateProperty.ADVANCEMENT_MODE);

        this.viewerMessagingHandler_.send(
        'selectDocument',
        dict({ 'previous': true, 'advancementMode': advancementMode }));

        return;
      }

      if (this.storeService_.get(StateProperty.CAN_SHOW_PREVIOUS_PAGE_HELP)) {
        this.ampStoryHint_.showFirstPageHintOverlay();
      }
    }

    /**
     * @param {number} direction The direction to navigate.
     * @private
     */ }, { key: "performTapNavigation_", value:
    function performTapNavigation_(direction) {
      this.storeService_.dispatch(
      Action.SET_ADVANCEMENT_MODE,
      AdvancementMode.MANUAL_ADVANCE);


      if (
      this.storeService_.get(StateProperty.UI_STATE) === UIType.DESKTOP_PANELS)
      {
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
     */ }, { key: "switchTo_", value:
    function switchTo_(targetPageId, direction) {var _this$backgroundBlur_,_this14 = this;
      var targetPage = this.getPageById(targetPageId);
      var pageIndex = this.getPageIndex(targetPage);

      // Step out if trying to navigate to the currently active page.
      if (this.activePage_ && this.activePage_.element.id === targetPageId) {
        return _resolvedPromise3();
      }

      // If the next page might be paywall protected, and the access
      // authorizations did not resolve yet, wait before navigating.
      // TODO(gmajoulet): implement a loading state.
      if (
      targetPage.element.hasAttribute('amp-access') &&
      !this.areAccessAuthorizationsCompleted_)
      {
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

      ((_this$backgroundBlur_ = this.backgroundBlur_) === null || _this$backgroundBlur_ === void 0) ? (void 0) : _this$backgroundBlur_.update(targetPage.element);

      // Each step will run in a requestAnimationFrame, and wait for the next
      // frame before executing the following step.
      var steps = [
      // First step contains the minimum amount of code to display and play the
      // target page as fast as possible.
      function () {
        oldPage && oldPage.element.removeAttribute('active');

        if (
        _this14.storeService_.get(StateProperty.UI_STATE) ===
        UIType.DESKTOP_PANELS)
        {
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
      },
      // Second step does all the operations that impact the UI/UX: media sound,
      // progress bar, ...
      function () {
        if (oldPage) {
          oldPage.setState(PageState.NOT_ACTIVE);

          // Indication to know where to display the page on the desktop
          // ribbon-like animation.
          _this14.getPageIndex(oldPage) < pageIndex ?
          setAttributeInMutate(oldPage, Attributes.VISITED) :
          removeAttributeInMutate(oldPage, Attributes.VISITED);

          if (oldPage.isAd()) {
            _this14.storeService_.dispatch(
            Action.SET_ADVANCEMENT_MODE,
            AdvancementMode.ADVANCE_TO_ADS);

          }
        }

        var storePageIndex = pageIndex;
        if (targetPage.isAd()) {
          _this14.storeService_.dispatch(Action.TOGGLE_AD, true);
          setAttributeInMutate(_this14, Attributes.AD_SHOWING);

          // Keep current page index when an ad is shown. Otherwise it messes
          // up with the progress variable in the VariableService.
          storePageIndex = _this14.storeService_.get(
          StateProperty.CURRENT_PAGE_INDEX);

        } else {
          _this14.storeService_.dispatch(Action.TOGGLE_AD, false);
          removeAttributeInMutate(_this14, Attributes.AD_SHOWING);

          // Start progress bar update for pages that are not ads or auto-
          // advance.
          if (!targetPage.isAutoAdvance()) {
            _this14.systemLayer_.updateProgress(
            targetPageId,
            _this14.advancement_.getProgress());

          }
        }

        _this14.storeService_.dispatch(Action.CHANGE_PAGE, {
          id: targetPageId,
          index: storePageIndex });


        // If first navigation.
        if (!oldPage) {
          _this14.registerAndPreloadBackgroundAudio_();
        }
      },
      // Third and last step contains all the actions that can be delayed after
      // the navigation happened, like preloading the following pages, or
      // sending analytics events.
      function () {
        _this14.preloadPagesByDistance_( /* prioritizeActivePage */!oldPage);
        _this14.triggerActiveEventForPage_();

        _this14.systemLayer_.resetDeveloperLogs();
        _this14.systemLayer_.setDeveloperLogContextString(
        _this14.activePage_.element.id);

      }];


      return new Promise(function (resolve) {
        targetPage.beforeVisible().then(function () {
          // Recursively executes one step per frame.
          var unqueueStepInRAF = function unqueueStepInRAF() {
            steps.shift().call(_this14);
            if (!steps.length) {
              return resolve();
            }
            _this14.win.requestAnimationFrame(function () {return unqueueStepInRAF();});
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
     */ }, { key: "updateNavigationPath_", value:
    function updateNavigationPath_(targetPageId, direction) {
      var navigationPath = /** @type {!Array<string>} */(
      this.storeService_.get(StateProperty.NAVIGATION_PATH));


      if (direction === NavigationDirection.PREVIOUS) {
        navigationPath.pop();
      }

      // Ensures the pageId is not at the top of the stack already, which can
      // happen on initial page load (e.g. reloading a page).
      if (
      direction === NavigationDirection.NEXT &&
      navigationPath[navigationPath.length - 1] !== targetPageId)
      {
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
     */ }, { key: "setDesktopPositionAttributes_", value:
    function setDesktopPositionAttributes_(targetPage) {var _this15 = this;
      if (!targetPage) {
        return;
      }

      var list = [{ page: targetPage, position: 0 }];

      var minusOneId = targetPage.getPreviousPageId();
      if (minusOneId) {
        var minusOnePage = this.getPageById(minusOneId);
        list.push({ page: minusOnePage, position: -1 });

        var minusTwoId = minusOnePage.getPreviousPageId();
        if (minusTwoId) {
          list.push({ page: this.getPageById(minusTwoId), position: -2 });
        }
      }

      var plusOneId = targetPage.getNextPageId();
      if (plusOneId) {
        var plusOnePage = this.getPageById(plusOneId);
        list.push({ page: plusOnePage, position: 1 });

        var plusTwoId = plusOnePage.getNextPageId();
        if (plusTwoId) {
          list.push({ page: this.getPageById(plusTwoId), position: 2 });
        }
      }

      var desktopPositionsToReset;

      this.measureMutateElement(
      /** measurer */
      function () {
        desktopPositionsToReset = scopedQuerySelectorAll(
        _this15.element, "amp-story-page[\n                      ".concat(

        escapeCssSelectorIdent(Attributes.DESKTOP_POSITION), "]"));

      },
      /** mutator */
      function () {
        Array.prototype.forEach.call(desktopPositionsToReset, function (el) {
          el.removeAttribute(Attributes.DESKTOP_POSITION);
        });

        list.forEach(function (entry) {
          var page = entry.page,position = entry.position;
          page.element.setAttribute(Attributes.DESKTOP_POSITION, position);
        });
      });

    }

    /** @private */ }, { key: "triggerActiveEventForPage_", value:
    function triggerActiveEventForPage_() {
      // TODO(alanorozco): pass event priority once amphtml-story repo is merged
      // with upstream.
      Services.actionServiceForDoc(this.element).trigger(
      this.activePage_.element,
      'active',
      /* event */null,
      ActionTrust.HIGH);

    }

    /**
     * For some reason, Safari has an issue where sometimes when pages become
     * visible, some descendants are not painted.  This is a hack, where we detect
     * that the browser is Safari and force it to repaint, to avoid this case.
     * See newmuis/amphtml-story#106 for details.
     * @private
     */ }, { key: "forceRepaintForSafari_", value:
    function forceRepaintForSafari_() {var _this16 = this;
      if (!this.platform_.isSafari() && !this.platform_.isIos()) {
        return;
      }
      if (
      this.storeService_.get(StateProperty.UI_STATE) === UIType.DESKTOP_PANELS)
      {
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
        var height = _this16.element. /*OK*/offsetHeight;
        if (height >= 0) {
          toggle(_this16.element, true);
        }
      });
    }

    /**
     * Handles all key presses within the story.
     * @param {!Event} e The keydown event.
     * @private
     */ }, { key: "onKeyDown_", value:
    function onKeyDown_(e) {
      this.storeService_.dispatch(
      Action.SET_ADVANCEMENT_MODE,
      AdvancementMode.MANUAL_ADVANCE);


      var rtlState = this.storeService_.get(StateProperty.RTL_STATE);

      switch (e.key) {
        case Keys.LEFT_ARROW:
          rtlState ? this.next_() : this.previous_();
          break;
        case Keys.RIGHT_ARROW:
          rtlState ? this.previous_() : this.next_();
          break;}

    }

    /**
     * Handle resize events and set the story's desktop state.
     * @visibleForTesting
     */ }, { key: "onResize", value:
    function onResize() {
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
     */ }, { key: "setOrientationAttribute_", value:
    function setOrientationAttribute_(isLandscape, isLandscapeSupported) {var _this17 = this;
      // TODO(#20832) base this check on the size of the amp-story-page, once it
      // is stored as a store state.
      this.mutateElement(function () {
        _this17.element.setAttribute(
        Attributes.ORIENTATION,
        isLandscapeSupported && isLandscape ? 'landscape' : 'portrait');

      });
    }

    /**
     * Maybe triggers the viewport warning overlay.
     * @param {boolean} isLandscape
     * @private
     */ }, { key: "maybeTriggerViewportWarning_", value:
    function maybeTriggerViewportWarning_(isLandscape) {var _this18 = this;
      if (isDesktopOnePanelExperimentOn(this.win)) {
        return;
      }
      if (
      isLandscape ===
      this.storeService_.get(StateProperty.VIEWPORT_WARNING_STATE))
      {
        return;
      }

      this.mutateElement(function () {
        if (isLandscape) {
          _this18.pausedStateToRestore_ = !!_this18.storeService_.get(
          StateProperty.PAUSED_STATE);

          _this18.storeService_.dispatch(Action.TOGGLE_PAUSED, true);
          _this18.storeService_.dispatch(Action.TOGGLE_VIEWPORT_WARNING, true);
        } else {
          _this18.storeService_.dispatch(
          Action.TOGGLE_PAUSED,
          _this18.pausedStateToRestore_);

          _this18.pausedStateToRestore_ = null;
          _this18.storeService_.dispatch(Action.TOGGLE_VIEWPORT_WARNING, false);
        }
      });
    }

    /**
     * Reacts to the browser tab becoming active/inactive.
     * @private
     */ }, { key: "onVisibilityChanged_", value:
    function onVisibilityChanged_() {
      this.getAmpDoc().isVisible() ? this.resume_() : this.pause_();
    }

    /**
     * Reacts to the ad state updates, and pauses the background-audio when an ad
     * is displayed.
     * @param {boolean} isAd
     * @private
     */ }, { key: "onAdStateUpdate_", value:
    function onAdStateUpdate_(isAd) {
      if (this.storeService_.get(StateProperty.MUTED_STATE)) {
        return;
      }

      isAd ? this.pauseBackgroundAudio_() : this.playBackgroundAudio_();
    }

    /**
     * Reacts to UI state updates.
     * @param {!UIType} uiState
     * @private
     */ }, { key: "onUIStateUpdate_", value:
    function onUIStateUpdate_(uiState) {var _this$backgroundBlur_2,_this19 = this;
      ((_this$backgroundBlur_2 = this.backgroundBlur_) === null || _this$backgroundBlur_2 === void 0) ? (void 0) : _this$backgroundBlur_2.detach();
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
          var pageAttachments = scopedQuerySelectorAll(
          this.element,
          'amp-story-page amp-story-page-attachment');


          this.vsync_.mutate(function () {
            _this19.element.setAttribute('i-amphtml-vertical', '');
            setImportantStyles(_this19.win.document.body, { height: 'auto' });
            _this19.element.removeAttribute('desktop');
            _this19.element.classList.remove('i-amphtml-story-desktop-fullbleed');
            _this19.element.classList.remove('i-amphtml-story-desktop-panels');
            for (var i = 0; i < pageAttachments.length; i++) {
              _this19.element.insertBefore(
              pageAttachments[i],
              // Attachments that are just links are rendered in-line with their
              // story page.
              pageAttachments[i].getAttribute('href') ?
              pageAttachments[i].parentElement.nextElementSibling :
              // Other attachments are rendered at the end.
              null);

            }
          });

          this.signals().
          whenSignal(CommonSignals.LOAD_END).
          then(function () {
            _this19.vsync_.mutate(function () {
              _this19.pages_.forEach(function (page) {return (
                  page.element.setAttribute('active', ''));});

            });
          });
          break;}

    }

    /**
     * Retrieves the UI type that should be used to view the story.
     * @return {!UIType}
     * @private
     */ }, { key: "getUIType_", value:
    function getUIType_() {
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
     */ }, { key: "isDesktop_", value:
    function isDesktop_() {
      if (isDesktopOnePanelExperimentOn(this.win)) {
        return this.desktopOnePanelMedia_.matches && !this.platform_.isBot();
      }
      return this.desktopMedia_.matches && !this.platform_.isBot();
    }

    /**
     * @return {boolean} True if the screen orientation is landscape.
     * @private
     */ }, { key: "isLandscape_", value:
    function isLandscape_() {
      return this.landscapeOrientationMedia_.matches;
    }

    /**
     * @return {boolean} true if this is a standalone story (i.e. this story is
     *     the only content of the document).
     * @private
     */ }, { key: "isStandalone_", value:
    function isStandalone_() {
      return this.element.hasAttribute(Attributes.STANDALONE);
    }

    /**
     * Whether the story should support landscape orientation: landscape mobile,
     * or full bleed desktop UI.
     * @return {boolean}
     * @private
     */ }, { key: "isLandscapeSupported_", value:
    function isLandscapeSupported_() {
      return this.element.hasAttribute(Attributes.SUPPORTS_LANDSCAPE);
    }

    /**
     * Reacts to paused state updates.
     * @param {boolean} isPaused
     * @private
     */ }, { key: "onPausedStateUpdate_", value:
    function onPausedStateUpdate_(isPaused) {
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
     */ }, { key: "onSidebarStateUpdate_", value:
    function onSidebarStateUpdate_(sidebarState) {var _this20 = this;
      this.analyticsService_.triggerEvent(
      sidebarState ? StoryAnalyticsEvent.OPEN : StoryAnalyticsEvent.CLOSE,
      this.sidebar_);


      var actions = Services.actionServiceForDoc(this.element);
      if (this.win.MutationObserver) {
        if (!this.sidebarObserver_) {
          this.sidebarObserver_ = new this.win.MutationObserver(function () {
            _this20.storeService_.dispatch(
            Action.TOGGLE_SIDEBAR,
            _this20.sidebar_.hasAttribute('open'));

          });
        }
        if (this.sidebar_ && sidebarState) {
          this.sidebarObserver_.observe(this.sidebar_, SIDEBAR_OBSERVER_OPTIONS);
          this.openOpacityMask_();
          actions.execute(
          this.sidebar_,
          'open',
          /* args */null,
          /* source */null,
          /* caller */null,
          /* event */null,
          ActionTrust.HIGH);

        } else {
          this.closeOpacityMask_();
          this.sidebarObserver_.disconnect();
        }
      } else if (this.sidebar_ && sidebarState) {
        this.openOpacityMask_();
        actions.execute(
        this.sidebar_,
        'open',
        /* args */null,
        /* source */null,
        /* caller */null,
        /* event */null,
        ActionTrust.HIGH);

        this.storeService_.dispatch(Action.TOGGLE_SIDEBAR, false);
      }
    }

    /**
     * @private
     */ }, { key: "initializeOpacityMask_", value:
    function initializeOpacityMask_() {var _this21 = this;
      if (!this.maskElement_) {
        var maskEl = this.win.document.createElement('div');
        maskEl.classList.add(OPACITY_MASK_CLASS_NAME);
        maskEl.addEventListener('click', function () {
          var actions = Services.actionServiceForDoc(_this21.element);
          if (_this21.sidebar_) {
            _this21.closeOpacityMask_();
            actions.execute(
            _this21.sidebar_,
            'close',
            /* args */null,
            /* source */null,
            /* caller */null,
            /* event */null,
            ActionTrust.HIGH);

          }
        });
        this.maskElement_ = maskEl;
        this.mutateElement(function () {
          _this21.element.appendChild(_this21.maskElement_);
          toggle( /** @type {!Element} */(_this21.maskElement_), /* display */false);
        });
      }
    }

    /**
     * @private
     */ }, { key: "openOpacityMask_", value:
    function openOpacityMask_() {var _this22 = this;
      this.mutateElement(function () {
        toggle( /** @type {!Element} */(_this22.maskElement_), /* display */true);
      });
    }

    /**
     * @private
     */ }, { key: "closeOpacityMask_", value:
    function closeOpacityMask_() {var _this23 = this;
      if (this.maskElement_) {
        this.mutateElement(function () {
          toggle( /** @type {!Element} */(_this23.maskElement_), /* display */false);
        });
      }
    }

    /**
     * If browser is supported, displays the story. Otherwise, shows either the
     * default unsupported browser layer or the publisher fallback (if provided).
     * @param {boolean} isBrowserSupported
     * @private
     */ }, { key: "onSupportedBrowserStateUpdate_", value:
    function onSupportedBrowserStateUpdate_(isBrowserSupported) {var _this24 = this;
      var fallbackEl = this.getFallback();
      if (isBrowserSupported) {
        // Removes the default unsupported browser layer or throws an error
        // if the publisher has provided their own fallback.
        if (fallbackEl) {
          dev().error(
          TAG,
          'No handler to exit unsupported browser state on ' +
          'publisher provided fallback.');

        } else {
          this.layoutStory_().then(function () {
            _this24.storeService_.dispatch(
            Action.TOGGLE_PAUSED,
            _this24.pausedStateToRestore_);

            _this24.pausedStateToRestore_ = null;
            _this24.mutateElement(function () {
              _this24.unsupportedBrowserLayer_.removeLayer();
            });
          });
        }
      } else {
        this.pausedStateToRestore_ = !!this.storeService_.get(
        StateProperty.PAUSED_STATE);

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
     */ }, { key: "getPagesByDistance_", value:
    function getPagesByDistance_() {var _this25 = this;
      var distanceMap = this.getPageDistanceMapHelper_(
      /* distance */0,
      /* map */{},
      this.activePage_.element.id);


      // Transpose the map into a 2D array.
      var pagesByDistance = [];
      Object.keys(distanceMap).forEach(function (pageId) {
        var distance = distanceMap[pageId];
        // If on last page, mark first page with distance 1.
        if (
        pageId === _this25.pages_[0].element.id &&
        _this25.activePage_ === _this25.pages_[_this25.pages_.length - 1] &&
        _this25.pages_.length > 1 &&
        !_this25.viewer_.hasCapability('swipe'))
        {
          distance = 1;
        }
        if (!pagesByDistance[distance]) {
          pagesByDistance[distance] = [];
        }
        // There may be other 1 skip away pages due to branching.
        if (isExperimentOn(_this25.win, 'amp-story-branching')) {
          var navigationPath = _this25.storeService_.get(
          StateProperty.NAVIGATION_PATH);

          var indexInStack = navigationPath.indexOf(
          _this25.activePage_.element.id);

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
     */ }, { key: "getPageDistanceMapHelper_", value:
    function getPageDistanceMapHelper_(distance, map, pageId) {var _this26 = this;
      if (map[pageId] !== undefined && map[pageId] <= distance) {
        return map;
      }

      map[pageId] = distance;
      var page = this.getPageById(pageId);
      page.getAdjacentPageIds().forEach(function (adjacentPageId) {
        if (
        map[adjacentPageId] !== undefined &&
        map[adjacentPageId] <= distance)
        {
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
     */ }, { key: "preloadPagesByDistance_", value:
    function preloadPagesByDistance_() {var _this27 = this;var prioritizeActivePage = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
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
        if (
        !isExperimentOn(_this27.win, 'story-load-first-page-only') ||
        !prioritizeActivePage)
        {
          return preloadAllPages();
        }

        var activePageId = devAssert(pagesByDistance[0][0]);
        new Promise(function (res, rej) {
          var page = _this27.getPageById(activePageId);
          page.setDistance(0);
          page.signals().whenSignal(CommonSignals.LOAD_END).then(res);
          // Don't call preload if user navigates before page loads, since the navigation will call preload properly.
          _this27.storeService_.subscribe(StateProperty.CURRENT_PAGE_ID, rej);
        }).then(
        function () {return preloadAllPages();},
        function () {});

      });
    }

    /**
     * Handles a background-audio attribute set on an <amp-story> tag.
     * @private
     */ }, { key: "registerAndPreloadBackgroundAudio_", value:
    function registerAndPreloadBackgroundAudio_() {var _this28 = this;
      var backgroundAudioEl = upgradeBackgroundAudio(this.element);

      if (!backgroundAudioEl) {
        return;
      }

      // Once the media pool is ready, registers and preloads the background
      // audio, and then gets the swapped element from the DOM to mute/unmute/play
      // it programmatically later.
      this.activePage_.element.
      signals().
      whenSignal(CommonSignals.LOAD_END).
      then(function () {
        backgroundAudioEl = /** @type {!HTMLMediaElement} */(
        backgroundAudioEl);

        _this28.mediaPool_.register(backgroundAudioEl);
        return _this28.mediaPool_.preload(backgroundAudioEl);
      }).
      then(function () {
        _this28.backgroundAudioEl_ = /** @type {!HTMLMediaElement} */(
        childElement(_this28.element, function (el) {
          return el.tagName.toLowerCase() === 'audio';
        }));

      });
    }

    /**
     * Loads amp-story-education if the viewer capability is provided.
     * @private
     */ }, { key: "maybeLoadStoryEducation_", value:
    function maybeLoadStoryEducation_() {var _this29 = this;
      if (!this.viewer_.hasCapability('education')) {
        return;
      }

      this.mutateElement(function () {
        _this29.element.appendChild(
        _this29.win.document.createElement('amp-story-education'));

      });

      Services.extensionsFor(this.win).installExtensionForDoc(
      this.getAmpDoc(),
      'amp-story-education');

    }

    /**
     * @param {string} id The ID of the page whose index should be retrieved.
     * @return {number} The index of the page.
     */ }, { key: "getPageIndexById", value:
    function getPageIndexById(id) {
      var pageIndex = findIndex(this.pages_, function (page) {return page.element.id === id;});
      if (pageIndex < 0) {
        user().error(
        TAG,
        'Story refers to page "%s", but no such page exists.',
        id);

      }

      return pageIndex;
    }

    /**
     * @param {string} id The ID of the page to be retrieved.
     * @return {!./amp-story-page.AmpStoryPage} Retrieves the page with the
     *     specified ID.
     */ }, { key: "getPageById", value:
    function getPageById(id) {
      var pageIndex = this.getPageIndexById(id);
      return devAssert(
      this.pages_[pageIndex]);



    }

    /**
     * @return {number}
     */ }, { key: "getPageCount", value:
    function getPageCount() {
      return this.pages_.length - this.adPages_.length;
    }

    /**
     * @param {!./amp-story-page.AmpStoryPage} desiredPage
     * @return {number} The index of the page.
     */ }, { key: "getPageIndex", value:
    function getPageIndex(desiredPage) {
      return findIndex(this.pages_, function (page) {return page === desiredPage;});
    }

    /**
     * Retrieves the page containing the element, or null. A background audio
     * set on the <amp-story> tag would not be contained in a page.
     * @param {!Element} element The element whose containing AmpStoryPage should
     *     be retrieved
     * @return {?./amp-story-page.AmpStoryPage} The AmpStoryPage containing the
     *     specified element, if any.
     */ }, { key: "getPageContainingElement_", value:
    function getPageContainingElement_(element) {
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

    /** @override */ }, { key: "getElementDistance", value:
    function getElementDistance(element) {
      var page = this.getPageContainingElement_(element);

      // An element not contained in a page is likely to be global to the story,
      // like a background audio. Setting the distance to -1 ensures it will not
      // get evicted from the media pool.
      if (!page) {
        return -1;
      }

      return page.getDistance();
    }

    /** @override */ }, { key: "getMaxMediaElementCounts", value:
    function getMaxMediaElementCounts() {var _ref;
      var audioMediaElementsCount = this.element.querySelectorAll(
      'amp-audio, [background-audio]').
      length;
      var videoMediaElementsCount =
      this.element.querySelectorAll('amp-video').length;

      // The root element (amp-story) might have a background-audio as well.
      if (this.element.hasAttribute('background-audio')) {
        audioMediaElementsCount++;
      }

      return _ref = {}, _defineProperty(_ref,
      MediaType.AUDIO, Math.min(
      audioMediaElementsCount + MINIMUM_AD_MEDIA_ELEMENTS,
      MAX_MEDIA_ELEMENT_COUNTS[MediaType.AUDIO])), _defineProperty(_ref,

      MediaType.VIDEO, Math.min(
      videoMediaElementsCount + MINIMUM_AD_MEDIA_ELEMENTS,
      MAX_MEDIA_ELEMENT_COUNTS[MediaType.VIDEO])), _ref;


    }

    /** @override */ }, { key: "getElement", value:
    function getElement() {
      return this.element;
    }

    /**
     * Reacts to muted state updates.
     * @param  {boolean} isMuted Whether the story just got muted.
     * @private
     */ }, { key: "onMutedStateUpdate_", value:
    function onMutedStateUpdate_(isMuted) {
      isMuted ? this.mute_() : this.unmute_();
      isMuted ?
      this.element.setAttribute(Attributes.MUTED, '') :
      this.element.removeAttribute(Attributes.MUTED);
    }

    /**
     * Mutes the audio for the story.
     * @private
     */ }, { key: "mute_", value:
    function mute_() {
      this.pauseBackgroundAudio_();
      if (this.activePage_) {
        this.activePage_.muteAllMedia();
      }
    }

    /**
     * Pauses the background audio.
     * @private
     */ }, { key: "pauseBackgroundAudio_", value:
    function pauseBackgroundAudio_() {
      if (!this.backgroundAudioEl_) {
        return;
      }
      this.mediaPool_.pause(this.backgroundAudioEl_);
    }

    /**
     * Unmutes the audio for the story.
     * @private
     */ }, { key: "unmute_", value:
    function unmute_() {var _this30 = this;
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
     */ }, { key: "playBackgroundAudio_", value:
    function playBackgroundAudio_() {
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
     */ }, { key: "updateAudioIcon_", value:
    function updateAudioIcon_() {
      var containsMediaElementWithAudio = !!this.element.querySelector(
      'amp-audio, amp-video:not([noaudio]), [background-audio]');

      var storyHasBackgroundAudio =
      this.element.hasAttribute('background-audio');

      this.storeService_.dispatch(
      Action.TOGGLE_STORY_HAS_AUDIO,
      containsMediaElementWithAudio || storyHasBackgroundAudio);

      this.storeService_.dispatch(
      Action.TOGGLE_STORY_HAS_BACKGROUND_AUDIO,
      storyHasBackgroundAudio);

    }

    /**
     * Shows the play/pause icon if there is an element with playback on the story.
     * @private
     */ }, { key: "updatePausedIcon_", value:
    function updatePausedIcon_() {
      var containsElementsWithPlayback = !!scopedQuerySelector(
      this.element,
      'amp-story-grid-layer amp-audio, amp-story-grid-layer amp-video, amp-story-page[background-audio], amp-story-page[auto-advance-after]');


      var storyHasBackgroundAudio =
      this.element.hasAttribute('background-audio');

      this.storeService_.dispatch(
      Action.TOGGLE_STORY_HAS_PLAYBACK_UI,
      containsElementsWithPlayback || storyHasBackgroundAudio);

    }

    /**
     * Handles the rewind viewer event.
     * @private
     */ }, { key: "onRewind_", value:
    function onRewind_() {var _this31 = this;
      this.signals().
      whenSignal(CommonSignals.LOAD_END).
      then(function () {return _this31.replay_();});
    }

    /**
     * Handles the selectPage viewer event.
     * @param {!JsonObject} data
     * @private
     */ }, { key: "onSelectPage_", value:
    function onSelectPage_(data) {
      if (!data) {
        return;
      }

      this.storeService_.dispatch(
      Action.SET_ADVANCEMENT_MODE,
      AdvancementMode.VIEWER_SELECT_PAGE);


      if (data['next']) {
        this.next_();
      } else if (data['previous']) {
        this.previous_();
      } else if (data['delta']) {
        this.switchDelta_(data['delta']);
      } else if (data['id']) {
        this.switchTo_(
        data['id'],
        this.getPageIndexById(data['id']) > this.getPageIndex(this.activePage_) ?
        NavigationDirection.NEXT :
        NavigationDirection.PREVIOUS);

      }
    }

    /**
     * Switches to a page in the story given a delta. If new index is out of
     * bounds, it will go to the last or first page (depending on direction).
     * @param {number} delta
     * @private
     */ }, { key: "switchDelta_", value:
    function switchDelta_(delta) {
      var currentPageIdx = this.storeService_.get(
      StateProperty.CURRENT_PAGE_INDEX);


      var newPageIdx =
      delta > 0 ?
      Math.min(this.pages_.length - 1, currentPageIdx + delta) :
      Math.max(0, currentPageIdx + delta);
      var targetPage = this.pages_[newPageIdx];

      if (
      !this.isActualPage_(targetPage && targetPage.element.id) ||
      newPageIdx === currentPageIdx)
      {
        return;
      }

      var direction =
      newPageIdx > currentPageIdx ?
      NavigationDirection.NEXT :
      NavigationDirection.PREVIOUS;

      this.switchTo_(targetPage.element.id, direction);
    }

    /**
     * Checks for the presence of a sidebar. If a sidebar does exist, then an icon
     * permitting for the opening/closing of the sidebar is shown.
     * @private
     */ }, { key: "initializeSidebar_", value:
    function initializeSidebar_() {var _this32 = this;
      this.sidebar_ = this.element.querySelector('amp-sidebar');
      if (!this.sidebar_) {
        return;
      }

      this.mutateElement(function () {
        _this32.sidebar_.classList.add(SIDEBAR_CLASS_NAME);
      });

      this.initializeOpacityMask_();
      this.storeService_.dispatch(Action.TOGGLE_HAS_SIDEBAR, !!this.sidebar_);

      var actions = [
      { tagOrTarget: 'AMP-SIDEBAR', method: 'open' },
      { tagOrTarget: 'AMP-SIDEBAR', method: 'close' },
      { tagOrTarget: 'AMP-SIDEBAR', method: 'toggle' }];

      this.storeService_.dispatch(Action.ADD_TO_ACTIONS_ALLOWLIST, actions);
    }

    /**
     * Checks for the the storyNavigationPath stack in the history.
     * @private
     */ }, { key: "initializeStoryNavigationPath_", value:
    function initializeStoryNavigationPath_() {var _this33 = this;
      var navigationPath = getHistoryState(
      this.win,
      HistoryState.NAVIGATION_PATH);

      if (
      !navigationPath ||
      !navigationPath.every(function (pageId) {return _this33.isActualPage_(pageId);}))
      {
        navigationPath = [];
      }
      this.storeService_.dispatch(Action.SET_NAVIGATION_PATH, navigationPath);
    }

    /** @private */ }, { key: "replay_", value:
    function replay_() {var _this34 = this;
      this.storeService_.dispatch(Action.SET_NAVIGATION_PATH, []);
      var switchPromise = this.switchTo_(
      /** @type {!Element} */(this.pages_[0].element).id,
      NavigationDirection.NEXT);

      // Restart page media, advancements, etc (#27742).
      if (this.pages_.length === 1) {
        this.pages_[0].setState(PageState.NOT_ACTIVE);
        this.pages_[0].setState(PageState.PLAYING);
      }

      // Reset all pages so that they are offscreen to right instead of left in
      // desktop view.
      switchPromise.then(function () {
        _this34.pages_.forEach(function (page) {return (
            removeAttributeInMutate(page, Attributes.VISITED));});

      });
    }

    /**
     * @param {!AmpStoryPage} page The page whose CTA anchor tags should be
     *     upgraded.
     * @param {number} pageIndex The index of the page.
     * @private
     */ }, { key: "upgradeCtaAnchorTagsForTracking_", value:
    function upgradeCtaAnchorTagsForTracking_(page, pageIndex) {
      this.mutateElement(function () {
        var pageId = page.element.id;
        var ctaAnchorEls = scopedQuerySelectorAll(
        page.element,
        'amp-story-cta-layer a');


        Array.prototype.forEach.call(ctaAnchorEls, function (ctaAnchorEl) {
          ctaAnchorEl.setAttribute('data-vars-story-page-id', pageId);
          ctaAnchorEl.setAttribute('data-vars-story-page-index', pageIndex);
        });
      });
    }

    /**
     * Add page to back of pages_ array
     * @param {!./amp-story-page.AmpStoryPage} page
     */ }, { key: "addPage", value:
    function addPage(page) {
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
     */ }, { key: "insertPage", value:
    function insertPage(pageBeforeId, pageToBeInsertedId) {
      // TODO(ccordry): make sure this method moves to PageManager when
      // implemented
      var pageToBeInserted = this.getPageById(pageToBeInsertedId);
      var pageToBeInsertedEl = pageToBeInserted.element;

      if (
      pageToBeInserted.isAd() &&
      !this.storeService_.get(StateProperty.CAN_INSERT_AUTOMATIC_AD))
      {
        dev().expectedError(TAG, 'Inserting ads automatically is disallowed.');
        return false;
      }

      var pageBefore = this.getPageById(pageBeforeId);
      var pageBeforeEl = pageBefore.element;

      var nextPage = this.getNextPage(pageBefore);

      if (!nextPage) {
        return false;
      }

      var advanceAttr = isExperimentOn(this.win, 'amp-story-branching') ?
      Attributes.PUBLIC_ADVANCE_TO :
      Attributes.ADVANCE_TO;

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
     */ }, { key: "getNextPage", value:
    function getNextPage(page) {
      var nextPageId = page.getNextPageId(true /*opt_isAutomaticAdvance */);
      if (!nextPageId) {
        return null;
      }
      return this.getPageById(nextPageId);
    }

    /**
     * @param {!Window} win
     * @return {boolean} true if the user's browser supports the features needed
     *     for amp-story.
     */ }, { key: "maybeLoadStoryDevTools_", value:









    /**
     * Loads amp-story-dev-tools if it is enabled.
     * @private
     */
    function maybeLoadStoryDevTools_() {
      if (
      !isModeDevelopment(this.win) ||
      this.element.getAttribute('mode') === 'inspect')
      {
        return false;
      }

      this.element.setAttribute('mode', 'inspect');

      var devToolsEl = this.win.document.createElement('amp-story-dev-tools');
      this.win.document.body.appendChild(devToolsEl);
      this.element.setAttribute('hide', '');

      Services.extensionsFor(this.win).installExtensionForDoc(
      this.getAmpDoc(),
      'amp-story-dev-tools');

      return true;
    }

    /**
     * Should enable the context menu (long press) on the element passed.
     * @private
     * @param {!Element} element
     * @return {boolean}
     */ }, { key: "allowContextMenuOnMobile_", value:
    function allowContextMenuOnMobile_(element) {
      // Match page attachments with links.
      return !!closest(
      element,
      function (e) {return matches(e, 'a.i-amphtml-story-page-open-attachment[href]');},
      this.element);

    } }], [{ key: "prerenderAllowed", value: /** @override @nocollapse */function prerenderAllowed() {return true;} }, { key: "isBrowserSupported", value: function isBrowserSupported(win) {return Boolean(win.CSS && win.CSS.supports && win.CSS.supports('display', 'grid') && win.CSS.supports('color', 'var(--test)'));} }]);return AmpStory;}(AMP.BaseElement);


AMP.extension('amp-story', '1.0', function (AMP) {
  AMP.registerElement('amp-story', AmpStory, CSS);
  AMP.registerElement('amp-story-access', AmpStoryAccess);
  AMP.registerElement('amp-story-consent', AmpStoryConsent);
  AMP.registerElement('amp-story-cta-layer', AmpStoryCtaLayer);
  AMP.registerElement('amp-story-grid-layer', AmpStoryGridLayer);
  AMP.registerElement('amp-story-page', AmpStoryPage);
  AMP.registerElement('amp-story-page-attachment', AmpStoryPageAttachment);
  AMP.registerElement('amp-story-page-outlink', AmpStoryPageAttachment); // Shares codepath with amp-story-page-attachment.
  AMP.registerServiceForDoc('amp-story-render', AmpStoryRenderService);
});
// /Users/mszylkowski/src/amphtml/extensions/amp-story/1.0/amp-story.js