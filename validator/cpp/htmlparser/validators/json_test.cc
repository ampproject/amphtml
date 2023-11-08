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

#include "cpp/htmlparser/validators/json.h"

#include <vector>

#include <gmock/gmock.h>
#include "gtest/gtest.h"

namespace htmlparser::json {

std::pair<bool, LineCol> V(std::string_view s, Callback callback = nullptr) {
  return Validate(s, callback);
}

TEST(ParserTest, ValidJson) {
  // true, false and null literals.
  EXPECT_TRUE(V("true").first);
  EXPECT_TRUE(V("false").first);
  EXPECT_TRUE(V("null").first);

  // Empty key is a valid json..
  EXPECT_TRUE(V("{\"\":true}").first);

  // String values.
  // - Basic.
  EXPECT_TRUE(V("\"amaltas\"").first);
  EXPECT_TRUE(V("\"kotlin的练习demo\"").first);

  // - Escaped quotes.
  EXPECT_TRUE(V("\"am\\\"altas\"").first);
  // - Contains tab.
  EXPECT_TRUE(V("\"hello\tworld\"").first);
  // - Contains formfeed.
  EXPECT_TRUE(V("\"hello\fworld\"").first);
  // - Contains linefeed.
  EXPECT_TRUE(V("\"hello\rworld\"").first);
  // - Contains newline.
  EXPECT_TRUE(V("\"hello\nworld\"").first);
  // - Contains backspace.
  EXPECT_TRUE(V("\"hello\bworld\"").first);
  // - Contains \uxxxx (u followed by four hex digits).
  EXPECT_TRUE(V("\"hello\\uA93cworld\"").first);

  // Number.
  // - Basic.
  // minus zero is valid value.
  EXPECT_TRUE(V("-0").first);
  // plus zero is not.
  EXPECT_FALSE(V("+0").first);

  EXPECT_TRUE(V("1234567890987654321").first);
  // - Negative number.
  EXPECT_TRUE(V("-1234567890987654321").first);
  // Decimal number.
  EXPECT_TRUE(V("3.1415926535897932384626433832795028841971693993751").first);
  // Negative decimal number.
  EXPECT_TRUE(V("-3.1415926535897932384626433832795028841971693993751").first);
  // Exponent notation +.
  EXPECT_TRUE(V("3.14e+3").first);
  // Exponent notation -.
  EXPECT_TRUE(V("3.14e-3").first);
  // Exponent without notation.
  EXPECT_TRUE(V("3.14e3").first);
  // Negative number e notation.
  EXPECT_TRUE(V("-3.14e+3").first);
  EXPECT_TRUE(V("-3.14e-3").first);
  EXPECT_TRUE(V("-3.14e3").first);
  // Number starting with zero.
  EXPECT_TRUE(V("0").first);
  EXPECT_TRUE(V("0.123").first);
  EXPECT_TRUE(V("-0.123").first);
  EXPECT_TRUE(V("-0.123e+3").first);
  EXPECT_TRUE(V("-0.123e-3").first);
  EXPECT_TRUE(V("-0.123e3").first);
  // Extra decimal cases.
  EXPECT_TRUE(V("1.0e3").first);
  EXPECT_TRUE(V("1.00001").first);
  EXPECT_TRUE(V("1.10000").first);

  EXPECT_TRUE(V("0e+3").first);

  // Arrays.
  // Empty.
  EXPECT_TRUE(V("[]").first);
  // Basic with same values.
  EXPECT_TRUE(V("[1, 2, 3]").first);
  EXPECT_TRUE(V("[\"amaltas\", \"seol\", \"hello\", \"ok\\uA93Cbye\"]").first);
  EXPECT_TRUE(V("[true, false, false, true, true, null]").first);
  EXPECT_TRUE(V("[1.0, 2.0, 3.0, 4.0e+3, 5.12e-3, 6.40e3, 0.1, -0.1]").first);
  // Basic with different type values.
  EXPECT_TRUE(V("[1, true, \"amaltas\", 1.0, null, \"world\", false]").first);
  // Array inside array.
  EXPECT_TRUE(V("[1, [2, [3, [4, 5]]], true, false, [\"a\", \"b\"]]").first);
  // End with a comma OK.
  EXPECT_TRUE(V("[1, 2, 3]").first);
  EXPECT_TRUE(V("[\"amaltas\", \"seol\", \"hello\", \"ok\\uA93Cbye\"]").first);
  EXPECT_TRUE(V("[1.0, 2.0, 3.0, 4.0e+3, 5.12e-3, 6.40e3, 0.1, -0.1]").first);

  // Object.
  // Empty.
  EXPECT_TRUE(V("{}").first);
  // Basic with one value.
  EXPECT_TRUE(V("{\"a\": 1}").first);
  EXPECT_TRUE(V("{\"a\": true}").first);
  EXPECT_TRUE(V("{\"a\": false}").first);
  EXPECT_TRUE(V("{\"a\": null}").first);
  EXPECT_TRUE(V("{\"a\": \"amaltas\"}").first);
  EXPECT_TRUE(V("{\"a\": 1.0}").first);
  EXPECT_TRUE(V("{\"a\": -1.0}").first);
  EXPECT_TRUE(V("{\"a\": 0.1}").first);
  EXPECT_TRUE(V("{\"a\": -123098}").first);
  EXPECT_TRUE(V("{\"a\": 1.30e+35}").first);
  EXPECT_TRUE(V("{\"a\": 1.30e-30}").first);
  EXPECT_TRUE(V("{\"a\": 1.30e3}").first);
  // Spaces everywhere.
  EXPECT_TRUE(V("{      \"hello\"      :       \"world\"         }").first);
  EXPECT_TRUE(V("{      \"hello\"      :       123         }").first);
  EXPECT_TRUE(V("{      \"hello\"      :       true         }").first);
  EXPECT_TRUE(V("{      \"hello\"      :       false         }").first);
  EXPECT_TRUE(V("{      \"hello\"      :       null         }").first);
  EXPECT_TRUE(V("{      \"hello\"      :       0.1232         }").first);
  EXPECT_TRUE(V("{      \"hello\"      :       -123         }").first);
  EXPECT_TRUE(V("{      \"hello\"      :       -0.193e+3         }").first);

  // Multiple values, nested multi line objects.
  auto v = V(R"(
      {"hello": "world",
       "foo": "bar",
       "age": 33, "a": true,
       "kids": 2,
       "names": ["foo", "bar"],
       "scores": [8, 10, [1, 2, 3.14, 0.34e+3], [-34.39, 0.340e-3, true]],
       "addresses": [{
           "home": "tracy, ca",
           "zip": 95304}, {
           "work": "MTV",
           "zip": 94043}],
       "own_home": true,
       "has_car": false,
       "ssn": null})");
  EXPECT_TRUE(v.first);
}

TEST(ParserTest, InvalidJson) {
  // The v.second below is pair of line/col where error is reported.
  auto v = V("True");
  EXPECT_FALSE(v.first);
  EXPECT_EQ(v.second.second, 1 /* true is case sensitive. */);

  v = V("tru");
  EXPECT_FALSE(v.first);
  EXPECT_EQ(v.second.second, 3 /* e missing */);

  v = V("truE");
  EXPECT_FALSE(v.first);
  EXPECT_EQ(v.second.second, 4 /* uppercase E invalid */);

  v = V("tuee");
  EXPECT_FALSE(v.first);
  EXPECT_EQ(v.second.second, 2 /* found u instead of r */);

  v = V("truee");
  EXPECT_FALSE(v.first);
  EXPECT_EQ(v.second.second, 5 /* extra e */);

  v = V("False");
  EXPECT_FALSE(v.first);
  EXPECT_EQ(v.second.second, 1 /* false is case sensitive. */);

  v = V("fals");
  EXPECT_FALSE(v.first);
  EXPECT_EQ(v.second.second, 4 /* e missing */);

  v = V("falsE");
  EXPECT_FALSE(v.first);
  EXPECT_EQ(v.second.second, 5 /* uppercase E invalid */);

  v = V("faIse");
  EXPECT_FALSE(v.first);
  EXPECT_EQ(v.second.second, 3 /* found I instead of l */);

  v = V("falsee");
  EXPECT_FALSE(v.first);
  EXPECT_EQ(v.second.second, 6 /* extra e */);

  v = V("Null");
  EXPECT_FALSE(v.first);
  EXPECT_EQ(v.second.second, 1 /* null is case sensitive */);

  v = V("nuIl");
  EXPECT_FALSE(v.first);
  EXPECT_EQ(v.second.second, 3 /* I instead of l */);

  v = V("nul");
  EXPECT_FALSE(v.first);
  EXPECT_EQ(v.second.second, 3 /* second l missing */);

  v = V("nil");
  EXPECT_FALSE(v.first);
  EXPECT_EQ(v.second.second, 2 /* nil is not a keyword */);

  v = V("nulls");
  EXPECT_FALSE(v.first);
  EXPECT_EQ(v.second.second, 5 /* extra 's char is invalid */);

  // 0 prefix number are invalid. But -0 is valid. +0 is not.
  EXPECT_FALSE(V("01234").first);
  EXPECT_TRUE(V("-0").first);
  EXPECT_FALSE(V("+0").first);
  EXPECT_FALSE(V("00000").first);

  v = V("1.234.55");
  EXPECT_FALSE(v.first);
  EXPECT_EQ(v.second.second, 6);

  v = V("1.23e+e34");
  EXPECT_FALSE(v.first);
  EXPECT_EQ(v.second.second, 7 /* two e */);

  v = V("123e4");
  EXPECT_FALSE(v.first);
  EXPECT_EQ(v.second.second, 4 /* e not allowed here */);

  v = V("123.e+4");
  EXPECT_FALSE(v.first);
  EXPECT_EQ(v.second.second, 5 /* e not allowed immediately after period */);

  v = V("123.3e");
  EXPECT_FALSE(v.first);
  EXPECT_EQ(v.second.second, 6 /* degree after e missing */);

  v = V("1.30e+-3");
  EXPECT_FALSE(v.first);
  EXPECT_EQ(v.second.second, 7 /* either - or + after e */);

  v = V("123.e+4");
  EXPECT_FALSE(v.first);
  EXPECT_EQ(v.second.second, 5 /* e not allowed immediately after period */);

  v = V("0.4f");
  EXPECT_FALSE(v.first);
  EXPECT_EQ(v.second.second, 4 /* floating point notation not allowed. */);

  v = V("[1, 2.2, 300, -0, 1000000, 1.34e+10, 033, 0.10, -1000, -0.3, -10.33");
  EXPECT_FALSE(v.first);
  EXPECT_EQ(v.second.second, 39 /* Invalid number 033 */);

  // Arrays.
  // Not closed.
  v = V("[1,2,3");
  EXPECT_FALSE(v.first);
  EXPECT_EQ(v.second.second, 6);
  // Nested not closed.
  v = V("[1, 2, [3, 4, [5, \"a\"], true], null, 1.2,");
  EXPECT_FALSE(v.first);
  EXPECT_EQ(v.second.second, 41);

  // Closed with wrong bracket.
  v = V("[1,2,3}");
  EXPECT_FALSE(v.first);
  EXPECT_EQ(v.second.second, 7);

  v = V("[,]");
  EXPECT_FALSE(v.first);
  EXPECT_EQ(v.second.second, 2);

  v = V("[,1,2,3]");
  EXPECT_FALSE(v.first);
  EXPECT_EQ(v.second.second, 2 /* first comma before item */);
  EXPECT_TRUE(V("[1,2,3]").first);  // Fixed previous error.

  // Objects.
  v = V("{3: 4}");
  EXPECT_FALSE(v.first);
  EXPECT_EQ(v.second.second, 2 /* Only string keys in double quotes allwoed */);

  v = V("{'a': 4}");
  EXPECT_FALSE(v.first);
  EXPECT_EQ(v.second.second, 2 /* Only string keys in double quotes allwoed */);

  v = V("{\"a\": tru}");
  EXPECT_FALSE(v.first);
  EXPECT_EQ(v.second.second, 10 /* invalid true literal, missing e */);

  // Closed wrongly.
  v = V("{\"a\": 3]");
  EXPECT_FALSE(v.first);
  EXPECT_EQ(v.second.second, 8);

  // Empty objects OK.
  EXPECT_TRUE(V("{}").first);

  // Empty objects with no key/value not ok.
  EXPECT_FALSE(V("{,}").first);
  EXPECT_FALSE(V("{:}").first);

  // No value of an item not ok.
  EXPECT_FALSE(V("{\"a\":}").first);
}

TEST(ParserTest, LargeObjects) {
  std::string_view json = R"JSON({
  "states":[
  {"state":{"state_id":"AN","state_name":"Andaman and Nicobar Island (UT)"}},
  {"state":{"state_id":"AP","state_name":"Andhra Pradesh"}},
  {"state":{"state_id":"AR","state_name":"Arunachal Pradesh"}},
  {"state":{"state_id":"AS","state_name":"Assam"}},
  {"state":{"state_id":"BR","state_name":"Bihar"}},
  {"state":{"state_id":"CH","state_name":"Chandigarh (UT)"}
  },{"state":{"state_id":"CG","state_name":"Chhattisgarh"}},
  {"state":{"state_id":"DN","state_name":"Dadra and Nagar Haveli (UT)"}},
  {"state":{"state_id":"DD","state_name":"Daman and Diu (UT)"}},
  {"state":{"state_id":"DL","state_name":"Delhi (NCT)"}},
  {"state":{"state_id":"GA","state_name":"Goa"}},
  {"state":{"state_id":"GJ","state_name":"Gujarat"}},
  {"state":{"state_id":"HR","state_name":"Haryana"}},
  {"state":{"state_id":"HP","state_name":"Himachal Pradesh"}},
  {"state":{"state_id":"JK","state_name":"Jammu and Kashmir"}},
  {"state":{"state_id":"JH","state_name":"Jharkhand"}},
  {"state":{"state_id":"KA","state_name":"Karnataka"}},
  {"state":{"state_id":"KL","state_name":"Kerala"}},
  {"state":{"state_id":"LD","state_name":"Lakshadweep (UT)"}},
  {"state":{"state_id":"MP","state_name":"Madhya Pradesh"}},
  {"state":{"state_id":"MH","state_name":"Maharashtra"}},
  {"state":{"state_id":"MN","state_name":"Manipur"}},
  {"state":{"state_id":"ML","state_name":"Meghalaya"}},
  {"state":{"state_id":"MZ","state_name":"Mizoram"}},
  {"state":{"state_id":"NL","state_name":"Nagaland"}},
  {"state":{"state_id":"OR","state_name":"Odisha"}},
  {"state":{"state_id":"PY","state_name":"Puducherry (UT)"}},
  {"state":{"state_id":"PB","state_name":"Punjab"}},
  {"state":{"state_id":"RJ","state_name":"Rajasthan"}},
  {"state":{"state_id":"SK","state_name":"Sikkim"}},
  {"state":{"state_id":"TN","state_name":"Tamil Nadu"}},
  {"state":{"state_id":"TG","state_name":"Telangana"}},
  {"state":{"state_id":"TR","state_name":"Tripura"}},
  {"state":{"state_id":"UK","state_name":"Uttarakhand"}},
  {"state":{"state_id":"UP","state_name":"Uttar Pradesh"}},
  {"state":{"state_id":"WB","state_name":"West Bengal"}}]})JSON";
  EXPECT_TRUE(V(json).first);
}

TEST(ParserTest, TrailingComma) {
  auto v = V("{\"vars\": {\"account\": 7436 },\"extraUrlParams\": {\"int\": "
             "\"%%interest%%\"},}");
  EXPECT_FALSE(v.first);  // Trailing comma in object declaration.

  v = V("{\"vars\": {\"account\": 7436 },\"extraUrlParams\": {\"int\": "
        "\"%%interest%%\"}}");
  EXPECT_TRUE(v.first);  // Trailing comma fixed.

  v = V("[1,2,3,]");
  EXPECT_FALSE(v.first);  // Trailing comma in array declaration.
  EXPECT_EQ(v.second.second, 8);
  v = V("[1,2,\"hello\",]");
  EXPECT_FALSE(v.first);  // Trailing comma in array declaration.
  v = V("[1,2,true,]");
  EXPECT_FALSE(v.first);  // Trailing comma in array declaration.
  v = V("[1,2,false,]");
  EXPECT_FALSE(v.first);  // Trailing comma in array declaration.

  v = V("[1,2,3]");      // Trailing comma fixed.
  EXPECT_TRUE(v.first);  // Trailing comma fixed.
  v = V("[1,2,\"hello\"]");
  EXPECT_TRUE(v.first);  // Trailing comma fixed.
  v = V("[1,2,true]");
  EXPECT_TRUE(v.first);  // Trailing comma fixed.
  v = V("[1,2,false]");
  EXPECT_TRUE(v.first);  // Trailing comma fixed.
}

TEST(ParserTest, ArraysSHIFTScenarios) {
  EXPECT_TRUE(V(R"([1,2, 3,"a",    "b",true, true, 4,true,
  false, false,null,
  null, 1,-2, -4,   -0.3,[1,2], [1,   2, true], {"a":"b"},{"a": "b"}])").first);

  EXPECT_TRUE(V(R"({"a":"b", "c":     true,"e"      :false, "f":null,"g":
  [1,2, 3   ], "h"  : -2,"i":-2,"j":{"a":"b"},"h" : {  "a" : "b" }})").first);
}

TEST(ParserTest, CallbackTestArrayAllInt) {
  std::vector<std::pair<CallbackCode, int>> callbacks{};
  EXPECT_TRUE(V("[1,     2, 3]", [&](CallbackCode cb_code, StateCode state_code,
                                 int i) {
    callbacks.push_back(std::make_pair(cb_code, i));
  }).first);
  EXPECT_THAT(callbacks, ::testing::ElementsAre(
      testing::Pair(CallbackCode::ROOT_ARRAY, 0),
      testing::Pair(CallbackCode::NUMBER_T, 1),
      testing::Pair(CallbackCode::ARRAY_VAL_END, 2),
      testing::Pair(CallbackCode::NUMBER_T, 8),
      testing::Pair(CallbackCode::ARRAY_VAL_END, 9),
      testing::Pair(CallbackCode::NUMBER_T, 11),
      testing::Pair(CallbackCode::ARRAY_END, 12),
      testing::Pair(CallbackCode::PARSE_END, 13)));
}

TEST(ParserTest, CallbackTestArrayAllString) {
  std::vector<std::pair<CallbackCode, int>> callbacks{};
  EXPECT_TRUE(V(R"(["a", "b", "c"])",
                [&](CallbackCode cb_code, StateCode state_code, int i) {
    callbacks.push_back(std::make_pair(cb_code, i));
  }).first);
  EXPECT_THAT(callbacks, ::testing::ElementsAre(
      testing::Pair(CallbackCode::ROOT_ARRAY, 0),
      testing::Pair(CallbackCode::STRING_T, 1),
      testing::Pair(CallbackCode::ARRAY_VAL_END, 4),
      testing::Pair(CallbackCode::STRING_T, 6),
      testing::Pair(CallbackCode::ARRAY_VAL_END, 9),
      testing::Pair(CallbackCode::STRING_T, 11),
      testing::Pair(CallbackCode::ARRAY_END, 14),
      testing::Pair(CallbackCode::PARSE_END, 15)));
}

TEST(ParserTest, CallbackTestArrayAllBool) {
  std::vector<std::pair<CallbackCode, int>> callbacks{};
  EXPECT_TRUE(V(R"([true, false, true])",
                [&](CallbackCode cb_code, StateCode state_code, int i) {
    callbacks.push_back(std::make_pair(cb_code, i));
  }).first);
  EXPECT_THAT(callbacks, ::testing::ElementsAre(
      testing::Pair(CallbackCode::ROOT_ARRAY, 0),
      testing::Pair(CallbackCode::TRUE_T, 1),
      testing::Pair(CallbackCode::ARRAY_VAL_END, 5),
      testing::Pair(CallbackCode::FALSE_T, 7),
      testing::Pair(CallbackCode::ARRAY_VAL_END, 12),
      testing::Pair(CallbackCode::TRUE_T, 14),
      testing::Pair(CallbackCode::ARRAY_END, 18),
      testing::Pair(CallbackCode::PARSE_END, 19)));
}

TEST(ParserTest, CallbackTestArrayAllNulls) {
  std::vector<std::pair<CallbackCode, int>> callbacks{};
  EXPECT_TRUE(V(R"([null, null, null])",
                [&](CallbackCode cb_code, StateCode state_code, int i) {
    callbacks.push_back(std::make_pair(cb_code, i));
  }).first);
  EXPECT_THAT(callbacks, ::testing::ElementsAre(
      testing::Pair(CallbackCode::ROOT_ARRAY, 0),
      testing::Pair(CallbackCode::NULL_T, 1),
      testing::Pair(CallbackCode::ARRAY_VAL_END, 5),
      testing::Pair(CallbackCode::NULL_T, 7),
      testing::Pair(CallbackCode::ARRAY_VAL_END, 11),
      testing::Pair(CallbackCode::NULL_T, 13),
      testing::Pair(CallbackCode::ARRAY_END, 17),
      testing::Pair(CallbackCode::PARSE_END, 18)));
}

TEST(ParserTest, CallbackTestArrayAllFloatingPoints) {
  std::vector<std::pair<CallbackCode, int>> callbacks{};
  EXPECT_TRUE(V(R"([0.2, 0.3, 0.4])",
                [&](CallbackCode cb_code, StateCode state_code, int i) {
    callbacks.push_back(std::make_pair(cb_code, i));
  }).first);
  EXPECT_THAT(callbacks, ::testing::ElementsAre(
      testing::Pair(CallbackCode::ROOT_ARRAY, 0),
      testing::Pair(CallbackCode::NUMBER_T, 1),
      testing::Pair(CallbackCode::FLOATING_POINT_T, 2),
      testing::Pair(CallbackCode::ARRAY_VAL_END, 4),
      testing::Pair(CallbackCode::NUMBER_T, 6),
      testing::Pair(CallbackCode::FLOATING_POINT_T, 7),
      testing::Pair(CallbackCode::ARRAY_VAL_END, 9),
      testing::Pair(CallbackCode::NUMBER_T, 11),
      testing::Pair(CallbackCode::FLOATING_POINT_T, 12),
      testing::Pair(CallbackCode::ARRAY_END, 14),
      testing::Pair(CallbackCode::PARSE_END, 15)));
}

TEST(ParserTest, CallbackTestArrayAllNegativeNumbers) {
  std::vector<std::pair<CallbackCode, int>> callbacks{};
  EXPECT_TRUE(V(R"([-1, -2, -3])",
                [&](CallbackCode cb_code, StateCode state_code, int i) {
    callbacks.push_back(std::make_pair(cb_code, i));
  }).first);
  EXPECT_THAT(callbacks, ::testing::ElementsAre(
      testing::Pair(CallbackCode::ROOT_ARRAY, 0),
      testing::Pair(CallbackCode::NUMBER_T, 1),
      testing::Pair(CallbackCode::ARRAY_VAL_END, 3),
      testing::Pair(CallbackCode::NUMBER_T, 5),
      testing::Pair(CallbackCode::ARRAY_VAL_END, 7),
      testing::Pair(CallbackCode::NUMBER_T, 9),
      testing::Pair(CallbackCode::ARRAY_END, 11),
      testing::Pair(CallbackCode::PARSE_END, 12)));
}

TEST(ParserTest, CallbackTestArrayMixed) {
  std::vector<std::pair<CallbackCode, int>> callbacks{};
  EXPECT_TRUE(V(R"([1, true, null, "a", 0.3, false])",
                [&](CallbackCode cb_code, StateCode state_code, int i) {
    callbacks.push_back(std::make_pair(cb_code, i));
  }).first);
  EXPECT_THAT(callbacks, ::testing::ElementsAre(
      testing::Pair(CallbackCode::ROOT_ARRAY, 0),
      testing::Pair(CallbackCode::NUMBER_T, 1),
      testing::Pair(CallbackCode::ARRAY_VAL_END, 2),
      testing::Pair(CallbackCode::TRUE_T, 4),
      testing::Pair(CallbackCode::ARRAY_VAL_END, 8),
      testing::Pair(CallbackCode::NULL_T, 10),
      testing::Pair(CallbackCode::ARRAY_VAL_END, 14),
      testing::Pair(CallbackCode::STRING_T, 16),
      testing::Pair(CallbackCode::ARRAY_VAL_END, 19),
      testing::Pair(CallbackCode::NUMBER_T, 21),
      testing::Pair(CallbackCode::FLOATING_POINT_T, 22),
      testing::Pair(CallbackCode::ARRAY_VAL_END, 24),
      testing::Pair(CallbackCode::FALSE_T, 26),
      testing::Pair(CallbackCode::ARRAY_END, 31),
      testing::Pair(CallbackCode::PARSE_END, 32)));
}

TEST(ParserTest, CallbackPlainNumber) {
  std::vector<std::pair<CallbackCode, int>> callbacks{};
  EXPECT_TRUE(V("1",
                [&](CallbackCode cb_code, StateCode state_code, int i) {
    callbacks.push_back(std::make_pair(cb_code, i));
  }).first);
  EXPECT_THAT(callbacks, ::testing::ElementsAre(
      testing::Pair(CallbackCode::ROOT_NUMBER, 0),
      testing::Pair(CallbackCode::PARSE_END, 1)));
}

TEST(ParserTest, CallbackPlainEmptyArray) {
  std::vector<std::pair<CallbackCode, int>> callbacks{};
  EXPECT_TRUE(V("[]",
                [&](CallbackCode cb_code, StateCode state_code, int i) {
    callbacks.push_back(std::make_pair(cb_code, i));
  }).first);
  EXPECT_THAT(callbacks, ::testing::ElementsAre(
      testing::Pair(CallbackCode::ROOT_ARRAY, 0),
      testing::Pair(CallbackCode::ARRAY_END, 1),
      testing::Pair(CallbackCode::PARSE_END, 2)));
}

TEST(ParserTest, CallbackPlainBoolTrue) {
  std::vector<std::pair<CallbackCode, int>> callbacks{};
  EXPECT_TRUE(V("true",
                [&](CallbackCode cb_code, StateCode state_code, int i) {
    callbacks.push_back(std::make_pair(cb_code, i));
  }).first);
  EXPECT_THAT(callbacks, ::testing::ElementsAre(
      testing::Pair(CallbackCode::ROOT_BOOL_TRUE, 0),
      testing::Pair(CallbackCode::PARSE_END, 4)));
}

TEST(ParserTest, CallbackPlainBoolFalse) {
  std::vector<std::pair<CallbackCode, int>> callbacks{};
  EXPECT_TRUE(V("false",
                [&](CallbackCode cb_code, StateCode state_code, int i) {
    callbacks.push_back(std::make_pair(cb_code, i));
  }).first);
  EXPECT_THAT(callbacks, ::testing::ElementsAre(
      testing::Pair(CallbackCode::ROOT_BOOL_FALSE, 0),
      testing::Pair(CallbackCode::PARSE_END, 5)));
}

TEST(ParserTest, CallbackPlainNull) {
  std::vector<std::pair<CallbackCode, int>> callbacks{};
  EXPECT_TRUE(V("null",
                [&](CallbackCode cb_code, StateCode state_code, int i) {
    callbacks.push_back(std::make_pair(cb_code, i));
  }).first);
  EXPECT_THAT(callbacks, ::testing::ElementsAre(
      testing::Pair(CallbackCode::ROOT_NULL_VAL, 0),
      testing::Pair(CallbackCode::PARSE_END, 4)));
}

TEST(ParserTest, CallbackEmptyDictionary) {
  std::vector<std::pair<CallbackCode, int>> callbacks{};
  EXPECT_TRUE(V("{}",
                [&](CallbackCode cb_code, StateCode state_code, int i) {
    callbacks.push_back(std::make_pair(cb_code, i));
  }).first);
  EXPECT_THAT(callbacks, ::testing::ElementsAre(
      testing::Pair(CallbackCode::ROOT_DICT, 0),
      testing::Pair(CallbackCode::DICT_END, 1),
      testing::Pair(CallbackCode::PARSE_END, 2)));
}

TEST(ParserTest, CallbackDictionary) {
  std::vector<std::pair<CallbackCode, int>> callbacks{};
  EXPECT_TRUE(V(R"({"a": 1.0, "b": true, "c": "value"})",
                [&](CallbackCode cb_code, StateCode state_code, int i) {
                  callbacks.push_back(std::make_pair(cb_code, i));
                }).first);

  EXPECT_THAT(callbacks, ::testing::ElementsAre(
                             testing::Pair(CallbackCode::ROOT_DICT, 0),
                             testing::Pair(CallbackCode::DICT_KEY_BEGIN, 1),
                             testing::Pair(CallbackCode::DICT_KEY_END, 4),
                             testing::Pair(CallbackCode::NUMBER_T, 6),
                             testing::Pair(CallbackCode::FLOATING_POINT_T, 7),
                             testing::Pair(CallbackCode::DICT_VAL_END, 9),
                             testing::Pair(CallbackCode::DICT_KEY_BEGIN, 11),
                             testing::Pair(CallbackCode::DICT_KEY_END, 14),
                             testing::Pair(CallbackCode::TRUE_T, 16),
                             testing::Pair(CallbackCode::DICT_VAL_END, 20),
                             testing::Pair(CallbackCode::DICT_KEY_BEGIN, 22),
                             testing::Pair(CallbackCode::DICT_KEY_END, 25),
                             testing::Pair(CallbackCode::STRING_T, 27),
                             testing::Pair(CallbackCode::DICT_END, 34),
                             testing::Pair(CallbackCode::PARSE_END, 35)));
}

TEST(ParserTest, CallbackRootString) {
  std::vector<std::pair<CallbackCode, int>> callbacks{};
  EXPECT_TRUE(
      V(R"("foobar")", [&](CallbackCode cb_code, StateCode state_code, int i) {
        callbacks.push_back(std::make_pair(cb_code, i));
      }).first);
  EXPECT_THAT(callbacks, ::testing::ElementsAre(
                             testing::Pair(CallbackCode::ROOT_STRING, 0),
                             testing::Pair(CallbackCode::PARSE_END, 8)));
}

}  // namespace htmlparser::json
