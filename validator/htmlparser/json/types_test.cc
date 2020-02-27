#include "json/types.h"

#include <cmath>

#include "gtest/gtest.h"

using htmlparser::json::JsonArray;
using htmlparser::json::JsonDict;
using htmlparser::json::JsonObject;

TEST(TypesTest, BasicAllTypesTest) {
  // Represents the following json in JsonObject object.
  // {"name": "John", "age": 18, "friends": ["Alice", "Bob"],
  //  "address": [123, "foo street", "3rd floor", "New york", 91234, true, null,
  //              false],
  //  "devices": {"phone": "android", "laptop": "macbook", "camera": null,
  //              "music": ["spotify", "youtube", "apple"],
  //              "sdcards": [64, 128, 256]},
  //  "gender": male,
  //  "employed": false,
  //  "married": true}.
  JsonDict json;
  json.Insert("name", "John");
  json.Insert("age", 18);
  JsonArray friends;
  friends.Append("Alice", "Bob");
  json.Insert("friends", friends);
  JsonArray address;
  address.Append(123, "foo street", "3rd floor", "New york", 91234, true,
                 nullptr, false);
  EXPECT_EQ(address.size(), 8);
  EXPECT_FALSE(address.empty());
  json.Insert("address", address);
  JsonDict devices;
  devices.Insert("phone", "android");
  devices.Insert("laptop", "macbook");
  devices.Insert("camera", nullptr);
  EXPECT_FALSE(devices.empty());
  EXPECT_EQ(devices.size(), 3);
  JsonArray music;
  music.Append("spotify", "youtube", "apple");
  devices.Insert("music", music);
  JsonArray sdcards;
  sdcards.Append(64);
  sdcards.Append(128);
  sdcards.Append(256.250);
  sdcards.Append(0xff);
  devices.Insert("sdcards", sdcards);
  json.Insert("devices", devices);
  json.Insert("gender", "male");
  json.Insert("employed", false);
  json.Insert("married", true);

  EXPECT_EQ(
      R"({"name": "John", "age": 18, "friends": ["Alice", "Bob"], "address": [123, "foo street", "3rd floor", "New york", 91234, true, null, false], "devices": {"phone": "android", "laptop": "macbook", "camera": null, "music": ["spotify", "youtube", "apple"], "sdcards": [64, 128, 256.250000, 255]}, "gender": "male", "employed": false, "married": true})",
      json.ToString());
}

TEST(TypesTest, SingleValue) {
  JsonObject j1(3);
  EXPECT_EQ(j1.ToString(), "3");

  JsonObject j2(1.230000);
  EXPECT_EQ(j2.ToString(), "1.230000");

  JsonObject j3("foo");
  EXPECT_EQ(j3.ToString(), "\"foo\"");

  JsonObject j4(true);
  EXPECT_EQ(j4.ToString(), "true");

  JsonObject j5(false);
  EXPECT_EQ(j5.ToString(), "false");

  JsonObject j6(nullptr);
  EXPECT_EQ(j6.ToString(), "null");

  JsonArray jarr;
  EXPECT_EQ(jarr.ToString(), "[]");
  // Bulk append.
  jarr.Append(1, 2, 3, 1.200000, 2.200000, 3.300000, "hello", "world");
  EXPECT_EQ(jarr.ToString(),
            "[1, 2, 3, 1.200000, 2.200000, 3.300000, "
            "\"hello\", \"world\"]");

  JsonDict keyval;
  EXPECT_EQ(keyval.ToString(), "{}");
  keyval.Insert("foo", "bar");
  EXPECT_EQ(keyval.ToString(), "{\"foo\": \"bar\"}");
}

TEST(TypesTest, GetAndAssignmentOperatorTest) {
  JsonObject int_value(3);
  EXPECT_EQ(3, int_value.Get<int>().value());
  // int_value is now bool.
  int_value = false;
  EXPECT_EQ(false, int_value.Get<bool>().value());
  // int_value is now string.
  int_value = "Hello World!";
  EXPECT_EQ("Hello World!", int_value.Get<std::string>().value());
}

TEST(TypesTest, OverflowIntegerTest) {
  JsonObject overflow_value(36028797018963968L);
  EXPECT_EQ("\"36028797018963968\"", overflow_value.ToString());

  JsonObject overflow_value2(-36028797018963968L);
  EXPECT_EQ("\"-36028797018963968\"", overflow_value2.ToString());

  JsonObject safe_number(static_cast<int64_t>(std::pow(2, 53) - 1));
  EXPECT_EQ("9007199254740991", safe_number.ToString());
}

TEST(TypesTest, UnicodeTest) {
  JsonObject str("한국어");
  EXPECT_EQ("\"한국어\"", str.ToString());
}
