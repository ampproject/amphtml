#include "cpp/htmlparser/strings.h"

#include <string>

#include "gtest/gtest.h"

using namespace std::string_literals;

TEST(StringsTest, SplitStringAtTest) {
  auto columns = htmlparser::Strings::SplitStringAt("a|b|c", '|');
  EXPECT_EQ(columns.size(), 3);
  EXPECT_EQ(columns.at(0), "a");
  EXPECT_EQ(columns.at(1), "b");
  EXPECT_EQ(columns.at(2), "c");

  columns = htmlparser::Strings::SplitStringAt("a", '|');
  EXPECT_EQ(columns.size(), 1);
  EXPECT_EQ(columns.at(0), "a");
}

TEST(StringsTest, IsUtf8WhiteSpaceCharTest) {
  EXPECT_EQ(0, htmlparser::Strings::IsUtf8WhiteSpaceChar("abcd"));
  EXPECT_EQ(0, htmlparser::Strings::IsUtf8WhiteSpaceChar("foo bar"));
  EXPECT_EQ(0, htmlparser::Strings::IsUtf8WhiteSpaceChar("f bar"));
  EXPECT_EQ(1, htmlparser::Strings::IsUtf8WhiteSpaceChar(" abcd"));
  EXPECT_EQ(1, htmlparser::Strings::IsUtf8WhiteSpaceChar("\nabcd"));
  EXPECT_EQ(1, htmlparser::Strings::IsUtf8WhiteSpaceChar("\tabcd"));
  EXPECT_EQ(1, htmlparser::Strings::IsUtf8WhiteSpaceChar("\rabcd"));
  EXPECT_EQ(1, htmlparser::Strings::IsUtf8WhiteSpaceChar(
      std::string({'\x20', 'a'})));
  EXPECT_EQ(2, htmlparser::Strings::IsUtf8WhiteSpaceChar(
      std::string({'\xc2', '\x85', 'a', 'b', 'c'})));
  EXPECT_EQ(2, htmlparser::Strings::IsUtf8WhiteSpaceChar(
      std::string({'\xc2', '\xa0', 'a', 'b', 'c'})));
  EXPECT_EQ(3, htmlparser::Strings::IsUtf8WhiteSpaceChar(
      std::string({'\xe1', '\x9a', '\x80', 'a', 'b', 'c'})));

  // 0x2000 to 0x200a
  EXPECT_EQ(3, htmlparser::Strings::IsUtf8WhiteSpaceChar(
      std::string({'\xe2', '\x80', '\x80', 'a', 'b', 'c'})));
  EXPECT_EQ(3, htmlparser::Strings::IsUtf8WhiteSpaceChar(
      std::string({'\xe2', '\x80', '\x81', 'a', 'b', 'c'})));
  EXPECT_EQ(3, htmlparser::Strings::IsUtf8WhiteSpaceChar(
      std::string({'\xe2', '\x80', '\x82', 'a', 'b', 'c'})));
  EXPECT_EQ(3, htmlparser::Strings::IsUtf8WhiteSpaceChar(
      std::string({'\xe2', '\x80', '\x83', 'a', 'b', 'c'})));
  EXPECT_EQ(3, htmlparser::Strings::IsUtf8WhiteSpaceChar(
      std::string({'\xe2', '\x80', '\x84', 'a', 'b', 'c'})));
  EXPECT_EQ(3, htmlparser::Strings::IsUtf8WhiteSpaceChar(
      std::string({'\xe2', '\x80', '\x85', 'a', 'b', 'c'})));
  EXPECT_EQ(3, htmlparser::Strings::IsUtf8WhiteSpaceChar(
      std::string({'\xe2', '\x80', '\x86', 'a', 'b', 'c'})));
  EXPECT_EQ(3, htmlparser::Strings::IsUtf8WhiteSpaceChar(
      std::string({'\xe2', '\x80', '\x87', 'a', 'b', 'c'})));
  EXPECT_EQ(3, htmlparser::Strings::IsUtf8WhiteSpaceChar(
      std::string({'\xe2', '\x80', '\x88', 'a', 'b', 'c'})));
  EXPECT_EQ(3, htmlparser::Strings::IsUtf8WhiteSpaceChar(
      std::string({'\xe2', '\x80', '\x89', 'a', 'b', 'c'})));
  EXPECT_EQ(3, htmlparser::Strings::IsUtf8WhiteSpaceChar(
      std::string({'\xe2', '\x80', '\x8a', 'a', 'b', 'c'})));

  // 0x2028
  EXPECT_EQ(3, htmlparser::Strings::IsUtf8WhiteSpaceChar(
      std::string({'\xe2', '\x80', '\xa8', 'a', 'b', 'c'})));
  EXPECT_EQ(3, htmlparser::Strings::IsUtf8WhiteSpaceChar("\u2028abc"));

  // 0x2029
  EXPECT_EQ(3, htmlparser::Strings::IsUtf8WhiteSpaceChar(
      std::string({'\xe2', '\x80', '\xa9', 'a', 'b', 'c'})));
  EXPECT_EQ(3, htmlparser::Strings::IsUtf8WhiteSpaceChar( "\u2029abc"));

  // 0x202f
  EXPECT_EQ(3, htmlparser::Strings::IsUtf8WhiteSpaceChar(
      std::string({'\xe2', '\x80', '\xaf', 'a', 'b', 'c'})));
  EXPECT_EQ(3, htmlparser::Strings::IsUtf8WhiteSpaceChar( "\u202Fabc"));

  // 0x205f
  EXPECT_EQ(3, htmlparser::Strings::IsUtf8WhiteSpaceChar(
      std::string{'\xe2', '\x81', '\x9f', 'a', 'b', 'c'}));

  // 0x3000
  EXPECT_EQ(3, htmlparser::Strings::IsUtf8WhiteSpaceChar(
      std::string{'\xe3', '\x80', '\x80', 'a', 'b', 'c'}));

  // Invalid second byte.
  EXPECT_EQ(0, htmlparser::Strings::IsUtf8WhiteSpaceChar(
      std::string({'\xc2', '\x86', 'a', 'b', 'c'})));
  // Invalid first byte.
  EXPECT_EQ(0, htmlparser::Strings::IsUtf8WhiteSpaceChar(
      std::string({'\xc3', '\x85', 'a', 'b', 'c'})));

  // Invalid second byte.
  EXPECT_EQ(0, htmlparser::Strings::IsUtf8WhiteSpaceChar(
      std::string({'\xe1', '\x9b', '\x80', 'a', 'b', 'c'})));

  // Invalid third byte.
  EXPECT_EQ(0, htmlparser::Strings::IsUtf8WhiteSpaceChar(
      std::string{'\xe3', '\x80', '\x9c', 'a', 'b', 'c'}));

  // A few position argument cases.
  EXPECT_EQ(1, htmlparser::Strings::IsUtf8WhiteSpaceChar("foo bar", 3));
  EXPECT_EQ(1, htmlparser::Strings::IsUtf8WhiteSpaceChar("f bar", 1));
  EXPECT_EQ(3, htmlparser::Strings::IsUtf8WhiteSpaceChar(
      std::string({'a', 'b', 'c', '\xe2', '\x80', '\x80', 'a', 'b', 'c'}, 3)));
  EXPECT_EQ(3, htmlparser::Strings::IsUtf8WhiteSpaceChar("foo\u202Fbar", 3));
}

TEST(StringsTest, SplitStrAtUtf8WhitespaceTest) {
  std::string_view s = "hello world foo bar";
  auto columns = htmlparser::Strings::SplitStrAtUtf8Whitespace(s);
  EXPECT_EQ(4, columns.size());
  EXPECT_EQ("hello", columns[0]);
  EXPECT_EQ("world", columns[1]);
  EXPECT_EQ("foo", columns[2]);
  EXPECT_EQ("bar", columns[3]);

  s = "foo\u202Fbar";
  columns = htmlparser::Strings::SplitStrAtUtf8Whitespace(s);
  EXPECT_EQ(2, columns.size());
  EXPECT_EQ("foo", columns[0]);
  EXPECT_EQ("bar", columns[1]);

  s = "foo\xe2\x80\x8a       bar";
  columns = htmlparser::Strings::SplitStrAtUtf8Whitespace(s);
  EXPECT_EQ(2, columns.size());
  EXPECT_EQ("foo", columns[0]);
  EXPECT_EQ("bar", columns[1]);

  s = "foo\n      \n     \n  \u202Fbar";
  columns = htmlparser::Strings::SplitStrAtUtf8Whitespace(s);
  EXPECT_EQ(2, columns.size());
  EXPECT_EQ("foo", columns[0]);
  EXPECT_EQ("bar", columns[1]);

  s = "foo\n      \n     \n  \u202Fbar \xe2\x80\x81hello\nworld";
  columns = htmlparser::Strings::SplitStrAtUtf8Whitespace(s);
  EXPECT_EQ(4, columns.size());
  EXPECT_EQ("foo", columns[0]);
  EXPECT_EQ("bar", columns[1]);
  EXPECT_EQ("hello", columns[2]);
  EXPECT_EQ("world", columns[3]);

  s = "helloworldfoobar";
  columns = htmlparser::Strings::SplitStrAtUtf8Whitespace(s);
  EXPECT_EQ(1, columns.size());
  EXPECT_EQ("helloworldfoobar", columns[0]);
}

TEST(StringsTest, LowerUpperTest) {
  // Unicode.
  std::string name = "AMALTASsSŚŚSŚ";
  htmlparser::Strings::ToLower(&name);
  EXPECT_EQ(name, "amaltasssśśsś");
  htmlparser::Strings::ToUpper(&name);
  EXPECT_EQ(name, "AMALTASSSŚŚSŚ");

  // ascii.
  std::string lower = "amalTas";
  std::string upper = "AMALTaS";
  htmlparser::Strings::ToLower(&upper);
  EXPECT_EQ(upper, "amaltas");
  htmlparser::Strings::ToUpper(&lower);
  EXPECT_EQ(lower, "AMALTAS");
}

TEST(StringsTest, ConvertNewLinesTest) {
  std::string s1 = "hello\nworld";
  htmlparser::Strings::ConvertNewLines(&s1);
  EXPECT_EQ(s1, "hello\nworld");

  std::string s2 = "hello\rworld";
  htmlparser::Strings::ConvertNewLines(&s2);
  EXPECT_EQ(s2, "hello\nworld");

  std::string s3 = "hello\r\nworld";
  htmlparser::Strings::ConvertNewLines(&s3);
  EXPECT_EQ(s3, "hello\nworld");

  std::string s4 = "hello\r\r\nworld";
  htmlparser::Strings::ConvertNewLines(&s4);
  EXPECT_EQ(s4, "hello\n\nworld");

  std::string s5 = "hello\r\n\f\r\nworld";
  htmlparser::Strings::ConvertNewLines(&s5);
  EXPECT_EQ(s5, "hello\n\n\nworld");
}

TEST(StringsTest, EqualFoldTest) {
  // Left upper and right lower.
  EXPECT_TRUE(htmlparser::Strings::EqualFold(
      "A+MALTASsSŚŚSŚ", "a+maltasssśśsś"));
  // Right upper and left lower.
  EXPECT_TRUE(htmlparser::Strings::EqualFold(
      "a+maltasssśśsś", "A+MALTASsSŚŚSŚ"));
  // right string has one less char.
  EXPECT_FALSE(htmlparser::Strings::EqualFold(
      "A+MALTASsSŚŚSŚ", "a+maltasssśśs"));
  // left string has one less char.
  EXPECT_FALSE(htmlparser::Strings::EqualFold(
      "A+MALTASsSŚŚS", "a+maltasssśśsś"));
  // Ends with ascii character. Validates string_view cursor moves forward.
  EXPECT_TRUE(htmlparser::Strings::EqualFold(
      "A+MALTASsSŚŚSŚZ", "a+maltasssśśsśz"));
  // Many extra characters in right string.
  EXPECT_FALSE(htmlparser::Strings::EqualFold(
      "A+MALTASsSŚŚSŚ", "a+maltasssśśsśaa"));
  EXPECT_TRUE(htmlparser::Strings::EqualFold("śśsśz", "śśsśz"));
}

TEST(StringsTest, DecodeUtf8SymbolTest) {
  std::vector<std::string> strs = {
    "Amaltas",  // All ascii chars.
    "AŚŚśś",    // First aschii rest utf.
    "śśśś",     // All utf.
    "śAm",      // first utf rest ascii.
    "śAś",      // first and last utf.
  };

  for (auto& str : strs) {
    std::string_view s(str);
    while (!s.empty()) {
      auto opt_decoded_symbol = htmlparser::Strings::DecodeUtf8Symbol(&s);
      EXPECT_TRUE(opt_decoded_symbol.has_value());
    }
  }
}

TEST(StringsTest, DecodeUtf8SymbolTestImmutableStringView) {
  std::string str = "AmaltaśAś";
  auto decoded_symbol = htmlparser::Strings::DecodeUtf8Symbol(str, 0);
  EXPECT_TRUE(decoded_symbol.has_value());
  EXPECT_EQ(decoded_symbol.value(), 65 /* A */);

  decoded_symbol = htmlparser::Strings::DecodeUtf8Symbol(str, 1);
  EXPECT_TRUE(decoded_symbol.has_value());
  EXPECT_EQ(decoded_symbol.value(), 109  /* m */);

  decoded_symbol = htmlparser::Strings::DecodeUtf8Symbol(str, 6);
  EXPECT_TRUE(decoded_symbol.has_value());
  EXPECT_EQ(decoded_symbol.value(), 0x15b  /* ś */);

  // Next character is at previous + 2, as previous char is 2 byte codepoint.
  decoded_symbol = htmlparser::Strings::DecodeUtf8Symbol(str, 7);
  EXPECT_FALSE(decoded_symbol.has_value());
  // Above index corrected.
  decoded_symbol = htmlparser::Strings::DecodeUtf8Symbol(str, 8);
  EXPECT_TRUE(decoded_symbol.has_value());
  EXPECT_EQ(decoded_symbol.value(), 65  /* A */);

  // negative index is error.
  decoded_symbol = htmlparser::Strings::DecodeUtf8Symbol(str, -1);
  EXPECT_FALSE(decoded_symbol.has_value());

  // out of bound is error.
  decoded_symbol = htmlparser::Strings::DecodeUtf8Symbol(str, 100000);
  EXPECT_FALSE(decoded_symbol.has_value());
}

TEST(StringsTest, StartsEndsTest) {
  std::string name = "AMALTASsSŚŚSŚ";
  EXPECT_TRUE(htmlparser::Strings::StartsWith(name, name));
  EXPECT_TRUE(htmlparser::Strings::StartsWith(name, "AMALT"));
  EXPECT_TRUE(htmlparser::Strings::EndsWith(name, "SsSŚŚSŚ"));
  htmlparser::Strings::ToUpper(&name);
  EXPECT_TRUE(htmlparser::Strings::EndsWith(name, "SSSŚŚSŚ"));

  std::string whitespace("\t\n\r ");
  EXPECT_EQ(htmlparser::Strings::IndexAny("a maltas", whitespace), 1);
  EXPECT_EQ(htmlparser::Strings::IndexAny("amaltasssśśsś", "ś"), 9);
  EXPECT_TRUE(htmlparser::Strings::StartsWith("amaltasbohra", "amaltas"));
}

TEST(StringsTest, EscapeTest) {
  std::string s("hello & world");
  std::stringbuf escaped;
  htmlparser::Strings::Escape(s, &escaped);
  EXPECT_EQ("hello &amp; world", escaped.str());
}

TEST(StringsTest, EscapeUnescapeTest) {
  std::string ss("hello&amp;world. 2 &lt; 3");
  std::string original_ss = ss;
  htmlparser::Strings::UnescapeString(&ss);
  EXPECT_EQ(ss, "hello&world. 2 < 3");
  EXPECT_EQ(htmlparser::Strings::EscapeString(ss), "hello&amp;world. 2 &lt; 3");

  std::string newss("Hello&nvsim;world. 2&oopf;okhello&Aacute &amp ok");
  htmlparser::Strings::UnescapeString(&newss);
  EXPECT_EQ(newss, "Hello∼⃒world. 2𝕠okhelloÁ & ok");

  std::string unescaped("amal<tas>&as");
  EXPECT_EQ(htmlparser::Strings::EscapeString(unescaped),
      "amal&lt;tas&gt;&amp;as");

  std::string unescapedquotes("hello\"world\"");
  EXPECT_EQ(htmlparser::Strings::EscapeString(unescapedquotes),
            "hello&#34;world&#34;");

  // The unescaped character size is bigger than the escaped entity name.
  // Example: "&nGt;" = "\xe2\x89\xab\xe2\x83\x92"
  // 5 character vs. 6 bytes.
  std::string str1 = "&nGt;cdef";
  std::string str2 = "&gt;cdef";
  std::string str3 = "abc&nGt;cdef";
  std::string str4 = "&abc;def";
  std::string str5 = "&amp;num;";
  std::string str6 = "&amp;num";
  std::string str7 = "&num";
  std::string str8 = "&num;";
  htmlparser::Strings::UnescapeString(&str1);
  htmlparser::Strings::UnescapeString(&str2);
  htmlparser::Strings::UnescapeString(&str3);
  htmlparser::Strings::UnescapeString(&str4);
  htmlparser::Strings::UnescapeString(&str5);
  htmlparser::Strings::UnescapeString(&str6);
  htmlparser::Strings::UnescapeString(&str7);
  htmlparser::Strings::UnescapeString(&str8);
  EXPECT_EQ(str1, "≫⃒cdef");
  EXPECT_EQ(str2, ">cdef");
  EXPECT_EQ(str3, "abc≫⃒cdef");
  EXPECT_EQ(str4, "&abc;def");
  EXPECT_EQ(str5, "&num;");
  EXPECT_EQ(str6, "&num");
  EXPECT_EQ(str7, "&num");
  EXPECT_EQ(str8, "#");
}

TEST(StringsTest, EncodingTest) {
  EXPECT_EQ(htmlparser::Strings::EncodeUtf8Symbol(224).value(), "à");
  EXPECT_EQ(htmlparser::Strings::EncodeUtf8Symbol(202).value(), "Ê");
  EXPECT_EQ(htmlparser::Strings::EncodeUtf8Symbol(128512).value(), "😀");
  EXPECT_EQ(htmlparser::Strings::EncodeUtf8Symbol(19990).value(), "世");
  EXPECT_EQ(htmlparser::Strings::EncodeUtf8Symbol(134071).value(), "𠮷");
  EXPECT_EQ(htmlparser::Strings::EncodeUtf8Symbol(67).value(), "C");
  EXPECT_EQ(htmlparser::Strings::EncodeUtf8Symbol(10703).value(), "⧏");
}

TEST(StringsTest, TrimTest) {
  std::string s_with_space = "     amaltas.";
  htmlparser::Strings::TrimLeft(&s_with_space);
  EXPECT_EQ(s_with_space, "amaltas.");
  s_with_space = "amaltas.                    ";
  htmlparser::Strings::TrimRight(&s_with_space);
  EXPECT_EQ(s_with_space, "amaltas.");

  s_with_space = "                    amaltas.                  ";
  htmlparser::Strings::Trim(&s_with_space);
  EXPECT_EQ(s_with_space, "amaltas.");

  std::string s_with_utf = "안안안안안Amaltas";
  htmlparser::Strings::TrimLeft(&s_with_utf, "안");
  EXPECT_EQ(s_with_utf, "Amaltas");
  s_with_utf = "Amaltas 안안안안안";
  htmlparser::Strings::TrimRight(&s_with_utf, "안 ");
  EXPECT_EQ(s_with_utf, "Amaltas");

  std::string_view sv_with_space = "     amaltas.";
  htmlparser::Strings::TrimLeft(&sv_with_space);
  EXPECT_EQ(sv_with_space, "amaltas.");
  sv_with_space = "amaltas.                    ";
  htmlparser::Strings::TrimRight(&sv_with_space);
  EXPECT_EQ(sv_with_space, "amaltas.");

  sv_with_space = "      \n\n              amaltas.                  ";
  htmlparser::Strings::Trim(&sv_with_space);
  EXPECT_EQ(sv_with_space, "amaltas.");

  std::string_view sv_with_utf = "안안안안안Amaltas";
  htmlparser::Strings::TrimLeft(&sv_with_utf, "안");
  EXPECT_EQ(sv_with_utf, "Amaltas");
  sv_with_utf = "Amaltas 안안안안안";
  htmlparser::Strings::TrimRight(&sv_with_utf, "안 ");
  EXPECT_EQ(sv_with_utf, "Amaltas");
}

TEST(StringsTest, ReplaceTest) {
  std::string s_to_replace =
      "AMALTASsSŚŚSŚ AMALTASsSŚŚSŚ AMALTASsSŚŚSŚ AMALTASsSŚŚSŚ";
  htmlparser::Strings::Replace(&s_to_replace, "ŚŚSŚ", " ");
  EXPECT_EQ(s_to_replace,
         "AMALTASsS  AMALTASsSŚŚSŚ AMALTASsSŚŚSŚ AMALTASsSŚŚSŚ");
  htmlparser::Strings::ReplaceAll(&s_to_replace, "ŚŚSŚ", " ");
  EXPECT_EQ(s_to_replace, "AMALTASsS  AMALTASsS  AMALTASsS  AMALTASsS ");

  s_to_replace = "amaltas\0\0amaltas"s;
  htmlparser::Strings::ReplaceAll(&s_to_replace,
                                  htmlparser::Strings::kNullChar,
                                  "");
  EXPECT_EQ(s_to_replace, "amaltasamaltas");

  std::string null_to_ufffd = "\0"s;
  EXPECT_EQ(null_to_ufffd.size(), 1);
  htmlparser::Strings::ReplaceAll(&null_to_ufffd,
                                  htmlparser::Strings::kNullChar,
                                  "\xef\xbf\xbd"s);
  EXPECT_EQ(null_to_ufffd, "\xef\xbf\xbd"s);
  EXPECT_EQ(null_to_ufffd.size(), 3);
  // The null replacement character.
  EXPECT_EQ(null_to_ufffd, "�");   // NOLINT(readability/utf8)

  std::string whitespace_and_null =
      "amaltas is \0\0good \0boy"s;  // NOLINT(readability/utf8)
  htmlparser::Strings::ReplaceAny(&whitespace_and_null,
                                  htmlparser::Strings::kWhitespaceOrNull,
                                  "�");  // NOLINT(readability/utf8)
  EXPECT_EQ(whitespace_and_null,
            "amaltas�is���good��boy");  // NOLINT(readability/utf8)

  std::string whitespace_and_null2 = "amaltas is \0\0good \0boy"s;
  htmlparser::Strings::ReplaceAny(&whitespace_and_null2,
                                  htmlparser::Strings::kNullChar,
                                  htmlparser::Strings::kNullReplacementChar);
  EXPECT_EQ(whitespace_and_null2, "amaltas is ��good �boy");

  std::string many_whitespaces = "  a   m  a lta s  ";
  htmlparser::Strings::RemoveExtraSpaceChars(&many_whitespaces);
  EXPECT_EQ(many_whitespaces, " a m a lta s ");
}

TEST(StringsTest, TranslateTest) {
  // Simple translate, lowercase to uppercase.
  auto t1 = htmlparser::Strings::Translate(
      "amaltas",
      "abcdefghijklmnopqrstuvwxyz",
      "ABCDEFGHIJKLMNOPQRSTUVWXYZ");
  EXPECT_TRUE(t1.has_value());
  EXPECT_EQ(t1.value(), "AMALTAS");

  // Duplicate entries.
  auto t2 = htmlparser::Strings::Translate(
      "amaltas", "abcdabcd", "lmnopqrs");
  EXPECT_EQ(t2.value(), "lmlltls");

  // Translate involving new Utf chars.
  auto t3 = htmlparser::Strings::Translate(
      "amaltas",
      "alt",
      "서비스");
  EXPECT_TRUE(t3.has_value());
  EXPECT_EQ(t3.value(), "서m서비스서s");

  // Restore previous string.
  auto t4 = htmlparser::Strings::Translate(
      "서m서비스서s",
      "서비스",
      "alt");
  EXPECT_TRUE(t4.has_value());
  EXPECT_EQ(t4.value(), "amaltas");

  // Special chars can be translated too.
  auto t5 = htmlparser::Strings::Translate(
      "amal\ntas\t\t"s,
      "\t\n"s,
      " .");
  EXPECT_TRUE(t5.has_value());
  EXPECT_EQ(t5.value(), "amal.tas  ");

  // xyz smaller than abc.
  auto t6 = htmlparser::Strings::Translate(
      "amaltas",
      "amlts",
      "bnm");
  EXPECT_TRUE(t6.has_value());
  EXPECT_EQ(t6.value(), "bnbmb");

  // abc smaller than xyz.
  auto t7 = htmlparser::Strings::Translate(
      "amaltas",
      "amlts",
      "bnmutoksobigstring");
  EXPECT_TRUE(t7.has_value());
  EXPECT_EQ(t7.value(), "bnbmubt");

  // Create a string with invalid codepoints.
  // Everything after 68 is invalid codepoint.
  uint8_t characters[] {65, 66, 67, 68, 183, 188, 190, 191, 192, 193, 194};
  std::stringbuf buf;
  for (auto c : characters) {
    buf.sputc(c);
  }
  std::string will_not_decode = buf.str();
  EXPECT_EQ(will_not_decode.at(0), 'A');
  EXPECT_EQ(will_not_decode.at(1), 'B');
  EXPECT_EQ(will_not_decode.at(2), 'C');
  EXPECT_EQ(will_not_decode.at(3), 'D');
  // garbage after this.

  auto t8 = htmlparser::Strings::Translate(
      will_not_decode,
      "abcdefghij",
      "lmnopqrstu");

  // Translate failed.
  EXPECT_FALSE(t8.has_value());

  // Translate ignore characters if abc is longer than xyz.
  // In the following abc string ...wn is removed from translated string.
  auto t9 = htmlparser::Strings::Translate(
      "The quick brown fox.", "brown", "red");
  EXPECT_TRUE(t9.has_value());
  EXPECT_EQ(t9.value(), "The quick red fdx.");
}

TEST(Utf8UtilTest, SingleCodepointToString) {
  char32_t bolt = 0x26A1;
  std::string utf8_string;
  htmlparser::Strings::AppendCodepointToUtf8String(bolt, &utf8_string);
  EXPECT_EQ("⚡", utf8_string);
}

TEST(Utf8UtilTest, RoundTripsAndLengths) {
  std::vector<char32_t> ascii =
      htmlparser::Strings::Utf8ToCodepoints("Hello, world");
  EXPECT_EQ("Hello, world",
            htmlparser::Strings::CodepointsToUtf8String(ascii));

  std::string amped = "⚡ Got Amp?";
  EXPECT_EQ(12, amped.size());
  std::vector<char32_t> amped_codes =
      htmlparser::Strings::Utf8ToCodepoints(amped);
  EXPECT_EQ(10, amped_codes.size());
  EXPECT_EQ(amped,
            htmlparser::Strings::CodepointsToUtf8String(amped_codes));

  // Checks multi-byte sequences where one of the byte is 0x80.
  // 0x80 is a special value in multi bytes sequence. In a multi byte sequence
  // only the last 6 bits are computed. The first two bits are always 0b10.
  // So if any byte in sequence is null value, its encoded value is 0x80 that
  // is 010xxxxxx where all x are zero. So 0b10000000 = 128 = 0x80.
  // Following tests ensures util decodes 0x80 byte correctly and do not treat
  // the decoded 0th value as null byte.
  //
  // Second byte 0x80 in a two byte sequence.
  std::string two_bytes_seq_second_byte_zero = "Ā";   // \xc4\x80
  auto decoded_bytes = htmlparser::Strings::DecodeUtf8Symbol(
      two_bytes_seq_second_byte_zero);
  EXPECT_TRUE(decoded_bytes.has_value());
  // First byte 0xc4;
  // 0bxxxxxxxx000000000000000000000000
  EXPECT_EQ(0xc4, (*decoded_bytes >> 6) | 0xc0);
  // Second byte 0x80;
  EXPECT_EQ(0x80, (*decoded_bytes & 0x3f) | 0x80);
  // Encode the bytes again.
  EXPECT_EQ("Ā", htmlparser::Strings::EncodeUtf8Symbol(*decoded_bytes).value());

  // Second byte 0x80 in a three byte sequence.
  std::string three_bytes_seq_second_byte_zero = "›";
  decoded_bytes = htmlparser::Strings::DecodeUtf8Symbol(
      three_bytes_seq_second_byte_zero);
  EXPECT_TRUE(decoded_bytes.has_value());
  // First byte 0xe2;
  // 0bxxxxxxxx000000000000000000000000
  EXPECT_EQ(0xe2, (*decoded_bytes >> 12) | 0xe0);
  // Second byte 0x80;
  // 0b00000000xxxxxxxx0000000000000000
  EXPECT_EQ(0x80, ((*decoded_bytes >> 6) & 0x3f) | 0x80);
  // Third byte 0xba;
  // 0b0000000000000000xxxxxxxx00000000
  EXPECT_EQ(0xba, (*decoded_bytes & 0x3f) | 0x80);
  // Fourth byte is zero for three bytes sequence.
  // 0b000000000000000000000000xxxxxxxx
  EXPECT_EQ(0x00, *decoded_bytes & 0xffff0000);
  // Encode the bytes again.
  EXPECT_EQ("›", htmlparser::Strings::EncodeUtf8Symbol(*decoded_bytes).value());

  // Third byte 0x80 in a four byte sequence.
  std::string four_bytes_seq_third_byte_zero = "𒀢";  // \xf0\x92\x80\xa2
  decoded_bytes = htmlparser::Strings::DecodeUtf8Symbol(
      four_bytes_seq_third_byte_zero);
  EXPECT_TRUE(decoded_bytes.has_value());
  // First byte 0xf0;
  // 0bxxxxxxxx000000000000000000000000
  EXPECT_EQ(0xf0, (*decoded_bytes >> 18) | 0xf0);
  // Second byte 0x92;
  // 0b00000000xxxxxxxx0000000000000000
  EXPECT_EQ(0x92, ((*decoded_bytes >> 12) & 0x3f) | 0x80);
  // Third byte 0xba;
  // 0b0000000000000000xxxxxxxx00000000
  EXPECT_EQ(0x80, ((*decoded_bytes >> 6) & 0x3f) | 0x80);
  // Fourth byte 0xa2;
  // 0b000000000000000000000000xxxxxxxx
  EXPECT_EQ(0xa2, (*decoded_bytes & 0x3f) | 0x80);
  // Encode the bytes again.
  EXPECT_EQ("𒀢", htmlparser::Strings::EncodeUtf8Symbol(*decoded_bytes).value());

  // Last two decoded bytes are 0x80.
  std::string four_bytes_seqlast_two_zero = "𒀀";  // \xf0\x92\x80\x80
  decoded_bytes = htmlparser::Strings::DecodeUtf8Symbol(
      four_bytes_seqlast_two_zero);
  EXPECT_TRUE(decoded_bytes.has_value());
  // First byte 0xf0;
  // 0bxxxxxxxx000000000000000000000000
  EXPECT_EQ(0xf0, (*decoded_bytes >> 18) | 0xf0);
  // Second byte 0x92;
  // 0b00000000xxxxxxxx0000000000000000
  EXPECT_EQ(0x92, ((*decoded_bytes >> 12) & 0x3f) | 0x80);
  // Third byte 0xba;
  // 0b0000000000000000xxxxxxxx00000000
  EXPECT_EQ(0x80, ((*decoded_bytes >> 6) & 0x3f) | 0x80);
  // Fourth byte 0x80;
  // 0b000000000000000000000000xxxxxxxx
  EXPECT_EQ(0x80, (*decoded_bytes & 0x3f) | 0x80);
  // Encode the bytes again.
  EXPECT_EQ("𒀀", htmlparser::Strings::EncodeUtf8Symbol(*decoded_bytes).value());

  // Last byte is 0x80.
  std::string four_bytes_seq_last_zero = "𒁀";  // \xf0\x92\x81\x80
  decoded_bytes = htmlparser::Strings::DecodeUtf8Symbol(
      four_bytes_seq_last_zero);
  EXPECT_TRUE(decoded_bytes.has_value());
  // First byte 0xf0;
  // 0bxxxxxxxx000000000000000000000000
  EXPECT_EQ(0xf0, (*decoded_bytes >> 18) | 0xf0);
  // Second byte 0x92;
  // 0b00000000xxxxxxxx0000000000000000
  EXPECT_EQ(0x92, ((*decoded_bytes >> 12) & 0x3f) | 0x80);
  // Third byte 0x81;
  // 0b0000000000000000xxxxxxxx00000000
  EXPECT_EQ(0x81, ((*decoded_bytes >> 6) & 0x3f) | 0x80);
  // Fourth byte 0x80;
  // 0b000000000000000000000000xxxxxxxx
  EXPECT_EQ(0x80, (*decoded_bytes & 0x3f) | 0x80);
  // Encode the bytes again.
  EXPECT_EQ("𒁀", htmlparser::Strings::EncodeUtf8Symbol(*decoded_bytes).value());
}

TEST(StringsTest, DecodePercentEncodedURLTest) {
  EXPECT_EQ(htmlparser::Strings::DecodePercentEncodedURL(
      "google.com%20%2F%20%3Fx%3Db").value(), "google.com / ?x=b");

  EXPECT_EQ(htmlparser::Strings::DecodePercentEncodedURL(
      "JavaScript_%d1%88%d0%B5%D0%BB%D0%BB%D1%8B%3a").value(),
            "JavaScript_шеллы:");

  // ASCII chars may also be encoded.
  EXPECT_EQ(htmlparser::Strings::DecodePercentEncodedURL(
      "%77%77w%2e%67o%6f%67%6c%65%2e%63%6f%6d%2f%3f%61%3d%62%3a%63"),
            "www.google.com/?a=b:c");

  // Percent character.
  EXPECT_EQ(htmlparser::Strings::DecodePercentEncodedURL("90%25").value(),
            "90%");

  // Invalid encoding missing sequence byte (%88 after %d1).
  EXPECT_FALSE(htmlparser::Strings::DecodePercentEncodedURL(
      "JavaScript_%d1M%d0%B5%D0%BB%D0%BB%D1%8B%3a").has_value());

  // Invalid encoding, sequence byte without initial byte.
  // (%88 without %d1).
  EXPECT_FALSE(htmlparser::Strings::DecodePercentEncodedURL(
      "JavaScript_%88%d0%B5%D0%BB%D0%BB%D1%8B%3a").has_value());

  // URI ends without completing the entire sequence. Checks code doesn't access
  // uri.front() while it is empty.
  EXPECT_FALSE(htmlparser::Strings::DecodePercentEncodedURL(
      "JavaScript_%d1M%d0%B5%D0%BB%D0%BB%D1").has_value());

  // Empty string.
  EXPECT_EQ(htmlparser::Strings::DecodePercentEncodedURL("").value(), "");

  // Any one byte char must be < 128.
  // 0xff (255) char.
  EXPECT_FALSE(htmlparser::Strings::DecodePercentEncodedURL(
      "example-%FF.com").has_value());
  // char code 128.
  EXPECT_FALSE(htmlparser::Strings::DecodePercentEncodedURL(
      "example-%80.com").has_value());
}

TEST(StringsTest, CountTermsTest) {
  EXPECT_EQ(2, htmlparser::Strings::CountTerms("hello world"));
  EXPECT_EQ(2, htmlparser::Strings::CountTerms("hello world\n"));
  EXPECT_EQ(2, htmlparser::Strings::CountTerms("   hello world\n"));
  EXPECT_EQ(2, htmlparser::Strings::CountTerms("\r\nhello world\n"));
  EXPECT_EQ(0, htmlparser::Strings::CountTerms("        \n         "));
  EXPECT_EQ(4, htmlparser::Strings::CountTerms(
      "  hello world \nbye\r\n bye"));
  EXPECT_EQ(10, htmlparser::Strings::CountTerms(
      "Accept: application/signed-exchange;v=b3\nAMP-Cache-Transform: "
      "google\n"));
}

