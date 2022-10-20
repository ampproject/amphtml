#include "cpp/htmlparser/json/types.h"

#include <array>

namespace htmlparser::json {

const int64_t MAX_SAFE_INTEGER = 1LL << 53;  // 2 ^^ 53.

std::string JsonNull::ToString() const {
  std::stringbuf buf;
  ToString(&buf);
  return buf.str();
}

void JsonNull::ToString(std::stringbuf* buf) const {
  buf->sputn("null", 4);
}

std::string JsonDict::ToString() const {
  std::stringbuf buf;
  ToString(&buf);
  return buf.str();
}

JsonObject* JsonDict::Get(std::string_view key) {
  for (auto iter = items_.rbegin(); iter != items_.rend(); ++iter) {
    if (iter->first == key) {
      return &iter->second;
    }
  }
  return nullptr;
}

void JsonDict::ToString(std::stringbuf* buf) const {
  bool first = true;
  buf->sputc('{');
  for (auto& [k, v] : items_) {
    if (!first) {
      buf->sputc(',');
    }
    first = false;
    buf->sputc('"');
    buf->sputn(k.c_str(), k.size());
    buf->sputn("\":", 2);
    v.ToString(buf);
  }
  buf->sputc('}');
}

std::string JsonArray::ToString() const {
  std::stringbuf buf;
  ToString(&buf);
  return buf.str();
}

void JsonArray::ToString(std::stringbuf* buf) const {
  if (items_.empty()) {
    buf->sputn("[]", 2);
    return;
  }

  bool first = true;
  buf->sputc('[');
  for (auto& i : items_) {
    if (!first) {
      buf->sputc(',');
    }
    first = false;
    i.ToString(buf);
  }
  buf->sputc(']');
}

std::string JsonObject::ToString() const {
  std::stringbuf buf;
  ToString(&buf);
  return buf.str();
}

template <class... Fs>
struct overloaded : Fs... {
  template <class... Ts>
  overloaded(Ts&&... ts) : Fs{std::forward<Ts>(ts)}...
  {}

  using Fs::operator()...;
};

template <class ...Ts>
overloaded(Ts&&...) -> overloaded<std::remove_reference_t<Ts>...>;

void JsonObject::ToString(std::stringbuf* buf) const {
  std::visit(
      overloaded{
          [&](int32_t i) {
            std::string str = std::to_string(i);
            buf->sputn(str.c_str(), str.size());
          },
          [&](int64_t i) {
            bool overflow = (
                (i < 0 && i < -MAX_SAFE_INTEGER + 1) ||
                (i > 0 && i > MAX_SAFE_INTEGER - 1));
            if (overflow) {
              buf->sputc('"');
            }
            std::string str = std::to_string(i);
            buf->sputn(str.c_str(), str.size());
            if (overflow) {
              buf->sputc('"');
            }
          },
          [&](double d) {
            std::string str = std::to_string(d);
            buf->sputn(str.c_str(), str.size());
          },
          [&](float f) {
            std::string str = std::to_string(f);
            buf->sputn(str.c_str(), str.size());
          },
          [&](bool b) { b ? buf->sputn("true", 4) : buf->sputn("false", 5); },
          [&](const std::string& str) {
            buf->sputc('"');
            buf->sputn(str.c_str(), str.size());
            buf->sputc('"');
          },
          [&](const std::string_view& str) {
            buf->sputc('"');
            buf->sputn(str.data(), str.size());
            buf->sputc('"');
          },
          [&](JsonNull n) { buf->sputn("null", 4); },
          [&](const JsonArray& a) { a.ToString(buf); },
          [&](const JsonDict& d) { d.ToString(buf); },
          [&](const Any<JsonArray>& a) { a.ToString(buf); },
          [&](const Any<JsonDict>& a) { a.ToString(buf); },
          [&](const Any<JsonObject>& a) { a.ToString(buf); },
      },
      v_);
}

}  // namespace htmlparser::json
