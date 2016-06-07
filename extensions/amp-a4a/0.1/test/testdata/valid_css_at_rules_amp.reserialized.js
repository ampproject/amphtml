/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

// Reserialized version of ./validator/testdata/feature_tests/valid_css_at_rules_amp.html.

export const data = `

<!doctype html>
<html ⚡>
<head>
  <meta charset="utf-8">
  <link rel="canonical" href="./regular-html-version.html">
  <meta name="viewport" content="width=device-width,minimum-scale=1">
  <style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style><noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>
  <script async src="https://cdn.ampproject.org/v0.js"></script>
  <style amp-custom>
    @supports (animation-name) {
    }

    @-webkit-keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @-moz-keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @-o-keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    amp-user-notification.amp-active {
      opacity: 0;
      -webkit-animation: fadeIn ease-in 1s 1 forwards;
      -moz-animation: fadeIn ease-in 1s 1 forwards;
      -ms-animation: fadeIn ease-in 1s 1 forwards;
      -o-animation: fadeIn ease-in 1s 1 forwards;
      animation: fadeIn ease-in 1s 1 forwards;
    }
  </style>
</head>
<body>
Hello, world.


<script type="application/json" amp-ad-metadata>
{
   "bodyAttributes" : "",
   "bodyUtf16CharOffsets" : [ 1772, 1789 ],
   "cssUtf16CharOffsets" : [ 1040, 1749 ]
}
</script>
</body></html>`;

export const sig = `ACWMjZEfDeiiPhbDLaJ7Kda+RbEVoC1bqyLdQMDpQ6Oe62RV4b733pacaQRmnLTTuwT7J/4NtNlCk6mz0myhm1/EVNA0ajzBKRfIWWps6KLIyzPRis1rpPvf7RtIzlRdorDdiZr5xtzI9Od9oxWA97dRFPkcr8eOoZOAhSWH5W6tom/UVY2pSMAn0EkwpgTBp7RLnsrVX29+6qAp37LLYlaLPSghzmzAK35h6BajTS/lw5ZfXZhN3MUIO0ns7Gj/6XMrfXLxyuz2B71sPlAt90vPssAlLRfUPsUqEGV8NM6Vn6KhO9qZ5gKWTZKY/FUqTTpJy3xuphpqA0iqtQ65H1z3S6Z2`;
