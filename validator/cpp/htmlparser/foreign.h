#ifndef CPP_HTMLPARSER_FOREIGN_H_
#define CPP_HTMLPARSER_FOREIGN_H_

#include <string>
#include <string_view>

#include "cpp/htmlparser/node.h"

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
// SVG names are case sensitive. altglyph vs altGlyph
inline constexpr std::pair<Atom, Atom> kSvgTagNameAdjustments[] {
    {Atom::ALTGLYPH,            Atom::ALT_GLYPH},
    {Atom::ALTGLYPHDEF,         Atom::ALT_GLYPH_DEF},
    {Atom::ALTGLYPHITEM,        Atom::ALT_GLYPH_ITEM},
    {Atom::ANIMATECOLOR,        Atom::ANIMATE_COLOR},
    {Atom::ANIMATEMOTION,       Atom::ANIMATE_MOTION},
    {Atom::ANIMATETRANSFORM,    Atom::ANIMATE_TRANSFORM},
    {Atom::CLIPPATH,            Atom::CLIP_PATH},
    {Atom::FEBLEND,             Atom::FE_BLEND},
    {Atom::FECOLORMATRIX,       Atom::FE_COLOR_MATRIX},
    {Atom::FECOMPONENTTRANSFER, Atom::FE_COMPONENT_TRANSFER},
    {Atom::FECOMPOSITE,         Atom::FE_COMPOSITE},
    {Atom::FECONVOLVEMATRIX,    Atom::FE_CONVOLVE_MATRIX},
    {Atom::FEDIFFUSELIGHTING,   Atom::FE_DIFFUSE_LIGHTING},
    {Atom::FEDISPLACEMENTMAP,   Atom::FE_DISPLACEMENT_MAP},
    {Atom::FEDISTANTLIGHT,      Atom::FE_DISTANT_LIGHT},
    {Atom::FEFLOOD,             Atom::FE_FLOOD},
    {Atom::FEFUNCA,             Atom::FE_FUNC_A},
    {Atom::FEFUNCB,             Atom::FE_FUNC_B},
    {Atom::FEFUNCG,             Atom::FE_FUNC_G},
    {Atom::FEFUNCR,             Atom::FE_FUNC_R},
    {Atom::FEGAUSSIANBLUR,      Atom::FE_GAUSSIAN_BLUR},
    {Atom::FEIMAGE,             Atom::FE_IMAGE},
    {Atom::FEMERGE,             Atom::FE_MERGE},
    {Atom::FEMERGENODE,         Atom::FE_MERGE_NODE},
    {Atom::FEMORPHOLOGY,        Atom::FE_MORPHOLOGY},
    {Atom::FEOFFSET,            Atom::FE_OFFSET},
    {Atom::FEPOINTLIGHT,        Atom::FE_POINT_LIGHT},
    {Atom::FESPECULARLIGHTING,  Atom::FE_SPECULAR_LIGHTING},
    {Atom::FESPOTLIGHT,         Atom::FE_SPOT_LIGHT},
    {Atom::FETILE,              Atom::FE_TILE},
    {Atom::FETURBULENCE,        Atom::FE_TURBULENCE},
    {Atom::FOREIGNOBJECT,       Atom::FOREIGN_OBJECT},
    {Atom::GLYPHREF,            Atom::GLYPH_REF},
    {Atom::LINEARGRADIENT,      Atom::LINEAR_GRADIENT},
    {Atom::RADIALGRADIENT,      Atom::RADIAL_GRADIENT},
    {Atom::TEXTPATH,            Atom::TEXT_PATH},
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

#endif  // CPP_HTMLPARSER_FOREIGN_H_
