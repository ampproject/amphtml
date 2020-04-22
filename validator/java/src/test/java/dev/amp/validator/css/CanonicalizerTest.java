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
import com.steadystate.css.parser.SACParserCSS3Constants;
import com.steadystate.css.parser.Token;
import dev.amp.validator.utils.CssSpecUtils;
import org.testng.Assert;
import org.testng.annotations.BeforeSuite;
import org.testng.annotations.BeforeTest;
import org.testng.annotations.Test;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

/**
 * Test for {@link Canonicalizer}
 *
 * @author GeorgeLuo
 */

public class CanonicalizerTest {

  @BeforeSuite
  public void init() {
    defaultSpec = CssSpecUtils.BlockType.PARSE_AS_IGNORE;
    atRuleSpec = new HashMap<>();

    atRuleSpec.put("$DEFAULT", CssSpecUtils.BlockType.PARSE_AS_IGNORE);
    atRuleSpec.put("media",CssSpecUtils.BlockType.PARSE_AS_RULES);
    atRuleSpec.put("page", CssSpecUtils.BlockType.PARSE_AS_DECLARATIONS);
  }

  @BeforeTest
  public void initTest() {
    canonicalizer = new Canonicalizer(atRuleSpec, defaultSpec);
  }

  @Test
  public void testParseAListOfRules() {
    try {
      final List<ErrorToken> cssErrors = new ArrayList<>();
      List<Token> tokens = new LinkedList<>();
      tokens.add(new Token(22, "amp-img"));
      tokens.add(new Token(55, "{"));
      tokens.add(new Token(1, ""));
      tokens.add(new Token(56, "}"));
      tokens.add(new Token(1, ""));
      tokens.add(new Token(0, ""));
      TokenStream tokenStream = new TokenStream(tokens);
      tokenStream.consume();

      List<Rule> rules = canonicalizer.parseAListOfRules(tokens, true, cssErrors);

      Assert.assertEquals(rules.size(), 1);
      Assert.assertEquals(rules.get(0).toString(), "QUALIFIED_RULE");

    } catch (CssValidationException e) {
      e.printStackTrace();
    }
  }

  @Test
  public void testParseAListOfDeclarationsInvalidAtRule() {
    try {
      final List<ErrorToken> cssErrors = new ArrayList<>();
      cssParser = new CssParser(MEDIA_RULE,
        0, 0, cssErrors);
      tokenList = cssParser.tokenize();

      List<ErrorToken> errors = new ArrayList<>();
      List<Declaration> declarations = canonicalizer.parseAListOfDeclarations(tokenList, errors);
      Assert.assertEquals(declarations.size(), 0);
      Assert.assertEquals(errors.size(), 1);
      Assert.assertEquals(errors.get(0).getCode(), ValidatorProtos.ValidationError.Code.CSS_SYNTAX_INVALID_AT_RULE);

    } catch (CssValidationException | IOException e) {
      e.printStackTrace();
    }
  }

  @Test
  public void testParseADeclaration() {
    List<ErrorToken> errors = new ArrayList<>();
    List<Declaration> declarations = new ArrayList<>();

    try {
      final List<ErrorToken> cssErrors = new ArrayList<>();
      cssParser = new CssParser(A_DECLARATION,
        0, 0, cssErrors);
      tokenList = cssParser.tokenize();

      TokenStream tokenStream = new TokenStream(tokenList);
      tokenStream.consume();
      canonicalizer.parseADeclaration(tokenStream, declarations, errors);
      Assert.assertEquals(declarations.size(), 1);
      Assert.assertEquals(declarations.get(0).getName(), "color");
    } catch (final IOException | CssValidationException ex) {
      ex.printStackTrace();
    }
  }

  @Test
  public void testConsumeAComponentValue() {
    try {
      List<com.steadystate.css.parser.Token> tokens = new LinkedList<>();
      tokens.add(new com.steadystate.css.parser.Token(SACParserCSS3Constants.LBRACE, "{"));
      tokens.add(new com.steadystate.css.parser.Token(SACParserCSS3Constants.IDENT, "width"));
      tokens.add(new Token(SACParserCSS3Constants.COLON, ":"));
      tokens.add(new Token(SACParserCSS3Constants.S, " "));
      tokens.add(new Token(SACParserCSS3Constants.IDENT, "square"));
      tokens.add(new Token(SACParserCSS3Constants.S, " "));
      tokens.add(new Token(SACParserCSS3Constants.FUNCTION, "and"));
      tokens.add(new Token(SACParserCSS3Constants.EOF, ""));
      TokenStream tokenStream = new TokenStream(tokens);
      tokenStream.consume();

      List<com.steadystate.css.parser.Token> tokensEmpty = new LinkedList<>();
      Assert.assertTrue(Canonicalizer.consumeAComponentValue(tokenStream, tokensEmpty, 3));
      Assert.assertEquals(tokensEmpty.size(), 9);

      Assert.assertFalse(Canonicalizer.consumeAComponentValue(tokenStream, tokensEmpty, 100000));
    } catch (CssValidationException e) {
      e.printStackTrace();
    }
  }

  @Test
  public void testConsumeAFunction() {
    try {
      List<com.steadystate.css.parser.Token> tokens = new LinkedList<>();
      tokens.add(new com.steadystate.css.parser.Token(SACParserCSS3Constants.FUNCTION, "and"));
      tokens.add(new com.steadystate.css.parser.Token(SACParserCSS3Constants.EOF, ""));

      TokenStream tokenStream = new TokenStream(tokens);
      tokenStream.consume();

      List<com.steadystate.css.parser.Token> tokensEmpty = new LinkedList<>();
      Canonicalizer.consumeAComponentValue(tokenStream, tokensEmpty, 3);

      Assert.assertEquals(tokensEmpty, tokens);

      tokens = new LinkedList<>();
      tokensEmpty = new LinkedList<>();
      tokens.add(new com.steadystate.css.parser.Token(SACParserCSS3Constants.FUNCTION, "and"));
      tokens.add(new com.steadystate.css.parser.Token(SACParserCSS3Constants.IDENT, "blue"));
      tokens.add(new com.steadystate.css.parser.Token(SACParserCSS3Constants.EOF, ""));
      tokenStream = new TokenStream(tokens);
      tokenStream.consume();

      Canonicalizer.consumeAComponentValue(tokenStream, tokensEmpty, 3);
      Assert.assertEquals(tokensEmpty, tokens);

    } catch (CssValidationException e) {
      e.printStackTrace();
    }
  }

  private CssSpecUtils.BlockType defaultSpec;
  private Map<String, CssSpecUtils.BlockType> atRuleSpec;
  private Canonicalizer canonicalizer;
  private List<com.steadystate.css.parser.Token> tokenList;
  private CssParser cssParser;

  private static final String MEDIA_RULE = "@media (min-width: 500px) and (max-width: 600px) {\n"
    + "    h1 {\n"
    + "        color: fuchsia;\n"
    + "        font-size: 12px;\n"
    + "    }\n"
    + "\n" + "    .desc:after {\n"
    + "        content:\".\";\n"
    + "    }\n"
    + "}";
  private static final String CSS_BODY = "        ul {\n"
    + "            list-style: square url(());\n"
    + "        }\n";
  private static final String A_DECLARATION = "color: red;";

}
