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

#include "atomutil.h"

#include "gtest/gtest.h"
#include "hash.h"

TEST(AtomUtilTest, StringToAtom) {
  // String to atom.
  EXPECT_EQ(htmlparser::AtomUtil::ToAtom("h3"), htmlparser::Atom::H3);
  EXPECT_EQ(htmlparser::AtomUtil::ToAtom("amp-ad"), htmlparser::Atom::AMP_AD);
  EXPECT_EQ(htmlparser::AtomUtil::ToAtom("amp-img"),
      htmlparser::Atom::AMP_IMG);
  EXPECT_EQ(htmlparser::AtomUtil::ToAtom("width"), htmlparser::Atom::WIDTH);
  EXPECT_EQ(htmlparser::AtomUtil::ToAtom("iframe"), htmlparser::Atom::IFRAME);
  EXPECT_EQ(htmlparser::AtomUtil::ToAtom("amp-no-such-tag"),
      htmlparser::Atom::UNKNOWN);
  EXPECT_EQ(htmlparser::AtomUtil::ToAtom("foreignobject"),
            htmlparser::Atom::FOREIGNOBJECT);
  EXPECT_EQ(htmlparser::AtomUtil::ToAtom("foreignObject"),
            htmlparser::Atom::FOREIGN_OBJECT);
}

TEST(AtomUtilTest, AtomToString) {
  // To string().
  EXPECT_EQ(htmlparser::AtomUtil::ToString(
        htmlparser::AtomUtil::ToAtom("h3")), "h3");
  EXPECT_EQ(htmlparser::AtomUtil::ToString(
        htmlparser::AtomUtil::ToAtom("amp-ad")), "amp-ad");
  EXPECT_EQ(htmlparser::AtomUtil::ToString(
        htmlparser::AtomUtil::ToAtom("amp-img")), "amp-img");
  EXPECT_EQ(htmlparser::AtomUtil::ToString(
        htmlparser::AtomUtil::ToAtom("width")), "width");
  EXPECT_EQ(htmlparser::AtomUtil::ToString(
        htmlparser::AtomUtil::ToAtom("iframe")), "iframe");
  EXPECT_EQ(htmlparser::AtomUtil::ToString(
        htmlparser::AtomUtil::ToAtom("amp-no-such-tag")), "");
  EXPECT_EQ(htmlparser::AtomUtil::ToString(htmlparser::Atom::FOREIGN_OBJECT),
            "foreignObject");
  EXPECT_EQ(htmlparser::AtomUtil::ToString(htmlparser::Atom::FOREIGNOBJECT),
            "foreignobject");
}
