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

export const data = {
  jsonBlob: `<html><head></head>
<body>
<p>some text</p>
<script type="application/json" amp-ad-metadata>
{
  "aString": "a string",
  "anArray": [0, 1, 2, 3, 4],
  "anObject": { "data": 3.14159 }
}
</script></body></html>`,

  minimalDocOneStyle: `<html><head>
<style>p { background: green }</style>
</head>
<body><p>some text</p></body></html>
`,
};
