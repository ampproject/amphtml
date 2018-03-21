<!--
Copyright 2018 The AMP HTML Authors. All Rights Reserved.

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

# <a name="`amp-video-service`"></a> `amp-video-service`

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>Extension gets loaded dynamically and manages video components.</td>
  </tr>
  <tr>
    <td width="40%"><strong>Availability</strong></td>
    <td><em>In progress</em></td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><em>None</em></td>
  </tr>
</table>

## Behavior

Provides all behaviors for components that implement the [VideoInterface API](../../../blob/src/video-interface.js), including autoplay and analytics.

## Validation

It's invalid to include this extension in your document as a `<script>` tag.

This extension gets automatically inserted by the runtime when required.
