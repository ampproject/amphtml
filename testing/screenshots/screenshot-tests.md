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

# AMP Screenshot Tests

## Overview

Screenshot tests are helpful to recognize when JS/CSS changes affect layout or styling of
AMP pages. These could be a result of changes in AMP Runtime or AMP extensions. And it
could be a result of an intentional change or an unintentional breaking change.


## How do screenshot tests work

For tests to work, first the "golden" screenshots have to be created for pages that should
be monitored. These are reference images in the `screenshots` folder. For each of these
pages the test creates a new screenshot and compares it to the "golden" image.

If images are the same, the JS/CSS didn't cause any style/layout changes for this page.

If images differ, it could mean two things:
1. This is an expected page. The "golden" screenshot needs to be regenerated and merged
   with the JS/CSS changes in the same PR.
2. The change is unexpected and it's a regression. The cause should be fixed and testing
   repeated.


## Running tests

All steps assume you are running a web server on localhost:8000. If not - you can change
the parameters in the below calls using `--host` argument. Refer to the specific `gulp help`
tasks for more info.

Make sure you install [PhantomJS 2](http://phantomjs.org/download.html). Note that if
you are installing on Mac OSX Yosemite and up, you may need to do
[this](http://stackoverflow.com/questions/28267809/phantomjs-getting-killed-9-for-anything-im-trying#answer-28890209).

### `gulp make-golden`

This task creates "golden" screenshots. You decide which pages you want to be screenshotted.
You can screenshot any URL, but it makes sense to only do screenshots of pages that are
using local builds (not from Google AMP Cache) because then you can actually troubleshoot and fix issues.

Just as with any test, it's best to test against smaller and targeted things, not
`everything.amp.html`.

To create a "golden" screenshot run:
```
gulp make-golden --path=local-path-to-amp.html -v
```

For instance, this will create a screenshot for
`http://localhost:8000/test/manual/amp-image-lightbox.amp.html` page:
```
gulp make-golden --path=/test/manual/amp-image-lightbox.amp.html
```

The "golden" screenshot will be placed into `screenshots/{local-path-to-amp.html}.png`
file. E.g. in the `amp-image-lightbox.amp.html` example the resulting file will be in
the `screenshots/test/manual/amp-image-lightbox.amp.html.png`.

At this point you can commit and merge the new "golden" screenshot(s).

### `gulp test-screenshots`

This task runs through previously generated "golden" screenshots, repeats screenshotting
on the current repository state and compares "golden" and new images.

To execute tests manually run:
```
gulp test-screenshots -v
```

The errors will be reported in the console and the final report will be placed into
`build/screenshots/report.html` file. This file will list all tested screenshots, the
results of tests and provide viewable "golden", "work" and "diff" images that can be
analysed to determine the reason for each broken diff.

If the change is expected you can simply regenerate "golden" screenshot using
`gulp make-golden` as described above.

If the change is not expected fix the underlying issue and rerun the tests.
