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
# Validator Web UI

If you'd like to use the web UI, simply visit [validator.ampproject.org](https://validator.ampproject.org/).

## Running your own Web UI

In this directory, run

```
$ npm install
$ go build serve-standalone.go
$ ./serve-standalone
```

Then visit your own instance at http://127.0.0.1:8765/.

If you'd like to run exactly the code that is running at
[validator.ampproject.org](https://validator.ampproject.org/), that's an
Appengine app - please refer to the instructions in serve.go.
