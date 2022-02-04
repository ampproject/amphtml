// Helper class to do a lookup of a tag/entity/event to its Atom and convert
// atom to string.

#ifndef CPP_HTMLPARSER_ATOMUTIL_H_
#define CPP_HTMLPARSER_ATOMUTIL_H_

#include <string>

#include "cpp/htmlparser/atom.h"

namespace htmlparser {

class AtomUtil {
 public:
  static Atom ToAtom(const std::string& s);
  // Returns the string representation (tag name) of the atom.
  // If the atom is unknown, returns the optional unknown_tag_name which
  // defaults to empty (no tagname).
  static std::string ToString(Atom a, std::string_view unknown_tag_name = "");

 private:
  inline static std::string ToString(uint32_t atom_as_int) {
    return ToString(static_cast<Atom>(atom_as_int));
  }

  inline static Atom CastToAtom(uint32_t atom_as_int) {
    return static_cast<Atom>(atom_as_int);
  }

  // No instances of this class.
  AtomUtil() = delete;
};

}  // namespace htmlparser

#endif  // CPP_HTMLPARSER_ATOMUTIL_H_
