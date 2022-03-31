

/**
 * @fileoverview CSS shared across AMP4ADS and other formats.
 */

/**
 * We intentionally break with HTML5's default [hidden] styling to apply
 * !important.
 */
[hidden] {
  /* This must be !important, else the toggle helper system would break down
     due to specificity */
  display: none !important;
}

.i-amphtml-element {
  display: inline-block;
}

.i-amphtml-blurry-placeholder {
  transition: opacity 0.3s cubic-bezier(0.0, 0.0, 0.2, 1) !important;
  pointer-events: none;
}

/* layout=nodisplay are automatically hidden until JS initializes. */
[layout=nodisplay]:not(.i-amphtml-element) {
  display: none !important;
}

/* Initialized layout=nodisplay contain [hidden] */
.i-amphtml-layout-nodisplay[hidden],
[layout=nodisplay][hidden]:not(.i-amphtml-layout-nodisplay)
{
  /* Display is set/reset via the hidden attribute */
}
.i-amphtml-layout-nodisplay:not([hidden]),
[layout=nodisplay]:not(.i-amphtml-layout-nodisplay[hidden])
{
  /* Display is set/reset via the hidden attribute */
}

/**
 * layout=fixed does not have a unresolved implicit style, due to conflicts
 * with non-amp elements.
 * https://github.com/ampproject/amphtml/pull/28115#discussion_r419843723
 */
.i-amphtml-layout-fixed,
[layout=fixed][width][height]:not(.i-amphtml-layout-fixed)
{
  display: inline-block;
  position: relative;
}

.i-amphtml-layout-responsive,
[layout=responsive][width][height]:not(.i-amphtml-layout-responsive),
[width][height][sizes]:not(img):not([layout]):not(.i-amphtml-layout-responsive),
[width][height][heights]:not([layout]):not(.i-amphtml-layout-responsive)
{
  display: block;
  position: relative;
}

.i-amphtml-layout-intrinsic,
[layout=intrinsic][width][height]:not(.i-amphtml-layout-intrinsic)
{
  display: inline-block;
  position: relative;
  max-width: 100%;
}

.i-amphtml-layout-intrinsic .i-amphtml-sizer {
  max-width: 100%;
}

.i-amphtml-intrinsic-sizer {
  max-width: 100%;
  display: block !important;
}

/**
 * layout=fixed-height does not have a unresolved implicit style, due to
 * conflicts with non-amp elements.
 * https://github.com/ampproject/amphtml/pull/28115#discussion_r419843723
 */
.i-amphtml-layout-fixed-height,
[layout=fixed-height][height]:not(.i-amphtml-layout-fixed-height)
{
  display: block;
  position: relative;
}

/**
 * layout=container does not have a unresolved implicit style, due to conflicts
 * with non-amp elements.
 * https://github.com/ampproject/amphtml/pull/28115#discussion_r419843723
 */
.i-amphtml-layout-container,
[layout=container]
{
  display: block;
  position: relative;
}

/* Fill layout requires higher specificity than i-amp-html-notbuilt
 * so that the correct width/height can be applied before build.
 */
.i-amphtml-layout-fill,
.i-amphtml-layout-fill.i-amphtml-notbuilt,
[layout=fill]:not(.i-amphtml-layout-fill),
body noscript > *
{
  display: block;
  overflow: hidden !important;
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
}

/* In previous rule and in this one, make sure noscript fallbacks get fill layout as if they are placeholders */
body noscript > * {
  position: absolute !important;

  /* Override width/height attributes defined on HTML elements in noscript. */
  width: 100%;
  height: 100%;

  /* Supersede sibling [placeholder]/[fallback] z-index:1 */
  z-index: 2;
}

body noscript {
  display: inline !important;
}

.i-amphtml-layout-flex-item,
[layout=flex-item]:not(.i-amphtml-layout-flex-item)
{
  display: block;
  position: relative;
  flex: 1 1 auto;
}

.i-amphtml-layout-fluid {
  position: relative;
}

.i-amphtml-layout-size-defined {
  overflow: hidden !important;
}

.i-amphtml-layout-awaiting-size {
  position: absolute !important;
  top: auto !important;
  bottom: auto !important;
}

i-amphtml-sizer {
  display: block !important;
}

/*
 * Disable `i-amphtml-sizer` when aspect ratio is supported by both the
 * borwser and the optimizer.
 */
@supports (aspect-ratio: 1 / 1) {
  i-amphtml-sizer.i-amphtml-disable-ar {
    display: none !important;
  }
}

.i-amphtml-fill-content,
.i-amphtml-blurry-placeholder {
  display: block;
  /* These lines are a work around to this issue in iOS:     */
  /* https://bugs.webkit.org/show_bug.cgi?id=155198          */
  /* And: https://github.com/ampproject/amphtml/issues/11133 */
  height: 0;
  max-height: 100%;
  max-width: 100%;
  min-height: 100%;
  min-width: 100%;
  width: 0;
  margin: auto;
}

.i-amphtml-layout-size-defined .i-amphtml-fill-content {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
}

.i-amphtml-replaced-content {
  padding: 0 !important;
  border: none !important;
  /* TODO(dvoytenko): explore adding here object-fit. */
}

/**
 * Makes elements visually invisible but still accessible to screen-readers.
 *
 * This Css has been carefully tested to ensure screen-readers can read and
 * activate (in case of links and buttons) the elements with this class. Please
 * use caution when changing anything, even seemingly safe ones. For example
 * changing width from 1 to 0 would prevent TalkBack from activating (clicking)
 * buttons despite TalkBack reading them just fine. This is because
 * element needs to have a defined size and be on viewport otherwise TalkBack
 * does not allow activation of buttons.
 */
.i-amphtml-screen-reader {
  position: fixed !important;
  /* keep it on viewport */
  top: 0px !important;
  left: 0px !important;
  /* give it non-zero size, VoiceOver on Safari requires at least 2 pixels
     before allowing buttons to be activated. */
  width: 4px !important;
  height: 4px !important;
  /* visually hide it with overflow and opacity */
  opacity: 0 !important;
  overflow: hidden !important;
  /* remove any margin or padding */
  border: none !important;
  margin: 0 !important;
  padding: 0 !important;
  /* ensure no other style sets display to none */
  display: block !important;
  visibility: visible !important;
}

.i-amphtml-screen-reader ~ .i-amphtml-screen-reader {
  left: 8px !important;
}
.i-amphtml-screen-reader ~ .i-amphtml-screen-reader ~ .i-amphtml-screen-reader {
  left: 12px !important;
}
.i-amphtml-screen-reader ~ .i-amphtml-screen-reader ~ .i-amphtml-screen-reader ~ .i-amphtml-screen-reader {
  left: 16px !important;
}

/* For author styling. */
.amp-unresolved {
}

.i-amphtml-unresolved {
  position: relative;
  overflow: hidden !important;
}

.i-amphtml-select-disabled {
  user-select: none !important;
}

/* "notbuild" classes are set as soon as an element is created and removed
   as soon as the element is built. */

.amp-notbuilt {
  /* For author styling. */
}

/**
 * [width][height][sizes] and [width][height][heights] imply layout=responsive
 * before the element has resolved.
 */
.i-amphtml-notbuilt,
[layout]:not(.i-amphtml-element),
[width][height][sizes]:not(img):not([layout]):not(.i-amphtml-element),
[width][height][heights]:not([layout]):not(.i-amphtml-element)
{
  position: relative;
  overflow: hidden !important;
  color: transparent !important;
}

/**
 * Hide all children of non-container elements.
 * [width][height][sizes] and [width][height][heights] imply layout=responsive
 * before the element has resolved.
 */
.i-amphtml-notbuilt:not(.i-amphtml-layout-container) > *,
[layout]:not([layout=container]):not(.i-amphtml-element) > *,
[width][height][sizes]:not([layout]):not(.i-amphtml-element) > *,
[width][height][heights]:not([layout]):not(.i-amphtml-element) > *
{
  display: none;
}

/**
 * We special case the native <img> inside an SSR'd <amp-img>. We allow this to
 * display using `block` defined by .i-amphtml-fill-content.
 *
 * As more elements get SSR, we'll need to add their special cases here.
 */
amp-img:not(.i-amphtml-element)[i-amphtml-ssr] > img.i-amphtml-fill-content
{
  display: block;
}

/** Hide all text node children of non-container elements. */
.i-amphtml-notbuilt:not(.i-amphtml-layout-container),
[layout]:not([layout='container']):not(.i-amphtml-element),
[width][height][sizes]:not(img):not([layout]):not(.i-amphtml-element),
[width][height][heights]:not([layout]):not(.i-amphtml-element) {
  color: transparent !important;
  line-height: 0 !important;
}

.i-amphtml-ghost {
  visibility: hidden !important;
}

.i-amphtml-layout {
  /* Just state. */
}

.i-amphtml-error {
  /* Just state. */
}

/**
 * [width][height][sizes] and [width][height][heights] imply layout=responsive
 * before the element has resolved.
 */
.i-amphtml-element > [placeholder],
[layout]:not(.i-amphtml-element) > [placeholder],
[width][height][sizes]:not([layout]):not(.i-amphtml-element) > [placeholder],
[width][height][heights]:not([layout]):not(.i-amphtml-element) > [placeholder] {
  display: block;
  /* line-height:normal overrides line-height:0 from the "hide all children of
     non-container text node children" rule. This avoids a minor content jump during
     element build since placeholders should be fully visible. */
  line-height: normal;
}

.i-amphtml-element > [placeholder].hidden,
.i-amphtml-element > [placeholder].amp-hidden {
  visibility: hidden;
}
/* Placeholder, by design, expands layout=container unlike other layouts where
   it is position:absolute and overlays the layout box.
   However, when it goes away it should no longer expand the parent, so instead
   of visibility:hidden it must be display:none */
.i-amphtml-layout-container > [placeholder].hidden,
.i-amphtml-layout-container > [placeholder].amp-hidden {
  display: none;
}

.i-amphtml-element:not(.amp-notsupported) > [fallback] {
  display: none;
}

.i-amphtml-layout-size-defined > [placeholder],
.i-amphtml-layout-size-defined > [fallback] {
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  z-index: 1;
}

/* We reset the z-index of blurry image placeholders for images that are
   rendered by the server and are not (yet) controlled by JS to speed up
   display of the real image. This conveniently also fixes the display of
   the image when JS fails to load. */
amp-img[i-amphtml-ssr]:not(.i-amphtml-element) > [placeholder] {
  z-index: auto;
}

.i-amphtml-notbuilt > [placeholder] {
  display: block !important;
}

.i-amphtml-hidden-by-media-query {
  display: none !important;
}

.i-amphtml-element-error {
  background: red !important;
  color: white !important;
  position: relative !important;
}

.i-amphtml-element-error::before {
  content: attr(error-message);
}

/**
 * Wraps an element to make the contents scrollable. This is
 * used to wrap iframes which in iOS always behave as if they had the
 * seamless attribute.
 * TODO(dvoytenko, #8464): cleanup old `i-amp-scroll-container`.
 */
i-amphtml-scroll-container, i-amp-scroll-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: block;
}

/**
 * Overflow:auto will be set with delay due to iOS bug where iframe is not
 * rendered.
 * TODO(dvoytenko, #8464): cleanup old `i-amp-scroll-container`.
 */
i-amphtml-scroll-container.amp-active, i-amp-scroll-container.amp-active {
  overflow: auto;
  -webkit-overflow-scrolling: touch;
}

.i-amphtml-loading-container {
  display: block !important;
  pointer-events: none;
  z-index: 1;
}

.i-amphtml-notbuilt > .i-amphtml-loading-container {
  display: block !important;
}

.i-amphtml-loading-container.amp-hidden {
  visibility: hidden;
}

/**
 * "overflow" element is an element shown when more content is available but
 * not currently visible. Typically tapping on this element shows the full
 * content.
 */
.i-amphtml-element > [overflow] {
  cursor: pointer;
  /* position:relative is critical to ensure that [overflow] is displayed
     above an iframe; z-index is not enough. */
  position: relative;
  z-index: 2;
  visibility: hidden;
  /* display:initial overrides display:none from the "hide all children of
     non-container elements" rule. Similarly, line-height:normal overrides
     line-height:0 for text node children. This avoids a minor content jump after
     element build since overflows increase the height of their parents. */
  display: initial;
  line-height: normal;
}

/**
 * "overflow" element must not contribute space to a size-defined element.
 */
.i-amphtml-layout-size-defined > [overflow] {
  position: absolute;
}

.i-amphtml-element > [overflow].amp-visible {
  visibility: visible;
}

/* Polyfill for IE and any other browser that don't understand templates. */
template {
  display: none !important;
}

/**
 * Authors can set this class on their html tags to provide `border-box` box-sizing
 * to every element in their document. Individual elements can override as necessary.
 */
.amp-border-box,
.amp-border-box *,
.amp-border-box *:before,
.amp-border-box *:after {
  box-sizing: border-box;
}

/* amp-pixel is always non-displayed. */
amp-pixel {
  display: none !important;
}

/**
 * Analytics & amp-story-auto-ads tags should never be visible. keep them hidden.
 */
amp-analytics, amp-story-auto-ads, amp-auto-ads {
  /* Fixed to make position independent of page other elements. */
  position: fixed !important;
  top: 0 !important;
  width: 1px !important;
  height: 1px !important;
  overflow: hidden !important;
  visibility: hidden;
}

/* Blocked rendering until amp-story.css is installed. Info on #37990. */
amp-story {
  visibility: hidden !important;
}

html.i-amphtml-fie > amp-analytics {
  /* Remove position fixed if it's in iframe.
  * So runtime can measure layoutBox correctly
  */
  position: initial !important;
}

/**
 * Forms error/success messaging containers should be hidden at first.
 */
form [submitting],
form [submit-success],
form [submit-error] {
  display: none;
}

/**
 * Form validation error messages should be hidden at first.
 */
[visible-when-invalid]:not(.visible) {
  display: none;
}

/**
 * amp-accordion to avoid FOUC.
 */

/* Non-overridable properties */
amp-accordion {
  display: block !important;
}

/**
 * This media query is used instead of @supports due to low compatibility.
 * At the time of this change (4/6/2021) no version of Webkit support @supports queries.

 * These provide low-specificity UI styles to prevent CLS for the header and content
 * segments of accordions. The same styles are later set and extended with interactive
 * styles for older browsers via the `i-amphtml-accordion-header` class in both 0.1 and
 * the 1.0 version of accordion.
 */
@media (min-width: 1px) {
  :where(amp-accordion > section) > :first-child {
    margin: 0;
    background-color: #efefef;
    padding-right: 20px;
    border: 1px solid #dfdfdf;
  }
  :where(amp-accordion > section) > :last-child {
    margin: 0;
  }
}

/* Make sections non-floatable */
amp-accordion > section {
  float: none !important;
}

/*  Display the first 2 elements (heading and content) */
amp-accordion > section > * {
  float: none !important;
  display: block !important;
  overflow: hidden !important; /* clearfix */
  position: relative !important;
}

amp-accordion,
amp-accordion > section {
  margin: 0;
}

/* Collapse content by default. */
amp-accordion:not(.i-amphtml-built) > section > :last-child {
  display: none !important;
}

/* Expand content when needed. */
amp-accordion:not(.i-amphtml-built) > section[expanded] > :last-child {
  display: block !important;
}
