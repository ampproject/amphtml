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

import dev.amp.validator.visitor.RuleVisitor;
import org.mockito.Mockito;
import org.mockito.invocation.InvocationOnMock;
import org.mockito.stubbing.Answer;
import org.testng.Assert;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

import java.util.ArrayList;
import java.util.List;

import static org.mockito.Mockito.doAnswer;

/**
 * Test for {@link AtRule}
 *
 * @author GeorgeLuo
 */

public class AtRuleTest {

  @BeforeClass
  public void init() {
    canonicalizer = Mockito.mock(Canonicalizer.class);
    atRule = new AtRule("@media");
  }

  @Test
  public void testAccept() {

    atRule = new AtRule("@media");

    final List<Rule> rules = new ArrayList<>();
    QualifiedRule qualifiedRule = new QualifiedRule();

    rules.add(qualifiedRule);

    final List<Declaration> declarations = new ArrayList<>();
    Declaration declaration = new Declaration("background-image");
    declarations.add(declaration);

    atRule.setDeclarations(declarations);

    final RuleVisitor ruleVisitor = Mockito.mock(RuleVisitor.class);
    try {
      doAnswer(new Answer<Void>() {
        public Void answer(final InvocationOnMock invocation) {
          final Object[] args = invocation.getArguments();
          Assert.assertEquals(((AtRule) args[0]).getName(), "media");
          return null;
        }
      }).when(ruleVisitor).visitAtRule(Mockito.any(AtRule.class));

      doAnswer(new Answer<Void>() {
        public Void answer(final InvocationOnMock invocation) {
          final Object[] args = invocation.getArguments();
          Assert.assertEquals(((Declaration) args[0]).getName(), "background-image");
          return null;
        }
      }).when(ruleVisitor).visitDeclaration(Mockito.any(Declaration.class));

      doAnswer(new Answer<Void>() {
        public Void answer(final InvocationOnMock invocation) {
          final Object[] args = invocation.getArguments();
          Assert.assertEquals(((Declaration) args[0]).getName(), "background-image");
          return null;
        }
      }).when(ruleVisitor).leaveDeclaration(Mockito.any(Declaration.class));

      doAnswer(new Answer<Void>() {
        public Void answer(final InvocationOnMock invocation) {
          final Object[] args = invocation.getArguments();
          Assert.assertEquals(((AtRule) args[0]).getName(), "media");
          return null;
        }
      }).when(ruleVisitor).leaveAtRule(Mockito.any(AtRule.class));

      atRule.accept(ruleVisitor);
    } catch (CssValidationException e) {
      e.printStackTrace();
    }
  }

  private Canonicalizer canonicalizer;
  private AtRule atRule;
}
