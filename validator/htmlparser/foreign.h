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

#ifndef HTMLPARSER__FOREIGN_H_
#define HTMLPARSER__FOREIGN_H_

#include <string>
#include <string_view>

#include "htmlparser/node.h"

namespace htmlparser {

bool MathMLTextIntegrationPoint(const Node& node);
bool HtmlIntegrationPoint(const Node& node);
void AdjustSVGAttributeNames(std::vector<Attribute>* attrs);
void AdjustMathMLAttributeNames(std::vector<Attribute>* attrs);
void AdjustForeignAttributes(std::vector<Attribute>* attrs);

// Section 12.2.6.5.
inline constexpr std::array<Atom, 44> kBreakoutTags {
  Atom::B,
  Atom::BIG,
  Atom::BLOCKQUOTE,
  Atom::BODY,
  Atom::BR,
  Atom::CENTER,
  Atom::CODE,
  Atom::DD,
  Atom::DIV,
  Atom::DL,
  Atom::DT,
  Atom::EM,
  Atom::EMBED,
  Atom::H1,
  Atom::H2,
  Atom::H3,
  Atom::H4,
  Atom::H5,
  Atom::H6,
  Atom::HEAD,
  Atom::HR,
  Atom::I,
  Atom::IMG,
  Atom::LI,
  Atom::LISTING,
  Atom::MENU,
  Atom::META,
  Atom::NOBR,
  Atom::OL,
  Atom::P,
  Atom::PRE,
  Atom::RUBY,
  Atom::S,
  Atom::SMALL,
  Atom::SPAN,
  Atom::STRONG,
  Atom::STRIKE,
  Atom::SUB,
  Atom::SUP,
  Atom::TABLE,
  Atom::TT,
  Atom::U,
  Atom::UL,
  Atom::VAR,
};

// Section 12.2.6.5.
inline constexpr std::pair<std::string_view, std::string_view>
    kSvgTagNameAdjustments[] {
    {"altglyph",            "altGlyph"},
    {"altglyphdef",         "altGlyphDef"},
    {"altglyphitem",        "altGlyphItem"},
    {"animatecolor",        "animateColor"},
    {"animatemotion",       "animateMotion"},
    {"animatetransform",    "animateTransform"},
    {"clippath",            "clipPath"},
    {"feblend",             "feBlend"},
    {"fecolormatrix",       "feColorMatrix"},
    {"fecomponenttransfer", "feComponentTransfer"},
    {"fecomposite",         "feComposite"},
    {"feconvolvematrix",    "feConvolveMatrix"},
    {"fediffuselighting",   "feDiffuseLighting"},
    {"fedisplacementmap",   "feDisplacementMap"},
    {"fedistantlight",      "feDistantLight"},
    {"feflood",             "feFlood"},
    {"fefunca",             "feFuncA"},
    {"fefuncb",             "feFuncB"},
    {"fefuncg",             "feFuncG"},
    {"fefuncr",             "feFuncR"},
    {"fegaussianblur",      "feGaussianBlur"},
    {"feimage",             "feImage"},
    {"femerge",             "feMerge"},
    {"femergenode",         "feMergeNode"},
    {"femorphology",        "feMorphology"},
    {"feoffset",            "feOffset"},
    {"fepointlight",        "fePointLight"},
    {"fespecularlighting",  "feSpecularLighting"},
    {"fespotlight",         "feSpotLight"},
    {"fetile",              "feTile"},
    {"feturbulence",        "feTurbulence"},
    {"foreignobject",       "foreignObject"},
    {"glyphref",            "glyphRef"},
    {"lineargradient",      "linearGradient"},
    {"radialgradient",      "radialGradient"},
    {"textpath",            "textPath"},
};

// Section 12.2.6.1
inline constexpr std::pair<std::string_view, std::string_view>
    kMathMLAttributeAdjustments[] {
    {"definitionurl", "definitionURL"},
};

inline constexpr std::pair<std::string_view, std::string_view>
    kSvgAttributeAdjustments[] {
    {"attributename",             "attributeName"},
    {"attributetype",             "attributeType"},
    {"basefrequency",             "baseFrequency"},
    {"baseprofile",               "baseProfile"},
    {"calcmode",                  "calcMode"},
    {"clippathunits",             "clipPathUnits"},
    {"contentscripttype",         "contentScriptType"},
    {"contentstyletype",          "contentStyleType"},
    {"diffuseconstant",           "diffuseConstant"},
    {"edgemode",                  "edgeMode"},
    {"externalresourcesrequired", "externalResourcesRequired"},
    {"filterres",                 "filterRes"},
    {"filterunits",               "filterUnits"},
    {"glyphref",                  "glyphRef"},
    {"gradienttransform",         "gradientTransform"},
    {"gradientunits",             "gradientUnits"},
    {"kernelmatrix",              "kernelMatrix"},
    {"kernelunitlength",          "kernelUnitLength"},
    {"keypoints",                 "keyPoints"},
    {"keysplines",                "keySplines"},
    {"keytimes",                  "keyTimes"},
    {"lengthadjust",              "lengthAdjust"},
    {"limitingconeangle",         "limitingConeAngle"},
    {"markerheight",              "markerHeight"},
    {"markerunits",               "markerUnits"},
    {"markerwidth",               "markerWidth"},
    {"maskcontentunits",          "maskContentUnits"},
    {"maskunits",                 "maskUnits"},
    {"numoctaves",                "numOctaves"},
    {"pathlength",                "pathLength"},
    {"patterncontentunits",       "patternContentUnits"},
    {"patterntransform",          "patternTransform"},
    {"patternunits",              "patternUnits"},
    {"pointsatx",                 "pointsAtX"},
    {"pointsaty",                 "pointsAtY"},
    {"pointsatz",                 "pointsAtZ"},
    {"preservealpha",             "preserveAlpha"},
    {"preserveaspectratio",       "preserveAspectRatio"},
    {"primitiveunits",            "primitiveUnits"},
    {"refx",                      "refX"},
    {"refy",                      "refY"},
    {"repeatcount",               "repeatCount"},
    {"repeatdur",                 "repeatDur"},
    {"requiredextensions",        "requiredExtensions"},
    {"requiredfeatures",          "requiredFeatures"},
    {"specularconstant",          "specularConstant"},
    {"specularexponent",          "specularExponent"},
    {"spreadmethod",              "spreadMethod"},
    {"startoffset",               "startOffset"},
    {"stddeviation",              "stdDeviation"},
    {"stitchtiles",               "stitchTiles"},
    {"surfacescale",              "surfaceScale"},
    {"systemlanguage",            "systemLanguage"},
    {"tablevalues",               "tableValues"},
    {"targetx",                   "targetX"},
    {"targety",                   "targetY"},
    {"textlength",                "textLength"},
    {"viewbox",                   "viewBox"},
    {"viewtarget",                "viewTarget"},
    {"xchannelselector",          "xChannelSelector"},
    {"ychannelselector",          "yChannelSelector"},
    {"zoomandpan",                "zoomAndPan"},
};

}  // namespace htmlparser

#endif  // HTMLPARSER__FOREIGN_H_
