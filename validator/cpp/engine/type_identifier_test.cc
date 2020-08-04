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

#include "gtest/gtest.h"
#include "../../validator.proto.h"

TEST(TypeIdentifier, TypeIdentifierToString) {
  EXPECT_EQ(
      amp::validator::TypeIdentifierToString(
          amp::validator::TypeIdentifier::kAmp),
      "amp");
  EXPECT_EQ(
      amp::validator::TypeIdentifierToString(
          amp::validator::TypeIdentifier::kAds),
      "amp4ads");
  EXPECT_EQ(
      amp::validator::TypeIdentifierToString(
          amp::validator::TypeIdentifier::kEmail),
      "amp4email");
  EXPECT_EQ(amp::validator::TypeIdentifierToString(
                amp::validator::TypeIdentifier::kTransformed),
            "transformed");
  EXPECT_EQ(amp::validator::TypeIdentifierToString(
                amp::validator::TypeIdentifier::kExperimental),
            "experimental");
  EXPECT_EQ(amp::validator::TypeIdentifierToString(
                amp::validator::TypeIdentifier::kDevMode),
            "data-ampdevmode");
  EXPECT_EQ(amp::validator::TypeIdentifierToString(
                amp::validator::TypeIdentifier::kUnknown),
            "");
}

TEST(TypeIdentifier, GetTypeIdentifierFromString) {
  EXPECT_EQ(amp::validator::GetTypeIdentifier("amp"),
            amp::validator::TypeIdentifier::kAmp);
  EXPECT_EQ(amp::validator::GetTypeIdentifier("⚡"),
            amp::validator::TypeIdentifier::kAmp);
  EXPECT_EQ(amp::validator::GetTypeIdentifier("⚡️"),
            amp::validator::TypeIdentifier::kAmp);
  EXPECT_EQ(amp::validator::GetTypeIdentifier("\u26a1\ufe0f"),
            amp::validator::TypeIdentifier::kAmp);
  EXPECT_EQ(amp::validator::GetTypeIdentifier("amp4ads"),
            amp::validator::TypeIdentifier::kAds);
  EXPECT_EQ(amp::validator::GetTypeIdentifier("⚡4ads"),
            amp::validator::TypeIdentifier::kAds);
  EXPECT_EQ(amp::validator::GetTypeIdentifier("⚡️4ads"),
            amp::validator::TypeIdentifier::kAds);
  EXPECT_EQ(amp::validator::GetTypeIdentifier("\u26a1\ufe0f4ads"),
            amp::validator::TypeIdentifier::kAds);
  EXPECT_EQ(amp::validator::GetTypeIdentifier("amp4email"),
            amp::validator::TypeIdentifier::kEmail);
  EXPECT_EQ(amp::validator::GetTypeIdentifier("⚡4email"),
            amp::validator::TypeIdentifier::kEmail);
  EXPECT_EQ(amp::validator::GetTypeIdentifier("⚡️4email"),
            amp::validator::TypeIdentifier::kEmail);
  EXPECT_EQ(amp::validator::GetTypeIdentifier("\u26a1\ufe0f4email"),
            amp::validator::TypeIdentifier::kEmail);
  EXPECT_EQ(amp::validator::GetTypeIdentifier("transformed"),
            amp::validator::TypeIdentifier::kTransformed);
  EXPECT_EQ(amp::validator::GetTypeIdentifier("experimental"),
            amp::validator::TypeIdentifier::kExperimental);
  EXPECT_EQ(amp::validator::GetTypeIdentifier("data-ampdevmode"),
            amp::validator::TypeIdentifier::kDevMode);
  EXPECT_EQ(amp::validator::GetTypeIdentifier("data-css-strict"),
            amp::validator::TypeIdentifier::kCssStrict);
  EXPECT_EQ(amp::validator::GetTypeIdentifier(""),
            amp::validator::TypeIdentifier::kUnknown);
  EXPECT_EQ(amp::validator::GetTypeIdentifier("lemur"),
            amp::validator::TypeIdentifier::kUnknown);
}

TEST(TypeIdentifier, GetTypeIdentifiersFromValidationResult) {
  {
    amp::validator::ValidationResult result;
    result.add_type_identifier("amp");
    std::vector<amp::validator::TypeIdentifier> expected{
        amp::validator::TypeIdentifier::kAmp};
    EXPECT_EQ(amp::validator::GetTypeIdentifiers(result), expected);
  }
  {
    amp::validator::ValidationResult result;
    result.add_type_identifier("⚡");
    std::vector<amp::validator::TypeIdentifier> expected{
        amp::validator::TypeIdentifier::kAmp};
    EXPECT_EQ(amp::validator::GetTypeIdentifiers(result), expected);
  }
  {
    amp::validator::ValidationResult result;
    result.add_type_identifier("amp");
    result.add_type_identifier("transformed");
    std::vector<amp::validator::TypeIdentifier> expected{
        amp::validator::TypeIdentifier::kAmp,
        amp::validator::TypeIdentifier::kTransformed};
    EXPECT_EQ(amp::validator::GetTypeIdentifiers(result), expected);
  }
  {
    amp::validator::ValidationResult result;
    std::vector<amp::validator::TypeIdentifier> expected;
    EXPECT_EQ(amp::validator::GetTypeIdentifiers(result), expected);
  }
}

TEST(TypeIdentifier, HasSignedExchangeTypeIdentifiers) {
  {
    std::vector<amp::validator::TypeIdentifier> type_identifiers = {
        amp::validator::TypeIdentifier::kAmp,
        amp::validator::TypeIdentifier::kTransformed};
    EXPECT_TRUE(
        amp::validator::HasSignedExchangeTypeIdentifiers(type_identifiers));
  }
  {
    std::vector<amp::validator::TypeIdentifier> type_identifiers = {
        amp::validator::TypeIdentifier::kAmp};
    EXPECT_FALSE(
        amp::validator::HasSignedExchangeTypeIdentifiers(type_identifiers));
  }
  {
    std::vector<amp::validator::TypeIdentifier> type_identifiers = {
        amp::validator::TypeIdentifier::kTransformed};
    EXPECT_FALSE(
        amp::validator::HasSignedExchangeTypeIdentifiers(type_identifiers));
  }
}
