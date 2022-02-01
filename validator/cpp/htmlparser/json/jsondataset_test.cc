#include <fstream>
#include <vector>
#include <sstream>
#include <string_view>

#include "gtest/gtest.h"
#include "cpp/htmlparser/defer.h"
#include "cpp/htmlparser/fileutil.h"
#include "cpp/htmlparser/json/parser.h"

void ParseAndValidateFile(std::string file_path) {
  std::ifstream fd(file_path);
  EXPECT_TRUE(fd.good());
  htmlparser::defer(fd.close());

  std::stringbuf buf;
  htmlparser::FileUtil::ReadFileLines(htmlparser::FileReadOptions{
    .ignore_comments = false},
    fd,
    [&](std::string_view line, int line_no) {
      buf.sputc('\n');
      buf.sputn(line.data(), line.size());
    });
  std::string json = buf.str();
  auto v = htmlparser::json::JSONParser::Validate(json);
  EXPECT_TRUE(v.first);
}

TEST(JSONParserTest, File1) {
  ParseAndValidateFile("cpp/htmlparser/json/testdata/1.json");
}

TEST(JSONParserTest, File2) {
  ParseAndValidateFile("cpp/htmlparser/json/testdata/2.json");
}

TEST(JSONParserTest, File3) {
  ParseAndValidateFile("cpp/htmlparser/json/testdata/3.json");
}

TEST(JSONParserTest, File4) {
  ParseAndValidateFile("cpp/htmlparser/json/testdata/4.json");
}

TEST(JSONParserTest, File5) {
  ParseAndValidateFile("cpp/htmlparser/json/testdata/5.json");
}

TEST(JSONParserTest, File6) {
  ParseAndValidateFile("cpp/htmlparser/json/testdata/6.json");
}

TEST(JSONParserTest, File7) {
  ParseAndValidateFile("cpp/htmlparser/json/testdata/7.json");
}

TEST(JSONParserTest, File8) {
  ParseAndValidateFile("cpp/htmlparser/json/testdata/8.json");
}

TEST(JSONParserTest, File9) {
  ParseAndValidateFile("cpp/htmlparser/json/testdata/9.json");
}

TEST(JSONParserTest, File10) {
  ParseAndValidateFile("cpp/htmlparser/json/testdata/10.json");
}
