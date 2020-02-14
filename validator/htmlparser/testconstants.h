//
// Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

#ifndef HTMLPARSER__TESTCONSTANTS_H_
#define HTMLPARSER__TESTCONSTANTS_H_

#include <array>
#include <string_view>

namespace htmlparser {

namespace testing {

inline constexpr std::array<std::string_view, 2> kTestDataDirs{
    "testdata/"
    "webkit/*.dat",
    "testdata/go/"
    "*.dat",
};

// Some test input result in parse trees are not 'well-formed' despite
// following the HTML5 recovery algorithms. Rendering and re-parsing such a
// tree will not result in an exact clone of that tree. We blacklist such
// inputs from the render test.
inline constexpr std::array<std::string_view, 38> kRenderTestBlacklist {
    // The second <a> will be reparented to the first <table>'s parent. This
    // results in an <a> whose parent is an <a>, which is not 'well-formed'.
    "<a><table><td><a><table></table><a></tr><a></table><b>X</b>C<a>Y",
    // The same thing with a <p>:
    "<p><table></p>",
    // More cases of <a> being reparented:
    "<a href=\"blah\">aba<table><a href=\"foo\">br<tr><td></td>"
        "</tr>x</table>aoe",
    "<a><table><a></table><p><a><div><a>",
    "<a><table><td><a><table></table><a></tr><a></table><a>",
    "<template><a><table><a>",
    // A similar reparenting situation involving <nobr>,
    "<!DOCTYPE html><body><b><nobr>1<table><nobr></b><i><nobr>2<nobr></i>3",
    // A <plaintext> element is reparented, putting it before a table.
    // A <plaintext> element can't have anything after it in HTML.
    "<table><plaintext><td>",
    "<!doctype html><table><plaintext></plaintext>",
    "<!doctype html><table><tbody><plaintext></plaintext>",
    "<!doctype html><table><tbody><tr><plaintext></plaintext>",
    // A form inside a table inside a form doesn't work either.
    "<!doctype html><form><table></form><form></table></form>",
    // A script that ends at EOF may escape its own closing tag when rendered.
    "<!doctype html><script><!--<script ",
    "<!doctype html><script><!--<script <",
    "<!doctype html><script><!--<script <a",
    "<!doctype html><script><!--<script </",
    "<!doctype html><script><!--<script </s",
    "<!doctype html><script><!--<script </script",
    "<!doctype html><script><!--<script </scripta",
    "<!doctype html><script><!--<script -",
    "<!doctype html><script><!--<script -a",
    "<!doctype html><script><!--<script -<",
    "<!doctype html><script><!--<script --",
    "<!doctype html><script><!--<script --a",
    "<!doctype html><script><!--<script --<",
    "<script><!--<script ",
    "<script><!--<script <a",
    "<script><!--<script </script",
    "<script><!--<script </scripta",
    "<script><!--<script -",
    "<script><!--<script -a",
    "<script><!--<script --",
    "<script><!--<script --a",
    "<script><!--<script <",
    "<script><!--<script </",
    "<script><!--<script </s",
    // Reconstructing the active formatting elements results in a <plaintext>
    // element that contains an <a> element.
    "<!doctype html><p><a><plaintext>b",
    "<table><math><select><mi><select></table>",
};

}  // namespace testing
}  // namespace htmlparser

#endif  // HTMLPARSER__TESTCONSTANTS_H_
