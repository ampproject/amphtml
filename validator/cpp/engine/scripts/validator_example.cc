//
// Copyright 2020 The AMP HTML Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the license.
//

#include <cassert>
#include <iostream>
#include <string_view>

#include "validator.h"
#include "validator.pb.h"

static constexpr std::string_view kValidAMPHtml{R"HTML(
<!--
     This is the minimum valid AMP HTML document. Type away
     here and the AMP Validator will re-check your document on the fly.
-->
<!doctype html>
<html ⚡>
<head>
  <meta charset="utf-8">
  <link rel="canonical" href="self.html">
  <meta name="viewport" content="width=device-width,minimum-scale=1">
  <style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style><noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>
  <script async src="https://cdn.ampproject.org/v0.js"></script>
</head>
<body>Hello, AMP world.</body>
</html>)HTML"};


int main(int argc, char** argv) {
  auto result = amp::validator::Validate(kValidAMPHtml,
                                         amp::validator::HtmlFormat::AMP);
  // DO NOT USE assert in production. For demonstration purpose only.
  assert(result.status() == amp::validator::ValidationResult::PASS);

  result = amp::validator::Validate("<script>StealCookies();</script>",
                                    amp::validator::HtmlFormat::AMP);
  assert(result.status() == amp::validator::ValidationResult::FAIL);
  // Paste the above html in http://validator.amp.dev and see the count.
  assert(result.errors().size() == 12);
}
