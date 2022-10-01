#ifndef CPP_HTMLPARSER_TOKEN_H_
#define CPP_HTMLPARSER_TOKEN_H_

#include <memory>
#include <optional>
#include <string>
#include <vector>

#include "cpp/htmlparser/atom.h"

namespace htmlparser {

// Unless otherwise commented where this type is used, both the line and
// columns used in the parser are 1 index based. That is first character being
// tokenized starts as first line and first column.
using LineCol = std::pair<int, int>;
using Offsets = LineCol;

enum class TokenType {
  // ErrorToken means that an error occurred during tokenization.
  ERROR_TOKEN,
  // TextToken means a text node.
  TEXT_TOKEN,
  // A StartTagToken looks like <a>.
  START_TAG_TOKEN,
  // An EndTagToken looks like </a>.
  END_TAG_TOKEN,
  // A SelfClosingTagToken looks like <br/>.
  SELF_CLOSING_TAG_TOKEN,
  // A CommentToken looks like <!--x-->.
  COMMENT_TOKEN,
  // A DoctypeToken looks like <!DOCTYPE x>
  DOCTYPE_TOKEN,
};

// An attribute is an attribute namespace-key-value triple. Namespace is
// non-empty for foreign attributes like xlink, Key is alphabetic (and hence
// does not contain escapable characters like '&', '<' or '>') and Val is
// unescaped (it looks like "a<b" rather than "a&lt;b").
struct Attribute {
  std::string name_space;
  std::string key;
  std::string value;
  // Position of the attribute in html source.
  std::optional<LineCol> line_col_in_html_src;

  bool operator==(const Attribute& other) const;
  bool operator!=(const Attribute& other) const;
  std::string String() const;
  // Returns only the key of the attribute. namespace prefixed if namespace is
  // not empty or just the key otherwise.
  std::string KeyPart() const;
};

// A Token consists of a TokenType and some Data (tag name for start and end
// tags, content for text, comments and doctypes). A tag Token may also contain
// a slice of Attributes. Data is unescaped for all Tokens (it looks like "a,b"
// rather than "a&lt;b"). For tag Tokens, data_atom is the atom for Data, or
// zero if Data is not a known tag name.
struct Token {
  // Type of token.
  TokenType token_type;
  // Atom name of this tag.
  Atom atom;
  // If text node the inner text of the node, if element node the tag name.
  std::string data;
  // Position of this token in html source.
  // Tokenizer increments it to 1 upon parsing the first character.
  LineCol line_col_in_html_src{0, 0};
  // Start/End offset in original html src.
  Offsets offsets_in_html_src{0, 0};

  // List of attributes (unsorted in the same order as they appear in html
  // source, with duplicates).
  std::vector<Attribute> attributes;

  // Tells if the token is manufactured. This should not be confused with
  // manufactured head, body, tbody, thead etc, these are manufactured during
  // parsing not tokenization. This field accounts for only special cases where
  // illegal characters leads to manufacturing of comments token.
  // Eg: https://html.spec.whatwg.org/multipage/parsing.html#parse-error-unexpected-question-mark-instead-of-tag-name
  bool is_manufactured = false;

  // Helper functions to return string representations of the token.
  // ===============================================================
  //
  // TokenType string representation.
  std::string TagString() const;
  // Tag name <div>, </html> or inner text of text node (escaped).
  std::string String() const;
};

}  // namespace htmlparser

#endif  // CPP_HTMLPARSER_TOKEN_H_
