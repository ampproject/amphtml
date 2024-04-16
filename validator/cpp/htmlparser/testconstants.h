#ifndef CPP_HTMLPARSER_TESTCONSTANTS_H_
#define CPP_HTMLPARSER_TESTCONSTANTS_H_

#include <array>
#include <string_view>

namespace htmlparser {

namespace testing {

inline constexpr std::array<std::string_view, 2> kTestDataDirs{
    "testdata/tree-construction/*.dat",
    "cpp/htmlparser/testdata/go/*.dat",
};

}  // namespace testing
}  // namespace htmlparser

#endif  // CPP_HTMLPARSER_TESTCONSTANTS_H_
