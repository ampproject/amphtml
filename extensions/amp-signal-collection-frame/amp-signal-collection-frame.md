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

`amp-signal-collection-frame`

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>Used within AMP creatives (see
      <a href="https://github.com/ampproject/amphtml/issues/3133">
      Intent to implement</a>) to augment creative with various signals.</td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>nodisplay</td>
  </tr>
  <tr>
    <td width="40%"><strong>Availability</strong></td>
    <td>In Development</td>
  </tr>
  <tr>
    <td>Data Attributes</td>
    <td>
      <table>
        <tr><th>Name</th><th>Required?</th><th>Description</th></tr>
        <tr><td>type></td><td>Yes</td><td>Signal collector identifier</td></tr>
        <tr><td>hash</td><td>No</td><td>Included in xdomain frame source allowing for it to be cacheable.</td></tr>
      </table>
    </td>
  </tr>
  </tr>
</table>

## Behavior

Requires data-type attribute indicating what known signal collection end point
is to be executed.  Upon layoutCallback, will create cross domain iframe whose
source is set to the corresponding type with optional hash.
