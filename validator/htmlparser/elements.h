//
// Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

#ifndef HTMLPARSER__ELEMENTS_H_
#define HTMLPARSER__ELEMENTS_H_

#include <array>

#include "atom.h"

namespace htmlparser {

inline constexpr std::array<Atom, 19> kBlockElements {
    Atom::ADDRESS,
    Atom::BLOCKQUOTE,
    Atom::DIV,
    Atom::DL,
    Atom::FIELDSET,
    Atom::FORM,
    Atom::H1,
    Atom::H2,
    Atom::H3,
    Atom::H4,
    Atom::H5,
    Atom::H6,
    Atom::HR,
    Atom::NOSCRIPT,
    Atom::OL,
    Atom::P,
    Atom::PRE,
    Atom::TABLE,
    Atom::UL,
};

inline constexpr std::array<Atom, 8> kRawTextNodes {
    Atom::IFRAME,
    Atom::NOEMBED,
    Atom::NOFRAMES,
    Atom::NOSCRIPT,
    Atom::PLAINTEXT,
    Atom::SCRIPT,
    Atom::STYLE,
    Atom::XMP,
};

// Section 12.1.2, "Elements", gives this list of void elements. Void elements
// are those that can't have any contents.
inline constexpr std::array<Atom, 16> kVoidElements {
    Atom::AREA,
    Atom::BASE,
    Atom::BR,
    Atom::COL,
    Atom::COMMAND,
    Atom::EMBED,
    Atom::HR,
    Atom::IMG,
    Atom::INPUT,
    Atom::KEYGEN,
    Atom::LINK,
    Atom::META,
    Atom::PARAM,
    Atom::SOURCE,
    Atom::TRACK,
    Atom::WBR,
};

// TODO: Add reference to what this means in html spec.
inline constexpr std::array<Atom, 83> kSpecialElements {
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
    // The 'isindex' element has been removed, but keep it for backwards
    // compatibility.
    Atom::ISINDEX,
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

#endif  // HTMLPARSER__ELEMENTS_H_
