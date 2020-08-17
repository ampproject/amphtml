#include <fstream>

#include "gtest/gtest.h"
#include "absl/flags/declare.h"
#include "absl/flags/flag.h"
#include "defer.h"
#include "fileutil.h"
#include "parser.h"
#include "thread/fiber/bundle.h"
#include "thread/fiber/fiber.h"

#define EXPECT_NOT_NULL(p) EXPECT_TRUE((p) != nullptr)

DECLARE_int32(fibers_default_thread_stack_size);

ABSL_DECLARE_FLAG(uint32_t, htmlparser_max_nodes_depth_count);

namespace htmlparser {

std::string ReadFileContent(std::ifstream* fd) {
  std::string str;
  fd->seekg(0, std::ios::end);
  str.reserve(fd->tellg());
  fd->seekg(0, std::ios::beg);
  str.assign((std::istreambuf_iterator<char>(*fd)),
            std::istreambuf_iterator<char>());
  return str;
}

TEST(MinimalRecursionTest, TestComplexDocument) {
  // For the purposes of this test with hundreds of deeply nested nodes increase
  // the htmlparser_max_nodes_depth_count value.
  ::absl::SetFlag(&FLAGS_htmlparser_max_nodes_depth_count, 500);

  std::ifstream fd(
      FLAGS_test_srcdir +
      "testdata/largehtmldoc.html");
  defer(fd.close());
  EXPECT_TRUE(fd.good());
  std::string html = ReadFileContent(&fd);
  EXPECT_GT(html.size(), 10000);

  thread::Bundle bundle;
  for (int i = 0; i < 1000; ++i) {
    bundle.Add([html]() {
      Parser parser(html);
      auto doc = parser.Parse();
      EXPECT_NOT_NULL(doc);
      EXPECT_NOT_NULL(doc->RootNode());
    });
  }
  bundle.JoinAll();
}

}  // namespace htmlparser
