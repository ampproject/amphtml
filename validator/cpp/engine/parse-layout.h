#ifndef CPP_ENGINE_PARSE_LAYOUT_H_
#define CPP_ENGINE_PARSE_LAYOUT_H_

#include <string>

#include "absl/strings/string_view.h"
#include "validator.pb.h"
#include "re2/re2.h"

namespace amp::validator::parse_layout {

// Parses a width or height layout attribute, for the determining the layout
// of AMP tags (e.g. <amp-img width="42px" ...) following the CSS length
// standard found at https://developer.mozilla.org/en-US/docs/Web/CSS/length.
// TODO: Consider using parse-css.cc for parsing some of this.
struct CssLength {
  // Whether the value or unit is invalid. Note that passing
  // nullptr as |input| is considered valid.
  bool is_valid;
  // Whether the attribute value is set.
  bool is_set;
  // Whether the attribute value is 'auto'. This is a special value that
  // indicates that the value gets derived from the context. In practice
  // that's only ever the case for a width.
  bool is_auto;
  // Whether the attribute value is 'fluid'.
  bool is_fluid;
  // The numeric value.
  double numeral;
  // The unit. Note that if the unit is absent, it's assumed to be 'px'.
  absl::string_view unit;

  // Creates a default, invalid CssLength.
  explicit CssLength();
  // Parses a given |input| value. |allow_auto| determines whether 'auto'
  // is accepted as a value. |allow_fluid| determines whether 'fluid' is
  // accepted as a value.
  explicit CssLength(
      re2::StringPiece input,
      bool allow_auto, bool allow_fluid);
};

// Interprets a |layout| string, such as fixed-height, as
// AmpLayout::Layout. Returns AmpLayout::UNKNOWN if the provided
// StringPiece is nullptr or if the layout can't be determined.
amp::validator::AmpLayout::Layout ParseLayout(absl::string_view layout);

// Fully interprets an AMP element's layout as AmpLayout::Layout.
// If the layout is not explicitly stated via the layout attribute, then the
// layout will be interpreted from the implicit rules. Returns
// AmpLayout::UNKNOWN if the layout can't be determined.
// The width and height output parameters will be set to the calculated sizes.
amp::validator::AmpLayout::Layout ParseAndCalculateLayout(
    absl::string_view layout, absl::string_view width, absl::string_view height,
    absl::string_view tagname, bool has_sizes, bool has_heights,
    CssLength* effective_width, CssLength* effective_height);

// Calculates the effective width from the input layout and width.
// This involves considering that some elements, such as amp-audio and
// amp-pixel, have natural dimensions (browser or implementation-specific
// defaults for width / height).
CssLength CalculateWidth(amp::validator::AmpLayout::Layout input_layout,
                         const CssLength& input_width,
                         absl::string_view tagname);
CssLength CalculateWidth(const amp::validator::AmpLayout& spec,
                         amp::validator::AmpLayout::Layout input_layout,
                         const CssLength& input_width);

// Calculates the effective height from input layout and input height.
CssLength CalculateHeight(amp::validator::AmpLayout::Layout input_layout,
                          const CssLength& input_height,
                          absl::string_view tagname);
CssLength CalculateHeight(const amp::validator::AmpLayout& spec,
                          amp::validator::AmpLayout::Layout input_layout,
                          const CssLength& input_height);

// Calculates the layout; this depends on the width / height
// calculation above. It happens last because web designers often make
// fixed-sized mocks first and then the layout determines how things
// will change for different viewports / devices / etc.
amp::validator::AmpLayout::Layout CalculateLayout(
    amp::validator::AmpLayout::Layout input_layout, const CssLength& width,
    const CssLength& height, bool has_sizes, bool has_heights);

// Returns the CSS style for this CssLength prefixed with type which most likely
// will be either height or width.
std::string GetCssLengthStyle(const CssLength& length, const std::string& type);

// Returns the CSS class name for the given AmpLayout. Equivalent to
// https://github.com/ampproject/amphtml/blob/main/src/layout.js.
std::string GetLayoutClass(amp::validator::AmpLayout::Layout layout);

// Returns the name for the given AmpLayout.
std::string GetLayoutName(amp::validator::AmpLayout::Layout layout);

// Returns the CSS style for the given AmpLayout, width and height.
std::string GetLayoutStyle(amp::validator::AmpLayout::Layout layout,
                           const CssLength& width, const CssLength& height);

// Returns the CSS style for an <i-amphtml-sizer> based on the given AmpLayout,
// width and height.
std::string GetSizerStyle(amp::validator::AmpLayout::Layout layout,
                          const CssLength& width, const CssLength& height);

// Returns whether the given AmpLayout has size defined. Equivalent to
// https://github.com/ampproject/amphtml/blob/main/src/layout.js.
bool IsLayoutSizeDefined(amp::validator::AmpLayout::Layout layout);

// Returns whether the given AmpLayout waits on a runtime size.
bool IsLayoutAwaitingSize(amp::validator::AmpLayout::Layout layout);

// Returns the CSS class name for AmpLayouts with defined sizes.
std::string GetLayoutSizeDefinedClass();

// Returns the CSS class name for AmpLayouts which wait on a runtime size.
std::string GetLayoutAwaitingSizeClass();

}  // namespace amp::validator::parse_layout

#endif  // CPP_ENGINE_PARSE_LAYOUT_H_
