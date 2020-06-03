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

import dev.amp.validator.visitor.UrlFunctionVisitor;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.util.ArrayList;
import java.util.List;

/**
 * Test for {@link Stylesheet}
 *
 * @author GeorgeLuo
 */

public class StylesheetTest {

  @Test
  public void testAccept() {
    try {
      final Stylesheet stylesheet = new Stylesheet();
      final List<ErrorToken> cssErrors = new ArrayList<>();

      final List<ParsedCssUrl> parsedCssUrls = new ArrayList<>();

      final ParsedCssUrl parsedCssUrl1 = new ParsedCssUrl();
      parsedCssUrl1.setUtf8Url("https://www.someurl1.com");

      parsedCssUrls.add(parsedCssUrl1);

      final ParsedCssUrl parsedCssUrl2 = new ParsedCssUrl();
      parsedCssUrl2.setUtf8Url("https://www.someurl2.com");

      parsedCssUrls.add(parsedCssUrl2);

      final UrlFunctionVisitor visitor = new UrlFunctionVisitor(parsedCssUrls, cssErrors);

      Declaration declaration = new Declaration("background-image");
      declaration.setLine(0);
      declaration.setCol(1);
      declaration.getValue().add(new EOFToken());

      List<Declaration> declarations = new ArrayList<>();
      declarations.add(declaration);

      QualifiedRule qualifiedRule = new QualifiedRule();
      qualifiedRule.setDeclarations(declarations);

      List<Rule> rules = new ArrayList<>();
      rules.add(qualifiedRule);

      stylesheet.setRules(rules);
      stylesheet.accept(visitor);

    } catch (CssValidationException e) {
      e.printStackTrace();
    }
  }

  @Test
  public void testGetTokenType() {
    final Stylesheet stylesheet = new Stylesheet();
    Assert.assertEquals(stylesheet.getTokenType(), TokenType.STYLESHEET);
  }
}
