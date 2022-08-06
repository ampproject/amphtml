#include "cpp/htmlparser/json/json.h"

#include <gmock/gmock.h>
#include "gtest/gtest.h"
#include "cpp/htmlparser/json/types.h"

using htmlparser::json::JsonArray;
using htmlparser::json::JsonDict;
using htmlparser::json::JsonNull;
using htmlparser::json::Parse;
using testing::NotNull;

TEST(JsonTest, RootBoolTest) {
  EXPECT_TRUE(Parse("true")->Bool());
  EXPECT_FALSE(Parse("false")->Bool());
}

TEST(JsonTest, RootStringTest) {
  std::string str = "\"foobar\"";
  // Points to original string.
  auto result = Parse(str, {.use_string_references = true});
  ASSERT_THAT(result, NotNull());
  EXPECT_FALSE(result->Is<std::string>());
  EXPECT_TRUE(result->Is<std::string_view>());
  str[1] = 'Z';
  EXPECT_EQ(result->StringView(), "Zoobar");

  // String copy.
  auto result2 = Parse(str, {.use_string_references = false});
  ASSERT_THAT(result2, NotNull());
  EXPECT_FALSE(result2->Is<std::string_view>());
  EXPECT_TRUE(result2->Is<std::string>());
  str[2] = 'm';
  EXPECT_EQ(result2->String(), "Zoobar");
}

TEST(JsonTest, EmptyStringTest) {
  std::string str = R"("")";
  auto result = Parse(str);
  EXPECT_TRUE(result->String().empty());

  str = R"([true, "", 1])";
  auto result2 = Parse(str);
  auto array = result2->Array();
  EXPECT_TRUE(array.at(1).String().empty());
}

TEST(JsonTest, RootInvalidString) {
  // Not ending with closing quotes.
  std::string str = "\"foobar";
  EXPECT_EQ(Parse(str), nullptr);
}

TEST(JsonTest, RootNumber) {
  std::string numstr = "1234";
  auto result = Parse(numstr);
  EXPECT_EQ(result->Number(), 1234);
}

TEST(JsonTest, RootInvalidNumber) {
  std::string numstr = "1234a";
  auto result = Parse(numstr);
  EXPECT_EQ(result, nullptr);
}

TEST(JsonTest, RootDouble) {
  std::string numstr = "3.14";
  auto result = Parse(numstr);
  EXPECT_EQ(result->Double(), 3.14);
}

TEST(JsonTest, RootNullTest) {
  std::string json_str{"null"};
  auto result = Parse(json_str);
  ASSERT_THAT(result, NotNull());
  EXPECT_TRUE(result->IsNull());
}

TEST(JsonTest, RootEmptyDictTest) {
  std::string json_str{"{}"};
  auto result = Parse(json_str);
  ASSERT_THAT(result, NotNull());
  EXPECT_TRUE(result->Is<JsonDict>());
  EXPECT_EQ(result->Dict().size(), 0);
}

TEST(JsonTest, RootEmptyArrayTest) {
  std::string json_str{"[]"};
  auto result = Parse(json_str);
  ASSERT_THAT(result, NotNull());
  EXPECT_TRUE(result->Is<JsonArray>());
  EXPECT_EQ(result->Array().size(), 0);
}

TEST(JsonTest, RootArrayAllBoolValues) {
  std::string json_str{"[true, false, true, true, false]"};
  auto result = Parse(json_str);
  ASSERT_THAT(result, NotNull());
  EXPECT_TRUE(result->Is<JsonArray>());
  auto array = result->Array();
  EXPECT_EQ(array.size(), 5);
  EXPECT_TRUE(array.at(0).Bool());
  EXPECT_FALSE(array.at(1).Bool());
  EXPECT_TRUE(array.at(2).Bool());
  EXPECT_TRUE(array.at(3).Bool());
  EXPECT_FALSE(array.at(4).Bool());
}

TEST(JsonTest, RootArrayAllNumbers) {
  std::string json_str{"[1, 2, 3, 4]"};
  auto result = Parse(json_str);
  ASSERT_THAT(result, NotNull());
  EXPECT_TRUE(result->Is<JsonArray>());
  auto array = result->Array();
  EXPECT_EQ(array.size(), 4);
  EXPECT_EQ(array.at(0).Number(), 1);
  EXPECT_EQ(array.at(1).Number(), 2);
  EXPECT_EQ(array.at(2).Number(), 3);
  EXPECT_EQ(array.at(3).Number(), 4);
}

TEST(JsonTest, RootArrayAllDouble) {
  std::string json_str{"[1.1, 2.2, 3.3, 4.4]"};
  auto result = Parse(json_str);
  ASSERT_THAT(result, NotNull());
  EXPECT_TRUE(result->Is<JsonArray>());
  auto array = result->Array();
  EXPECT_EQ(array.size(), 4);
  EXPECT_EQ(array.at(0).Double(), 1.1);
  EXPECT_EQ(array.at(1).Double(), 2.2);
  EXPECT_EQ(array.at(2).Double(), 3.3);
  EXPECT_EQ(array.at(3).Double(), 4.4);
}

TEST(JsonTest, RootArrayNumberExpNotation) {
  std::string json_str{"[3.14e+3, -3.14e+3, 0.14e+3, -0.58e+8]"};
  auto result = Parse(json_str);
  ASSERT_THAT(result, NotNull());
  EXPECT_TRUE(result->Is<JsonArray>());
  auto array = result->Array();
  EXPECT_EQ(array.size(), 4);
  EXPECT_EQ(array.at(0).Double(), 3.14e+3);
  EXPECT_EQ(array.at(1).Double(), -3.14e+3);
  EXPECT_EQ(array.at(2).Double(), 0.14e+3);
  EXPECT_EQ(array.at(3).Double(), -0.58e+8);
}

TEST(JsonTest, RootArrayMixedIntTypes) {
  std::string json_str{"[1, 1.1, 2, 2.2, 3, 3.3, 4, 4.4]"};
  auto result = Parse(json_str);
  ASSERT_THAT(result, NotNull());
  EXPECT_TRUE(result->Is<JsonArray>());
  auto array = result->Array();
  EXPECT_EQ(array.size(), 8);
  EXPECT_EQ(array.at(0).Number(), 1);
  EXPECT_EQ(array.at(1).Double(), 1.1);
  EXPECT_EQ(array.at(2).Number(), 2);
  EXPECT_EQ(array.at(3).Double(), 2.2);
  EXPECT_EQ(array.at(4).Number(), 3);
  EXPECT_EQ(array.at(5).Double(), 3.3);
  EXPECT_EQ(array.at(6).Number(), 4);
  EXPECT_EQ(array.at(7).Double(), 4.4);
}

TEST(JsonTest, NestedArrays) {
  std::string json_str{"[1, [2, [3, [4, 5, 6], 7], 8], 9]"};
  auto result = Parse(json_str);
  ASSERT_THAT(result, NotNull());
  EXPECT_TRUE(result->Is<JsonArray>());
  auto array = result->Array();
  EXPECT_EQ(array.size(), 3);
  auto array2 = array.at(1).Array();
  auto array3 = array2.at(1).Array();
  auto array4 = array3.at(1).Array();
  EXPECT_EQ(array.at(0).Number(), 1);
  EXPECT_EQ(array2.at(0).Number(), 2);
  EXPECT_EQ(array3.at(0).Number(), 3);
  EXPECT_EQ(array4.at(0).Number(), 4);
  EXPECT_EQ(array4.at(1).Number(), 5);
  EXPECT_EQ(array4.at(2).Number(), 6);
  EXPECT_EQ(array3.at(2).Number(), 7);
  EXPECT_EQ(array2.at(2).Number(), 8);
  EXPECT_EQ(array.at(2).Number(), 9);
}

TEST(JsonTest, NestedDictInsideArray) {
  std::string json_str{R"([1, [null, 3], true])"};
  auto result = Parse(json_str);
  ASSERT_THAT(result, NotNull());
}

TEST(JsonTest, RootArrayAllStrings) {
  std::string json_str{R"(["foo", "bar", "a", "true"])"};
  auto result = Parse(json_str);
  ASSERT_THAT(result, NotNull());
  EXPECT_TRUE(result->Is<JsonArray>());
  auto array = result->Array();
  EXPECT_EQ(array.size(), 4);
  EXPECT_EQ(array.at(0).String(), "foo");
  EXPECT_EQ(array.at(1).String(), "bar");
  EXPECT_EQ(array.at(2).String(), "a");
  EXPECT_EQ(array.at(3).String(), "true");
}

TEST(JsonTest, RootArrayAllNulls) {
  std::string json_str{R"([null, null, null, null])"};
  auto result = Parse(json_str);
  ASSERT_THAT(result, NotNull());
  EXPECT_TRUE(result->Is<JsonArray>());
  auto array = result->Array();
  EXPECT_EQ(array.size(), 4);
  EXPECT_TRUE(array.at(0).IsNull());
  EXPECT_TRUE(array.at(1).IsNull());
  EXPECT_TRUE(array.at(2).IsNull());
  EXPECT_TRUE(array.at(3).IsNull());
}

TEST(JsonTest, RootArrayMixedValuesAsReferences) {
  std::string json_str{R"([1, true, null, "foo", false, "",
  {}, 324.123445560])"};
  auto result = Parse(json_str, {.use_string_references = true});
  ASSERT_THAT(result, NotNull());
  EXPECT_TRUE(result->Is<JsonArray>());
  auto array = result->Array();
  EXPECT_EQ(array.size(), 8);
  EXPECT_EQ(array.at(0).Number(), 1);
  EXPECT_TRUE(array.at(1).Bool());
  EXPECT_TRUE(array.at(2).IsNull());
  json_str[17] = 'b';
  json_str[18] = 'a';
  json_str[19] = 'r';
  EXPECT_EQ(array.at(3).StringView(), "bar");
  EXPECT_FALSE(array.at(4).Bool());
  EXPECT_EQ(array.at(5).StringView(), "");
  ASSERT_THAT(array.at(6).Get<JsonDict>(), NotNull());
  EXPECT_EQ(array.at(7).Double(), 324.123445560);
}

TEST(JsonTest, RootArrayMixedValues) {
  std::string json_str{R"([1, true, null, "foo", false, "", 324.123445560])"};
  auto result = Parse(json_str, {.use_string_references = false});
  ASSERT_THAT(result, NotNull());
  EXPECT_TRUE(result->Is<JsonArray>());
  auto array = result->Array();
  EXPECT_EQ(array.size(), 7);
  EXPECT_EQ(array.at(0).Number(), 1);
  EXPECT_TRUE(array.at(1).Bool());
  EXPECT_TRUE(array.at(2).IsNull());
  json_str[17] = 'b';
  json_str[18] = 'a';
  json_str[19] = 'r';
  EXPECT_EQ(array.at(3).String(), "foo");
  EXPECT_FALSE(array.at(4).Bool());
  EXPECT_EQ(array.at(5).String(), "");
  EXPECT_EQ(array.at(6).Double(), 324.123445560);
}

TEST(JsonTest, RootDictTest) {
  std::string json_str{R"({
  "a": null, "b": true, "c": "value", "d": false,
  "e": 123, "f": "foo", "b": false
  })"};
  auto result = Parse(json_str);
  ASSERT_THAT(result, NotNull());
  ASSERT_THAT(result->Get<JsonDict>(), NotNull());
  auto dict = result->Dict();
  EXPECT_EQ(dict.size(), 7);
  ASSERT_THAT(dict.Get<JsonNull>("a"), NotNull());
  // Overwritten by second definition.
  EXPECT_FALSE(*dict.Get<bool>("b"));
  EXPECT_EQ(*dict.Get<std::string>("c"), "value");
  EXPECT_FALSE(*dict.Get<bool>("d"));
  EXPECT_EQ(*dict.Get<int64_t>("e"), 123);
  EXPECT_EQ(*dict.Get<std::string>("f"), "foo");
}

TEST(JsonTest, NegativeNumber) {
  std::string json_str{
      R"([-65.613616999999977,43.420273000000009, -65.619720000000029,43.418052999999986,-65.625,43.421379000000059])"};
  auto result = Parse(json_str);
  ASSERT_THAT(result, NotNull());
  ASSERT_THAT(result->Get<JsonArray>(), NotNull());
  auto array = result->Array();
  EXPECT_EQ(array.at(0).Double(), -65.613616999999977);
  EXPECT_EQ(array.at(1).Double(), 43.420273000000009);
  EXPECT_EQ(array.at(2).Double(), -65.619720000000029);
  EXPECT_EQ(array.at(3).Double(), 43.418052999999986);
  EXPECT_EQ(array.at(4).Double(), -65.625);
  EXPECT_EQ(array.at(5).Double(), 43.421379000000059);
}

TEST(JsonTest, BasicAllInOneTest) {
  auto result = htmlparser::json::Parse(R"JSON({
  "a": "b",
  "c": "hello world!     ",
  "d": [1, 0.23, {"a": true}, [1, "foo"], "abc"],
  "foo": "bar",
  "e": {"foo": "b\"a\"r", "baz": false, "ok": {"hello":"world"}},
  "f": [1,[2,[1,[2,[4,[5,[6]]]]]]]
  })JSON");
  ASSERT_THAT(result, NotNull());
  auto dict = result->Dict();
  EXPECT_EQ(*dict.Get<std::string>("a"), std::string("b"));
  EXPECT_EQ(*dict.Get<std::string>("c"), std::string("hello world!     "));
  EXPECT_EQ(*dict.Get<std::string>("foo"), std::string("bar"));
  auto array = *dict.Get<JsonArray>("d");
  EXPECT_EQ(array.at(0).Number(), 1);
  EXPECT_EQ(array.at(1).Double(), 0.23);
  auto dict2 = array.at(2).Dict();
  EXPECT_TRUE(dict2.Get<bool>("a"));
  auto array2 = array.at(3).Array();
  EXPECT_EQ(array2.at(0).Number(), 1);
  EXPECT_EQ(array2.at(1).String(), "foo");
  EXPECT_EQ(array.at(4).String(), "abc");
  auto dict3 = *dict.Get<JsonDict>("e");
  EXPECT_EQ(*dict3.Get<std::string>("foo"), std::string(R"(b\"a\"r)"));
  EXPECT_FALSE(*dict3.Get<bool>("baz"));
  auto dict4 = *dict3.Get<JsonDict>("ok");
  EXPECT_EQ(*dict4.Get<std::string>("hello"), "world");
  auto array3 = *dict.Get<JsonArray>("f");
  EXPECT_EQ(array3.size(), 2);
  EXPECT_EQ(array3.at(0).Number(), 1);
  auto array3_1 = array3.at(1).Array();
  EXPECT_EQ(array3_1.size(), 2);
  EXPECT_EQ(array3_1.at(0).Number(), 2);
  auto array3_2 = array3_1.at(1).Array();
  EXPECT_EQ(array3_2.size(), 2);
  EXPECT_EQ(array3_2.at(0).Number(), 1);
  auto array3_3 = array3_2.at(1).Array();
  EXPECT_EQ(array3_3.size(), 2);
  EXPECT_EQ(array3_3.at(0).Number(), 2);
  auto array3_4 = array3_3.at(1).Array();
  EXPECT_EQ(array3_4.size(), 2);
  EXPECT_EQ(array3_4.at(0).Number(), 4);
  auto array3_5 = array3_4.at(1).Array();
  EXPECT_EQ(array3_5.size(), 2);
  EXPECT_EQ(array3_5.at(0).Number(), 5);
  auto array3_6 = array3_5.at(1).Array();
  EXPECT_EQ(array3_6.size(), 1);
  EXPECT_EQ(array3_6.at(0).Number(), 6);
}
