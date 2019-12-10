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
import org.testng.annotations.BeforeTest;
import org.testng.annotations.Test;

import java.util.ArrayList;
import java.util.List;

import static org.mockito.Mockito.doAnswer;

/**
 * Test for {@link QualifiedRule}
 *
 * @author GeorgeLuo
 */

public class QualifiedRuleTest {

    @BeforeTest
    public void init() {
        declaration = new Declaration("background-image");
        declaration.setLine(0);
        declaration.setCol(1);

        List<Declaration> declarations = new ArrayList<>();
        declarations.add(declaration);

        qualifiedRule = new QualifiedRule();
        qualifiedRule.setDeclarations(declarations);

        rules = new ArrayList<>();
        rules.add(qualifiedRule);

        prelude = new ArrayList<>();
        prelude.add(new Declaration("h1"));

    }

    @Test
    public void testAccept() {

        final RuleVisitor ruleVisitor = Mockito.mock(RuleVisitor.class);
        try {

          doAnswer(new Answer<Void>() {
            public Void answer(final InvocationOnMock invocation) {
              final Object[] args = invocation.getArguments();
              Assert.assertEquals(((QualifiedRule) args[0]).getDeclarations().get(0).getName(), "background-image");
              return null;
            }
          }).when(ruleVisitor).visitQualifiedRule(qualifiedRule);

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

            qualifiedRule.accept(ruleVisitor);
        } catch (CssValidationException e) {
            e.printStackTrace();
        }
    }

    @Test
    public void testGetTokenType() {
        Assert.assertEquals(qualifiedRule.getTokenType(), TokenType.QUALIFIED_RULE);
    }

    @Test
    public void testSetRules() {
        qualifiedRule.setRules(rules);
        Assert.assertEquals(qualifiedRule.getRules(), rules);
    }

    @Test
    public void testSetDeclarations() {
        Assert.assertEquals(qualifiedRule.getDeclarations().get(0), declaration);
    }

    @Test
    public void testRuleName() {
        qualifiedRule.ruleName();
    }

    private QualifiedRule qualifiedRule;
    private List<Rule> rules;
    private Declaration declaration;
    private List<Token> prelude;
}
