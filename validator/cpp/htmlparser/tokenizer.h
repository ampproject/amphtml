#ifndef CPP_HTMLPARSER_TOKENIZER_H_
#define CPP_HTMLPARSER_TOKENIZER_H_

#include <memory>
#include <optional>
#include <tuple>
#include <vector>

#include "cpp/htmlparser/token.h"

namespace htmlparser {

class Tokenizer {
 public:
  // Constructs a new HTML Tokenizer for the given html.
  // The input is assumed to be UTF-8 encoded.
  //
  // If tokenizing InnerHTML fragment, context_tag is that element's tag, such
  // as "div" or "iframe".
  explicit Tokenizer(std::string_view html, std::string context_tag = "");

  Tokenizer() = delete;

  // Span is a range of bytes in a Tokenizer's buffer. The start is inclusive,
  // the end is exclusive.
  struct Span {
    int start = 0;
    int end = 0;
  };

  using RawAttribute = std::tuple<Span, Span, LineCol>;

  // Sets whether or not the tokenizer recognizes `<![CDATA[foo]]>` as
  // the text "foo". The default value is false, which means to recognize it as
  // a bogus comment `<!-- [CDATA[foo]] -->` instead.
  //
  // Strictly speaking, an HTML5 compliant tokenizer should allow CDATA if and
  // only if tokenizing foreign content, such as MathML and SVG. However,
  // tracking foreign-contentness is difficult to do purely in the tokenizer,
  // as opposed to the parser, due to HTML integration points: an <svg> element
  // can contain a <foreignObject> that is foreign-to-SVG but not foreign-to-
  // HTML. For strict compliance with the HTML5 tokenization algorithm, it is
  // the responsibility of the user of a tokenizer to call AllowCDATA as
  // appropriate.
  // In practice, if using the tokenizer without caring whether MathML or SVG
  // CDATA is text or comments, such as tokenizing HTML to find all the anchor
  // text, it is acceptable to ignore this responsibility.
  void SetAllowCDATA(bool allow_cdata);

  // NextIsNotRawText instructs the tokenizer that the next token should not be
  // considered as 'raw text'. Some elements, such as script and title elements,
  // normally require the next token after the opening tag to be 'raw text' that
  // has no child elements. For example, tokenizing "<title>a<b>c</b>d</title>"
  // yields a start tag token for "<title>", a text token for "a<b>c</b>d", and
  // an end tag token for "</title>". There are no distinct start tag or end tag
  // tokens for the "<b>" and "</b>".
  //
  // This tokenizer implementation will generally look for raw text at the right
  // times. Strictly speaking, an HTML5 compliant tokenizer should not look for
  // raw text if in foreign content: <title> generally needs raw text, but a
  // <title> inside an <svg> does not. Another example is that a <textarea>
  // generally needs raw text, but a <textarea> is not allowed as an immediate
  // child of a <select>; in normal parsing, a <textarea> implies </select>, but
  // one cannot close the implicit element when parsing a <select>'s InnerHTML.
  // Similarly to AllowCDATA, tracking the correct moment to override raw-text-
  // ness is difficult to do purely in the tokenizer, as opposed to the parser.
  // For strict compliance with the HTML5 tokenization algorithm, it is the
  // responsibility of the user of a tokenizer to call NextIsNotRawText as
  // appropriate. In practice, like AllowCDATA, it is acceptable to ignore this
  // responsibility for basic usage.
  //
  // Note that this 'raw text' concept is different from the one offered by the
  // Tokenizer.Raw method.
  void NextIsNotRawText();

  // The following two states have special meaning.
  // EOF is when tokenizer reaches end of HTML input.
  // Error is the first time error encountered during tokenization.
  // It is possible for not Error && EOF. which means Next call will return an
  // error token. For example, if the HTML text was just "plain", or
  // `<!-- xml version="1.0"` (without closing), then the first Next call would
  // set EOF and return TextToken or CommentToken. Subsequent calls to Next
  // will return ErrorToken with Error set to true.
  bool IsEOF() const { return eof_; }
  bool Error() const { return err_; }

  // Returns the unmodified text of the current token. Calling Next, Token,
  // Text, TagName or TagAttr may change the contents of the returned slice.
  std::string_view Raw();

  // Scans the next token and returns its type.
  TokenType Next(bool template_mode = false);

  // Returns the unescaped text of a text, comment or doctype token. The
  // contents of the returned slice may change on the next call to Next.
  std::string Text();

  // Returns the lower-cased name of a tag token (the `img` out of
  // `<IMG SRC="foo">`) and whether the tag has attributes.
  // The contents of the returned slice may change on the next call to Next.
  std::optional<std::tuple<std::string, bool>> TagName();

  // Returns the lower-cased key and unescaped value of the next unparsed
  // attribute for the current tag token and whether there are more attributes.
  // The contents of the returned slices may change on the next call to Next.
  std::optional<std::tuple<Attribute, bool>> TagAttr();

  // Returns the current Token. The result's Data and Attr values remain
  // valid after subsequent Next calls.
  Token token();

  // Returns current position of the tokenizer in the html source.
  LineCol CurrentPosition() { return current_line_col_; }

  // Count of lines processed in html source.
  int LinesProcessed() { return lines_cols_.size(); }

 private:
  // Fragment tokenization is allowed from these parent elements only.
  inline static constexpr std::array<Atom, 10> kAllowedFragmentContainers{
      Atom::IFRAME,    Atom::NOEMBED, Atom::NOFRAMES, Atom::NOSCRIPT,
      Atom::PLAINTEXT, Atom::SCRIPT,  Atom::STYLE,    Atom::TEXTAREA,
      Atom::TITLE,     Atom::XMP,
  };

  // Returns the next byte from the input stream, doing a buffered read
  // from z.r into z.buf if necessary. z.buf[z.raw.start:z.raw.end] remains a
  // contiguous byte slice that holds all the bytes read so far for the current
  // token.
  // It sets z.err if the underlying reader returns an error.
  // Pre-condition: z.err == nil.
  char ReadByte();

  // Moves cursor back past one byte.
  void UnreadByte();

  // Reads until next ">".
  void ReadUntilCloseAngle();

  // Reads the next start tag token. The opening "<a" has already
  // been consumed, where 'a' means anything in [A-Za-z].
  TokenType ReadStartTag(bool template_mode = false);

  // Attempts to read a CDATA section and returns true if
  // successful. The opening "<!" has already been consumed.
  bool ReadCDATA();

  // Reads until the next "</foo>", where "foo" is z.rawTag and
  // is typically something like "script" or "textarea".
  void ReadRawOrRCDATA();

  // Attempts to read a doctype declaration and returns true if
  // successful. The opening "<!" has already been consumed.
  bool ReadDoctype();

  // Reads the next tag token and its attributes. If saveAttr, those
  // attributes are saved in z.attr, otherwise z.attr is set to an empty slice.
  // The opening "<a" or "</a" has already been consumed, where 'a' means
  // anything in [A-Za-z].
  void ReadTag(bool save_attr, bool template_mode = false);

  // Sets z.data to the "div" in "<div k=v>". The reader (z.raw.end)
  // is positioned such that the first byte of the tag name (the "d" in "<div")
  // has already been consumed.
  void ReadTagName();

  // Sets z.pendingAttr[0] to the "k" in "<div k=v>".
  // Precondition: z.err == nil.
  void ReadTagAttributeKey(bool template_mode = false);

  // Sets z.pendingAttr[1] to the "v" in "<div k=v>".
  void ReadTagAttributeValue();

  // Attempts to read a tag like "</foo>", where "foo" is z.rawTag.
  // If it succeeds, it backs up the input position to reconsume the tag and
  // returns true. Otherwise it returns false. The opening "</" has already been
  // consumed.
  bool ReadRawEndTag();

  // Reads until the next </script> tag, following the byzantine
  // rules for escaping/hiding the closing tag.
  void ReadScript();

  // Reads the next token starting with "<!". It might be
  // a "<!--comment-->", a "<!DOCTYPE foo>", a "<![CDATA[section]]>" or
  // "<!a bogus comment". The opening "<!" has already been consumed.
  TokenType ReadMarkupDeclaration();

  // Reads the next comment token starting with "<!--". The opening
  // "<!--" has already been consumed.
  void ReadComment();

  // Skips past any white space.
  void SkipWhiteSpace();

  // Returns whether the start tag in buffer[data.start:data.end]
  // case-insensitively matches any element of ss.
  template <typename... Args>
  bool StartTagIn(Args... ss);

  std::string_view buffer_;

  // buffer_[raw.start:raw.end] holds the raw bytes of the current token.
  // buf[raw.end:] is buffered input that will yield future tokens.
  Span raw_ = {0, 0};

  // buffer_[data.start:data.end] holds the raw bytes of the current token's
  // data: a text token's text, a tag token's tag name, etc.
  Span data_ = {0, 0};

  // TokenType of the current token.
  TokenType token_type_;

  // Attribute key and value currently being tokenized.
  RawAttribute pending_attribute_;

  std::vector<RawAttribute> attributes_{};

  int n_attributes_returned_ = 0;

  // raw_tag_ is the "script" in "</script>" that closes the next token. If
  // non-empty, the subsequent call to Next will return a raw or RCDATA text
  // token: one that treats "<p>" as text instead of an element.
  // raw_tag_'s contents are lower-cased.
  std::string raw_tag_;

  // text_is_raw_ is whether the current text token's data is not escaped.
  bool text_is_raw_ = false;

  // Whether NULL bytes in the current token's data should be converted
  // into \ufffd replacement characters.
  bool convert_null_ = false;

  // allow_cdata_ is whether CDATA sectiosn are allowed in the current context.
  bool allow_cdata_ = false;

  // Cursor reached the end of the buffer.
  bool eof_ = false;
  bool err_ = false;

  // Tells if the token is manufactured.
  // In a few cases, for example '<' followed by '?', is treated as comment and
  // a comment token is manufactured.
  // This is not same as manufactured html, head, body, tbody, thead etc,
  // these are manufactured during parsing, not tokenization.
  // This field accounts for only special cases where illegal characters leads
  // to  manufacturing of comments token.
  // Eg:
  // https://html.spec.whatwg.org/multipage/parsing.html#parse-error-unexpected-question-mark-instead-of-tag-name
  bool is_token_manufactured_ = false;

  // Keeps track of all the lines and columns in HTML source.
  std::vector<LineCol> lines_cols_;

  // Keeps track of current position of the cursor.
  LineCol current_line_col_;

  // Current token's line col record. One line can have several tokens.
  LineCol token_line_col_;
};

}  // namespace htmlparser

#endif  // CPP_HTMLPARSER_TOKENIZER_H_
