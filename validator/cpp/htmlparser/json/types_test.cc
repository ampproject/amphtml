#include "cpp/htmlparser/json/types.h"

#include <cmath>
#include <type_traits>

#include "gtest/gtest.h"

using htmlparser::json::Any;
using htmlparser::json::JsonArray;
using htmlparser::json::JsonDict;
using htmlparser::json::JsonObject;

// Ensures the following copy and move constructible traits are not implicitly
// deleted.
TEST(TypesTest, PerformanceConditionsTests) {
  EXPECT_TRUE(std::is_copy_constructible<JsonArray>::value);
  EXPECT_TRUE(std::is_copy_assignable<JsonArray>::value);
  EXPECT_TRUE(std::is_copy_constructible<JsonDict>::value);
  EXPECT_TRUE(std::is_copy_assignable<JsonDict>::value);
  EXPECT_TRUE(std::is_copy_constructible<JsonObject>::value);
  EXPECT_TRUE(std::is_copy_assignable<JsonObject>::value);
  EXPECT_TRUE(std::is_copy_constructible<Any<JsonDict>>::value);
  EXPECT_TRUE(std::is_copy_assignable<Any<JsonDict>>::value);
  EXPECT_TRUE(std::is_move_constructible<JsonArray>::value);
  EXPECT_TRUE(std::is_move_assignable<JsonArray>::value);
  EXPECT_TRUE(std::is_move_constructible<JsonDict>::value);
  EXPECT_TRUE(std::is_move_assignable<JsonDict>::value);
  EXPECT_TRUE(std::is_move_constructible<JsonObject>::value);
  EXPECT_TRUE(std::is_move_assignable<JsonObject>::value);
  EXPECT_TRUE(std::is_move_constructible<Any<JsonDict>>::value);
  EXPECT_TRUE(std::is_move_assignable<Any<JsonDict>>::value);
}

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
  json.Insert("friends", std::move(friends));
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

  EXPECT_EQ(R"({"name":"John","age":18,"friends":["Alice","Bob"],"address":[123,"foo street","3rd floor","New york",91234,true,null,false],"devices":{"phone":"android","laptop":"macbook","camera":null,"music":["spotify","youtube","apple"],"sdcards":[64,128,256.250000,255]},"gender":"male","employed":false,"married":true})",
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
  EXPECT_EQ("[1,2,3,1.200000,2.200000,3.300000,\"hello\",\"world\"]",
            jarr.ToString());

  JsonDict keyval;
  EXPECT_EQ(keyval.ToString(), "{}");
  keyval.Insert("foo", "bar");
  EXPECT_EQ("{\"foo\":\"bar\"}", keyval.ToString());
}

TEST(TypesTest, GetAndAssignmentOperatorTest) {
  JsonObject int_value(3);
  EXPECT_EQ(3, *int_value.Get<int>());
  // int_value is now bool.
  int_value = false;
  EXPECT_EQ(false, *int_value.Get<bool>());
  // int_value is now string.
  int_value = "Hello World!";
  EXPECT_EQ("Hello World!", *int_value.Get<std::string>());
  std::string_view str = "Foo Bar";
  str.remove_prefix(1);
  int_value = str;
  EXPECT_EQ("oo Bar", *int_value.Get<std::string_view>());
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

namespace testing::data {

struct Greeting {
  std::string message;
};

struct LottoDrawing {
  int n1;
  int n2;
  int n3;
  int n4;
  int n5;
  int powerball;
};

struct Age {
  int age;
};

struct Name {
  std::string first;
  std::string last;
};

struct Nested {
  Name name;
  Age age;
  Greeting greeting;
  LottoDrawing drawing;
};

}  // namespace testing::data

using testing::data::Age;
using testing::data::Greeting;
using testing::data::LottoDrawing;
using testing::data::Name;
using testing::data::Nested;

TEST(TypesTest, AnyObjectTest) {
  // Output as dict.
  Greeting greet{.message = "Hello World!"};
  std::function<JsonDict(const Greeting&)> serializer1 = [](
      const Greeting& g) {
    JsonDict dict;
    dict.Insert("greeting", g.message);
    return dict;
  };
  Any<JsonDict> any(&greet, serializer1);
  EXPECT_EQ("{\"greeting\":\"Hello World!\"}", any.ToString());

  // Output as JsonObject.
  std::function<JsonObject(const Greeting&)> serializer2 = [](
      const Greeting& g) {
    JsonDict dict;
    dict.Insert("greeting", g.message);
    return JsonObject(dict);
  };
  Any<JsonObject> any2(&greet, serializer2);
  EXPECT_EQ("{\"greeting\":\"Hello World!\"}", any2.ToString());

  // Output as json array.
  LottoDrawing drawing{.n1 = 18, .n2 = 33, .n3 = 36, .n4 = 45, .n5 = 50,
    .powerball = 10};
  std::function<JsonArray(const LottoDrawing&)> serializer3 = [](
      const LottoDrawing& draw) {
    JsonArray jarray;
    jarray.Append(draw.n1, draw.n2, draw.n3, draw.n4, draw.n5,
                  draw.powerball);
    return jarray;
  };
  Any<JsonArray> any3(&drawing, serializer3);
  EXPECT_EQ("[18,33,36,45,50,10]", any3.ToString());

  // Output as int.
  Age age{.age = 18};
  std::function<JsonObject(const Age&)> serializer4 = [](
      const Age& age) {
    return JsonObject(age.age);
  };
  Any<JsonObject> any4(&age, serializer4);
  EXPECT_EQ(any4.ToString(), "18");

  // Output as string.
  Name name{.first = "John", .last = "Doe"};
  std::function<JsonObject(const Name&)> serializer5 = [](
      const Name& name) {
    return JsonObject(name.first + " " + name.last);
  };
  Any<JsonObject> any5(&name, serializer5);
  EXPECT_EQ("\"John Doe\"", any5.ToString());

  // Nested object.
  Nested nested{.name = name, .age = age, .greeting = greet,
    .drawing = drawing};
  std::function<JsonObject(const Nested&)> serializer6 = [&](
      const Nested& nested) {
    JsonDict dict;
    dict.Insert("name", nested.name.first + " " + nested.name.last);
    dict.Insert("age", nested.age.age);
    dict.Insert("greeting", nested.greeting.message);
    JsonArray draw_numbers;
    draw_numbers.Append(nested.drawing.n1,
                        nested.drawing.n2,
                        nested.drawing.n3,
                        nested.drawing.n4,
                        nested.drawing.n5,
                        nested.drawing.powerball);
    dict.Insert("drawing", draw_numbers);
    return JsonObject(dict);
  };
  Any<JsonObject> any6(&nested, serializer6);
  EXPECT_EQ(R"({"name":"John Doe","age":18,"greeting":"Hello World!","drawing":[18,33,36,45,50,10]})",
            any6.ToString());
}

TEST(TypesTest, JsonDictTypedGetter) {
  JsonDict json;
  json.Insert("name", "John");
  json.Insert("age", 18);
  EXPECT_EQ(*json.Get<int>("age"), 18);
  EXPECT_EQ(*json.Get<std::string>("name"), "John");
}

TEST(TypesTest, ImmutablityTest) {
  JsonDict json;
  json.Insert("name", "John");
  json.Insert("age", 18);
  *json.Get<int>("age") = 20;
  *json.Get<std::string>("name") = "Foo";
  EXPECT_EQ(*json.Get<int>("age"), 20);
  EXPECT_EQ(*json.Get<std::string>("name"), "Foo");

  JsonArray array;
  array.Append(1, 2, 3);
  json.Insert("array", array);
  EXPECT_EQ(json.Get<JsonArray>("array")->size(), 3);
  EXPECT_EQ("[1,2,3]", json.Get<JsonArray>("array")->ToString());
  json.Get<JsonArray>("array")->Append(4, 5, 6);
  EXPECT_EQ(json.Get<JsonArray>("array")->size(), 6);
  EXPECT_EQ("[1,2,3,4,5,6]", json.Get<JsonArray>("array")->ToString());
}

TEST(TypesTest, ArrayAppendTest) {
  JsonDict dict;
  dict.Insert("name", "foo");
  JsonArray array;
  array.Append(dict, 1, true, nullptr, "hello");
  EXPECT_EQ(array.size(), 5);
}
