#include "cpp/htmlparser/foreign.h"

#include <algorithm>

#include "cpp/htmlparser/comparators.h"
#include "cpp/htmlparser/strings.h"

namespace htmlparser {

bool HtmlIntegrationPoint(const Node& node) {
  if (node.Type() != NodeType::ELEMENT_NODE) {
    return false;
  }

  if (node.NameSpace() == "math") {
    if (node.DataAtom() == Atom::ANNOTATION_XML) {
      for (const Attribute& attr : node.Attributes()) {
        if (attr.key == "encoding") {
          std::string value = attr.value;
          Strings::ToLower(&value);
          if (value == "text/html" || value == "application/xhtml+xml") {
            return true;
          }
        }
      }
    }
  } else if (node.NameSpace() == "svg") {
    if (node.DataAtom() == Atom::DESC ||
        node.DataAtom() == Atom::FOREIGN_OBJECT ||
        node.DataAtom() == Atom::TITLE) {
      return true;
    }
  }

  return false;
}

bool MathMLTextIntegrationPoint(const Node& node) {
  static constexpr std::array<Atom, 5> textNodes {
    Atom::MI, Atom::MO, Atom::MN, Atom::MS, Atom::MTEXT};

  if (node.NameSpace() != "math") return false;
  for (auto tn : textNodes) {
    if (node.DataAtom() == tn) return true;
  }
  return false;
}

void AdjustSVGAttributeNames(std::vector<Attribute>* attrs) {
  for (Attribute& attr : *attrs) {
    if (auto iter = std::lower_bound(std::begin(kSvgAttributeAdjustments),
                                     std::end(kSvgAttributeAdjustments),
                                     attr.key,
                                     PairComparator<std::string_view,
                                                    std::string_view>());
        iter != std::end(kSvgAttributeAdjustments) &&
        iter->first == attr.key) {
      attr.key = iter->second.data();
    }
  }
}

void AdjustMathMLAttributeNames(std::vector<Attribute>* attrs) {
  for (Attribute& attr : *attrs) {
    if (auto iter = std::lower_bound(std::begin(kMathMLAttributeAdjustments),
                                     std::end(kMathMLAttributeAdjustments),
                                     attr.key,
                                     PairComparator<std::string_view,
                                                    std::string_view>());
        iter != std::end(kMathMLAttributeAdjustments) &&
        iter->first == attr.key) {
      attr.key = iter->second.data();
    }
  }
}

void AdjustForeignAttributes(std::vector<Attribute>* attrs) {
  static constexpr std::array<std::string_view, 11> keys {
    "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show",
    "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space",
    "xmlns:xlink",
  };

  for (Attribute& attr : *attrs) {
    if (attr.key.empty() || attr.key.at(0) != 'x') continue;
    if (std::find(keys.begin(), keys.end(), attr.key) != keys.end()) {
      int j = attr.key.find(':');
      attr.name_space = attr.key.substr(0, j);
      attr.key = attr.key.substr(j + 1);
    }
  }
}

}  // namespace htmlparser
