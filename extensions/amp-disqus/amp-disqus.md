<!---
Copyright 2016 The AMP HTML Authors. All Rights Reserved.

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

# <a name="amp-disqus"></a> `amp-disqus`

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>Displays a Disqus commenting widget.</td>
  </tr>
  <tr>
    <td width="40%"><strong>Availability</strong></td>
    <td>Development</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-disqus" src="https://cdn.ampproject.org/v0/amp-disqus-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td></td>
  </tr>
</table>

## Examples

<!-- TODO: Add examples -->

## Attributes

**data-forum**

The shortname for the forum. This is unique to your website as registered on Disqus.

**data-identifier**
_Optional_

The identifier of the thread. This is a forum-unique string.

[What is a Disqus identifier?](https://help.disqus.com/customer/en/portal/articles/472099-what-is-a-disqus-identifier-)

**data-url**
_Optional_

The url to associate with the thread. Defaults to the canonical url of the document.

If provided, must be an absolute URL. Using a relative URL may prevent Disqus from loading.

This will be used to look up the thread if the identifier is not given. It will also be saved when a thread is created, so that Disqus knows what page a thread belongs to.

**data-title**
_Optional_

The title of the thread. Defaults to the current document title.

Saved when a thread is created. This title will be used in organic discovery and on disqus.com

**data-slug**
_Optional_

**data-language**
_Optional_

**data-category-id**
_Optional_

<!-- TODO: Finish documenting these parameters -->

## Recommended Attributes

data-forum (required)
data-url
data-identifier
data-title

It is recommended to provide `data-identifier` and `data-url` to help avoid split threads. Both of these values should be unique to the thread to display.
