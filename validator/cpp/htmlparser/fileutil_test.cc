#include "cpp/htmlparser/fileutil.h"

#include <vector>

#include "gtest/gtest.h"

namespace htmlparser {

struct TestCaseDataType {
  std::string url;
  std::string html;

  void Clear() {
    url = "";
    html = "";
  }
};

}  // namespace htmlparser

TEST(FileUtilTest, ReadAllLines) {
  std::vector<std::string> lines;
  std::stringstream content;
  content.str(R"HTML(<html>
<head><body>
Hello world!
</body>
</html>)HTML");
  EXPECT_TRUE(htmlparser::FileUtil::ReadFileLines(htmlparser::FileReadOptions(),
                                                  content,
                                                  &lines));
  EXPECT_EQ(lines.size(), 5);
  EXPECT_EQ(lines.at(0), "<html>");
  EXPECT_EQ(lines.at(4), "</html>");
}

TEST(FileUtil, ReadLinesCallback) {
  int i = 1;
  std::stringstream content;
  content.str(R"HTML(<html>
<head><body>
Hello world!
</body>
</html>)HTML");
  EXPECT_TRUE(htmlparser::FileUtil::ReadFileLines(
      htmlparser::FileReadOptions(),
      content,
      [&](std::string_view line, int line_no) {
        switch (i++) {
          case 1:
            EXPECT_EQ(line, "<html>");
            break;
          case 2:
            EXPECT_EQ(line, "<head><body>");
            break;
          case 3:
            EXPECT_EQ(line, "Hello world!");
            break;
          case 4:
            EXPECT_EQ(line, "</body>");
            break;
          case 5:
            EXPECT_EQ(line, "</html>");
            break;
        }
      }));
}

TEST(FileUtil, ReadFileDataCases) {
  std::stringstream content;
  content.str(R"HTML(http://foo.com/foo.html
<html>
<head><body>
Hello world!
</body>
</html>
<!-- TEST CASE -->
http://bar.com/bar.html
<html>
<head><body><div>
Bar world! <!--TEST CASE -->
<!-- TEST CASE --></body>
</html>)HTML");

  int i = 0;
  std::string_view marker = "<!-- TEST CASE -->";
  std::stringbuf buf;
  htmlparser::TestCaseDataType data;
  std::vector<htmlparser::TestCaseDataType> testcases;
  EXPECT_TRUE(
      htmlparser::FileUtil::ReadFileLines(
          htmlparser::FileReadOptions(),
          content,
          [&](std::string_view line, int line_no) {
            if (i++ == 0) {
              data.Clear();
              data.url = line;
              return;
            }
            buf.sputn(line.data(), line.size());
            if (line.compare(marker) == 0) {
              data.html = buf.str();
              testcases.push_back(data);
              buf.str("");
              i = 0;
            }
          }));
  data.html = buf.str();
  testcases.push_back(data);
  EXPECT_EQ(testcases.size(), 2);
}

TEST(FileUtil, ReadFileDataAtMarker) {
  std::stringstream content;
  content.str(R"HTML(http://foo.com/foo.html
<html>
<head><body>
Hello world!
</body>
</html>
<!-- TEST CASE -->
http://bar.com/bar.html
<html>
<head><body><div>
Bar world! <!--TEST CASE -->
<!-- TEST CASE --></body>
</html>)HTML");

  std::string_view marker = "<!-- TEST CASE -->";
  std::vector<htmlparser::TestCaseDataType> testcases;
  EXPECT_TRUE(
      htmlparser::FileUtil::ReadFileDataAtMarker<htmlparser::TestCaseDataType>(
          htmlparser::FileReadOptions(),
          content,
          marker,
          [&](htmlparser::TestCaseDataType data) {
             testcases.push_back(data);
          },
          [&](std::string_view unparsed_data) -> htmlparser::TestCaseDataType {
            htmlparser::TestCaseDataType data;
            std::size_t nl = unparsed_data.find_first_of('\n');
            data.url = std::string(unparsed_data.substr(0, nl));
            unparsed_data.remove_prefix(nl);
            data.html = std::string(unparsed_data.data());
            return data;
          }));
  EXPECT_EQ(testcases.size(), 2);
  EXPECT_EQ(testcases[1].url, "http://bar.com/bar.html");
  EXPECT_EQ(testcases[1].html, R"HTML(
<html>
<head><body><div>
Bar world! <!--TEST CASE -->
<!-- TEST CASE --></body>
</html>
)HTML");
  EXPECT_EQ(testcases[0].url, "http://foo.com/foo.html");
  EXPECT_EQ(testcases[0].html, R"HTML(
<html>
<head><body>
Hello world!
</body>
</html>
)HTML");
}

TEST(FileUtil, RowLookupOneLineKey) {
  std::string content = R"CONTENT(~~~~~ Record ~~~~~
Amanda: Works in marketing department.
Birthday: 03/03/90
Date Joined: 01/01/10
~~~~~ Record ~~~~~
Amit: Works in engineering department.
Birthday: 02/02/90
Date Joined: 01/01/12
Hobbies: Dance
~~~~~ Record ~~~~~
Mike: Chef.
Birthday: 05/05/80
Date Joined: 01/01/11
Notes: Is a TVC
~~~~~ Record ~~~~~
Sam: is on vacations.
Birthday: 01/01/90
Date Joined: 01/01/08
~~~~~ Record ~~~~~
Zahra: was born in leap year.
Birthday: 01/01/90
Date Joined: 01/01/08)CONTENT";

  std::string_view marker = "~~~~~ Record ~~~~~";

  // First key.
  std::stringstream fd1;
  fd1.str(content);
  auto first_row = htmlparser::FileUtil::RowLookup<1>(
      fd1,
      marker,
      [](std::string_view key) -> int {
        std::string_view key_part =
            key.substr(0, key.find_first_of(':'));
        return key_part.compare("Amanda");
      });
  EXPECT_TRUE(first_row.has_value());
  EXPECT_EQ(first_row.value(),
            R"VALUE(Amanda: Works in marketing department.
Birthday: 03/03/90
Date Joined: 01/01/10)VALUE");

  // Last  key.
  std::stringstream fd2;
  fd2.str(content);
  auto last_row = htmlparser::FileUtil::RowLookup<1>(
      fd2,
      marker,
      [](std::string_view key) -> int {
        std::string_view key_part =
            key.substr(0, key.find_first_of(':'));
        return key_part.compare("Zahra");
      });
  EXPECT_TRUE(last_row.has_value());
  EXPECT_EQ(last_row.value(),
            R"VALUE(Zahra: was born in leap year.
Birthday: 01/01/90
Date Joined: 01/01/08)VALUE");

  // Random key. upper bound.
  std::stringstream fd3;
  fd3.str(content);
  auto random_row = htmlparser::FileUtil::RowLookup<1>(
      fd3,
      marker,
      [](std::string_view key) -> int {
        std::string_view key_part =
            key.substr(0, key.find_first_of(':'));
        return key_part.compare("Amit");
      });
  EXPECT_TRUE(random_row.has_value());
  EXPECT_EQ(random_row.value(),
            R"VALUE(Amit: Works in engineering department.
Birthday: 02/02/90
Date Joined: 01/01/12
Hobbies: Dance)VALUE");

  // Random key. lower bound.
  std::stringstream fd4;
  fd4.str(content);
  auto random_row2 = htmlparser::FileUtil::RowLookup<1>(
          fd4,
          marker,
          [](std::string_view key) -> int {
            std::string_view key_part =
                key.substr(0, key.find_first_of(':'));
            return key_part.compare("Sam");
          });
  EXPECT_TRUE(random_row2.has_value());
  EXPECT_EQ(random_row2.value(),
            R"VALUE(Sam: is on vacations.
Birthday: 01/01/90
Date Joined: 01/01/08)VALUE");
}

TEST(FileUtil, RowLookupTwoLineKey) {
  std::string content = R"CONTENT(;;
Houston
Texas
Weather: 60 F, Population: 600000
;;
London
England
Weather: 35 F, Population: 800000
;;
Mountain View
California
Weather: 40 F, Population: 100000
;;
Mumbai
India
Weather: 100 F, Population: 100000000
;;
San Francisco
California
Weather: 30 F, Population: 500000
;;
Tokyo
Japan
Weather: 60 F, Population: 6500000)CONTENT";

  std::string_view marker = ";;";

  // First key.
  std::stringstream fd1;
  fd1.str(content);
  auto first_row = htmlparser::FileUtil::RowLookup<2>(
      fd1,
      marker,
      [](std::string_view key) -> int {
        return key.compare("Houston\nTexas");
      });
  EXPECT_TRUE(first_row.has_value());
  EXPECT_EQ(first_row.value(),
            R"VALUE(Houston
Texas
Weather: 60 F, Population: 600000)VALUE");

  std::stringstream fd2;
  fd2.str(content);
  auto last_row = htmlparser::FileUtil::RowLookup<2>(
      fd2,
      marker,
      [](std::string_view key) -> int {
        return key.compare("Tokyo\nJapan");
      });
  EXPECT_TRUE(last_row.has_value());
  EXPECT_EQ(last_row.value(),
            R"VALUE(Tokyo
Japan
Weather: 60 F, Population: 6500000)VALUE");

  std::stringstream fd3;
  fd3.str(content);
  auto upper = htmlparser::FileUtil::RowLookup<2>(
      fd3,
      marker,
      [](std::string_view key) -> int {
        return key.compare("London\nEngland");
      });
  EXPECT_TRUE(upper.has_value());
  EXPECT_EQ(upper.value(),
            R"VALUE(London
England
Weather: 35 F, Population: 800000)VALUE");
}
