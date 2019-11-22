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

import amp.validator.Validator;
import org.testng.Assert;
import org.testng.annotations.BeforeTest;
import org.testng.annotations.Test;

import java.util.HashMap;
import java.util.Map;

/**
 * Test for {@link CssParsingConfig}
 *
 * @author GeorgeLuo
 */

public class CssParsingConfigTest {

  @BeforeTest
  public void init() {
    defaultSpec = Validator.AtRuleSpec.BlockType.PARSE_AS_IGNORE;
    atRuleSpec = new HashMap<>();

    atRuleSpec.put("$DEFAULT", Validator.AtRuleSpec.BlockType.PARSE_AS_IGNORE);
    atRuleSpec.put("media", Validator.AtRuleSpec.BlockType.PARSE_AS_RULES);
    atRuleSpec.put("page", Validator.AtRuleSpec.BlockType.PARSE_AS_DECLARATIONS);
  }

  @Test
  public void testComputeCssParsingConfig() {
    final Validator.CssSpec.Builder cssSpecBuilder = Validator.CssSpec.newBuilder();

    final Validator.AtRuleSpec.Builder atRuleSpecBuilder1 = Validator.AtRuleSpec.newBuilder();
    atRuleSpecBuilder1.setType(Validator.AtRuleSpec.BlockType.PARSE_AS_RULES);
    atRuleSpecBuilder1.setName("media");

    final Validator.AtRuleSpec.Builder atRuleSpecBuilder2 = Validator.AtRuleSpec.newBuilder();
    atRuleSpecBuilder2.setType(Validator.AtRuleSpec.BlockType.PARSE_AS_DECLARATIONS);
    atRuleSpecBuilder2.setName("page");

    final Validator.AtRuleSpec.Builder atRuleSpecBuilder3 = Validator.AtRuleSpec.newBuilder();
    atRuleSpecBuilder3.setType(Validator.AtRuleSpec.BlockType.PARSE_AS_ERROR);
    atRuleSpecBuilder3.setName("$DEFAULT");

    cssSpecBuilder.addAtRuleSpec(atRuleSpecBuilder1.build());
    cssSpecBuilder.addAtRuleSpec(atRuleSpecBuilder2.build());
    cssSpecBuilder.addAtRuleSpec(atRuleSpecBuilder3.build());

    final Validator.CssSpec cssSpec = cssSpecBuilder.build();
    try {
      final CssParsingConfig cssParsingConfig = CssParsingConfig.computeCssParsingConfig(cssSpec);
      Assert.assertEquals(cssParsingConfig.getAtRuleSpec().size(), 3);
      Assert.assertEquals(cssParsingConfig.getAtRuleSpec(), atRuleSpec);
      Assert.assertEquals(cssParsingConfig.getDefaultSpec(), defaultSpec);
    } catch (CssValidationException e) {
      e.printStackTrace();
    }
  }

  private Map<String, Validator.AtRuleSpec.BlockType> atRuleSpec;
  private Validator.AtRuleSpec.BlockType defaultSpec;
}
