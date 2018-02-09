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
 * Particulars of the webpages used in the AMP visual diff tests.
 *
 * Note: While the extension of this file is .json, the contents are pseudo-json
 * due to the presence of detailed comments. Ruby's json parser natively
 * supports comments in json files, and is capable of parsing this file.
 */
{
  /**
   * Path relative to amphtml/ that contains the assets for all test pages.
   */
  "assets_dir": "examples/visual-tests",

  /**
   * Path relative to webserver root where assets for all test pages are
   * served.
   */
  "assets_base_url": "/examples/visual-tests",

  /**
   * List of webpages used in tests.
   */
  "webpages": [
  /**
   * Example of a webpage spec.
   * {
   *   // Path of webpage relative to webserver root.
   *   "url": "examples/visual-tests/foo/foo.html",
   *
   *   // Name used to identify snapshots of webpage on Percy.
   *   "name": "Foo test",
   *
   *   // CSS elements that must never appear on the webpage.
   *   "forbidden_css": [
   *     ".invalid-css-class",
   *     ".another-invalid-css-class"
   *   ],
   *
   *   // CSS elements that may initially appear on the page, but must
   *   // eventually disappear.
   *   "loading_incomplete_css": [
   *     ".loading-in-progress-css-class",
   *     ".another-loading-in-progress-css-class"
   *   ],
   *
   *   // CSS elements that must eventually appear on the page.
   *   "loading_complete_css": [
   *     ".loading-complete-css-class",
   *     ".another-loading-complete-css-class"
   *   ],
   *
   *   // Experiments that must be enabled via cookies.
   *   "experiments": [
   *     "amp-feature-one",
   *     "amp-feature-two"
   *   ]
   * },
   */
    {
      "url": "examples/visual-tests/article-access.amp/article-access.amp.html",
      "name": "AMP Article Access",
      "loading_complete_css": [
        ".login-section"
      ],
      "loading_incomplete_css": [
        ".article-body"
      ]
    },
    {
      "url": "examples/visual-tests/font.amp/font.amp.html",
      "name": "Fonts",
      "loading_incomplete_css": [
        "html.comic-amp-font-loading",
        "html.comic-amp-bold-font-loading"
      ],
      "loading_complete_css": [
        "html.comic-amp-font-loaded",
        "html.comic-amp-bold-font-loaded"
      ]
    },
    {
      "url": "examples/visual-tests/amp-layout/amp-layout.amp.html",
      "name": "AMP Layout"
    },
    {
      "url": "examples/visual-tests/amp-by-example/index.html",
      "name": "Amp By Example"
    },
    {
      "url": "examples/visual-tests/amp-access/index.html",
      "name": "amp-access - Amp By Example"
    },
    {
      "url": "examples/visual-tests/amp-access-laterpay/index.html",
      "name": "amp-access-laterpay - Amp By Example"
    },
    {
      "url": "examples/visual-tests/amp-accordion/index.html",
      "name": "amp-accordion - Amp By Example"
    },
    {
      "url": "examples/visual-tests/amp-ad/index.html",
      "name": "amp-ad - Amp By Example"
    },
    {
      "url": "examples/visual-tests/amp-analytics/index.html",
      "name": "amp-analytics - Amp By Example"
    },
    {
      "url": "examples/visual-tests/amp-anim/index.html",
      "name": "amp-anim - Amp By Example"
    },
    {
      "url": "examples/visual-tests/amp-app-banner/index.html",
      "name": "amp-app-banner - Amp By Example"
    },
    {
      "url": "examples/visual-tests/amp-audio/index.html",
      "name": "amp-audio - Amp By Example"
    },
    {
      "url": "examples/visual-tests/amp-bind/index.html",
      "name": "amp-bind - Amp By Example"
    },
    {
      "url": "examples/visual-tests/amp-brid-player/index.html",
      "name": "amp-brid-player - Amp By Example"
    },
    {
      "url": "examples/visual-tests/amp-brightcove/index.html",
      "name": "amp-brightcove - Amp By Example"
    },
    {
      "url": "examples/visual-tests/amp-call-tracking/index.html",
      "name": "amp-call-tracking - Amp By Example"
    },
    {
      "url": "examples/visual-tests/amp-carousel/index.html",
      "name": "amp-carousel - Amp By Example"
    },
    {
      "url": "examples/visual-tests/amp-dailymotion/index.html",
      "name": "amp-dailymotion - Amp By Example"
    },
    {
      "url": "examples/visual-tests/amp-date-picker/index.html",
      "name": "amp-date-picker - Amp By Example"
    },
    {
      "url": "examples/visual-tests/amp-dynamic-css-classes/index.html",
      "name": "amp-dynamic-css-classes - Amp By Example"
    },
    {
      "url": "examples/visual-tests/amp-experiment/index.html",
      "name": "amp-experiment - Amp By Example"
    },
    {
      "url": "examples/visual-tests/amp-facebook/index.html",
      "name": "amp-facebook - Amp By Example"
    },
    {
      "url": "examples/visual-tests/amp-fit-text/index.html",
      "name": "amp-fit-text - Amp By Example"
    },
    {
      "url": "examples/visual-tests/amp-font/index.html",
      "name": "amp-font - Amp By Example"
    },
    {
      "url": "examples/visual-tests/amp-form/index.html",
      "name": "amp-form - Amp By Example"
    },
    {
      "url": "examples/visual-tests/amp-fx-flying-carpet/index.html",
      "name": "amp-fx-flying-carpet - Amp By Example"
    },
    {
      "url": "examples/visual-tests/amp-fx-parallax/index.html",
      "name": "amp-fx-parallax - Amp By Example"
    },
    {
      "url": "examples/visual-tests/amp-gfycat/index.html",
      "name": "amp-gfycat - Amp By Example"
    },
    {
      "url": "examples/visual-tests/amp-gist/index.html",
      "name": "amp-gist - Amp By Example"
    },
    {
      "url": "examples/visual-tests/amp-google-vrview-image/index.html",
      "name": "amp-google-vrview-image - Amp By Example"
    },
    {
      "url": "examples/visual-tests/amp-hulu/index.html",
      "name": "amp-hulu - Amp By Example"
    },
    {
      "url": "examples/visual-tests/amp-iframe/index.html",
      "name": "amp-iframe - Amp By Example"
    },
    {
      "url": "examples/visual-tests/amp-image-lightbox/index.html",
      "name": "amp-image-lightbox - Amp By Example"
    },
    {
      "url": "examples/visual-tests/amp-ima-video/index.html",
      "name": "amp-ima-video - Amp By Example"
    },
    {
      "url": "examples/visual-tests/amp-img/index.html",
      "name": "amp-img - Amp By Example"
    },
    {
      "url": "examples/visual-tests/amp-instagram/index.html",
      "name": "amp-instagram - Amp By Example"
    },
    {
      "url": "examples/visual-tests/amp-install-serviceworker/index.html",
      "name": "amp-install-serviceworker - Amp By Example"
    },
    {
      "url": "examples/visual-tests/amp-jwplayer/index.html",
      "name": "amp-jwplayer - Amp By Example"
    },
    {
      "url": "examples/visual-tests/amp-kaltura-player/index.html",
      "name": "amp-kaltura-player - Amp By Example"
    },
    {
      "url": "examples/visual-tests/amp-lightbox/index.html",
      "name": "amp-lightbox - Amp By Example"
    },
    {
      "url": "examples/visual-tests/amp-list/index.html",
      "name": "amp-list - Amp By Example"
    },
    {
      "url": "examples/visual-tests/amp-live-list/index.html",
      "name": "amp-live-list - Amp By Example"
    },
    {
      "url": "examples/visual-tests/amp-mustache/index.html",
      "name": "amp-mustache - Amp By Example"
    },
    {
      "url": "examples/visual-tests/amp-o2-player/index.html",
      "name": "amp-o2-player - Amp By Example"
    },
    {
      "url": "examples/visual-tests/amp-pinterest/index.html",
      "name": "amp-pinterest - Amp By Example"
    },
    {
      "url": "examples/visual-tests/amp-pixel/index.html",
      "name": "amp-pixel - Amp By Example"
    },
    {
      "url": "examples/visual-tests/amp-reach-player/index.html",
      "name": "amp-reach-player - Amp By Example"
    },
    {
      "url": "examples/visual-tests/amp-selector/index.html",
      "name": "amp-selector - Amp By Example"
    },
    {
      "url": "examples/visual-tests/amp-sidebar/index.html",
      "name": "amp-sidebar - Amp By Example"
    },
    {
      "url": "examples/visual-tests/amp-social-share/index.html",
      "name": "amp-social-share - Amp By Example"
    },
    {
      "url": "examples/visual-tests/amp-soundcloud/index.html",
      "name": "amp-soundcloud - Amp By Example"
    },
    {
      "url": "examples/visual-tests/amp-springboard-player/index.html",
      "name": "amp-springboard-player - Amp By Example"
    },
    {
      "url": "examples/visual-tests/amp-sticky-ad/index.html",
      "name": "amp-sticky-ad - Amp By Example"
    },
    {
      "url": "examples/visual-tests/amp-timeago/index.html",
      "name": "amp-timeago - Amp By Example"
    },
    {
      "url": "examples/visual-tests/amp-twitter/index.html",
      "name": "amp-twitter - Amp By Example"
    },
    {
      "url": "examples/visual-tests/amp-user-notification/index.html",
      "name": "amp-user-notification - Amp By Example"
    },
    {
      "url": "examples/visual-tests/amp-video/index.html",
      "name": "amp-video - Amp By Example"
    },
    {
      "url": "examples/visual-tests/amp-vimeo/index.html",
      "name": "amp-vimeo - Amp By Example"
    },
    {
      "url": "examples/visual-tests/amp-vine/index.html",
      "name": "amp-vine - Amp By Example"
    },
    {
      "url": "examples/visual-tests/amp-youtube/index.html",
      "name": "amp-youtube - Amp By Example"
    }
  ],

  /**
   * List of failing webpages. Move pages here if they fail, since visual tests
   * block PRs from being merged. Move them back once failures are fixed.
   */
  "failing_webpages": [
    {
      "url": "examples/visual-tests/font.amp.404/font.amp.html",
      "name": "Fonts 404",
      "forbidden_css": [
        ".comic-amp-font-loaded",
        ".comic-amp-bold-font-loaded"
      ],
      "loading_complete_css": [
        ".comic-amp-font-missing",
        ".comic-amp-bold-font-missing"
      ]
    },
    {
      "url": "examples/visual-tests/article.amp/article.amp.html",
      "name": "AMP Article",
      "loading_complete_css": [
        ".article-body",
        ".ad-one",
        ".ad-two"
      ]
    },
    {
      "url": "examples/visual-tests/amp-list/amp-list.amp.html",
      "name": "AMP List and Mustache",
      "loading_complete_css": [
        ".list1",
        ".list2"
      ]
    }
  ],

  /**
   * List of failing webpages. Move pages here if they fail, since visual tests
   * block PRs from being merged. Move them back once failures are fixed.
   */
  "failing_webpages": [
  ]
}
