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

package dev.amp.validator.utils;

import dev.amp.validator.ValidatorProtos;
import com.steadystate.css.parser.SACParserCSS3Constants;
import com.steadystate.css.parser.Token;
import dev.amp.validator.css.AtRule;
import dev.amp.validator.css.CssValidationException;
import dev.amp.validator.css.Declaration;
import dev.amp.validator.css.ErrorToken;
import dev.amp.validator.css.ParsedCssUrl;
import dev.amp.validator.css.Stylesheet;
import dev.amp.validator.visitor.RuleVisitor;
import org.mockito.Mockito;
import org.mockito.invocation.InvocationOnMock;
import org.mockito.stubbing.Answer;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.ArrayList;

import static org.mockito.Mockito.doAnswer;

/**
 * Test for {@link CssSpecUtils}
 *
 * @author GeorgeLuo
 */

public class CssSpecUtilsTest {

  @Test
  public void testParseAStylesheet() {
    final List<Token> tokens = new LinkedList<>();
    tokens.add(new Token(75, "@media"));
    tokens.add(new Token(1, " "));
    tokens.add(new Token(22, "screen"));
    tokens.add(new Token(55, "{"));
    tokens.add(new Token(56, "}"));
    tokens.add(new Token(56, "}"));
    tokens.add(new Token(1, "\n"));
    tokens.add(new Token(0, ""));

    final Map<String, CssSpecUtils.BlockType> atRuleSpec = new HashMap<>();
    atRuleSpec.put("$DEFAULT", CssSpecUtils.BlockType.PARSE_AS_IGNORE);
    atRuleSpec.put("media", CssSpecUtils.BlockType.PARSE_AS_RULES);
    atRuleSpec.put("page", CssSpecUtils.BlockType.PARSE_AS_DECLARATIONS);

    final CssSpecUtils.BlockType defaultSpec = CssSpecUtils.BlockType.PARSE_AS_IGNORE;
    final List<ErrorToken> errors = new ArrayList<>();

    try {
      final Stylesheet stylesheet = CssSpecUtils.parseAStylesheet(tokens, atRuleSpec, defaultSpec, errors);

      final RuleVisitor ruleVisitor = Mockito.mock(RuleVisitor.class);

      doAnswer(new Answer<Void>() {
        public Void answer(final InvocationOnMock invocation) {
          final Object[] args = invocation.getArguments();
          Assert.assertEquals(((AtRule) args[0]).getName(), "media");
          Assert.assertEquals(((AtRule) args[0]).getPrelude().size(), 3);
          Assert.assertEquals(((AtRule) args[0]).getPrelude().get(0).toString(), " ");
          Assert.assertEquals(((AtRule) args[0]).getPrelude().get(1).toString(), "screen");
          Assert.assertEquals(((AtRule) args[0]).getPrelude().get(2).kind, 0);
          return null;
        }
      }).when(ruleVisitor).visitAtRule(Mockito.any(AtRule.class));
      stylesheet.accept(ruleVisitor);

    } catch (CssValidationException e) {
      e.printStackTrace();
    }
  }

  @Test
  public void testExtractUrls() {

    final List<Token> tokens = new LinkedList<>();
    tokens.add(new Token(22, "@media"));
    tokens.add(new Token(55, "screen"));
    tokens.add(new Token(1, "\n"));
    tokens.add(new Token(22, "background-image"));
    tokens.add(new Token(61, ":"));
    tokens.add(new Token(100, "https://www.somesite.com/image.jpg"));
    tokens.add(new Token(60, ";"));
    tokens.add(new Token(1, "\n"));
    tokens.add(new Token(0, ""));


    final Map<String, CssSpecUtils.BlockType> atRuleSpec = new HashMap<>();
    atRuleSpec.put("$DEFAULT", CssSpecUtils.BlockType.PARSE_AS_IGNORE);
    atRuleSpec.put("media", CssSpecUtils.BlockType.PARSE_AS_RULES);
    atRuleSpec.put("page", CssSpecUtils.BlockType.PARSE_AS_DECLARATIONS);

    final CssSpecUtils.BlockType defaultSpec = CssSpecUtils.BlockType.PARSE_AS_IGNORE;
    final List<ErrorToken> errors = new ArrayList<>();
    final List<ParsedCssUrl> parsedUrls = new ArrayList<>();

    try {
      final Stylesheet stylesheet = CssSpecUtils.parseAStylesheet(tokens, atRuleSpec, defaultSpec, errors);
      CssSpecUtils.extractUrls(stylesheet, parsedUrls, errors);
    } catch (CssValidationException e) {
      e.printStackTrace();
    }

    Assert.assertEquals(parsedUrls.size(), 1);
    Assert.assertEquals(parsedUrls.get(0).getUtf8Url(), "https://www.somesite.com/image.jpg");

  }

  @Test
  public void testStripVendorPrefix() {
    Assert.assertEquals(CssSpecUtils.stripVendorPrefix("-moz-keyframes"), "keyframes");
    Assert.assertEquals(CssSpecUtils.stripVendorPrefix("-o-keyframes"), "keyframes");
    Assert.assertEquals(CssSpecUtils.stripVendorPrefix("-webkit-keyframes"), "keyframes");
    Assert.assertEquals(CssSpecUtils.stripVendorPrefix("-ms-keyframes"), "keyframes");
  }

  @Test
  public void testStripMinMax() {
    Assert.assertEquals(CssSpecUtils.stripMinMax("min-width"), "width");
    Assert.assertEquals(CssSpecUtils.stripMinMax("max-width"), "width");
  }

  @Test
  public void testAsciiMatch() {
    final Token token = new Token(22, "@media");
    Assert.assertTrue(CssSpecUtils.asciiMatch(token, "@media"));
  }

  @Test
  public void testValidateKeyframesCss() {
  }

  @Test
  public void testValidateAmp4AdsCss() {
  }

  @Test
  public void testIsDeclarationValid() {
    final ValidatorProtos.CssSpec.Builder cssSpecBuilder = ValidatorProtos.CssSpec.newBuilder();
    cssSpecBuilder.addDeclaration("testName");
    Assert.assertTrue(CssSpecUtils.isDeclarationValid(cssSpecBuilder.build(), "testName"));
  }

  @Test
  public void testAllowedDeclarationsString() {
    final ValidatorProtos.CssSpec.Builder cssSpecBuilder = ValidatorProtos.CssSpec.newBuilder();
    cssSpecBuilder.addDeclaration("testName1");
    cssSpecBuilder.addDeclaration("testName2");
    Assert.assertEquals(CssSpecUtils.allowedDeclarationsString(cssSpecBuilder.build()),
      "['testName1', 'testName2']");
  }

  @Test
  public void testParseUrlToken() {
    final List<Token> tokens = new LinkedList<>();
    tokens.add(new Token(22, "@media"));
    tokens.add(new Token(100, "https://www.someurl.com/image.jpg"));
    tokens.add(new Token(0, ""));

    final ParsedCssUrl parsedCssUrl = new ParsedCssUrl();

    try {
      CssSpecUtils.parseUrlToken(tokens, 1, parsedCssUrl);
    } catch (CssValidationException e) {
      e.printStackTrace();
    }

    Assert.assertEquals(parsedCssUrl.getUtf8Url(),
      "https://www.someurl.com/image.jpg");
  }

  @Test
  public void testParseUrlFunction() {
    final List<Token> tokens = new LinkedList<>();
    tokens.add(new Token(22, "square"));
    tokens.add(new Token(1, "\n"));
    tokens.add(new Token(SACParserCSS3Constants.FUNCTION, "url("));
    tokens.add(new Token(SACParserCSS3Constants.STRING, "https://www.somesite.com/image.jpg"));
    tokens.add(new Token(SACParserCSS3Constants.RROUND, ")"));
    tokens.add(new Token(1, "\n"));
    tokens.add(new Token(0, ""));

    final ParsedCssUrl parsedCssUrl = new ParsedCssUrl();

    try {
      Assert.assertEquals(CssSpecUtils.parseUrlFunction(tokens, 2, parsedCssUrl), 5);
      Assert.assertEquals(parsedCssUrl.getUtf8Url(), "https://www.somesite.com/image.jpg");
    } catch (CssValidationException e) {
      e.printStackTrace();
    }
  }

  @Test
  public void testParseInlineStyle() {
    final List<Token> tokens = new LinkedList<>();
    tokens.add(new Token(22, "position"));
    tokens.add(new Token(61, ":"));
    tokens.add(new Token(22, "10"));
    tokens.add(new Token(60, ";"));
    tokens.add(new Token(22, "color"));
    tokens.add(new Token(61, ":"));
    tokens.add(new Token(22, "blue"));
    tokens.add(new Token(60, ";"));
    tokens.add(new Token(0, ""));

    final List<ErrorToken> errors = new ArrayList<>();

    try {
      List<Declaration> declarations = CssSpecUtils.parseInlineStyle(tokens, errors);
      Assert.assertEquals(declarations.size(), 2);
      Assert.assertEquals(declarations.get(0).getName(), "position");
      Assert.assertEquals(declarations.get(0).getValue().get(0).image, "10");
      Assert.assertEquals(declarations.get(0).getValue().get(1).kind, 0);
      Assert.assertEquals(declarations.get(1).getName(), "color");
      Assert.assertEquals(declarations.get(1).getValue().get(0).image, "blue");
      Assert.assertEquals(declarations.get(1).getValue().get(1).kind, 0);
    } catch (CssValidationException e) {
      e.printStackTrace();
    }
  }
}
