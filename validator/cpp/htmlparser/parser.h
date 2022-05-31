#ifndef CPP_HTMLPARSER_PARSER_H_
#define CPP_HTMLPARSER_PARSER_H_

#include <array>
#include <deque>
#include <functional>
#include <vector>

#include "cpp/htmlparser/atom.h"
#include "cpp/htmlparser/document.h"
#include "cpp/htmlparser/node.h"
#include "cpp/htmlparser/tokenizer.h"

namespace htmlparser {

using OnNodeCallback =
    std::function<void(Node* parsed_node, Token original_token)>;

struct ParseOptions {
 public:
  // Parsing state flags (section 12.2.4.5).
  // By default, scripting and frameset is enabled.
  bool scripting = true;
  bool frameset_ok = true;

  // Setting the following two options leads to more memory consumption.
  // (number of nodes X 4 bytes) + (number of attributes X 4 bytes).
  //
  // NOTE: If you are running parser in extremely memory constrained environment
  // but still interested in the parsed node position in html string, consider
  // using OnNodeCallback. Set the following to false and use the OnNodeCallback
  // based parsing. See OnNodeCallback field comments. Callback returns
  // everything parser knows about a particular node being parsed, node, its
  // data, token data, position etc.
  // ===============================================================
  //
  // Records nodes tag position in the html string.
  bool record_node_offsets = false;
  // Records attributes position in the html string.
  bool record_attribute_offsets = false;
  // Count number of terms in a text node delimited by ascii whitespace and
  // entity code &nbsp;
  bool count_num_terms_in_text_node = false;

  // To be used in unit tests only. Callback style parsing is not yet supported.
  OnNodeCallback on_node_callback = nullptr;
};

// Parse returns the parse tree for the HTML from the given html.
//
// It implements the HTML5 parsing algorithm.
// (https://html.spec.whatwg.org/multipage/syntax.html#tree-construction)
// which is very complicated. The resultant tree can contain implicitly
// created nodes that have no explicit <tag> listed in r's data, and nodes'
// parents can differ from the nesting implied by a naive processing of start
// and end <tag>s. Conversely, explicit <tag>s in html string can be silently
// dropped, with no corresponding node in the resulting tree.
//
// The html string is assumed to be UTF-8 encoded.
[[nodiscard]] std::unique_ptr<Document> Parse(std::string_view html);
[[nodiscard]] std::unique_ptr<Document> ParseWithOptions(
    std::string_view html, const ParseOptions& options);

[[nodiscard]] std::unique_ptr<Document> ParseFragment(
    std::string_view html, Node* fragment_parent = nullptr);

[[nodiscard]] std::unique_ptr<Document> ParseFragmentWithOptions(
    const std::string_view html, const ParseOptions& options,
    Node* fragment_parent = nullptr);

class Parser {
 public:
  Parser(std::string_view html, const ParseOptions& options = {},
         Node* fragment_parent = nullptr);

  [[nodiscard]] std::unique_ptr<Document> Parse();

  friend std::unique_ptr<Document> Parse(std::string_view html);

  friend std::unique_ptr<Document> ParseWithOptions(
      std::string_view html, const ParseOptions& options);

  friend std::unique_ptr<Document> ParseFragment(std::string_view html,
                                                 Node* fragment_parent);

  friend std::unique_ptr<Document> ParseFragmentWithOptions(
      const std::string_view html, const ParseOptions& options,
      Node* fragment_parent);

 private:
  enum class Scope {
    DefaultScope = 0,
    ListItemScope = 1,
    ButtonScope = 2,
    TableScope = 3,
    TableRowScope = 4,
    TableBodyScope = 5,
    SelectScope = 6
  };

  // Disallow copy and assign.
  Parser(const Parser&) = delete;
  Parser& operator=(const Parser&) = delete;

  // Adds a child element based on the current token.
  void AddElement();

  // Parses a token as though it had appeared in the parser's input.
  void ParseImpliedToken(TokenType token_type, Atom atom,
                         const std::string& data);

  // Runs the current token through the parsing routines until it is consumed.
  void ParseCurrentToken();

  // Section 12.2.4.2.
  Node* AdjustedCurrentNode();

  // Section 12.2.4.3.
  void ReconstructActiveFormattingElements();
  void AddFormattingElement();

  // Section 12.2.6.
  bool InForeignContent();

  // Section 12.2.6.2.
  void ParseGenericRawTextElement();

  // Section 12.2.6.5
  bool ParseForeignContent();

  // Section 12.2.5.
  void AcknowledgeSelfClosingTag();

  // Section 12.2.4.3.
  void ClearActiveFormattingElements();

  // inBodyEndTagOther performs the "any other end tag" algorithm for inBodyIM.
  // "Any other end tag" handling from 12.2.6.5 The rules for parsing tokens
  // in foreign content
  // https://html.spec.whatwg.org/multipage/syntax.html#parsing-main-inforeign
  void InBodyEndTagOther(Atom tag_atom, std::string_view tag_name);

  // ----------------
  // Insertion modes.
  // ----------------
  //
  // Section 12.2.6.4.1.
  bool InitialIM();
  // Section 12.2.6.4.2.
  bool BeforeHTMLIM();
  // Section 12.2.6.4.3.
  bool BeforeHeadIM();
  // Section 12.2.6.4.4.
  bool InHeadIM();
  // 12.2.6.4.5.
  bool InHeadNoscriptIM();
  // Section 12.2.6.4.6.
  bool AfterHeadIM();
  // Section 12.2.6.4.7.
  bool InBodyIM();
  // Section 12.2.6.4.8.
  bool TextIM();
  // Section 12.2.6.4.9.
  bool InTableIM();
  // Section 12.2.6.4.11.
  bool InCaptionIM();
  // Section 12.2.6.4.12.
  bool InColumnGroupIM();
  // Section 12.2.6.4.13.
  bool InTableBodyIM();
  // Section 12.2.6.4.14.
  bool InRowIM();
  // Section 12.2.6.4.15.
  bool InCellIM();
  // Section 12.2.6.4.16.
  bool InSelectIM();
  // Section 12.2.6.4.17.
  bool InSelectInTableIM();
  // Section 12.2.6.4.18.
  bool InTemplateIM();
  // Section 12.2.6.4.19.
  bool AfterBodyIM();
  // Section 12.2.6.4.20.
  bool InFramesetIM();
  // Section 12.2.6.4.21.
  bool AfterFramesetIM();
  // Section 12.2.6.4.22.
  bool AfterAfterBodyIM();
  // Section 12.2.6.4.23.
  bool AfterAfterFramesetIM();

  // Section 12.2.4.1, "reset the insertion mode".
  void ResetInsertionMode();

  // Sets the insertion mode to return to after completing a text or
  // inTableText insertion mode.
  // Section 12.2.4.1, "using the rules for".
  void SetOriginalIM();

  // Pops the stack of open elements at the highest element whose tag
  // is in matchTags, provided there is no higher element in the scope's stop
  // tags (as defined in section 12.2.4.2). It returns whether or not there was
  // such an element. If there was not, popUntil leaves the stack unchanged.
  //
  // For example, the set of stop tags for table scope is: "html", "table". If
  // the stack was:
  // ["html", "body", "font", "table", "b", "i", "u"]
  // then popUntil(tableScope, "font") would return false, but
  // popUntil(tableScope, "i") would return true and the stack would become:
  // ["html", "body", "font", "table", "b"]
  //
  // If an element's tag is in both the stop tags and matchTags, then the stack
  // will be popped and the function returns true (provided, there was no
  // higher element in the stack that was also in the stop tags). For example,
  // popUntil(tableScope, "table") returns true and leaves:
  // ["html", "body", "font"]
  template <typename... Args>
  bool PopUntil(Scope scope, Args... match_tags);

  // Returns the index in p.oe of the highest element
  // whose tag is in matchTags that is in scope. If no matching element is in
  // scope, it returns -1.
  int IndexOfElementInScope(Scope scope,
                            const std::vector<Atom>& match_tags) const;

  // Is like popUntil, except that it doesn't modify the stack of open elements.
  template <typename... Args>
  bool ElementInScope(Scope scope, Args... match_tags) const;

  // Pops elements off the stack of open elements until a scope-defined element
  // is found.
  void ClearStackToContext(Scope scope);

  // Pops nodes off the stack of open elements as long as
  // the top node has a tag name of dd, dt, li, optgroup, option, p, rb, rp,
  // rt or rtc.
  // If exceptions are specified, nodes with that name will not be popped off.
  void GenerateImpliedEndTags(
      const std::initializer_list<Atom>& exceptions = {});

  // Adds a child node n to the top element, and pushes n onto the stack
  // of open elements if it is an element node.
  void AddChild(Node* node);

  // Returns whether the next node to be added should be foster parented.
  bool ShouldFosterParent();

  // Adds a child node according to the foster parenting rules.
  // Section 12.2.6.1, "foster parenting".
  void FosterParent(Node* node);

  void InBodyEndTagFormatting(Atom atom, std::string_view tag_name);

  Node* top();

  void AddText(const std::string& text);

  // Copies attributes of the token's attributes to the node.
  void CopyAttributes(Node* node, Token token) const;

  // Record <base> tag's base url and target attributes as document's
  // metadata.
  void RecordBaseURLMetadata(Node* base_node);

  // Record link rel=canonical url as document's metadata.
  void RecordLinkRelCanonical(Node* link_node);

  // Provides the tokens for the parser.
  std::unique_ptr<Tokenizer> tokenizer_;

  // Callback for each new node parsed and added to the document.
  OnNodeCallback on_node_callback_;

  // Most recently read token.
  Token token_;

  // Self-closing tags like <hr/> are treated as start tags, except that
  // has_self_closing_token is set while they are being processed.
  bool has_self_closing_token_ = false;

  // Document root element.
  std::unique_ptr<Document> document_;

  // Section 12.2.4.3 says "The markers are inserted when entering applet,
  // object, marquee, template, td, th, and caption elements, and are used
  // to prevent formatting from "leaking" into applet, object, marquee,
  // template, td, th, and caption elements".
  //
  // TODO: This is just a marker. Consider making it static and const.
  Node* scope_marker_;

  // The stack of open elements (section 12.2.4.2) and active formatting
  // elements (section 12.2.4.3).
  NodeStack open_elements_stack_;
  NodeStack active_formatting_elements_stack_;

  // Element pointers (section 12.2.4.4).
  Node* head_ = nullptr;
  Node* form_ = nullptr;

  // Other parsing state flags (section 12.2.4.5).
  bool scripting_ = true;
  bool frameset_ok_ = true;

  // Records position of elements in html source.
  bool record_node_offsets_ = false;
  bool record_attribute_offsets_ = false;
  // Counts number of terms delimited by whitespace chars i.e. ascii whitespace,
  // newline etc.
  // Entities like &nbsp; and other unicode whitespace chars are not taken into
  // account.
  bool count_num_terms_in_text_node_ = false;

  // Whether the parser is parsing an HTML fragment.
  // If the fragment is the InnerHTML of a node, set that node in context_node_.
  // in parent_node.
  bool fragment_ = false;
  // The context element when parsing an HTML fragment (section 12.4).
  Node* context_node_;

  // Whether new elements should be inserted according to
  // the foster parenting rules (section 12.2.6.1).
  bool foster_parenting_ = false;

  // The stack of template insertion modes
  std::deque<std::function<bool(void)>> template_stack_;

  // The current insertion mode.
  std::function<bool(void)> insertion_mode_;

  // Insertion mode to go back to after completing a text or inTableText
  // insertion mode.
  std::function<bool(void)> original_insertion_mode_;

  // Stop tags for use in popUntil. These come from section 12.2.4.2.
  static constexpr std::pair<std::string_view, std::array<Atom, 9>>
      kDefaultScopeStopTags[]{
          {
              "",  // Empty namespace.
              {Atom::APPLET, Atom::CAPTION, Atom::HTML, Atom::TABLE, Atom::TD,
               Atom::TH, Atom::MARQUEE, Atom::OBJECT, Atom::TEMPLATE},
          },
          {
              "math",
              {Atom::ANNOTATION_XML, Atom::MI, Atom::MN, Atom::MO, Atom::MS,
               Atom::MTEXT},
          },
          {
              "svg",
              {Atom::DESC, Atom::FOREIGN_OBJECT, Atom::TITLE},
          }};

  // Internal tracking.
  int num_html_tags_ = 0;
  int num_body_tags_ = 0;
};

}  // namespace htmlparser

#endif  // CPP_HTMLPARSER_PARSER_H_
