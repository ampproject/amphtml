#include "cpp/engine/parse-layout.h"

#include <string>
#include <unordered_map>

#include "absl/strings/ascii.h"
#include "absl/strings/match.h"
#include "absl/strings/str_cat.h"
#include "absl/strings/str_format.h"
#include "absl/strings/str_replace.h"
#include "absl/strings/string_view.h"
#include "google/protobuf/descriptor.pb.h"  // For GetEnumDescriptor
#include "validator.pb.h"
#include "re2/re2.h"  // NOLINT(build/deprecated)

using absl::AsciiStrToLower;
using absl::StrCat;
using absl::StrReplaceAll;
using absl::StrFormat;
using absl::string_view;
using amp::validator::AmpLayout;
using std::unordered_map;

namespace protocolbuffer = google::protobuf;

namespace amp::validator::parse_layout {
const char kUnitPx[] = "px";
const char kUnitEm[] = "em";
const char kUnitRem[] = "rem";
const char kUnitVh[] = "vh";
const char kUnitVw[] = "vw";
const char kUnitVmin[] = "vmin";
const char kUnitVmax[] = "vmax";
static const auto* kAuto =
    new CssLength("auto", /*allow_auto=*/true, /*allow_fluid=*/false);
static const auto* kFortyFourPx =
    new CssLength("44", /*allow_auto=*/false, /*allow_fluid=*/false);
static const auto* kOnePx =
    new CssLength("1", /*allow_auto=*/false, /*allow_fluid=*/false);
static const auto* kSixtyPx =
    new CssLength("60", /*allow_auto=*/false, /*allow_fluid=*/false);

CssLength::CssLength()
    : is_valid(false),
      is_set(false),
      is_auto(false),
      is_fluid(false),
      numeral(std::numeric_limits<double>::quiet_NaN()),
      unit(kUnitPx) {}
CssLength::CssLength(
    re2::StringPiece input,
    bool allow_auto, bool allow_fluid)
    : is_valid(false),
      is_set(false),
      is_auto(false),
      is_fluid(false),
      numeral(std::numeric_limits<double>::quiet_NaN()),
      unit(kUnitPx) {
  static const RE2* kLeadingNumber = new RE2("(\\d+(?:\\.\\d+)?)");

  if (input.data() == nullptr) {
    is_valid = true;
    return;
  }
  is_set = true;
  if (input == "auto") {
    is_auto = true;
    is_valid = allow_auto;
    return;
  } else if (input == "fluid") {
    is_fluid = true;
    is_valid = allow_fluid;
    return;
  }
  if (!RE2::Consume(&input, *kLeadingNumber, &numeral)) return;
  if (input.empty()) {  // empty means the default, that is "px".
    is_valid = true;
  } else if (input == "px") {  // "px" is default, so no need to assign.
    is_valid = true;
  } else if (input == "em") {
    unit = kUnitEm;
    is_valid = true;
  } else if (input == "rem") {
    unit = kUnitRem;
    is_valid = true;
  } else if (input == "vh") {
    unit = kUnitVh;
    is_valid = true;
  } else if (input == "vw") {
    unit = kUnitVw;
    is_valid = true;
  } else if (input == "vmin") {
    unit = kUnitVmin;
    is_valid = true;
  } else if (input == "vmax") {
    unit = kUnitVmax;
    is_valid = true;
  }
}

AmpLayout::Layout ParseLayout(string_view layout) {
  static unordered_map<std::string, AmpLayout::Layout> layouts_by_attr_val({
      {"container", AmpLayout::CONTAINER},
      {"fill", AmpLayout::FILL},
      {"fixed", AmpLayout::FIXED},
      {"fixed-height", AmpLayout::FIXED_HEIGHT},
      {"flex-item", AmpLayout::FLEX_ITEM},
      {"fluid", AmpLayout::FLUID},
      {"intrinsic", AmpLayout::INTRINSIC},
      {"nodisplay", AmpLayout::NODISPLAY},
      {"responsive", AmpLayout::RESPONSIVE},
      {"unknown", AmpLayout::UNKNOWN},
  });
  if (layout.empty()) return AmpLayout::UNKNOWN;
  auto it = layouts_by_attr_val.find(std::string(layout));
  return (it == layouts_by_attr_val.end()) ? AmpLayout::UNKNOWN : it->second;
}

AmpLayout::Layout ParseAndCalculateLayout(string_view layout, string_view width,
                                          string_view height,
                                          string_view tagname, bool has_sizes,
                                          bool has_heights,
                                          CssLength* effective_width,
                                          CssLength* effective_height) {
  AmpLayout::Layout input_layout = ParseLayout(layout);

  CssLength input_width(width, /*allow_auto=*/true,
                        /*allow_fluid=*/input_layout == AmpLayout::FLUID);
  if (!input_width.is_valid) return AmpLayout::UNKNOWN;

  CssLength input_height(height, /*allow_auto=*/true,
                         /*allow_fluid=*/input_layout == AmpLayout::FLUID);
  if (!input_height.is_valid) return AmpLayout::UNKNOWN;

  // Calculate effective height, width and layout.
  *effective_height = CalculateHeight(input_layout, input_height, tagname);
  *effective_width = CalculateWidth(input_layout, input_width, tagname);

  return CalculateLayout(input_layout, *effective_width, *effective_height,
                         has_sizes, has_heights);
}

CssLength CalculateWidth(AmpLayout::Layout input_layout,
                         const CssLength& input_width, string_view tagname) {
  if ((input_layout == AmpLayout::UNKNOWN ||
       input_layout == AmpLayout::FIXED) &&
      !input_width.is_set) {
    // These values come from AMP's external runtime and can be found in
    // https://github.com/ampproject/amphtml/blob/main/src/layout.js#L70
    // Note that amp-audio is absent due to it not having explicit dimensions
    // (the dimensions are determined at runtime and are specific to the
    // particular device/browser/etc).
    if (absl::EqualsIgnoreCase(tagname, "AMP-ANALYTICS")) return *kOnePx;
    if (absl::EqualsIgnoreCase(tagname, "AMP-PIXEL")) return *kOnePx;
    if (absl::EqualsIgnoreCase(tagname, "AMP-SOCIAL-SHARE")) return *kSixtyPx;
  }
  return input_width;
}

CssLength CalculateWidth(const AmpLayout& spec, AmpLayout::Layout input_layout,
                         const CssLength& input_width) {
  static const auto* kOne =
      new CssLength("1", /*allow_auto=*/false, /*allow_fluid=*/false);
  if ((input_layout == AmpLayout::UNKNOWN ||
       input_layout == AmpLayout::FIXED) &&
      !input_width.is_set && spec.defines_default_width())
    return *kOne;
  return input_width;
}

CssLength CalculateHeight(AmpLayout::Layout input_layout,
                          const CssLength& input_height, string_view tagname) {
  if ((input_layout == AmpLayout::UNKNOWN || input_layout == AmpLayout::FIXED ||
       input_layout == AmpLayout::FIXED_HEIGHT) &&
      !input_height.is_set) {
    // These values come from AMP's external runtime and can be found in
    // https://github.com/ampproject/amphtml/blob/main/src/layout.js#L70
    // Note that amp-audio is absent due to it not having explicit dimensions
    // (the dimensions are determined at runtime and are specific to the
    // particular device/browser/etc).
    if (absl::EqualsIgnoreCase(tagname, "AMP-ANALYTICS")) return *kOnePx;
    if (absl::EqualsIgnoreCase(tagname, "AMP-PIXEL")) return *kOnePx;
    if (absl::EqualsIgnoreCase(tagname, "AMP-SOCIAL-SHARE"))
      return *kFortyFourPx;
  }
  return input_height;
}

CssLength CalculateHeight(const AmpLayout& spec, AmpLayout::Layout input_layout,
                          const CssLength& input_height) {
  if ((input_layout == AmpLayout::UNKNOWN || input_layout == AmpLayout::FIXED ||
       input_layout == AmpLayout::FIXED_HEIGHT) &&
      !input_height.is_set && spec.defines_default_height())
    return *kOnePx;
  return input_height;
}

AmpLayout::Layout CalculateLayout(AmpLayout::Layout input_layout,
                                  const CssLength& width,
                                  const CssLength& height, bool has_sizes,
                                  bool has_heights) {
  if (input_layout != AmpLayout::UNKNOWN) return input_layout;
  if (!width.is_set && !height.is_set) return AmpLayout::CONTAINER;
  if ((height.is_set && height.is_fluid) || (width.is_set && width.is_fluid))
    return AmpLayout::FLUID;
  if (height.is_set && (!width.is_set || width.is_auto))
    return AmpLayout::FIXED_HEIGHT;
  if (height.is_set && width.is_set && (has_sizes || has_heights))
    return AmpLayout::RESPONSIVE;
  return AmpLayout::FIXED;
}

std::string GetCssLengthStyle(const CssLength& length,
                              const std::string& type) {
  if (!length.is_set) return "";
  if (length.is_auto) return StrCat(type, ":auto;");
  return StrCat(type, ":", absl::AlphaNum(length.numeral), length.unit,
                ";");
}

std::string GetLayoutClass(AmpLayout::Layout layout) {
  static unordered_map<AmpLayout::Layout, std::string> classes_by_layout({
      {AmpLayout::CONTAINER, "i-amphtml-layout-container"},
      {AmpLayout::FILL, "i-amphtml-layout-fill"},
      {AmpLayout::FIXED, "i-amphtml-layout-fixed"},
      {AmpLayout::FIXED_HEIGHT, "i-amphtml-layout-fixed-height"},
      {AmpLayout::FLEX_ITEM, "i-amphtml-layout-flex-item"},
      {AmpLayout::FLUID, "i-amphtml-layout-fluid"},
      {AmpLayout::INTRINSIC, "i-amphtml-layout-intrinsic"},
      {AmpLayout::NODISPLAY, "i-amphtml-layout-nodisplay"},
      {AmpLayout::RESPONSIVE, "i-amphtml-layout-responsive"},
      {AmpLayout::UNKNOWN, "i-amphtml-layout-unknown"},
  });
  if (layout == AmpLayout::UNKNOWN) return "";

  if (auto iter = classes_by_layout.find(layout);
      iter != classes_by_layout.end()) {
    return iter->second;
  }

  return "";
}

std::string GetLayoutName(AmpLayout::Layout layout) {
  static unordered_map<AmpLayout::Layout, std::string> names_by_layout({
      {AmpLayout::CONTAINER, "container"},
      {AmpLayout::FILL, "fill"},
      {AmpLayout::FIXED, "fixed"},
      {AmpLayout::FIXED_HEIGHT, "fixed-height"},
      {AmpLayout::FLEX_ITEM, "flex-item"},
      {AmpLayout::FLUID, "fluid"},
      {AmpLayout::INTRINSIC, "intrinsic"},
      {AmpLayout::NODISPLAY, "nodisplay"},
      {AmpLayout::RESPONSIVE, "responsive"},
      {AmpLayout::UNKNOWN, "unknown"},
  });
  if (layout == AmpLayout::UNKNOWN) return "";

  if (auto iter = names_by_layout.find(layout); iter != names_by_layout.end()) {
    return iter->second;
  }

  return "";
}

std::string GetLayoutStyle(AmpLayout::Layout layout, const CssLength& width,
                           const CssLength& height) {
  switch (layout) {
    case AmpLayout::FIXED:
    case AmpLayout::FLEX_ITEM:
      return StrCat(GetCssLengthStyle(width, "width"),
                    GetCssLengthStyle(height, "height"));
    case AmpLayout::FIXED_HEIGHT:
      return GetCssLengthStyle(height, "height");
    case AmpLayout::FLUID:
      return "width:100%;height:0;";
    case AmpLayout::NODISPLAY:
    case AmpLayout::RESPONSIVE:
    case AmpLayout::FILL:
    case AmpLayout::CONTAINER:
    default:
      // No style attribute.
      return "";
  }
}

std::string GetSizerStyle(AmpLayout::Layout layout, const CssLength& width,
                          const CssLength& height) {
  if (layout != AmpLayout::RESPONSIVE || !width.is_set || width.numeral == 0 ||
      !height.is_set || width.unit != height.unit)
    return "";
  double padding = height.numeral / width.numeral * 100;
  return StrFormat("display:block;padding-top:%.4f%%;", padding);
}

bool IsLayoutSizeDefined(AmpLayout::Layout layout) {
  return (layout == AmpLayout::FIXED || layout == AmpLayout::FIXED_HEIGHT ||
          layout == AmpLayout::RESPONSIVE || layout == AmpLayout::FILL ||
          layout == AmpLayout::FLEX_ITEM || layout == AmpLayout::FLUID ||
          layout == AmpLayout::INTRINSIC);
}

bool IsLayoutAwaitingSize(AmpLayout::Layout layout) {
  return layout == AmpLayout::FLUID;
}

std::string GetLayoutSizeDefinedClass() {
  return "i-amphtml-layout-size-defined";
}

std::string GetLayoutAwaitingSizeClass() {
  return "i-amphtml-layout-awaiting-size";
}

}  // namespace amp::validator::parse_layout
