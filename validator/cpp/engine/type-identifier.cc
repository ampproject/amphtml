#include "cpp/engine/type-identifier.h"

#include <algorithm>

#include "absl/strings/match.h"
#include "validator.pb.h"

namespace amp::validator {

std::string TypeIdentifierToString(TypeIdentifier type_identifier) {
  switch (type_identifier) {
    case TypeIdentifier::kAmp:
      return "amp";
    case TypeIdentifier::kAds:
      return "amp4ads";
    case TypeIdentifier::kEmail:
      return "amp4email";
    case TypeIdentifier::kTransformed:
      return "transformed";
    case TypeIdentifier::kExperimental:
      return "experimental";
    case TypeIdentifier::kDevMode:
      return "data-ampdevmode";
    case TypeIdentifier::kCssStrict:
      return "data-css-strict";
    case TypeIdentifier::kUnknown:
      return "";
  }
  return "";
}

std::string TypeIdentifierToBoltString(TypeIdentifier type_identifier) {
  switch (type_identifier) {
    case TypeIdentifier::kAmp:
      return "\u26a1";
    case TypeIdentifier::kAds:
      return "\u26a14ads";
    case TypeIdentifier::kEmail:
      return "\u26a14email";
    default:
      return TypeIdentifierToString(type_identifier);
  }
}

TypeIdentifier GetTypeIdentifier(absl::string_view type_identifier) {
  if (absl::EqualsIgnoreCase(type_identifier, "amp") ||
      absl::EqualsIgnoreCase(type_identifier, "\u26a1") ||
      absl::EqualsIgnoreCase(type_identifier, "\u26a1\ufe0f")) {
    return TypeIdentifier::kAmp;
  }
  if (absl::EqualsIgnoreCase(type_identifier, "amp4ads") ||
      absl::EqualsIgnoreCase(type_identifier, "\u26a14ads") ||
      absl::EqualsIgnoreCase(type_identifier, "\u26a1\ufe0f4ads")) {
    return TypeIdentifier::kAds;
  }
  if (absl::EqualsIgnoreCase(type_identifier, "amp4email") ||
      absl::EqualsIgnoreCase(type_identifier, "\u26a14email") ||
      absl::EqualsIgnoreCase(type_identifier, "\u26a1\ufe0f4email")) {
    return TypeIdentifier::kEmail;
  }
  if (absl::EqualsIgnoreCase(type_identifier, "transformed")) {
    return TypeIdentifier::kTransformed;
  }
  if (absl::EqualsIgnoreCase(type_identifier, "experimental")) {
    return TypeIdentifier::kExperimental;
  }
  if (absl::EqualsIgnoreCase(type_identifier, "data-ampdevmode")) {
    return TypeIdentifier::kDevMode;
  }
  if (absl::EqualsIgnoreCase(type_identifier, "data-css-strict")) {
    return TypeIdentifier::kCssStrict;
  }
  return TypeIdentifier::kUnknown;
}

std::vector<TypeIdentifier> GetTypeIdentifiers(
    const amp::validator::ValidationResult& result) {
  std::vector<TypeIdentifier> type_identifiers;
  for (const std::string& type_identifier : result.type_identifier()) {
    type_identifiers.emplace_back(GetTypeIdentifier(type_identifier));
  }
  return type_identifiers;
}

bool HasSignedExchangeTypeIdentifiers(
    std::vector<TypeIdentifier> type_identifiers) {
  return std::find(type_identifiers.begin(), type_identifiers.end(),
                   TypeIdentifier::kAmp) !=
             type_identifiers.end() &&
         std::find(type_identifiers.begin(), type_identifiers.end(),
                   TypeIdentifier::kTransformed) !=
             type_identifiers.end();
}

}  // namespace amp::validator
