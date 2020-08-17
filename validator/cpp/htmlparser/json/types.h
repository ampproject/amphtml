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
// Declares types in json spec (http://www.json.org):
// JsonArray: List of hetrogenous types. [1, true, "foo",...]
//
// JsonDict = Key value pairs of hetrogenous values, key is always std::string.
// {"foo": "bar", "count": 1,...}
//
// JsonObject = Encapsulates any type:
//   - int32, int64, float, double, string, bool, null,
//     JsonArray, JsonDict and Any<T>.
//
// When serializing to string, if int64 is greater than 2^53, serializes the
// number as string.
//
// Examples:
// JsonArray arr;
// arr.Append(1);
// arr.Append(true);
// arr.Append("foo");
// Above three append can be combined in one:
// arr.Append(1, true, "foo");
// arr.ToString() => [1, true, "foo"]
//
// Iteration:
// for (auto& i : arr) {
//   // i is one of the int64, double, string, bool, null, array, dict or
//   // object.
//   if (std::holds_alternative<JsonArray>(i)) {
//     // i is a JsonArray.
//     auto& myarray = std::get<JsonArray>(i);
//   } else if (std::holds_alternative<JsonDict>(i) {
//     // Process i as dict.
//     auto& mydict = std::get<JsonDict>(i);
//   } else if (std::holds_alternative<int64_t>(i)) {
//     // Process i as integer.
//     int myint = std::get<int>(i);
//   }
// }
//
// JsonDict dict;
// dict.Insert("foo", "bar");
// dict.Insert("count", 1);
// dict.ToString() => {"foo": "bar", "count": 1}
//
// Iteration:
// for (auto& [k, v] : dict) {
//   // k is always std::string.
//   // v can be one of the int, double, string, bool, null, array, dict or
//   // object.
//   // Process v as array items example above.
// }
//
// JsonObject int_value(1);
// JsonObject true_value(true);
// JsonObject false_value(false);
// JsonObject null_value(nullptr);
// JsonObject double_value(1.234000);
// JsonObject array_value(arr);
// JsonObject dict_value(dict);
//
// Re-assignment is supported.
// int_value = false;  // int_value is now bool.
// false_value = 3;    // false_value is now int.
// false_value = "HelloWorld";  // false_value is now string.
//
// The ToString() methods converts any above type to json string representation.
// JsonDict json;
// json.Insert("hello", "world");
// json.Insert("population", 50000);
// json.Insert("winter", false);
// json.ToString() => {"hello": "world", "population": 50000, "winter": false}
//
// See types_test.cc for detailed usage of generating nested json objects.
//
#ifndef HTMLPARSER__JSON_JSON_H_
#define HTMLPARSER__JSON_JSON_H_

#include <functional>
#include <memory>
#include <optional>
#include <sstream>
#include <string>
#include <variant>
#include <vector>

namespace htmlparser::json {

class JsonArray;
class JsonDict;
class NullValue;
class JsonObject;

class JsonDict {
 public:
  // TODO: Add support for vararg:
  // my_dict.Insert({"foo", "bar"}, {"hello", 1}, {"bar": false});
  template <typename V>
  void Insert(std::string key, V value) {
    values_.emplace_back(std::pair<std::string, V>{key, value});
  }

  std::size_t size() const { return values_.size(); }

  bool empty() const { return values_.empty(); }

  std::string ToString(int indent_columns = 0) const;
  void ToString(std::stringbuf*, int indent_columns = 0) const;

  template<typename T>
  T* Get(const std::string& key);

  // Facilitates range based iterator directly on JsonDict object.
  // for (auto& [k, v] : my_json_dict) {
  //   cout << k << " : " << v.ToString() << endl;
  // }
  // This only works with auto syntax. Following wont' compile:
  // JsonDict::const_iterator = mydict.begin();
  auto begin() { return values_.begin(); }
  auto end() { return values_.end(); }
  // const_iterator.
  auto begin() const { return values_.begin(); }
  auto end() const { return values_.end(); }

 private:
  std::vector<std::pair<std::string, JsonObject>> values_;
};

class JsonArray {
 public:
  template <typename T>
  void Append(T i) {
    items_.emplace_back(i);
  }

  // Facilitates appending multiple items.
  // my_array.Append(1, 2, 3, 4, "hello", "world", true, true, false);
  // my_array contains:
  // [1, 2, 3, 4, "hello", "world", true, true, false];
  template <typename... Ts>
  void Append(Ts&&... items) {
    int unused[] = {0, (items_.emplace_back(std::forward<Ts>(items)), 0)...};
  }

  std::size_t size() const { return items_.size(); }
  bool empty() const { return items_.empty(); }

  std::string ToString(int indent_columns = 0) const;
  void ToString(std::stringbuf*, int indent_columns = 0) const;

  // Facilitates range based for loop.
  // for (const auto& item : my_json_array) {
  //   std::cout << item.ToString() << std::endl;
  // }
  auto begin() { return items_.begin(); }
  auto end() { return items_.end(); }
  // const_iterator.
  auto begin() const { return items_.begin(); }
  auto end() const { return items_.end(); }

 private:
  std::vector<JsonObject> items_;
};

class NullValue {
 public:
  void ToString(std::stringbuf* buf, int indent_columns = 0) const;
  std::string ToString(int indent_columns = 0) const;
};

template<typename JsonType>
class Any {
 public:
  template<typename T>  // Erased by Wrapper.
  Any(const T* object,
      std::function<JsonType(const T& object)> apply) :
    wrapper_(new Wrapper<T>(object, apply)) {}

  Any(const Any& from) {
    wrapper_ = from.wrapper_->Clone();
  }

  Any(Any&& from) {
    wrapper_ = std::move(from.wrapper_);
  }

  Any& operator=(const Any& from) {
    wrapper_ = from.wrapper_->Clone();
    return *this;
  }

  std::string ToString(int indent_columns = 0) const {
    return wrapper_->ToJson().ToString(indent_columns);
  }

  void ToString(std::stringbuf* buf, int indent_columns = 0) const {
    wrapper_->ToJson().ToString(buf, indent_columns);
  }

 private:
  class WrapperBase {
   public:
    virtual JsonType ToJson() = 0;
    virtual std::unique_ptr<WrapperBase> Clone() = 0;
    virtual ~WrapperBase() {}
  };

  template<typename O>
  class Wrapper : public WrapperBase {
   public:
    Wrapper(const O* obj,
            std::function<JsonType(const O& obj)> apply) :
      obj_(obj), apply_(apply) {}

    virtual JsonType ToJson() {
      return apply_(*obj_);
    }

    virtual std::unique_ptr<WrapperBase> Clone() {
      return std::make_unique<Wrapper>(obj_, apply_);
    }

    const O* obj_;
    std::function<JsonType(const O& obj)> apply_;
  };

  std::unique_ptr<WrapperBase> wrapper_;
};

class JsonObject {
 public:
  // The json types.
  explicit JsonObject(int32_t i) : v_(i) {}
  explicit JsonObject(int64_t i) : v_(i) {}
  explicit JsonObject(double d) : v_(d) {}
  explicit JsonObject(float f) : v_(f) {}
  explicit JsonObject(const char* s) {
    v_.emplace<std::string>(s);
  }
  explicit JsonObject(const std::string& s) : v_(s) {}
  explicit JsonObject(bool b) : v_(b) {}
  explicit JsonObject(std::nullptr_t n) : v_(NullValue()) {}
  explicit JsonObject(JsonArray l) : v_(l) {}
  explicit JsonObject(JsonDict o) : v_(o) {}
  explicit JsonObject(JsonArray&& l) : v_(std::move(l)) {}
  explicit JsonObject(JsonDict&& o) : v_(std::move(o)) {}
  explicit JsonObject(Any<JsonArray> a) : v_(a) {}
  explicit JsonObject(Any<JsonDict> a) : v_(a) {}
  explicit JsonObject(Any<JsonObject> j) : v_(j) {}
  explicit JsonObject(Any<JsonArray>&& a) : v_(std::move(a)) {}
  explicit JsonObject(Any<JsonDict>&& a) : v_(std::move(a)) {}
  explicit JsonObject(Any<JsonObject>&& j) : v_(std::move(j)) {}

  JsonObject(JsonObject&& from) {
    v_ = std::move(from.v_);
  }

  JsonObject(const JsonObject& from) {
    v_ = from.v_;
  }

  JsonObject& operator=(const JsonObject& from) {
    v_ = from.v_;
    return *this;
  }

  template <typename T>
  JsonObject& operator=(T i) {
    v_ = i;
    return *this;
  }

  // Gets the underlying value inside this JsonObject.
  // Returns nullopt if JsonObject doesn't hold this type.
  template<typename T>
  T* Get() {
    if (!std::holds_alternative<T>(v_)) {
      return nullptr;
    }
    return &std::get<T>(v_);
  }

  template<typename... Types>
  constexpr bool Has() const {
    return (std::holds_alternative<Types>(v_) || ...);
  }

  std::string ToString(int indent_columns = 0) const;
  void ToString(std::stringbuf* buf, int indent_columns = 0) const;

 private:
  std::variant<bool, int32_t, int64_t, double, float, std::string,
               NullValue, JsonArray, JsonDict,
               Any<JsonArray>, Any<JsonDict>, Any<JsonObject>> v_;
};

template<typename T>
T* JsonDict::Get(const std::string& key) {
  for (auto& [k, v] : values_) {
    if (k == key) {
      return v.Get<T>();
    }
  }
  return nullptr;
}

}  // namespace htmlparser::json

#endif  // HTMLPARSER__JSON_JSON_H_
