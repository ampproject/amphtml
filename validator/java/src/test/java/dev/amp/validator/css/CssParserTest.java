/*
 *
 * ====================================================================
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *  ====================================================================
 */

/*
 * Changes to the original project are Copyright 2019, Verizon Media Inc..
 */

package dev.amp.validator.css;

import dev.amp.validator.ValidatorProtos;
import com.steadystate.css.parser.Token;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

/**
 * Test for {@link CssParser}
 *
 * @author GeorgeLuo
 */

public class CssParserTest {

  @Test
  public void testToCSSParseExceptionStrayTrailingBackslash() {
    try {
      final List<ErrorToken> cssErrors = new ArrayList<>();
      CssParser cssParser = new CssParser(CSS_CONTENT_STRAY_TRAILING_BACKSLASH,
        0, 0, cssErrors);
      List<Token> tokenList = cssParser.tokenize();

      Assert.assertEquals(cssParser.getErrors().size(), 1);
      Assert.assertEquals(cssParser.getErrors().get(0).getCode(),
        ValidatorProtos.ValidationError.Code.CSS_SYNTAX_STRAY_TRAILING_BACKSLASH);

    } catch (IOException e) {
      e.printStackTrace();
    }
  }

  @Test
  public void testToCSSParseExceptionUnterminatedString() {
    try {
      final List<ErrorToken> cssErrors = new ArrayList<>();
      CssParser cssParser = new CssParser(CSS_CONTENT_UNTERMINATED_STRING,
        0, 0, cssErrors);
      List<Token> tokenList = cssParser.tokenize();

      Assert.assertEquals(cssParser.getErrors().size(), 2);
      Assert.assertEquals(cssParser.getErrors().get(0).getCode(),
        ValidatorProtos.ValidationError.Code.CSS_SYNTAX_UNTERMINATED_STRING);
      Assert.assertEquals(cssParser.getErrors().get(1).getCode(),
        ValidatorProtos.ValidationError.Code.CSS_SYNTAX_UNTERMINATED_STRING);

    } catch (IOException e) {
      e.printStackTrace();
    }
  }

  @Test
  public void testToCSSParseExceptionUnterminatedComment() {
    try {
      final List<ErrorToken> cssErrors = new ArrayList<>();
      CssParser cssParser = new CssParser(CSS_CONTENT_UNTERMINATED_COMMENT,
        0, 0, cssErrors);
      List<Token> tokenList = cssParser.tokenize();

      Assert.assertEquals(cssParser.getErrors().size(), 1);
      Assert.assertEquals(cssParser.getErrors().get(0).getCode(),
        ValidatorProtos.ValidationError.Code.CSS_SYNTAX_UNTERMINATED_COMMENT);

    } catch (IOException e) {
      e.printStackTrace();
    }
  }

  @Test
  public void testTokenize() {
    try {
      final List<ErrorToken> cssErrors = new ArrayList<>();
      CssParser cssParser = new CssParser(CSS_CONTENT,
        0, 0, cssErrors);
      List<Token> tokenList = cssParser.tokenize();

      Assert.assertEquals(tokenList.size(), 35);
      Assert.assertEquals(cssParser.getErrors().size(), 0);

      Assert.assertEquals(tokenList.get(0).image, "@media");
      Assert.assertEquals(tokenList.get(9).image, "and");
      Assert.assertEquals(tokenList.get(19).image, ".");
      Assert.assertEquals(tokenList.get(29).image, "\n    ");

    } catch (IOException e) {
      e.printStackTrace();
    }
  }

  private static final String CSS_CONTENT = "@media (min-width: 500px) and (max-width: 600px) {\n"
    + "    .desc:after {\n"
    + "        content:\".\";\n"
    + "    }\n"
    + "}";

  private static final String CSS_CONTENT_UNTERMINATED_COMMENT = "    <style amp-custom>\n"
    + "        h1 { color: red; }\n"
    + "        @page :first {\n"
    + "            margin: 1in;\n"
    + "        }/*uhbuhbuyb\n";

  private static final String CSS_CONTENT_UNTERMINATED_STRING = "        ul {\"\n"
    + "        }\n"
    + "        ul {'\n"
    + "        }\n";

  private static final String CSS_CONTENT_STRAY_TRAILING_BACKSLASH = "        body {\n"
    + "            background-color: white;\n"
    + "            color: beige;\\\n"
    + "        }";
}
