#ifndef CPP_HTMLPARSER_ELEMENTS_H_
#define CPP_HTMLPARSER_ELEMENTS_H_

#include <array>

#include "cpp/htmlparser/atom.h"

namespace htmlparser {

inline constexpr std::array<Atom, 19> kBlockElements{
    Atom::ADDRESS,  Atom::BLOCKQUOTE, Atom::DIV, Atom::DL,
    Atom::FIELDSET, Atom::FORM,       Atom::H1,  Atom::H2,
    Atom::H3,       Atom::H4,         Atom::H5,  Atom::H6,
    Atom::HR,       Atom::NOSCRIPT,   Atom::OL,  Atom::P,
    Atom::PRE,      Atom::TABLE,      Atom::UL,
};

inline constexpr std::array<Atom, 8> kRawTextNodes{
    Atom::IFRAME,    Atom::NOEMBED, Atom::NOFRAMES, Atom::NOSCRIPT,
    Atom::PLAINTEXT, Atom::SCRIPT,  Atom::STYLE,    Atom::XMP,
};

// Section 12.1.2, "Elements", gives this list of void elements. Void elements
// are those that can't have any contents.
inline constexpr std::array<Atom, 15> kVoidElements{
    Atom::AREA,    Atom::BASE,   Atom::BR,    Atom::COL,
    Atom::EMBED,  Atom::HR,    Atom::IMG,
    Atom::INPUT,   Atom::KEYGEN, Atom::LINK,  Atom::META,
    Atom::PARAM,   Atom::SOURCE, Atom::TRACK, Atom::WBR,
};

inline constexpr std::array<Atom, 82> kSpecialElements{
    Atom::ADDRESS,
    Atom::APPLET,
    Atom::AREA,
    Atom::ARTICLE,
    Atom::ASIDE,
    Atom::BASE,
    Atom::BASEFONT,
    Atom::BGSOUND,
    Atom::BLOCKQUOTE,
    Atom::BODY,
    Atom::BR,
    Atom::BUTTON,
    Atom::CAPTION,
    Atom::CENTER,
    Atom::COL,
    Atom::COLGROUP,
    Atom::DD,
    Atom::DETAILS,
    Atom::DIR,
    Atom::DIV,
    Atom::DL,
    Atom::DT,
    Atom::EMBED,
    Atom::FIELDSET,
    Atom::FIGCAPTION,
    Atom::FIGURE,
    Atom::FOOTER,
    Atom::FORM,
    Atom::FRAME,
    Atom::FRAMESET,
    Atom::H1,
    Atom::H2,
    Atom::H3,
    Atom::H4,
    Atom::H5,
    Atom::H6,
    Atom::HEAD,
    Atom::HEADER,
    Atom::HGROUP,
    Atom::HR,
    Atom::HTML,
    Atom::IFRAME,
    Atom::IMG,
    Atom::INPUT,
    Atom::KEYGEN,
    Atom::LI,
    Atom::LINK,
    Atom::LISTING,
    Atom::MAIN,
    Atom::MARQUEE,
    Atom::MENU,
    Atom::META,
    Atom::NAV,
    Atom::NOEMBED,
    Atom::NOFRAMES,
    Atom::NOSCRIPT,
    Atom::OBJECT,
    Atom::OL,
    Atom::P,
    Atom::PARAM,
    Atom::PLAINTEXT,
    Atom::PRE,
    Atom::SCRIPT,
    Atom::SECTION,
    Atom::SELECT,
    Atom::SOURCE,
    Atom::STYLE,
    Atom::SUMMARY,
    Atom::TABLE,
    Atom::TBODY,
    Atom::TD,
    Atom::TEMPLATE,
    Atom::TEXTAREA,
    Atom::TFOOT,
    Atom::TH,
    Atom::THEAD,
    Atom::TITLE,
    Atom::TR,
    Atom::TRACK,
    Atom::UL,
    Atom::WBR,
    Atom::XMP,
};

}  // namespace htmlparser

#endif  // CPP_HTMLPARSER_ELEMENTS_H_
