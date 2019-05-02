# Contributing Validator Rules for an AMP Extended Component

This doc describes how to create a basic validator ruleset for a new [AMP
Extended Component](https://www.ampproject.org/docs/reference/components). It
does not describe every possible validator feature, but rather goes over some
of the most common rules used when creating a new AMP Extended Component.

## Getting Started

Before writing any of your `.protoascii` or `validator-*.html` files, please
[see the Installation and Usage sections of the AMP Validator](https://github.com/ampproject/amphtml/blob/master/validator/README.md).

This repo uses a [python script](https://github.com/ampproject/amphtml/blob/master/validator/build.py) to run golden tests using the AMP validator.
Thus it is a good idea to ensure,
that your development environment is configured correctly,
before writing new tests to avoid any confusion.

## Example

As a concrete example, imagine you are creating an extended component that
displays an image of a cat inside an AMP document. This extended component
loads one of a set of 3 different pre-built cat images, so that the user
doesn't need to host the images on their server. Each image has a cat name:

 - Oscar
 - Chloe
 - Bella

Common usage of this extended component might look like:

```
<!-- Display the cat named 'oscar' -->
<amp-cat data-selected-cat="oscar" width=50 height=50></amp-cat>

<!-- Display a random cat -->
<amp-cat width=50 height=50></amp-cat>
```

Your first step will be writing the extended component JavaScript code. Place
this code in the amphtml src tree at the location of
`amphtml/extensions/amp-cat/0.1/`. This document only describes how to
specify validation rules for an extended component - it does not cover
implementing its runtime behavior. For the latter, see the codelab [Creating
your first AMP
Component](https://codelabs.developers.google.com/codelabs/creating-your-first-amp-component/).

## Validation Rules

Once you have built the extended component JavaScript, you are ready to submit validator
rules. You may do this in the same Pull Request, or a later Pull Request for
simplicity.

You will be creating a rules file as well as two test files. The paths for
these files, using the `<amp-cat>` example above, would be:

**Rules File**
<pre>
amphtml/extensions/<b>amp-cat</b>/validator-<b>amp-cat</b>.protoascii
</pre>

**Test Files**
<pre>
amphtml/extensions/<b>amp-cat</b>/0.1/test/validator-<b>amp-cat</b>.html
amphtml/extensions/<b>amp-cat</b>/0.1/test/validator-<b>amp-cat</b>.out
</pre>

Start with a rules file, `validator-amp-cat.protoascii`. First, a complete rules
file, followed by line-by-line explanations of what's inside.

```
#
# Copyright 2017 The AMP HTML Authors. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS-IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the license.
#

tags: {  # amp-cat
  html_format: AMP
  tag_name: "SCRIPT"
  extension_spec: {
    name: "amp-cat"
    version: "0.1"
    version: "latest"
  }
  attr_lists: "common-extension-attrs"
}

tags: {  # <amp-cat>
  html_format: AMP
  tag_name: "AMP-CAT"
  requires_extension: "amp-cat"
  attrs: {
    name: "data-selected-cat"
    value_casei: "bella"
    value_casei: "chloe"
    value_casei: "oscar"
  }
  attr_lists: "extended-amp-global"
  amp_layout: {
    supported_layouts: FILL
    supported_layouts: FIXED
    supported_layouts: FIXED_HEIGHT
    supported_layouts: FLEX_ITEM
    supported_layouts: NODISPLAY
    supported_layouts: RESPONSIVE
  }
}
```

This rules file specifies the rules for two tags:

 1. A script tag for including the `amp-cat` extended component code.
 2. The `<amp-cat>` tag itself.

Let's see it broken down:

```
#
# Copyright 2017 The AMP HTML Authors. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS-IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the license.
#
```

This is the AMP HTML license statement required at the top of every AMP
file.

### amp-cat extended component

```
tags: {  # amp-cat extended component
```
This tells the validator that we want to define a new tag. In this case, we want
to validate a tag that looks something like the following:

> `<script async custom-element='amp-cat'`
> `        src='https://cdn.ampproject.org/v0/amp-cat-0.1.js'></script>`

```
  html_format: AMP
```

This tells the validator that this tag
should be valid in AMP format documents. Tags can also be valid in `AMP4ADS`
format documents, if the tag should be used in an ad format. If you are unsure,
leave the tag as an `AMP` format tag only for now. Additional formats can be
added later.

```
  tag_name: "SCRIPT"
```

This tells the validator that we are defining a tag with the `<script>` name.

The following fields describe the HTML Tag attributes we expect for this
`<script>` tag to be valid:

```
  extension_spec: {
    name: "amp-cat"
```

The `extension_spec` field indicates that this `<script>` tag is a new amp
extension with the "amp-cat" name. This will add requirements for the
`custom-element=amp-cat` attribute, specific values for the `src` attribute,
as well as a link to documentation on ampproject.org for all error messages.

```
    version: "0.1"
    version: "latest"
  }
```

These fields define a list of all allowed version numbers. Currently, almost all
extended components are at version `0.1`, and we also allow `latest` to be specified.

The combination of the `version` and `name` fields of the
`extension_spec` define the allowed values of the `src` attribute in the
script tag, for example `src=https://cdn.ampproject.org/v0/amp-cat-0.1.js`.

```
  attr_lists: "common-extension-attrs"
}
```

That's all for the extended component script tag. Now let's look at the actual
`<amp-cat>` tag:

### `<amp-cat>` tag

```
tags: {  # <amp-cat>
```

This tells the validator that we want to define a new tag. In this case, we want
to validate a tag that looks something like the following:

> `<amp-cat data-selected-cat="oscar" width=50 height=50></amp-cat>`

```
  html_format: AMP
```

Same as the extended component tag above, this tells the validator that this tag is only
valid for AMP format documents.

```
  tag_name: "AMP-CAT"
```

This tells the validator that the html tag name is 'AMP-CAT'.

```
  requires_extension: "amp-cat"
```

This tells the validator that the `amp-cat` tag requires the inclusion of the
matching extension script tag that we defined above.

```
  attrs: {
    name: "data-selected-cat"
    value_casei: "bella"
    value_casei: "chloe"
    value_casei: "oscar"
  }
```

Here we specify the rules for validating the `data-selected-cat` attribute. In
our case, we tell the validator that we want the attribute value to
case-insensitively match for either "bella", "chloe", or "oscar" which
essentially means the value must be one of those 3 options.

```
  attr_lists: "extended-amp-global"
```

This adds the `media` and `noloading` attributes which are allowed on all amp
tags.

```
  amp_layout: {
    supported_layouts: FILL
    supported_layouts: FIXED
    supported_layouts: FIXED_HEIGHT
    supported_layouts: FLEX_ITEM
    supported_layouts: NODISPLAY
    supported_layouts: RESPONSIVE
  }
}
```

This section adds validation rules for the various layout options available to
amp tags. See
[AMP HTML Layout System](https://github.com/ampproject/amphtml/blob/master/spec/amp-html-layout.md)
to determine which options make sense for your tag.


### Attribute Validation Options

We saw a very simple example of an attribute validation rule above:

```
  attrs: {
    name: "data-selected-cat"
    value_casei: "bella"
    value_casei: "chloe"
    value_casei: "oscar"
  }
```

There are many other rule types for attribute validation, some of which we will
explore here.

```
attrs: {
  name: "data-selected-cat"
}
```
By specifying no value rules, any value is allowed for this attribute.

If your code expects certain values, it is best to specify them here it will
produce helpful error messages for developers trying to debug their tag.


```
value: "oscar"
```
```
value_casei: "oscar"
```
Specifies that only "oscar" is an allowed value, as case-sensitive and
case-insensitive variants.

```
  value_regex: "\\d+"
```
```
  value_regex_casei: "[a-z0-9]+"
```
Specifies that only values matching these RegEx patterns is an allowed value,
as case-sensitive and case-instensitive variants.


```
value_url: {
  protocol: "https"
  protocol: "http"
  allow_relative: false
  allow_empty: true
}
```
This specifies that the attribute value must be a valid URL or an empty string.
If an URL, it may be either "http" or "https" and may be relative. Note that in
many cases, you may want to allow only "https" as non-secure resources will
generate mixed-mode warnings when displayed from the AMP Cache.

Only one of:

 - `value`
 - `value_casei`
 - `value_regex`
 - `value_regex_casei`
 - `value_url`

may be specified for a single attribute. However, multiple values may be specified
for `value` and `value_casei` as seen in the example above.

Unless specified, attributes are all optional. To specify that an attribute is
mandatory, use the `mandatory` field:

```
attrs: {
  name: "data-selected-cat"
  mandatory: true
}
```

You may also specify that exactly one of a set of attributes is present:

```
attrs: {
  name: "data-selected-cat"
  mandatory_oneof: "['data-selected-cat', 'img-src']"
}
attrs: {
  name: "img-src"
  mandatory_oneof: "['data-selected-cat', 'img-src']"
  value_url: {
    protocol: "https"
  }
}
```

### Additional Common Validation Rules

So let's say we want to add some additional rules to our original element validation rules:

```
tags: {  # <amp-cat>
  html_format: AMP
  tag_name: "AMP-CAT"
  requires_extension: "amp-cat"
  attrs: {
    name: "data-selected-cat"
    value_casei: "bella"
    value_casei: "chloe"
    value_casei: "oscar"
  }
  attr_lists: "extended-amp-global"
  amp_layout: {
    supported_layouts: FILL
    supported_layouts: FIXED
    supported_layouts: FIXED_HEIGHT
    supported_layouts: FLEX_ITEM
    supported_layouts: NODISPLAY
    supported_layouts: RESPONSIVE
  }
}
```

#### Mandatory Parent

Let's say we want `<amp-cat>` to ONLY be a valid element if it is a DIRECT child of a div element. We could add:

```
mandatory_parent: "DIV"
```

as a key/value of the `tags`. If `<amp-cat>` can be a DIRECT or INDIRECT (nested) child of a div element, we could add:

```
mandatory_ancestor: "DIV"
```

as a key/value of the `tags`.

## Test Files

It is a good idea to contribute test files along with your validator rules
which at minimum demonstrate a correct usage of your validator rules.

A good place to start is to copy
[minimum_valid_amp.html](https://github.com/ampproject/amphtml/blob/master/validator/testdata/feature_tests/minimum_valid_amp.html) to a new file named, for example:

<pre>
amphtml/extensions/<b>amp-cat</b>/0.1/test/validator-<b>amp-cat</b>.html
</pre>

It a basic AMP HTML document. Open this file and then make the
following modifications.

**Change the Test Description**

In an HTML comment, below the AMP copyright declaration, is a brief description
of the test. Change this to describe which extension this test is for.

**Add your extension script tag**

In the document `<head>` section, add the extension `<script>` tag used by this extension:

<pre>
&lt;script async custom-element='<b>amp-cat</b>'
     src='https://cdn.ampproject.org/v0/<b>amp-cat</b>-0.1.js'&gt;&lt;/scrip&gt;
</pre>

**Add a working example of your tag**

In the document `<body>` section, add a valid example of your tag.

```
<!-- Valid amp-cat tag -->
<amp-cat data-selected-cat="oscar" width=50 height=50></amp-cat>
```

Optionally, you may add more than one valid variant and/or invalid examples.

## Test Output files

For each test file, also add a matching output file which will display the
validator output for the test case. If you only added valid examples, this file
should contain a single line:

```
PASS
```

If you include one or more invalid test cases, the file should look like the
following, with errors specific to your test cases.

```
FAIL
amp-iframe/0.1/test/validator-amp-iframe.html:41:2 The attribute 'src' in tag 'amp-iframe' is missing or incorrect, but required by attribute '[src]'. (see https://amp.dev/documentation/components/amp-iframe) [DISALLOWED_HTML]
```

To test your changes, from the `amphtml/validator/` path, run `python build.py`.
If your test case `.html` files produce the validator output in the test case
`.out` files, then you will see:

```
[[build.py RunTests]] - ... success
```

Alternatively, if the tests don't match, this script will print the validator
output to stdout, which can be used for updating the test file.


## Final Note on Rules

This document attempts to summarize some of the more commonly used rules for
creating validator extended components. More complex rules are possible and new rule
types can even be added as needed. If your goals are not met by the rules in
this document, [don't hesitate to
contact](https://github.com/ampproject/amphtml/blob/master/CONTRIBUTING.md#discussion-channels) the AMP developers and ask for suggestions.
