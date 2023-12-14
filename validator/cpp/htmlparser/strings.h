#ifndef CPP_HTMLPARSER_STRINGS_H_
#define CPP_HTMLPARSER_STRINGS_H_

#include <optional>
#include <sstream>
#include <string>
#include <string_view>
#include <vector>

namespace htmlparser {

class Strings {
 public:
  // One of:
  // U+0009 CHARACTER TABULATION,
  // U+000A LINE FEED (LF),
  // U+000C FORM FEED (FF),
  // U+000D CARRIAGE RETURN (CR), or
  // U+0020 SPACE.
  inline static const std::string kWhitespace {
    // Do not sort or re-order.
    ' ',
    '\t',
    '\r',
    '\n',
    '\f',
    '\v'};

  // kWhitespace plus null char.
  inline static const std::string kWhitespaceOrNull {
    // Do not sort or re-order.
    ' ',
    '\t',
    '\r',
    '\n',
    '\f',
    '\0',
    '\v'};

  inline static const std::string kEscapeChars {
    // Do not sort or re-order.
    '&',
    '\'',
    '<',
    '>',
    '"'};

  inline static const std::string kNullChar = {'\0'};

  inline static const std::string kNullReplacementChar {
    '\xef', '\xbf', '\xbd'};  // encoded \ufffd (3 bytes).

  // Decodes a percent encoded string like "google.com%20%2F%20%3Fx%3Db" to
  // "google.com / ?x=b".
  static std::optional<std::string> DecodePercentEncodedURL(
    std::string_view uri);

  // Returns hex string representation of a 4 byte codepoint.
  static std::string ToHexString(uint32_t c);

  // byte is in the range 0x41-0x5A or 0x61-0x7A (A-Z or a-z).
  static bool IsCharAlphabet(char c);

  // byte is in the range 0x30-0x39 (chars: 0-9)
  static bool IsDigit(char c);

  // Converts "\r" and "\r\n" in s to "\n".
  // The conversion happens in place, but the resulting string may be shorter.
  static void ConvertNewLines(std::string* s);

  // UTF-8 Encoding/Decoding utility functions.
  // =================================
  //
  // Checks if the byte is a beginning of a unicode codepoint byte sequence.
  // First byte is masked as follows:
  // 0b110xxxxx - 2 byte sequence.
  // 0b1110xxxx - 3 byte sequence.
  // 0b11110xxx - 4 byte sequence.
  //
  // Returns number of byte sequence needed to encode the codepoint.
  static int8_t CodePointByteSequenceCount(uint8_t c);

  // Similar to CodePointByteSequenceCount except that it accepts entire
  // codepoint and tells how many bytes the codepoint contains.
  static int8_t CodePointNumBytes(char32_t c);

  // Decodes byte sequence to utf-8 codepoint.
  // The s points to the first byte in the sequence. Moves the cursor past
  // the byte sequence if decoding is successful.
  //
  // Returns 4 byte utf-8 codepoint value, or nullopt if:
  // - First byte is not valid (IsCodePoint),
  // - The three byte sequence includes unpaired surrogate which is not a scalar
  //   value.
  // - Invalid utf-8 data.
  static std::optional<char32_t> DecodeUtf8Symbol(std::string_view* s);

  // Same as DecodeUtf8Symbol(string_view*) except that the prefix is not
  // updated, meaning cursor is at the first byte of the current character
  // decoded in s.
  static std::optional<char32_t>
      DecodeUtf8Symbol(std::string_view s, std::size_t position = 0) {
    if (position < 0 || position > s.size()) return std::nullopt;

    if (position == 0) {
      return DecodeUtf8Symbol(&s);
    }

    std::string_view s_at_prefix = s.substr(position);
    return DecodeUtf8Symbol(&s_at_prefix);
  }

  // Encodes a utf-8 codepoint.
  // Fills the codepoint in the following sequence:
  //
  // 7 bits US ASCII characters.
  // 0b0xxxxxx
  //
  // Codepoint upto 11 bits.
  // 0b110xxxxx 0b10xxxxxx
  //
  // Codepoint upto 16 bits.
  // 0b1110xxxx 0b10xxxxxx 0b10xxxxxx
  //
  // Codepoint upto 21 bits.
  // 0b11110xxx 0b10xxxxxx 0b10xxxxxx 0b10xxxxxx
  //
  // Returns nullopt on error.
  static std::optional<std::string> EncodeUtf8Symbol(char32_t code_point);

  static std::vector<char32_t> Utf8ToCodepoints(std::string_view utf8) {
    std::vector<char32_t> out;
    out.reserve(utf8.size() / 2);
    // We use the UnicodeText abstraction because it handles
    // validation / conversion under the hood, so what comes out of this is
    // surely valid UTF8.
    auto codepoint = DecodeUtf8Symbol(&utf8);
    while (codepoint) {
      out.push_back(*codepoint);
      codepoint = DecodeUtf8Symbol(&utf8);
    }
    return out;
  }

  static void AppendCodepointToUtf8String(char32_t code,
                                          std::string* utf8_str) {
    // The implementation is modified from UnicodeText::push_back to append
    // to an existing string, rather than allocate a new one.
    auto encoded = EncodeUtf8Symbol(code);
    if (encoded) {
      *utf8_str += *encoded;
    } else {
      utf8_str->push_back(' ');
    }
  }

  static std::string CodepointToUtf8String(char32_t code) {
    auto output = htmlparser::Strings::EncodeUtf8Symbol(code);
    return output ? std::move(output.value()) : "";
  }

  // Converts unicode code points to a string.
  static std::string CodepointsToUtf8String(std::vector<char32_t> codes) {
    std::stringbuf buf;
    for (auto c : codes) {
      if (auto encoded = htmlparser::Strings::EncodeUtf8Symbol(c);
          encoded) {
        buf.sputn(encoded->c_str(), encoded->size());
      }
    }
    return buf.str();
  }

  // Returns index of the first instance of any character in chars or
  // npos if no character found. For unicode character returns the index of
  // initial byte of the sequence of bytes.
  static std::size_t IndexAny(std::string_view s,
                              std::string_view chars);

  // Escapes special characters like "<" to become "&lt;". It escapes only
  // five such characters: <, >, &, ' and ".
  // UnescapeString(EscapeString(s)) == s always holds, but the converse isn't
  // always true.
  static std::string EscapeString(std::string_view s);
  static void Escape(std::string_view s, std::stringbuf* escaped);

  // Unescapes s's entities in-place, so that "a&lt;b" becomes "a<b".
  // attribute should be true if passing an attribute value.
  // UnescapeString(EscapeString(s)) == s always holds, but the converse isn't
  // always true.
  static void UnescapeString(std::string* s, bool attribute = false);

  // Converts case of string in-place.
  static void ToLower(std::string* s);
  static void ToUpper(std::string* s);

  // Checks if string contains whitespace only characters.
  static bool IsAllWhitespaceChars(std::string_view s,
      std::string_view whitespace_chars = kWhitespace);

  // Case insensitive equals.
  static bool EqualFold(std::string_view l, std::string_view r);

  // Search replace functions.
  // Replaces first occurrence of the f in s with t.
  static void Replace(std::string* s, std::string_view f,
      std::string_view t);
  // Replaces all occurrences of the f in s with t.
  static void ReplaceAll(std::string* s, std::string_view f,
                         std::string_view t);
  static void ReplaceAny(std::string* s, std::string_view chars,
                         std::string_view to);

  // Replaces the string of characters in abc with the string of characters
  // in xyz. The first character in xyz will replace every occurrence of the
  // first character in abc that appears in the str.
  //
  // Example:
  // Translate("The quick brown fox.",
  //           "abcdefghijklmnopqrstuvwxyz",
  //           "ABCDEFGHIJKLMNOPQRSTUVWXYZ")
  // Returns:
  //   THE QUICK BROWN FOX.
  //
  // This works for utf-8 characters.
  // Strings::Translate("AmAltAs", "A", "서") outputs: 서m서lt서s.
  //
  // If abc contains duplicates, replacements are performed in the order they
  // appear in the target string. So Translate("amaltas", "atas", "ipox") will
  // replace all occurrences of 'a' with 'i'. The later 'a'->'o' mapping is
  // ignored.
  //
  // If abc is longer than xyz, then every occurrence of characters from str
  // that do not have a corresponding character in xyz will be removed.
  //
  // Example:
  // Strings::Translate("The quick brown fox.", "brown", "red");
  // returns: "The quick red fdx."
  //
  // The translated string may be smaller or larger than the evaluated string.
  //
  // Translation is guaranteed for ASCII characters. Translation may fail if
  // any of the strings str, abc, xyz contains utf-8 chars and decoding of those
  // chars failed, in which case this function returns std::nullopt.
  static std::optional<std::string> Translate(
      std::string_view str,   // String to evaluate.
      std::string_view abc,   // Chars that will be replaced.
      std::string_view xyz);  // Chars used for replacement.

  // Strips whitespace from a string in-place.
  static void TrimLeft(std::string* s,
      std::string_view chars_to_trim = kWhitespace);
  static void TrimRight(std::string* s,
      std::string_view chars_to_trim = kWhitespace);
  static void Trim(std::string* s,
      std::string_view chars_to_trim = kWhitespace);
  static void TrimLeft(std::string_view* s,
      std::string_view chars_to_trim = kWhitespace);
  static void TrimRight(std::string_view* s,
      std::string_view chars_to_trim = kWhitespace);
  static void Trim(std::string_view* s,
      std::string_view chars_to_trim = kWhitespace);

  static bool StripTrailingNewline(std::string* s);

  // Reduces all consecutive sequences of space characters to a single space
  // character.
  // Resulting string may be smaller (resized) than the original string.
  static void RemoveExtraSpaceChars(std::string* s);

  // Prefix and suffix matching functions.
  static bool StartsWith(std::string_view s, std::string_view prefix);
  static bool EndsWith(std::string_view s, std::string_view suffix);

  // Splits a string at delimiter character and returns the columns.
  static std::vector<std::string> SplitStringAt(
      std::string_view s, char delimiter);

  // Splits the string at any utf8 or ascii whitespace and returns the columns.
  // The returned values are the views of original string argument passed to
  // this method. If the original string goes out of scope after this method is
  // called, the contents of the columns is undefined.
  static std::vector<std::string_view> SplitStrAtUtf8Whitespace(
      std::string_view s);

  // Determines if a character at current position is a whitespace char.
  // Returns the number of bytes from current character that are part of the
  // whitespace. For multichar whitespace like ideographic space \u3000 it
  // returns 3 as ideographic space has 3 codepoints.
  //
  // Returns 0, if the character at current position is not a whitespace.
  static int IsUtf8WhiteSpaceChar(std::string_view s, std::size_t position = 0);

  // Counts number of terms in a text separated by whitespace and punctuations.
  static int CountTerms(std::string_view s);

 private:
  // No instance of this class.
  Strings() = default;
};

}  // namespace htmlparser

#endif  // CPP_HTMLPARSER_STRINGS_H_
