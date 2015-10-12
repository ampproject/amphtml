<!---
Copyright 2015 The AMP HTML Authors. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS-IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
-->

### <a name=”amp-pixel”></a> `amp-pixel`

The `amp-pixel` element is meant to be used as a typical tracking pixel - to count page views.

#### Behavior

The `amp-pixel` component behaves like a simple tracking pixel `img`. It takes a single URL, but provides variables that can be replaced by the component in the URL string when making the request. See the `src` attribute for more information.

#### Attributes

**src**

A simple URL to send a GET request to when the tracking pixel is loaded.

The variables listed under the Substitutions paragraph can be used to interpolate certain values into the pixel URL.

#### Substitutions

**$RANDOM**

Use the special string `$RANDOM` to add a random number to the URL if required.

For instance:
```html
<amp-pixel src="https://foo.com/pixel?$RANDOM"></amp-pixel>
```
may make a request to something like `https://foo.com/pixel?0.8390278471201` where the $RANDOM value is randomly generated upon each impression.

**$CANONICAL_URL**

Use the special string `$CANONICAL_URL` to add the canonical URL of the current document to the URL

For instance:
```html
<amp-pixel src="https://foo.com/pixel?href=$CANONICAL_URL"></amp-pixel>
```
may make a request to something like `https://foo.com/pixel?href=https%3A%2F%2Fpinterest.com%2F`.

**$CANONICAL_HOST**

Use the special string `$CANONICAL_HOST` to add the canonical URL's host of the current document to the URL

For instance:
```html
<amp-pixel src="https://foo.com/pixel?host=$CANONICAL_HOST"></amp-pixel>
```
may make a request to something like `https://foo.com/pixel?host=pinterest.com`.

**$CANONICAL_PATH**

Use the special string `$CANONICAL_PATH` to add the canonical URL's path of the current document to the URL

For instance:
```html
<amp-pixel src="https://foo.com/pixel?path=$CANONICAL_PATH"></amp-pixel>
```
may make a request to something like `https://foo.com/pixel?path=%2Fpage1.html`.

**$TITLE**

Use the special string `$TITLE` to add the title of the current document to the URL

For instance:
```html
<amp-pixel src="https://foo.com/pixel?title=$TITLE"></amp-pixel>
```
may make a request to something like `https://foo.com/pixel?title=Breaking%20News`.

**$AMPDOC_URL**

Use the special string `$AMPDOC_URL` to add the AMP document's URL.

For instance:
```html
<amp-pixel src="https://foo.com/pixel?ref=$AMPDOC_URL"></amp-pixel>
```
may make a request to something like `https://foo.com/pixel?ref=https%3A%2F%2Fexample.com%2F`.

**$AMPDOC_HOST**

Use the special string `$AMPDOC_HOST` to add the AMP document's URL host.

For instance:
```html
<amp-pixel src="https://foo.com/pixel?host=$AMPDOC_HOST"></amp-pixel>
```
may make a request to something like `https://foo.com/pixel?host=example.com`.

#### Styling

`amp-pixel` should not be styled.
