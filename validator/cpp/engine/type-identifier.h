#ifndef CPP_ENGINE_TYPE_IDENTIFIER_H_
#define CPP_ENGINE_TYPE_IDENTIFIER_H_

#include <vector>

#include "absl/strings/string_view.h"
#include "validator.pb.h"

namespace amp::validator {

// The type identifier of a parsed document. This is declared as an attribute
// on the HTML tag and is parsed by the Validator engine. Examples are amp,
// amp4ads, and ⚡4email.
enum TypeIdentifier {
  kUnknown,
  kAmp,
  kAds,
  kEmail,
  kTransformed,
  kExperimental,
  kDevMode,
  kCssStrict,
};

// Returns a string representation of the type identifier. If the
// type identifier is not recognized it returns "".
std::string TypeIdentifierToString(TypeIdentifier type_identifier);

// Returns a string representation, utilizing ⚡ where appropriate, of the
// type identifier. If the type identifier is not recognized it returns "".
std::string TypeIdentifierToBoltString(TypeIdentifier type_identifier);

// Returns the TypeIdentifier of the given string representation. If the
// type identifier is not recognized it returns kUnknown.
TypeIdentifier GetTypeIdentifier(absl::string_view type_identifier);

// Returns all type identifiers that are stored in the ValidationResult
// type_identifier field. If the type identifier is not recognized it is added
// as kUnknown.
std::vector<TypeIdentifier> GetTypeIdentifiers(
    const amp::validator::ValidationResult&);

// Returns true iff the given type identifiers include all the required type
// identifiers for Signed Exchanges.
bool HasSignedExchangeTypeIdentifiers(
    std::vector<TypeIdentifier> type_identifiers);
}  // namespace amp::validator

#endif  // CPP_ENGINE_TYPE_IDENTIFIER_H_
