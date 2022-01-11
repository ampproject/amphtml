#include "cpp/htmlparser/renderer.h"

#include <sstream>

#include "gtest/gtest.h"
#include "cpp/htmlparser/parser.h"

using namespace std::string_literals;

namespace htmlparser {

void CheckParseRenderOutput(std::string_view input,
                            std::string_view expected_output) {
  auto doc = htmlparser::Parse(input);
  std::stringbuf buf;
  auto err = htmlparser::Renderer::Render(doc->RootNode(), &buf);
  EXPECT_EQ(err, htmlparser::RenderError::NO_ERROR);
  EXPECT_EQ(buf.str(), expected_output.data());
}

}  // namespace htmlparser

TEST(RendererTest, NullCharsTest) {
  // Checks they these difficult parsing cases always pass.
  std::vector<std::string> html_sources = {
      "<body><table>\0filler\0text\0"s,
      "<!doctype html><script><!--<script --",
      "<!DOCTYPE html><html><head><script><!--<script -<</script></head><body>"
          "</body></html>",
      "<!DOCTYPE html><script>\n</script>  <title>x</title>  </head>",
      "FOO&gtBAR",
      "FOOBAR&gt",
      "&gtFOOBAR",
      "FOO&gt;BAR",
      "FOOBAR&gt;",
      "&gt;FOOBAR",
      "<!DOCTYPE html><head><!-- Head example --><meta charset=\"utf8\">",
      "<p><b><i><u></p>\n<p>X"s,
      "<!doctype html><html><frameset></frameset></html>  ",
      "<!DOCTYPE html><html><html abc:def=gh><xyz:abc></xyz:abc>",
      "<select><b><option><select><option></b></select>X",
      "<table><colgroup></html>foo",
      "<html><ruby>a<rb>b<rb></ruby></html>",
      "<!DOCTYPE html><pre>\r\rA</pre>"s,
      "<svg><p><frameset>"s,
      "<svg>\0</svg><frameset>"s,
      "<html><select>",
      "<html>Hello<frameset></frameset>",
      "<html>\0<frameset></frameset>"s,
      "<html>  \0  <frameset></frameset>"s,
      "<html>a\0a<frameset></frameset>"s,
      "<body><table>fillertext",
      "<!DOCTYPE potato SYSTEM 'taco\"'>Hello",
      "<!DOCTYPE potato >Hello",
      "<?xml version",
      "<b>1<i>2<p>3</b>4",
      "<table><a>1<td>2</td>3</table>",
      "<table>A<td>B</td>C</table>",
      "<b><a><b><p></a>",
      "<table>A<td>B</td>C</table>",
      "<p>1<s id=\"A\">2<b id=\"B\">3</p>4</s>5</b>",
      "<a>1<p>2</a>3</p>",
      "<?xml version=\"1.0\">Hi",
      "<!DOCTYPE potato>Hello",
      "<math><template><mn><b></template>",
      "<a><p></a></p>",
      "<html><head><title>Hello</title></head>",
      "<body><div>Hello</div></body></html>",
      "<math><mrow><mrow><mn>1</mn></mrow><mi>a</mi></mrow></math>",
      "<b><em><dcell><postfield><postfield><postfield><postfield>"
          "<missing_glyph><missing_glyph><missing_glyph><missing_glyph>"
          "<hkern><aside></b></em>",
      "<svg><template><desc><t><svg></template>",
      "<table><td></tbody>A",
      "<html><frameset><!--1--><noframes>A</noframes><!--2--></frameset>"
          "<!--3--><noframes>B</noframes><!--4--></html><!--5--><noframes>C"
          "</noframes><!--6-->",
      "<html><head></head><body><tag1><tag2 /><p></p></tag1><div></div>"
          "</body></html>",
      "<dd><dd><dt><dt><dd><li><li>",
      "<ul><li><div id='foo'/>A</li><li>B<div>C</div></li></ul>"};

  std::vector<std::string> rendered_outputs = {
      "<html><head></head><body>fillertext<table></table></body></html>",
      "<!DOCTYPE html><html><head><script><!--<script --</script></head><body>"
          "</body></html>",
      "<!DOCTYPE html><html><head><script><!--<script -<</script></head><body>"
          "</body></html></script></head><body></body></html>",
      "<!DOCTYPE html><html><head><script>\n</script>  <title>x</title>  "
          "</head><body></body></html>",
      "<html><head></head><body>FOO&gt;BAR</body></html>",
      "<html><head></head><body>FOOBAR&gt;</body></html>",
      "<html><head></head><body>&gt;FOOBAR</body></html>",
      "<html><head></head><body>FOO&gt;BAR</body></html>",
      "<html><head></head><body>FOOBAR&gt;</body></html>",
      "<html><head></head><body>&gt;FOOBAR</body></html>",
      "<!DOCTYPE html><html><head><!-- Head example -->"
          "<meta charset=\"utf8\"></head><body></body></html>",
      "<html><head></head><body><p><b><i><u></u></i></b></p><b><i><u>\n<p>X</p>"
          "</u></i></b></body></html>"s,
      "<!DOCTYPE html><html><head></head><frameset></frameset>  </html>",
      "<!DOCTYPE html><html abc:def=\"gh\"><head></head><body><xyz:abc>"
          "</xyz:abc></body></html>",
      "<html><head></head><body><select><option></option></select>"
          "<option>X</option></body></html>",
      "<html><head></head><body>foo<table><colgroup></colgroup></table></body>"
          "</html>",
      "<html><head></head><body><ruby>a<rb>b</rb><rb></rb></ruby></body>"
          "</html>",
      "<!DOCTYPE html><html><head></head><body><pre>\n\nA</pre></body></html>"s,
      "<html><head></head><frameset></frameset></html>",
      "<html><head></head><frameset></frameset></html>",
      "<html><head></head><body><select></select></body></html>",
      "<html><head></head><body>Hello</body></html>",
      "<html><head></head><frameset></frameset></html>",
      "<html><head></head><frameset></frameset></html>",
      "<html><head></head><body>aa</body></html>",
      "<html><head></head><body>fillertext<table></table></body></html>",
      "<!DOCTYPE potato SYSTEM 'taco\"'><html><head></head><body>Hello</body>"
          "</html>",
      "<!DOCTYPE potato><html><head></head><body>Hello</body></html>",
      "<!--?xml version--><html><head></head><body></body></html>",
      "<html><head></head><body><b>1<i>2</i></b><i><p><b>3</b>4</p></i></body>"
          "</html>",
      "<html><head></head><body><a>1</a><a>3</a><table><tbody><tr><td>2</td>"
          "</tr></tbody></table></body></html>",
      "<html><head></head><body>AC<table><tbody><tr><td>B</td></tr></tbody>"
          "</table></body></html>",
      "<html><head></head><body><b><a><b></b></a><b><p><a></a></p></b></b>"
          "</body></html>",
      "<html><head></head><body>AC<table><tbody><tr><td>B</td></tr></tbody>"
          "</table></body></html>",
      "<html><head></head><body><p>1<s id=\"A\">2<b id=\"B\">3</b></s></p><s "
          "id=\"A\"><b id=\"B\">4</b></s><b id=\"B\">5</b></body></html>",
      "<html><head></head><body><a>1</a><p><a>2</a>3</p></body></html>",
      "<!--?xml version=\"1.0\"--><html><head></head><body>Hi</body></html>",
      "<!DOCTYPE potato><html><head></head><body>Hello</body></html>",
      "<html><head></head><body><math><template><mn><b></b></mn></template>"
          "</math></body></html>",
      "<html><head></head><body><a></a><p><a></a></p></body></html>",
      "<html><head><title>Hello</title></head><body></body></html>",
      "<html><head></head><body><div>Hello</div></body></html>",
      "<html><head></head><body><math><mrow><mrow><mn>1</mn></mrow><mi>a</mi>"
          "</mrow></math></body></html>",
      "<html><head></head><body><b><em><dcell><postfield><postfield><postfield>"
          "<postfield><missing_glyph><missing_glyph><missing_glyph>"
          "<missing_glyph><hkern></hkern></missing_glyph></missing_glyph>"
          "</missing_glyph></missing_glyph></postfield></postfield></postfield>"
          "</postfield></dcell></em></b><aside><b></b></aside></body></html>",
      "<html><head></head><body><svg><template><desc><t><svg></svg></t></desc>"
          "</template></svg></body></html>",
      "<html><head></head><body>A<table><tbody><tr><td></td></tr></tbody>"
          "</table></body></html>",
      "<html><head></head><frameset><!--1--><noframes>A</noframes><!--2-->"
          "</frameset><!--3--><noframes>B</noframes><!--4--><noframes>C"
          "</noframes></html><!--5--><!--6-->",
      "<html><head></head><body><tag1><tag2><p></p></tag2></tag1><div></div>"
          "</body></html>",
      "<html><head></head><body><dd></dd><dd></dd><dt></dt><dt></dt><dd><li>"
          "</li><li></li></dd></body></html>",
      "<html><head></head><body><ul><li><div id=\"foo\">A</div></li><li>B<div>"
          "C</div></li></ul></body></html>"};

  EXPECT_EQ(html_sources.size(), rendered_outputs.size());

  for (std::size_t i = 0; i < html_sources.size(); ++i) {
    htmlparser::CheckParseRenderOutput(
        html_sources.at(i), rendered_outputs.at(i));
  }
};
