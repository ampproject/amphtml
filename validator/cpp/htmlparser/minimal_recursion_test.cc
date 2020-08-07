#include <fstream>

#include "gtest/gtest.h"
#include "defer.h"
#include "fileutil.h"
#include "parser.h"
#include "thread/fiber/bundle.h"
#include "thread/fiber/fiber.h"

#define EXPECT_NOT_NULL(p) EXPECT_TRUE((p) != nullptr)

DECLARE_int32(fibers_default_thread_stack_size);

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
  // Very small fiber stack size.
  absl::SetFlag(&FLAGS_fibers_default_thread_stack_size, 32 << 10 /* 32k */);

  std::ifstream fd(
      FLAGS_test_srcdir +
      "testdata/largehtmldoc.html");
  defer(fd.close());
  EXPECT_TRUE(fd.good());
  std::string html = ReadFileContent(&fd);

  thread::Bundle bundle;
  for (int i = 0; i < 1000; ++i) {
    bundle.Add([html]() {
      Parser parser(html);
      auto doc = parser.Parse();
      EXPECT_NOT_NULL(doc);
    });
  }
  bundle.JoinAll();
}

}  // namespace htmlparser
