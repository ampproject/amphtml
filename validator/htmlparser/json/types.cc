#include "json/types.h"

namespace htmlparser::json {

constexpr int64_t MAX_SAFE_INTEGER = 9007199254740992;  // 2 ^^ 53.

std::string JsonDict::ToString() const {
  std::stringbuf buf;
  ToString(&buf);
  return buf.str();
}

void JsonDict::ToString(std::stringbuf* buf) const {
  bool first = true;
  buf->sputc('{');
  for (auto& [k, v] : values_) {
    if (!first) buf->sputn(", ", 2);
    first = false;
    buf->sputc('"');
    buf->sputn(k.c_str(), k.size());
    buf->sputc('"');
    buf->sputn(": ", 2);
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
  bool first = true;
  buf->sputc('[');
  for (auto& i : items_) {
    if (!first) buf->sputn(", ", 2);
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

template <typename... Ts>
struct overloaded : Ts... {
  using Ts::operator()...;
};
template <typename... Ts>
overloaded(Ts...) -> overloaded<Ts...>;

void JsonObject::ToString(std::stringbuf* buf) const {
  std::visit(
      overloaded{
          [buf](int32_t i) {
            std::string str = std::to_string(i);
            buf->sputn(str.c_str(), str.size());
          },
          [buf](int64_t i) {
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
          [buf](double d) {
            std::string str = std::to_string(d);
            buf->sputn(str.c_str(), str.size());
          },
          [buf](float f) {
            std::string str = std::to_string(f);
            buf->sputn(str.c_str(), str.size());
          },
          [buf](bool b) { b ? buf->sputn("true", 4) : buf->sputn("false", 5); },
          [buf](const std::string& str) {
            buf->sputc('"');
            buf->sputn(str.c_str(), str.size());
            buf->sputc('"');
          },
          [buf](NullValue n) { buf->sputn("null", 4); },
          [buf](const JsonArray& a) { a.ToString(buf); },
          [buf](const JsonDict& d) { d.ToString(buf); },
      },
      v_);
}

}  // namespace htmlparser::json
