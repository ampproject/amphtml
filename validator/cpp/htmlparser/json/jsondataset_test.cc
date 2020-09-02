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

#include <fstream>
#include <vector>
#include <sstream>
#include <string_view>

#include "gtest/gtest.h"
#include "defer.h"
#include "fileutil.h"
#include "json/parser.h"

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
  ParseAndValidateFile("json/testdata/1.json");
}

TEST(JSONParserTest, File2) {
  ParseAndValidateFile("json/testdata/2.json");
}

TEST(JSONParserTest, File3) {
  ParseAndValidateFile("json/testdata/3.json");
}

TEST(JSONParserTest, File4) {
  ParseAndValidateFile("json/testdata/4.json");
}

TEST(JSONParserTest, File5) {
  ParseAndValidateFile("json/testdata/5.json");
}

TEST(JSONParserTest, File6) {
  ParseAndValidateFile("json/testdata/6.json");
}

TEST(JSONParserTest, File7) {
  ParseAndValidateFile("json/testdata/7.json");
}

TEST(JSONParserTest, File8) {
  ParseAndValidateFile("json/testdata/8.json");
}

TEST(JSONParserTest, File9) {
  ParseAndValidateFile("json/testdata/9.json");
}

TEST(JSONParserTest, File10) {
  ParseAndValidateFile("json/testdata/10.json");
}
