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
    defaultSpec = ValidatorProtos.AtRuleSpec.BlockType.PARSE_AS_IGNORE;
    atRuleSpec = new HashMap<>();

    atRuleSpec.put("$DEFAULT", ValidatorProtos.AtRuleSpec.BlockType.PARSE_AS_IGNORE);
    atRuleSpec.put("media", ValidatorProtos.AtRuleSpec.BlockType.PARSE_AS_RULES);
    atRuleSpec.put("page", ValidatorProtos.AtRuleSpec.BlockType.PARSE_AS_DECLARATIONS);
  }

  @Test
  public void testComputeCssParsingConfig() {
    final ValidatorProtos.CssSpec.Builder cssSpecBuilder = ValidatorProtos.CssSpec.newBuilder();

    final ValidatorProtos.AtRuleSpec.Builder atRuleSpecBuilder1 = ValidatorProtos.AtRuleSpec.newBuilder();
    atRuleSpecBuilder1.setType(ValidatorProtos.AtRuleSpec.BlockType.PARSE_AS_RULES);
    atRuleSpecBuilder1.setName("media");

    final ValidatorProtos.AtRuleSpec.Builder atRuleSpecBuilder2 = ValidatorProtos.AtRuleSpec.newBuilder();
    atRuleSpecBuilder2.setType(ValidatorProtos.AtRuleSpec.BlockType.PARSE_AS_DECLARATIONS);
    atRuleSpecBuilder2.setName("page");

    final ValidatorProtos.AtRuleSpec.Builder atRuleSpecBuilder3 = ValidatorProtos.AtRuleSpec.newBuilder();
    atRuleSpecBuilder3.setType(ValidatorProtos.AtRuleSpec.BlockType.PARSE_AS_ERROR);
    atRuleSpecBuilder3.setName("$DEFAULT");

    cssSpecBuilder.addAtRuleSpec(atRuleSpecBuilder1.build());
    cssSpecBuilder.addAtRuleSpec(atRuleSpecBuilder2.build());
    cssSpecBuilder.addAtRuleSpec(atRuleSpecBuilder3.build());

    final ValidatorProtos.CssSpec cssSpec = cssSpecBuilder.build();
    try {
      final CssParsingConfig cssParsingConfig = CssParsingConfig.computeCssParsingConfig(cssSpec);
      Assert.assertEquals(cssParsingConfig.getAtRuleSpec().size(), 3);
      Assert.assertEquals(cssParsingConfig.getAtRuleSpec(), atRuleSpec);
      Assert.assertEquals(cssParsingConfig.getDefaultSpec(), defaultSpec);
    } catch (CssValidationException e) {
      e.printStackTrace();
    }
  }

  private Map<String, ValidatorProtos.AtRuleSpec.BlockType> atRuleSpec;
  private ValidatorProtos.AtRuleSpec.BlockType defaultSpec;
}
