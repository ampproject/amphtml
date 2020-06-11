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

#include "type_identifier.h"

#include <algorithm>

#include "absl/strings/case.h"
#include "../../validator.proto.h"

namespace amp::validator {

std::string TypeIdentifierToString(TypeIdentifier type_identifier) {
  switch (type_identifier) {
    case TypeIdentifier::kAmp:
      return "amp";
    case TypeIdentifier::kAds:
      return "amp4ads";
    case TypeIdentifier::kEmail:
      return "amp4email";
    case TypeIdentifier::kActions:
      return "actions";
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
  if (CaseEqual(type_identifier, "amp") ||
      CaseEqual(type_identifier, "\u26a1") ||
      CaseEqual(type_identifier, "\u26a1\ufe0f")) {
    return TypeIdentifier::kAmp;
  }
  if (CaseEqual(type_identifier, "amp4ads") ||
      CaseEqual(type_identifier, "\u26a14ads") ||
      CaseEqual(type_identifier, "\u26a1\ufe0f4ads")) {
    return TypeIdentifier::kAds;
  }
  if (CaseEqual(type_identifier, "amp4email") ||
      CaseEqual(type_identifier, "\u26a14email") ||
      CaseEqual(type_identifier, "\u26a1\ufe0f4email")) {
    return TypeIdentifier::kEmail;
  }
  if (CaseEqual(type_identifier, "actions")) {
    return TypeIdentifier::kActions;
  }
  if (CaseEqual(type_identifier, "transformed")) {
    return TypeIdentifier::kTransformed;
  }
  if (CaseEqual(type_identifier, "experimental")) {
    return TypeIdentifier::kExperimental;
  }
  if (CaseEqual(type_identifier, "data-ampdevmode")) {
    return TypeIdentifier::kDevMode;
  }
  if (CaseEqual(type_identifier, "data-css-strict")) {
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
