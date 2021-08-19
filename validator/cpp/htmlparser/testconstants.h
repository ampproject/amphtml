#ifndef HTMLPARSER__TESTCONSTANTS_H_
#define HTMLPARSER__TESTCONSTANTS_H_

#include <array>
#include <string_view>

namespace htmlparser {

namespace testing {

inline constexpr std::array<std::string_view, 2> kTestDataDirs{
    "testdata/tree-construction/*.dat",
    "testdata/go/*.dat",
};

}  // namespace testing
}  // namespace htmlparser

#endif  // HTMLPARSER__TESTCONSTANTS_H_
