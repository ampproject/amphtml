#include "cpp/htmlparser/strings.h"

#include <algorithm>
#include <array>
#include <functional>
#include <sstream>
#include <tuple>
#include "cpp/htmlparser/casetable.h"
#include "cpp/htmlparser/entity.h"
#include "cpp/htmlparser/whitespacetable.h"

namespace htmlparser {

// These replacements permit compatibility with old numeric entities that
// assumed Windows-1252 encoding.
// https://html.spec.whatwg.org/multipage/syntax.html#consume-a-character-reference
constexpr std::array<char32_t, 32> kReplacementTable{
    L'\u20AC', // First entry is what 0x80 should be replaced with.
    L'\u0081',
    L'\u201A',
    L'\u0192',
    L'\u201E',
    L'\u2026',
    L'\u2020',
    L'\u2021',
    L'\u02C6',
    L'\u2030',
    L'\u0160',
    L'\u2039',
    L'\u0152',
    L'\u008D',
    L'\u017D',
    L'\u008F',
    L'\u0090',
    L'\u2018',
    L'\u2019',
    L'\u201C',
    L'\u201D',
    L'\u2022',
    L'\u2013',
    L'\u2014',
    L'\u02DC',
    L'\u2122',
    L'\u0161',
    L'\u203A',
    L'\u0153',
    L'\u009D',
    L'\u017E',
    L'\u0178', // Last entry is 0x9F.
    // 0x00->L'\uFFFD' is handled programmatically.
    // 0x0D->L'\u000D' is a no-op.
};

// Copied from https://github.com/abseil/abseil-cpp/blob/master/absl/strings/ascii.cc
constexpr std::array<unsigned char, 256> kPropertyBits{
    0x40, 0x40, 0x40, 0x40, 0x40, 0x40, 0x40, 0x40,  // 0x00
    0x40, 0x68, 0x48, 0x48, 0x48, 0x48, 0x40, 0x40,
    0x40, 0x40, 0x40, 0x40, 0x40, 0x40, 0x40, 0x40,  // 0x10
    0x40, 0x40, 0x40, 0x40, 0x40, 0x40, 0x40, 0x40,
    0x28, 0x10, 0x10, 0x10, 0x10, 0x10, 0x10, 0x10,  // 0x20
    0x10, 0x10, 0x10, 0x10, 0x10, 0x10, 0x10, 0x10,
    0x84, 0x84, 0x84, 0x84, 0x84, 0x84, 0x84, 0x84,  // 0x30
    0x84, 0x84, 0x10, 0x10, 0x10, 0x10, 0x10, 0x10,
    0x10, 0x85, 0x85, 0x85, 0x85, 0x85, 0x85, 0x05,  // 0x40
    0x05, 0x05, 0x05, 0x05, 0x05, 0x05, 0x05, 0x05,
    0x05, 0x05, 0x05, 0x05, 0x05, 0x05, 0x05, 0x05,  // 0x50
    0x05, 0x05, 0x05, 0x10, 0x10, 0x10, 0x10, 0x10,
    0x10, 0x85, 0x85, 0x85, 0x85, 0x85, 0x85, 0x05,  // 0x60
    0x05, 0x05, 0x05, 0x05, 0x05, 0x05, 0x05, 0x05,
    0x05, 0x05, 0x05, 0x05, 0x05, 0x05, 0x05, 0x05,  // 0x70
    0x05, 0x05, 0x05, 0x10, 0x10, 0x10, 0x10, 0x40,
};


// Internal functions forward
// ==========================
namespace {

// Unescapes the entity inline. &lt;html&gt; becomes <html>. The resulting
// string may be smaller than original string.
std::pair<int, int> UnescapeEntity(std::string* b, int dst, int src,
    bool attribute = false);

// Converts the case of a string s according to the rules of character map in
// the case conversion table.
void CaseTransformInternal(bool to_upper, std::string* s);

// For multi-sequence utf-8 codepoints, reads the next valid byte as out
// parameter. Returns false if next byte in the sequence is not a valid byte.
bool ReadContinuationByte(uint8_t byte, uint8_t* out);

// Checks if the character is ASCII that is in range 1-127.
inline bool IsOneByteASCIIChar(uint8_t c);

// For a given string extracts all its char (including big char).
// Extraction may fail if there is error decoding utf-8 bytes inside the str.
// Returns false in case of error.
bool ExtractChars(std::string_view str, std::vector<char32_t>* chars);

// Converts 0xFF to 255, 0x8d to 141 etc. Better and exception safe than
// std::stoi and others.
bool OneByteHexCodeToInt(std::string_view hex_code, uint8_t* out);

}  // namespace.

std::optional<std::string> Strings::DecodePercentEncodedURL(
    std::string_view uri) {
  if (uri.empty()) return "";

  std::stringbuf uri_decoded;
  while (!uri.empty()) {
    if (uri.front() != '%') {
      uri_decoded.sputc(uri.front());
      uri.remove_prefix(1);
      continue;
    }

    uint8_t x1 = 0;
    if (uri.size() < 3 ||
        !OneByteHexCodeToInt(uri.substr(1, 2), &x1)) {
      return std::nullopt;
    }

    // Consumed the first three percent encoded chars. eg. %a8.
    uri.remove_prefix(3);

    // Sequence byte without initial byte.
    if ((x1 & 0xc0) == 0x80) return std::nullopt;

    auto num_bytes = Strings::CodePointByteSequenceCount(x1);
    uri_decoded.sputc(x1);
    if (num_bytes == 1) {
      // Single byte char must be signed char.
      if (x1 > 127) return std::nullopt;
      continue;
    }

    // 2 bytes sequence.
    if (num_bytes > 1) {
      uint8_t x2 = 0;
      if (uri.size() < 3 ||
          uri.front() != '%' ||
          !OneByteHexCodeToInt(uri.substr(1, 2), &x2) ||
          (x2 & 0xc0) != 0x80) {
        return std::nullopt;
      }
      uri.remove_prefix(3);
      uri_decoded.sputc(x2);
    }

    // 3 byte sequence.
    if (num_bytes > 2) {
      uint8_t x3 = 0;
      if (uri.size() < 3 ||
          uri.front() != '%' ||
          !OneByteHexCodeToInt(uri.substr(1, 2), &x3) ||
          (x3 & 0xc0) != 0x80) {
        return std::nullopt;
      }
      uri.remove_prefix(3);
      uri_decoded.sputc(x3);
    }

    // 4 byte sequence.
    if (num_bytes > 3) {
      uint8_t x4 = 0;
      if (uri.size() < 3 ||
          uri.front() != '%' ||
          !OneByteHexCodeToInt(uri.substr(1, 2), &x4) ||
          (x4 & 0xc0) != 0x80) {
        return std::nullopt;
      }
      uri.remove_prefix(3);
      uri_decoded.sputc(x4);
    }
  }

  return uri_decoded.str();
}

bool Strings::IsCharAlphabet(char c) {
  return ('a' <= c && c <= 'z') || ('A' <= c && c <= 'Z');
}

// Returns true if character is char 0-9.
bool Strings::IsDigit(char c) {
  return '0' <= c && c <= '9';
}

void Strings::ConvertNewLines(std::string* s) {
  for (std::size_t i = 0; i < s->size(); i++) {
    char c = s->at(i);
    if (!(c == '\r' || c == '\f')) continue;

    // Converts any lone \r that is not followed by \n to \n.
    // \r\rfoo becomes \n\nfoo.
    // \r\r\nfoo becomes \n\nfoo.
    // \r\f\r\nfoo becomes \n\n\nfoo
    std::size_t next = i + 1;
    if (c == '\r') {
      if (next >= s->size() || s->at(next) != '\n') {
        (*s)[i] = '\n';
        continue;
      }
    }

    if (c == '\f') {
      (*s)[i] = '\n';
      continue;
    }

    int dest = i;
    while (next < s->size()) {
      if (s->at(next) == '\r') {
        if ((next + 1) < s->size() && s->at(next + 1) == '\n') {
          next++;
        }
        (*s)[dest] = '\n';
      } else {
        (*s)[dest] = s->at(next);
      }
      next++;
      dest++;
    }
    s->resize(dest);
  }
}

std::string Strings::ToHexString(uint32_t c) {
  std::stringstream ss;
  ss << "0x" << std::hex << c;
  return ss.str();
}

int8_t Strings::CodePointByteSequenceCount(uint8_t c) {
  if ((c & 0x80) == 0) return 1;     // Ascii char.
  if ((c & 0xe0) == 0xc0) return 2;  // 2 bytes sequence.
  if ((c & 0xf0) == 0xe0) return 3;  // 3 bytes sequence.
  if ((c & 0xf8) == 0xf0) return 4;  // 4 bytes sequence.


  // Defaults to 1 byte ascii.
  return 1;
}

int8_t Strings::CodePointNumBytes(char32_t c) {
  if (c & 0xffffff80) return 1;
  if (c & 0xfffff800) return 2;
  if (c & 0xffff0000) return 3;
  if (c & 0xffe00000) return 4;

  // Defaults to 1 byte ascii.
  return 1;
}

std::optional<char32_t> Strings::DecodeUtf8Symbol(std::string_view* s) {
  if (!s || s->empty()) {
    return std::nullopt;
  }

  // Checks first byte is valid.
  uint8_t c = *(s->data()) & 0xff;

  // 1 byte sequence.
  if (IsOneByteASCIIChar(c)) {
    s->remove_prefix(1);
    return c;
  }

  if (!(CodePointByteSequenceCount(c) > 1)) {
    return std::nullopt;
  }

  // 2 byte sequence.
  if ((c & 0xe0) == 0xc0) {
    if (s->size() < 2) return std::nullopt;
    s->remove_prefix(1);
    uint8_t c2;
    bool c2_ok = ReadContinuationByte(*(s->data()), &c2);
    s->remove_prefix(1);
    // Invalid byte in the sequence.
    if (!c2_ok) return L'\uFFFD';
    char32_t code_point = ((c & 0x1f) << 6) | c2;
    if (code_point < 0x80) {
      return std::nullopt;
    }
    return code_point;
  }

  // 3 byte sequence.
  if ((c &  0xf0) == 0xe0) {
    if (s->size() < 3) return std::nullopt;
    s->remove_prefix(1);
    uint8_t c2;
    bool c2_ok = ReadContinuationByte(*(s->data()), &c2);
    s->remove_prefix(1);
    uint8_t c3;
    bool c3_ok = ReadContinuationByte(*(s->data()), &c3);
    s->remove_prefix(1);
    // Invalid bytes in the sequence.
    if (!(c2_ok && c3_ok)) return L'\uFFFD';
    char32_t code_point = ((c & 0x0f) << 12) | (c2 << 6) | c3;
    if (code_point < 0x0800) {
      return std::nullopt;
    }
    // Check if this is codepoint is low surrgates.
    if (code_point >= 0xd800 && code_point <= 0xdfff) {
      return std::nullopt;
    }

    return code_point;
  }

  // 4 byte sequence.
  if ((c & 0xf8) == 0xf0) {
    if (s->size() < 4) return std::nullopt;
    s->remove_prefix(1);
    uint8_t c2;
    bool c2_ok = ReadContinuationByte(*(s->data()), &c2);
    s->remove_prefix(1);
    uint8_t c3;
    bool c3_ok = ReadContinuationByte(*(s->data()), &c3);
    s->remove_prefix(1);
    uint8_t c4;
    bool c4_ok = ReadContinuationByte(*(s->data()), &c4);
    s->remove_prefix(1);
    // Invalid bytes in the sequence.
    if (!(c2_ok && c3_ok && c4_ok)) return L'\uFFFD';
    char32_t code_point =  ((c & 0x07) << 0x12) |
                           (c2 << 0x0c) |
                           (c3 << 0x06) | c4;
    if (!(code_point >= 0x010000 && code_point <= 0x10ffff)) {
      return std::nullopt;
    }
    return code_point;
  }

  return std::nullopt;
}

std::optional<std::string> Strings::EncodeUtf8Symbol(char32_t code_point) {
  if ((code_point & 0xffffff80) == 0) {  // 1 byte sequence.
    return std::string{static_cast<char>(code_point)};
  } else if ((code_point & 0xfffff800) == 0) {  // 2 byte sequence.
    return std::string{
      static_cast<char>((code_point >> 6) | 0xc0),
      static_cast<char>((code_point & 0x3f) | 0x80)
    };
  } else if ((code_point & 0xffff0000) == 0) {  // 3 byte sequence.
    return std::string{
      static_cast<char>((code_point >> 12) | 0xe0),
      static_cast<char>(((code_point >> 6) & 0x3f) | 0x80),
      static_cast<char>((code_point & 0x3f) | 0x80)
    };
  } else if ((code_point & 0xffe00000) == 0) {  // 4 byte sequence.
    return std::string{
      static_cast<char>((code_point >> 18) | 0xf0),
      static_cast<char>(((code_point >> 12) & 0x3f) | 0x80),
      static_cast<char>(((code_point >> 6) & 0x3f) | 0x80),
      static_cast<char>((code_point & 0x3f) | 0x80)
    };
  }

  return std::nullopt;
}

std::string Strings::EscapeString(std::string_view s) {
  std::stringbuf buffer;
  Escape(s, &buffer);
  return buffer.str();
}


void Strings::Escape(std::string_view s, std::stringbuf* escaped) {
  for (auto c : s) {
    if (kEscapeChars.find(c) == std::string::npos) {
      escaped->sputc(c);
      continue;
    }

    std::string esc = "";
    switch (c) {
      case '"':
        esc = "&#34;";
        break;
      case '&':
        esc = "&amp;";
        break;
      // "&#39;" is shorter than "&apos;" and apos was not in HTML until
      // HTML5.
      case '\'':
        esc = "&#39;";
        break;
      case '<':
        esc = "&lt;";
        break;
      case '>':
        esc = "&gt;";
        break;
      default:
        continue;
    }
    escaped->sputn(esc.c_str(), esc.size());
  }
}

void Strings::UnescapeString(std::string* s, bool attribute) {
  if (s->empty()) return;
  std::size_t src, dst = 0;
  for (std::size_t i = 0; i < s->size() - 1; i++) {
    if (s->at(i) == '&') {
      std::tie(dst, src) = UnescapeEntity(s, i, i, attribute);
      while (src < s->size()) {
        auto c = s->at(src);
        if (c == '&') {
          std::tie(dst, src) = UnescapeEntity(s, dst, src, attribute);
        } else {
          s->at(dst) = c;
          std::tie(dst, src) = std::tuple<int, int>(dst + 1, src + 1);
        }
      }
      return s->resize(dst);
    }
  }
}

void Strings::ToLower(std::string* s) {
  CaseTransformInternal(false, s);
}

void Strings::ToUpper(std::string* s) {
  CaseTransformInternal(true, s);
}

std::size_t Strings::IndexAny(const std::string_view s,
                              std::string_view chars) {
  return s.find_first_of(chars);
}

void Strings::TrimLeft(std::string* s, std::string_view chars_to_trim) {
  s->erase(0, s->find_first_not_of(chars_to_trim));
}

void Strings::TrimRight(std::string* s, std::string_view chars_to_trim) {
  s->erase(s->find_last_not_of(chars_to_trim) + 1);
}

void Strings::Trim(std::string* s, std::string_view chars_to_trim) {
  TrimLeft(s, chars_to_trim);
  TrimRight(s, chars_to_trim);
}

void Strings::TrimLeft(std::string_view* s, std::string_view chars_to_trim) {
  if (auto count = s->find_first_not_of(chars_to_trim);
      count != std::string_view::npos) {
    s->remove_prefix(count);
  } else {
    // All whitespace.
    s->remove_prefix(s->size());
  }
}

void Strings::TrimRight(std::string_view* s, std::string_view chars_to_trim) {
  if (auto count = s->find_last_not_of(chars_to_trim);
      count != std::string_view::npos) {
    s->remove_suffix(s->size() - count - 1);
  } else {
    // All whitespace.
    s->remove_suffix(s->size());
  }
}

void Strings::Trim(std::string_view* s, std::string_view chars_to_trim) {
  TrimLeft(s, chars_to_trim);
  TrimRight(s, chars_to_trim);
}

bool Strings::StripTrailingNewline(std::string* s) {
  if (!s->empty() && (*s)[s->size() - 1] == '\n') {
    if (s->size() > 1 && (*s)[s->size() - 2] == '\r')
      s->resize(s->size() - 2);
    else
      s->resize(s->size() - 1);
    return true;
  }
  return false;
}

void Strings::RemoveExtraSpaceChars(std::string* s) {
  int put_index = 0;
  bool ignore_next_space_char = false;
  for (std::size_t i = 0; i < s->size(); ++i) {
    if (s->at(i) == ' ') {
      // Previous character was a space, so ignore this char.
      if (ignore_next_space_char) {
        continue;
      }
      ignore_next_space_char = true;
    } else {
      ignore_next_space_char = false;
    }
    s->at(put_index++) = s->at(i);
  }
  s->resize(put_index);
}

bool Strings::StartsWith(std::string_view s, std::string_view prefix) {
  if (prefix.size() > s.size()) return false;

  for (std::size_t i = 0; i < prefix.size(); ++i) {
    uint8_t c1 = prefix.at(i) & 0xff;
    uint8_t c2 = s.at(i) & 0xff;
    if (c1 != c2) return false;
  }

  return true;
}

bool Strings::EndsWith(std::string_view s, std::string_view suffix) {
  if (suffix.size() > s.size()) return false;

  std::size_t i;
  std::size_t j;
  for (i = suffix.size() - 1, j = s.size() - 1; i > 0; --i) {
    uint8_t c1 = suffix.at(i) & 0xff;
    uint8_t c2 = s.at(j--) & 0xff;
    if (c1 != c2) return false;
  }

  return true;
}

void Strings::Replace(std::string* s, std::string_view from,
    std::string_view to) {
  if (from.empty()) return;

  std::size_t i = s->find(from);
  s->replace(i, from.size(), to);
}

void Strings::ReplaceAll(std::string* s, std::string_view from,
                         std::string_view to) {
  if (from.empty()) return;
  std::size_t i = s->find(from);
  while (i != std::string::npos) {
    s->replace(i, from.size(), to);
    i = s->find(from, i);
  }
}

void Strings::ReplaceAny(std::string* s, std::string_view chars,
                         std::string_view to) {
  if (chars.empty()) return;
  std::size_t i = s->find_first_of(chars);
  while (i != std::string::npos) {
    s->replace(i, 1, to);
    i = s->find_first_of(chars);
  }
}

std::optional<std::string> Strings::Translate(std::string_view str,
                                              std::string_view abc,
                                              std::string_view xyz) {
  // Contains sequence of characters found in abc string.
  std::vector<char32_t> abc_bytes;
  // Contains sequence of characters founds in xyz string.
  std::vector<char32_t> xyz_bytes;

  // Captures the characters.
  if (!(ExtractChars(abc, &abc_bytes) &&
        ExtractChars(xyz, &xyz_bytes))) {
    return std::nullopt;
  }

  // Helper function to find out index of matching char in the abc string.
  // Returns -1 if char is not found.
  std::function<int(char32_t)> getCharIndex =
      [&](char32_t c) -> std::size_t {
    for (std::size_t i = 0; i < abc_bytes.size(); ++i) {
      if (abc_bytes.at(i) == c) return i;
    }
    return std::string::npos;
  };

  // Evaluate and translate.
  std::stringbuf buf;
  while (!str.empty()) {
    uint8_t new_char = str.front() & 0xff;
    if (IsOneByteASCIIChar(new_char)) {
      std::size_t i = getCharIndex(new_char);
      if (i == std::string::npos) {
        buf.sputc(new_char);
      } else if (i >= xyz_bytes.size()) {
        // Ignore the character. i.e. remove from translated string.
      } else {
        // Replacement byte can be utf-8 code.
        std::string s = EncodeUtf8Symbol(xyz_bytes.at(i)).value_or("");
        buf.sputn(s.c_str(), s.size());
      }
      str.remove_prefix(1);
      continue;
    }

    auto big_char_or = DecodeUtf8Symbol(&str);
    if (!big_char_or.has_value()) {
      // Error decoding string.
      return std::nullopt;
    }
    char32_t big_char = big_char_or.value();
    std::size_t i = getCharIndex(big_char);
    if (i == std::string::npos) {
      auto s_or = EncodeUtf8Symbol(big_char);
      if (!s_or.has_value()) return std::nullopt;
      buf.sputn(s_or.value().c_str(), s_or.value().size());
    } else if (i >= xyz_bytes.size()) {
      // Ignore the character. i.e. remove from translated string.
    } else {
      auto s_or = EncodeUtf8Symbol(xyz_bytes.at(i));
      if (!s_or.has_value()) return std::nullopt;
      buf.sputn(s_or.value().c_str(), s_or.value().size());
    }
  }

  return buf.str();
}

bool Strings::IsAllWhitespaceChars(std::string_view s,
      std::string_view whitespace_chars) {
  return s.find_first_not_of(whitespace_chars) == std::string::npos;
}

bool Strings::EqualFold(std::string_view l, std::string_view r) {
  while (!l.empty()) {
    // Reached the end of r, but more chars in l.
    if (r.empty()) return false;

    uint8_t l_char = l.front() & 0xff;
    uint8_t r_char = r.front() & 0xff;

    // ASCII characters first.
    if (IsOneByteASCIIChar(l_char)) {
      if (('A' <= l_char && l_char <= 'Z') ||
          ('a' <= l_char && l_char <= 'z')) {
        // Compare lower character for both the chars.
        if ((l_char | 0x20) != (r_char | 0x20)) {
          return false;
        }
      } else if (l_char != r_char) { // Compare other ascii character as-is.
        return false;
      }

      l.remove_prefix(1);
      r.remove_prefix(1);
      continue;
    }

    if (!(CodePointByteSequenceCount(l_char) > 1 &&
          CodePointByteSequenceCount(r_char) > 1)) {
      return false;
    }

    auto l_char_opt = DecodeUtf8Symbol(&l);
    auto r_char_opt = DecodeUtf8Symbol(&r);

    // Checks decoding succeeded.
    if (!(l_char_opt.has_value() && r_char_opt.has_value())) return false;

    char32_t l_char_wide = l_char_opt.value();
    char32_t r_char_wide = r_char_opt.value();

    // Two characters matched. No case conversion needed.
    if (l_char_wide == r_char_wide) {
      continue;
    }

    // Convert both to lowercase.
    l_char_wide = ToLowerChar(l_char_wide);
    r_char_wide = ToLowerChar(r_char_wide);

    if (l_char_wide != r_char_wide) return false;
  }

  // Checks all the bytes are processed in both the strings. If some bytes
  // left in either string, they are not equal.
  return l.empty() && r.empty();
}

std::vector<std::string> Strings::SplitStringAt(
      std::string_view s, char delimiter) {
  std::vector<std::string> columns;
  size_t first = 0;

  while (first < s.size()) {
    auto second = s.find_first_of(delimiter, first);

    if (first != second)
      columns.emplace_back(std::string(s.substr(first, second-first)));

    if (second == std::string_view::npos)
      break;

    first = second + 1;
  }

  return columns;
}

std::vector<std::string_view> Strings::SplitStrAtUtf8Whitespace(
    std::string_view s) {
  std::vector<std::string_view> columns;
  std::size_t start = 0;
  std::size_t end = 0;
  while (end < s.size()) {
    auto num_ws = IsUtf8WhiteSpaceChar(s, end);
    if (num_ws > 0) {
      if (start < end) {
        columns.emplace_back(s.substr(start, end - start));
      }
      start = end + num_ws;
      end = start;
    } else {
      end++;
    }
  }
  columns.emplace_back(s.substr(start, s.size()));
  return columns;
}

int Strings::IsUtf8WhiteSpaceChar(std::string_view s, std::size_t position) {
  std::size_t i = position;
  int state = 0;
  while (i < s.size()) {
    uint8_t c = s.at(i++);
    state = kWhitespaceTable[state][c];

    if (state == 0) {
      return 0;
    }

    if (state == 1) {
      return i - position;
    }
  }

  return 0;
}

int Strings::CountTerms(std::string_view s) {
  bool in_term = false;
  int num_terms = 0;
  while (!s.empty()) {
    unsigned char c = s.front();
    s.remove_prefix(1);
    // whitespace and punctuations.
    if ((kPropertyBits[c] & 0x08) != 0 || (kPropertyBits[c] & 0x10) != 0) {
      in_term = false;
    } else if (!in_term) {
      // First character of a term
      ++num_terms;
      in_term = true;
    }
  }
  return num_terms;
}

namespace {

// Reads an entity like "&lt;" from b[src:] and writes the corresponding "<"
// to b[dst:], returning the incremented dst and src cursors.
// Precondition: b[src] == '&' && dst <= src.
// attribute should be true if passing an attribute value.
std::pair<int, int> UnescapeEntity(std::string* b, int dst, int src,
    bool attribute) {
  std::string s = b->substr(src);
  if (s.size() <= 1) {
    b->at(dst) = b->at(src);
    return std::pair<int, int>(dst + 1, src + 1);
  }

  // i starts at 1 because we already know that s[0] == '&'.
  std::size_t i = 1;
  if (s.at(i) == '#') {
    if (s.size() <= 3) {  // We need to have at least  "&#.".
      b->at(dst) = b->at(src);
      return std::pair<int, int>(dst + 1, src + 1);
    }
    i++;
    auto c = s.at(i);
    bool hex = false;
    if (c == 'x' || c == 'X') {
      hex = true;
      i++;
    }

    char32_t x = '\x00';
    while (i < s.size()) {
      auto c = s.at(i);
      i++;
      if (hex) {
        if (Strings::IsDigit(c)) {
          x = (16 * x) | (c - '0');
          continue;
        } else if ('a' <= c && c <= 'f') {
          x = 16 * x + c - 'a' + 10;
          continue;
        } else if ('A' <= c && c <= 'F') {
          x = 16 * x + c - 'A' + 10;
          continue;
        }
      } else if (Strings::IsDigit(c)) {
        x = 10 * x + c - '0';
        continue;
      }
      if (c != ';') {
          i--;
      }
      break;
    }

    if (i <= 3) {  // No characters matched.
      b->at(dst) = b->at(src);
      return std::pair<int, int>(dst + 1, src + 1);
    }

    if (0x80 <= x && x <= 0x9F) {
      // Replace characters from Windows-1252 with UTF-8 equivalents.
      x = kReplacementTable[x - 0x80];
    } else if (x == 0 || (0xD800 <= x && x <= 0xDFFF) || x > 0x10FFFF) {
      // Replace invalid characters with the replacement character.
      x = L'\uFFFD';
    }

    auto encoded_bytes = Strings::EncodeUtf8Symbol(x);
    if (encoded_bytes.has_value()) {
      std::transform(encoded_bytes.value().begin(),
          encoded_bytes.value().end(), b->begin() + dst,
          [](uint8_t c) -> char { return static_cast<char>(c); });
      return std::pair<int, int>(dst + encoded_bytes.value().size(), src + i);
    }
  }

  // Consume the maximum number of characters possible, with the consumed
  // characters matching one of the named references.
  while (i < s.size()) {
    auto c = s.at(i);
    i++;
    // Lower-cased characters are more common in entities, so we check for
    // them first.
   if (Strings::IsCharAlphabet(c) || Strings::IsDigit(c)) {
     continue;
   }
   if (c != ';') {
     i--;
   }
   break;
  }

  std::string entityName = s.substr(1, i - 1);
  auto encoded_bytes = EntityLookup(entityName);
  if (entityName.empty()) {
    // No-op.
  } else if (attribute && entityName.at(entityName.size() - 1) != ';' &&
      s.size() > i && s.at(i) == '=') {
    // No-op.
  } else if (!encoded_bytes.empty()) {
    int overflow = encoded_bytes.size() - entityName.size() - 1 /* & */;
    if (overflow > 0) {
      // Insert some dummy chars which will get occupied by overflow entity
      // chars.
      // Suppose &xy; = \x1\x2\x3\x4\x5 (5 bytes char)
      // abc&xy;def (10 bytes) after this statement is:
      // abc&xy; def (11 bytes).
      // After unescape: abc\x1\x2\x3\x4\x5def (11 bytes).
      b->insert(src + encoded_bytes.size() - 1, " ", overflow);
    }
    // Copies the unescaped bytes to the destination,
    std::transform(encoded_bytes.begin(), encoded_bytes.end(), b->begin() + dst,
        [](uint8_t c) -> char { return static_cast<char>(c); });
    return std::pair<int, int>(
        dst + encoded_bytes.size() - (overflow > 0 ? overflow : 0), src + i);
  } else if (!attribute) {
    int max_length = entityName.size() - 1;
    if (max_length > kLongestEntityWithoutSemiColon) {
      max_length = kLongestEntityWithoutSemiColon;
    }
    for (int j = max_length; j > 1; --j) {
      auto encoded_bytes = EntityLookup(entityName.substr(0, j));
      if (!encoded_bytes.empty()) {
        std::transform(encoded_bytes.begin(), encoded_bytes.end(),
                       b->begin() + dst, [](uint8_t c) -> char {
                         return static_cast<char>(c); });
        return std::pair<int, int>(dst + encoded_bytes.size(), src + j + 1);
      }
    }
  }

  std::copy(b->begin() + src, b->begin() + src + i, b->begin() + dst);
  return std::pair<int, int>(dst + i, src + i);
}

void CaseTransformInternal(bool to_upper, std::string* s) {
  for (std::size_t i = 0; i < s->size(); ++i) {

    uint8_t code_point = s->at(i) & 0xff;

    // ASCII characters first.
    if (IsOneByteASCIIChar(code_point)) {
      auto c = to_upper ? ToUpperChar(code_point) : ToLowerChar(code_point);
      if (c != code_point) {
        s->at(i) = static_cast<char>(c);
      }
      continue;
    }

    if (Strings::CodePointByteSequenceCount(code_point) > 1) {
      std::string_view sv = *s;
      sv.remove_prefix(i);
      auto decoded = Strings::DecodeUtf8Symbol(&sv);
      if (decoded.has_value()) {
        char32_t decode_value = decoded.value();
        auto c =
            to_upper ? ToUpperChar(decode_value) : ToLowerChar(decode_value);
        if (c != decode_value) {
          auto char_encoded = Strings::EncodeUtf8Symbol(c);
          if (char_encoded.has_value()) {
            std::transform(char_encoded.value().begin(),
                char_encoded.value().end(), s->begin() + i,
                [](uint8_t c) -> char { return static_cast<char>(c); });
          }
        }
      }
    }
  }
}

bool ReadContinuationByte(uint8_t byte, uint8_t* out) {
  // Checks it is valid continuation byte. 0b10xxxxxx.
  if ((byte & 0xc0) == 0x80) {
    // Mask last six bits 0b00xxxxxx.
    *out = byte & 0x3f;
    return true;
  }

  // Invalid continuation byte.
  return false;
}

inline bool IsOneByteASCIIChar(uint8_t c) {
  return (c & 0x80) == 0;
}

bool ExtractChars(std::string_view str, std::vector<char32_t>* chars) {
  while (!str.empty()) {
    uint8_t c = str.front() & 0xff;

    // ASCII characters first.
    if (IsOneByteASCIIChar(c)) {
      chars->push_back(c);
      str.remove_prefix(1);
      continue;
    // Check if this character is member of codepoint sequence.
    } else if (Strings::CodePointByteSequenceCount(c) > 1) {
      // Decode moves the string view prefix so no need to remove prefix
      // manually.
      auto old_big_char = Strings::DecodeUtf8Symbol(&str);
      if (!old_big_char.has_value()) {
        // Error decoding string.
        chars->clear();
        return false;
      }
      chars->push_back(old_big_char.value());
    } else {
      // Unknown character type.
      chars->clear();
      return false;
    }
  }
  return true;
}

bool OneByteHexCodeToInt(std::string_view hex_code, uint8_t* out) {
  // Will overflow.
  if (hex_code.size() > 2) return false;
  uint8_t x = 0;
  while (!hex_code.empty()) {
    auto h = hex_code.at(0);
    hex_code.remove_prefix(1);
    if (Strings::IsDigit(h)) {
      x = (16 * x) | (h - '0');
    } else if ('a' <= h && h <= 'f') {
      x = 16 * x + h - 'a' + 10;
    } else if ('A' <= h && h <= 'F') {
      x = 16 * x + h - 'A' + 10;
    } else {
      // Invalid hex code eg. %2x or %m8
      return false;
    }
  }
  *out = x;
  return true;
}

}  // namespace

}  // namespace htmlparser
