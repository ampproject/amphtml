// Renderer renders the parse tree rooted at node to the given buffer.
//
// Rendering is done on a 'best effort' basis: calling Parse on the output of
// Render will always result in something similar to the original tree, but it
// is not necessarily an exact clone unless the original tree was 'well-formed'.
// 'Well-formed' is not easily specified; the HTML5 specification is
// complicated.
//
// Calling Parse on arbitrary input typically results in a 'well-formed' parse
// tree. However, it is possible for Parse to yield a 'badly-formed' parse tree.
// For example, in a 'well-formed' parse tree, no <a> element is a child of
// another <a> element: parsing "<a><a>" results in two sibling elements.
// Similarly, in a 'well-formed' parse tree, no <a> element is a child of a
// <table> element: parsing "<p><table><a>" results in a <p> with two sibling
// children; the <a> is reparented to the <table>'s parent. However, calling
// Parse on "<a><table><a>" does not return an error, but the result has an <a>
// element with an <a> child, and is therefore not 'well-formed'.
//
// Programmatically constructed trees are typically also 'well-formed', but it
// is possible to construct a tree that looks innocuous but, when rendered and
// re-parsed, results in a different tree. A simple example is that a solitary
// text node would become a tree containing <html>, <head> and <body> elements.
// Another example is that the programmatic equivalent of "a<head>b</head>c"
// becomes "<html><head><head/><body>abc</body></html>".

#ifndef HTMLPARSER__RENDERER_H_
#define HTMLPARSER__RENDERER_H_

#include <sstream>

#include "node.h"

namespace htmlparser {

enum class RenderError {
  NO_ERROR = 0,
  PLAIN_TEXT_ABORT = 1,
  ERROR_NODE_NO_RENDER = 2,
  VOID_ELEMENT_CHILD_NODE = 3,
  UNKNOWN_NODE_TYPE = 4
};

class Renderer {
 public:
  // This renderer though fully functional, is primarily used to render webkit
  // test cases. This Render uses recursion which may not be very efficient for
  // production rendering. Some things you may need to consider:
  // A) Increase the stack size.
  // B) Control document complexity by --htmlparser_max_nodes_depth_count flag.
  // C) Write your own renderer.
  //
  // TODO(amaltas): Replace recursion with iteration based dom tree traversal.
  static RenderError Render(Node* node, std::stringbuf* output_buffer);
};

}  // namespace htmlparser

#endif  // HTMLPARSER__RENDERER_H_
