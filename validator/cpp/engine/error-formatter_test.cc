// AMP Validator client library to validate if given html is a valid AMP
// document.

#include "cpp/engine/error-formatter.h"

#include "gtest/gtest.h"

namespace amp {
namespace validator {
namespace {
TEST(ApplyFormat, YieldsFormattedMessages) {
  ValidationError error;
  EXPECT_EQ("%", ErrorFormatter::ApplyFormat("%", error));
  EXPECT_EQ("%", ErrorFormatter::ApplyFormat("%%", error));
  EXPECT_EQ("%%", ErrorFormatter::ApplyFormat("%%%", error));
  EXPECT_EQ("%%", ErrorFormatter::ApplyFormat("%%%%", error));
  error.add_params("b");
  error.add_params("d");
  EXPECT_EQ("a b c d e", ErrorFormatter::ApplyFormat("a %1 c %2 e", error));
  error.add_params("g");
  EXPECT_EQ("a ⚡ (invalid param)%0 c g e (invalid param)%f %⚡",
            ErrorFormatter::ApplyFormat("a ⚡ %0 c %3 e %f %⚡", error));
  error.clear_params();
  error.add_params("one");
  error.add_params("two");
  EXPECT_EQ("a %1 b %one c two",
            ErrorFormatter::ApplyFormat("a %%1 b %%%1 c %2", error));
  error.clear_params();
  error.add_params("world");
  EXPECT_EQ("Hello, world.", ErrorFormatter::ApplyFormat("Hello, %1.", error));
}

TEST(ApplyFormat, CollapsewhitespaceInParams) {
  ValidationError error;
  error.add_params("b\r\n  \tc  d");
  error.add_params(" f g");
  EXPECT_EQ("a b c d e  f g h",
            ErrorFormatter::ApplyFormat("a %1 e %2 h", error));
}

TEST(FormattedMessageFor, FormatsValidationErrors) {
  // Empty validation error.
  ValidationError error;
  EXPECT_EQ("Unknown error.", ErrorFormatter::FormattedMessageFor(error));
  // Error code set but params empty. In that case, the '%1' is rendered
  // just as it appeared in the format string. It's not amazing but not
  // sure what else we could do.
  error.set_code(ValidationError::DISALLOWED_TAG);
  EXPECT_EQ("The tag '(invalid param)%1' is disallowed.",
            ErrorFormatter::FormattedMessageFor(error));
  // Single param set.
  error.add_params("img");
  EXPECT_EQ("The tag 'img' is disallowed.",
            ErrorFormatter::FormattedMessageFor(error));
  error.Clear();
  error.set_code(ValidationError::INVALID_PROPERTY_VALUE_IN_ATTR_VALUE);
  error.add_params("foo");
  error.add_params("bar");
  error.add_params("baz");
  error.add_params("boo");
  EXPECT_EQ(
      "The property 'foo' in attribute 'bar' in tag 'baz' is set to "
      "'boo', which is invalid.",
      ErrorFormatter::FormattedMessageFor(error));
}
}  // namespace
}  // namespace validator
}  // namespace amp
